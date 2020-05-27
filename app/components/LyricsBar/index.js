import React, { PureComponent } from 'react';
import classNames from 'classnames';
import styles from './style.css';

const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function mod(n, m) {
	return ((n % m) + m) % m;
}

/**
 * Find the smallest distance between two notes
 * @param  {Number} usSang 	UltraStar-format user-sang pitch
 * @param  {Number} usPitch	UltraStar-format wanted pitch
 * @return {Number}      	UltraStar-format smallest distance from wanted pitch
 */
function findMinDistance(usSang, usPitch){
	var adjSand = mod(usSang, 12);
	var adjPitch = mod(usPitch, 12);
	var adjDist = mod(adjSand - adjPitch, 12);

	return adjDist > Math.abs(adjDist - 12) ? adjDist - 12 : adjDist;
}

export class LyricsBar extends PureComponent {
	constructor(props){
		super(props);
	}

	render() {
		const {style} = this.props;
		const {type} = this.props.sil;
	    return (
	      <div className={styles.barContainer} style={{width: style.width, marginLeft: (style.marginLeft || 0)}}>
			{this.props.children}
	      	<div className={classNames(styles.bar, {[styles.specialBar]: type === 'golden'})}  style={{marginTop: style.marginTop}}>
				<p>{this.props.sil.text}</p>
			</div>
	      </div>
	    );
	}
}


export class ColorBar extends PureComponent {
	constructor(props){
		super(props);
	}
	
	render() {
		const {note, marginLeft, width, octave, parent} = this.props
		
		if(!note || width < 1) return null;
		
		var _top = 0;
		var newWidth = width;

		var sangOctave = octave - 4; // Ultrastar normalized octave
		var ultraStarSangPitch = noteStrings.indexOf(note) + (12 * sangOctave);

		_top = ( parent.sil.pitch - parent.middle + findMinDistance(ultraStarSangPitch, parent.sil.pitch)) * 15;		

		if(marginLeft && width + marginLeft > 100) newWidth = 100 - marginLeft;
	    return (
			<div className={classNames(styles.bar, styles.barColored)} 
			style={{
				width: newWidth + '%', 
				marginTop: -_top,
				marginLeft: (marginLeft || 0) + '%'}}></div>
	    );
	}
}