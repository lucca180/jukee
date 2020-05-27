import React from 'react';
import { remote } from 'electron';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import path from 'path';
import fs from 'fs';

import { LyricsBar, ColorBar } from '../../components/LyricsBar';

import LeaveDialog from '../../components/Dialogs/LeaveDialog';
import ReadyDialog from '../../components/Dialogs/ReadyDialog';

import ProgressBar from '../../components/ProgressBar';

import * as syllabes from '../../utils/syllabes.js';
import {analysePitch, transposeOctave} from '../../utils/pitch.js';
import * as GlobalState from '../../actions/globalState';

import styles from './style.css';

const app = remote.app;
const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const modulo = (n, m) => (((n % m) + m) % m);


class KaraokeRoom extends React.PureComponent  {
	constructor(props) {
	    super(props);

	    this.state = {
	    	lyricsPos: -1,
			currentLyric: "",
			nextLyric: "",
	    	bars: null,
	    	parsedLyrics: null,
	    	leaveDialog: false,

	    	musicPath: null,
	    	musicInfo: null,
			videoSrc: "",
			videoReady: true,
			audioSrc: "",
			albumCover: "",
			
			progressWidth: 100,

			userScore: 0,

			isReady: false,
			isPlaying: false,
	    }

	    this.audio = React.createRef();
	   	this.video = React.createRef();
		this.micStream = null;
		this.micProcessor = null
	   	this.actualSyllabe = 0;
		this.timeInterval = null;
		
		this.bars = null; //fixes setState delay
		this.pitchBars = [];
		this.correctElapsedPercent = 0; // singing elapsed

		this.fade = React.createRef();
	}

	getLyrics = async () => {
		try{
			const {musicPath, musicInfo} = this.state;
			var sy = new syllabes.Syllabes()
			var txt = fs.readFileSync(path.join(musicPath,musicInfo.name+'.txt'), "latin1");
			var lyrics = sy.parse('ultrastar', txt);
			
			this.setState({
				parsedLyrics: lyrics,
				isReady: true,
			});

		}catch(e){
			console.error(e);
			this.setState({isReady: e.message})
		}
	}

	playAll = async () => {
		try{
			var video = this.video.current;
			var audio = this.audio.current;

			if(!this.micStream){
				
				this.micStream = await navigator.mediaDevices.getUserMedia({ audio: {
					autoGainControl: true,
					echoCancellation: true,
					noiseSuppression: true
				}, video: false });

				this.micProcessor = analysePitch(this.micStream, this.onPitch);
			}


			if(!audio?.currentSrc) {
				video.onended = () => {
					this.props.setState({currentScore: this.state.userScore});
					this.fade.current.classList.toggle(styles.hide);
					setTimeout(() => this.props.history.push('/score'), 2000);
				}
			}
			else {
				video.currentTime = audio.currentTime;
				audio.onended = () => {
					this.props.setState({currentScore: this.state.userScore});
					this.fade.current.classList.toggle(styles.hide);
					setTimeout(() => this.props.history.push('/score'), 2000);
				}
			}

			if(!this.timeInterval) this.timeInterval = setInterval(this.timeChanged, 10);
			
			if(video?.currentSrc) video.play().catch(e => console.error(e));
			if(audio?.currentSrc) {
				audio.play().catch(e => console.error(e));
				// console.log('yay');
				video.muted = true;
			}
		
			this.setState({
				isPlaying: true,
			})

			if(video?.readyState === 0) this.setState({videoReady: false});
			
		}catch(e){
			console.error(e);
			this.setState({isReady: e.message})
		}
	}
	
	pauseAll = () => {
		try{
			this.audio.current?.pause();
			this.video.current?.pause();
			if(this.micStream) this.micStream.getTracks().forEach(track => track.stop());
			if(this.micProcessor) this.micProcessor.disconnect();

			this.micStream = null;
			this.micProcessor = null;
		} catch(e){
			console.error(e);
		}
	}

	isPaused = () => {
		if(this.audio.current?.paused || this.video.current?.paused) return true;
		else return false;
	}

	onPitch = voiceInfos => {
		const video = this.video.current;
		const audio = this.audio.current;
		const { pitchBars } = this;
		const { userScore } = this.state;
		var time;

		if(this.actualSyllabe === null || this.bars === null || (!audio && !video)) return;

		if(!audio.currentSrc) time = video.currentTime * 1000;
		else time = audio.currentTime * 1000;
		time = Math.ceil(time);
		
		var bar = this.bars[this.actualSyllabe];

		var duration = bar.props.sil.duration;
		
		let timeBar = time - bar.props.sil.start; // tempo decorrido após entrar na barra;
		let percentTimeBar = Math.ceil(timeBar/duration * 100); //% da barra já decorridos;
		
		if(percentTimeBar < 0 || percentTimeBar > 100) return;
		
		var lastPitchBar = pitchBars[pitchBars.length - 1 ] || null;
		let widthElapsed = lastPitchBar ? percentTimeBar - lastPitchBar.props.lastPercent : percentTimeBar;		
				
		if(widthElapsed >= 100) return;
		
		if(!lastPitchBar) 
			pitchBars.push(
				<ColorBar
				parent={bar.props}
				key={time}
				octave={voiceInfos.octave}
				note={voiceInfos.note} 
				width={widthElapsed} 
				lastPercent={percentTimeBar}
				correct={voiceInfos.note === bar.props.note}/>
			);

		else if(lastPitchBar.props.note === voiceInfos.note)
			pitchBars[pitchBars.length - 1 ] = React.cloneElement(lastPitchBar, {width: lastPitchBar.props.width + widthElapsed, lastPercent: percentTimeBar});
		
		else 
		pitchBars.push(
			<ColorBar
			parent={bar.props}
			key={time}
			octave={voiceInfos.octave}
			note={voiceInfos.note}
			width={widthElapsed}
			marginLeft={percentTimeBar}
			lastPercent={percentTimeBar}
			correct={voiceInfos.note === bar.props.note}/>
		);
		
		const actualBar = React.cloneElement(bar, {
			sungNote: voiceInfos.note,
			children: [...pitchBars],
		});
		
		this.bars[this.actualSyllabe] = actualBar;
		
		let newScore = userScore + this.calcScore(bar.props.sil, voiceInfos.note, widthElapsed);

		return this.setState({
				bars: this.bars,
				userScore: newScore ? Math.floor(newScore) : userScore,
			})
	}

	calcScore = (syllable, sangNote, widthElapsed) => {
		if(!sangNote) return 0;

		const pointsPerMs = 10000 / this.state.parsedLyrics.meta.singTotal;
		const silMaxPoint = syllable.duration * pointsPerMs;
		let needNoteNumber = modulo(syllable.pitch, 12);
		let sangNoteNumber = noteStrings.indexOf(sangNote);

		var points = silMaxPoint * (widthElapsed/100);

		if(Math.abs(needNoteNumber - sangNoteNumber) === 1) points *= 0.5;
		else if(Math.abs(needNoteNumber - sangNoteNumber) > 1) points = 0;
		else this.correctElapsedPercent += widthElapsed;
		
		if(this.correctElapsedPercent >= 95) {
			points += 50
			this.correctElapsedPercent = 0;
			console.log(syllable.text, ' PERFECT +50 PONTOS GALERAAAA')
		}

		if(syllable.type === 'golden') points *= 2;
		
		return points;
	}

	geraLetra = (lyrics) => {
		if(!lyrics) return null;
		//var total = lyrics.duration;

		var adjustedDuration = lyrics.syllables[lyrics.syllables.length - 1].end - lyrics.syllables[0].start;		
		var middle = 0;

		var adjustedSyllabes = transposeOctave(lyrics.syllables);
		
		var t = [0, ...new Set(adjustedSyllabes.map(x => x.pitch))];
		t.sort((a, b) => a - b);
		if(t[0] < 0 || t[t.length-1] > 11) middle = Math.round((t[0] + t[t.length - 1])/2);
	
		var renderArr = [];

		var lastEnded = null;
		for (let sil of lyrics.syllables){

			let mod = modulo(sil.pitch, 12);
			let nota = noteStrings[mod];
			let _top = (sil.pitch - middle) * 30;
			
			
			if(!lastEnded) {
				renderArr.push(<LyricsBar key={sil.start} middle={middle} sil={sil} note={nota} style={{marginTop: -_top, width: (100 * sil.duration / adjustedDuration)+'%'}}/>)
				lastEnded = {
					time: sil.end,
				}
			}

			else{
				let gap = 100 * (sil.start - lastEnded.time) / adjustedDuration;
				renderArr.push(<LyricsBar key={sil.start} middle={middle} sil={sil} note={nota} style={{marginTop: -(_top), marginLeft: gap+'%', width: (100 * sil.duration / adjustedDuration)+'%'}}/>)
				lastEnded = {
					time: sil.end,
				}
			}
		}
		
		return renderArr;
	}

	timeChanged = () => {
		const {lyricsPos, parsedLyrics, videoReady} = this.state;		
		var video = this.video.current;
		var audio = this.audio.current;
		var time, duration;

		if((!audio && !video) || (audio.currentSrc && audio.paused) || (video.currentSrc && video.paused)) return;

		if(!audio.currentSrc) {
			time = video.currentTime * 1000;
			duration = video.duration*1000;
		}

		else {
			if(Math.ceil(audio.currentTime) != Math.ceil(video.currentTime)) video.currentTime = audio.currentTime;
			time = audio.currentTime * 1000;
			duration = audio.duration * 1000;
		}

		if(!videoReady && video.readyState !== 0) {
			this.setState({videoReady: true});
		}

		var progressWidth = 100 - time/duration * 100;

		var lyrics = parsedLyrics.track;
		
		//Gap inicial
		if(time < parsedLyrics.meta.gap) {
			if(this.state.nextLyric) return this.updateProgressBar(progressWidth);
			let nextText = "";
			let nextLyric = lyrics[0];
			
			for (let sil of nextLyric.syllables){
				nextText = nextText + sil.text;
			}

			this.setState({
				nextLyric: nextText,
			})

			return this.updateProgressBar(progressWidth);
		}


		//Primeiro Verso
		if(lyricsPos == -1 && time >= parsedLyrics.meta.gap){
			let currentText = "";
			let nextText = "";
			let currentLyric = lyrics[0];
			let nextLyric = lyrics[1];
			
			var bars = this.geraLetra(currentLyric);
			
			for (let sil of currentLyric.syllables){
				currentText = currentText + sil.text;
			}
			
			for (let sil of nextLyric.syllables){
				nextText = nextText + sil.text;
			}

			this.bars = bars;

			this.setState({
				lyricsPos: lyricsPos+1,
				currentLyric: currentText,
				nextLyric: nextText,
				bars: bars,
				progressWidth: progressWidth
			});

		};

		var currentLyric = lyrics[lyricsPos];
		var nextLyric = lyrics[lyricsPos+1]

		if(!currentLyric) return this.updateProgressBar(progressWidth);;

		//Palavra dentro do verso;
		if((currentLyric.end && time < currentLyric.end)){
			var currentSyllabe = currentLyric.syllables[this.actualSyllabe];

			if(time > currentSyllabe.end && this.actualSyllabe+1 < currentLyric.syllables.length) {

				this.pitchBars = [];
				this.actualSyllabe++;
				this.correctElapsedPercent = 0;

				return this.updateProgressBar(progressWidth);
			}
		}

		//Gap entre versos
		if((currentLyric && time > currentLyric.end) && (!nextLyric || time < nextLyric.start)){
			
			if(this.state.currentLyric === "" && this.state.bars === null) return this.updateProgressBar(progressWidth);

			this.actualSyllabe = null;
			this.bars = null;

			this.setState({
				currentLyric: "",
				progressWidth: progressWidth,
				bars: null,
			})
			
			return;
		}

		//Começou o próximo verso
		else if(nextLyric && time > nextLyric.start && time > currentLyric.end){
			let currentText = "";
			let nextText = "";

			if(lyricsPos == lyrics.length) return;

			currentLyric = nextLyric;
			
			var bars = this.geraLetra(currentLyric);

			for (let sil of currentLyric.syllables){
				currentText = currentText + sil.text;
			}

			if(lyrics[lyricsPos+2]){
				nextLyric = lyrics[lyricsPos+2];
				for (let sil of nextLyric.syllables){
					nextText = nextText + sil.text;
				}
			}

			this.setState({
				lyricsPos: lyricsPos+1,
				currentLyric: currentText,
				nextLyric: nextText,
				bars: bars,
				progressWidth: progressWidth,
			})
			
			this.bars = bars,
			this.actualSyllabe = 0;
			this.pitchBars = [];
			return;
		}

		return this.updateProgressBar(progressWidth);
	}

	updateProgressBar = progressWidth => {
		this.setState({progressWidth: progressWidth});
	}

	handleKeys = (event) => {
		if(!this.state.isPlaying) return this.playAll();

		switch( event.keyCode ) {
	        case 27:
				if(this.state.leaveDialog === true) {
					this.closeDialog(false);
					break;
				}
				this.pauseAll();
	            this.setState({ leaveDialog: true });
				break;
			case 32:
				if(this.state.leaveDialog === true) break;
				if(!this.isPaused()) this.pauseAll();
				else this.playAll();
				break
	        default: 
	            break;
	    }
	}
	
	closeDialog = async (leave) => {
		if(leave){
			this.video.current.pause();
			this.audio.current.pause();
			this.props.history.push('/');
		}

		else {
			this.playAll();
			this.setState({leaveDialog: false});
		}
	}

	init = async () => {
		try{
			const {selectedSong} = this.props.globalState;
			if(!selectedSong) return this.props.history.push('/');
			
			const musicPath = path.join(app.getPath('downloads'), 'karaoke', selectedSong.name);
			var files = fs.readdirSync(musicPath);

			var videoSrc = files.find(function (file) {return file.endsWith('.mp4')});
			var audioSrc = files.find(function (file) {return file.endsWith('.mp3')});
			var albumCover = files.find(function (file) {return file.endsWith('.jpg')});
			videoSrc = videoSrc ? path.join(musicPath, videoSrc) : "";
			audioSrc = audioSrc ? path.join(musicPath, audioSrc) : "";
			albumCover = albumCover ? path.join(musicPath, albumCover) : "";

			this.setState({
				musicPath: musicPath,
				musicInfo: selectedSong,
				videoSrc: videoSrc,
				audioSrc: audioSrc,
				albumCover: albumCover,
			}, this.getLyrics);

			document.addEventListener("keydown", this.handleKeys);
		}catch(e){
			console.error(e);
			this.setState({isReady: e.message})
		}
	}


	componentDidMount(){
		this.init();
	}

	componentWillUnmount() {
		if(this.micStream) this.micStream.getTracks().forEach(track => track.stop());
		if(this.micProcessor) this.micProcessor.disconnect();
		if(this.timeInterval) clearInterval(this.timeInterval);
		document.removeEventListener("keydown", this.handleKeys);
	}

	
	render(){
		const {bars, leaveDialog, videoSrc, audioSrc, userScore, progressWidth, albumCover, videoReady, isReady, isPlaying} = this.state;
	
		return (
	  		<div className={styles.karaokeContainer}>

	  			<LeaveDialog open={leaveDialog} handleClose={this.closeDialog}/>
				<ReadyDialog open={!isPlaying} ready={isReady} handleClose={this.closeDialog}/>
				<div ref={this.fade} className={styles.fade + ' ' + styles.hide}></div>

	  			<div className={styles.media}>
					{!videoReady && <img src={albumCover}/>}
		  			<video preload="auto" ref={this.video}>
				 	 	<source src={videoSrc}/>
					</video>
					<audio preload="auto" ref={this.audio}>
					  <source src={audioSrc}/>
					</audio>
				</div>
				<div className={styles.content}>
					<div className={styles.headerBar}>
					</div>
					<div className={styles.bars}>{bars}</div>
					<ProgressBar width={progressWidth}/>

					<div className={styles.botbar}>
						<div className={styles.userScore}>
							{userScore}
						</div>
						<div className={styles.lyrics}>
							<p className={styles.currentLyric}>{this.state.currentLyric}</p><p className={styles.nextLyric}>{this.state.nextLyric}</p>
						</div>
						<div className={styles.multiScores}></div>
					</div>
				</div>
	  		</div>
	  	);
	}
}

function mapStateToProps(state) {
  return {
    globalState: state.globalState,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GlobalState, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(KaraokeRoom);