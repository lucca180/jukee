import React, { PureComponent } from 'react';
import styles from './style.css';

export default class ProgressBar extends PureComponent {
	constructor(props){
		super(props);
	}
	
	render() {	
	    return (
			<div className={styles.progressBar}>
                <div className={styles.progressDot}></div>
                <div className={styles.progress} style={{width: this.props.width+'%'}}></div>
            </div>
	    );
	}
}