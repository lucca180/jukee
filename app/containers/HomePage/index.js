import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import ElectronStore from 'electron-store';
import classNames from 'classnames';
import path from 'path';
import fs from 'fs';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Fade from '@material-ui/core/Fade';

import Layout from '../../components/Layout/';
import RemoveDialog from '../../components/Dialogs/RemoveDialog';
import {RenderMusicCards} from '../../components/MusicCard';

import * as GlobalState from '../../actions/globalState';

import styles from './style.css';


class HomePage extends Component {
    constructor(props){
		super(props);
		this.state = {
			songs: {},
			selectedID: null,
			removeDialog: false,
			highScore: 0,
		}
	}

	cataMusicas = () => {
		try{
			const app = remote.app;
			var musicsPath = path.join(app.getPath('downloads'), 'karaoke');
			var songs = {};

			var files = fs.readdirSync(musicsPath, {withFileTypes: true});

			for(let file of files) {
				if(!file.isDirectory()) continue;
				try{
				
					let dir = path.join(musicsPath, file.name);
					let json = fs.readFileSync(path.join(dir, 'info.json'), 'utf8');
					let data = JSON.parse(json);		
					let [artist, title] = data.name.split('-');
					
					data.artist = artist;
					data.title = title;
					data.path = dir;

					if(data.done) songs[data.id] = data;
				}catch(e){
					console.warn(e)
				}
			}
			
			console.log(songs)

			this.props.setState({
				songList: songs,
			});

			this.setState({
				songs: songs,
			})
		}catch(e){
			console.error(e);
		}
	}

	selectSong = (id) => {
		this.setState({
			selectedID: id,
			highScore: this.getHighScore(id)
		});
	}

	getHighScore = (id) => {
		const highScores = new ElectronStore({name: "highScores"});
		var highScore = highScores.get(id);
		
		return highScore || 0;
	}

	toggleRemoveDialog = (didDelete = false) => {

		if(!didDelete)
			this.setState({
				removeDialog: !this.state.removeDialog,
			})
		

		else{
			var songs = this.state.songs;
			delete songs[this.state.selectedID];

			this.setState({
				removeDialog: false,
				selectedID: null,
				songs: songs,
			});
		}
	}

	playSolo = () => {
		const {songs, selectedID} = this.state;

		this.props.setState({
			selectedSong: songs[selectedID],
		});

		this.props.history.push('/room');
	}

	componentDidMount(){
		this.cataMusicas();
		ipcRenderer.on('wt-torrent-done', () => this.cataMusicas());
	}

	componentWillUnmount(){
		ipcRenderer.removeAllListeners();
	}

    render() {
		const {songs, selectedID, removeDialog, highScore} = this.state;
	    return (
	  		<Layout>
		      <div className={styles.container}>
				<RemoveDialog open={removeDialog} song={songs[selectedID]} handleClose={this.toggleRemoveDialog}/>

				<Fade in={Boolean(selectedID)}>
					<div className={classNames(styles.left, {[styles.hide]: !Boolean(selectedID)})}>
						<h2>{songs[selectedID]?.artist || ""}</h2>
						<h1>{songs[selectedID]?.title || ""}</h1>
						<div className={styles.record}>
							SEU RECORDE
							<div className={styles.recordBox}>{highScore}</div>
						</div>
					
						<Button onClick={this.playSolo} className={styles.playButton} variant="contained" color="primary">Jogar Solo</Button>

						<div className={styles.deleteButton}>
							<IconButton onClick={() => this.toggleRemoveDialog()} aria-label="delete">
								<i className="fas fa-trash"></i>
							</IconButton>
						</div>
					</div>
				</Fade>

				<Fade in={!Boolean(selectedID)}> 
					<div className={classNames(styles.left, {[styles.hide]: Boolean(selectedID)})}>
						<h2>Suas Músicas</h2>
						<h1>Selecione uma Música</h1>
						{Object.values(songs).length === 0 && <p>Você não possui nenhuma musica, que tal baixar alguma?</p>}
					</div>
				</Fade>
				<div className={styles.right}>
					<RenderMusicCards songs={songs} select={this.selectSong}/>
				</div>
		      </div>
		    </Layout>
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
  
  export default connect(mapStateToProps, mapDispatchToProps)(HomePage);