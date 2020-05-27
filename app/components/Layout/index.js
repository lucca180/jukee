import React, { PureComponent } from 'react';

import IconButton from '@material-ui/core/IconButton';

import DownloadMenu from '../DownloadMenu';

import styles from './style.css';

export default class Layout extends PureComponent {
	constructor(props){
        super(props);
        
		this.state = {
            anchorEl: null,
		}
    }
    
    handleClick = (event) => {
        this.setState({
            anchorEl: event.currentTarget
        });
    }
    
    handleClose = () => {
        this.setState({
            anchorEl: null
        });
    }

	render() {
        const {anchorEl} = this.state;
        return (
	     	<div className={styles.container}>
                
                <div className={styles.header}>
                    <div className={styles.logo}></div>
                    
                    <div className={styles.right}>
        
                        <IconButton onClick={this.handleClick} className={styles.icon}>
                            <i className="fas fa-download"></i>
                        </IconButton>

                        <DownloadMenu anchorEl={anchorEl} handleClose={this.handleClose}/>

                        <IconButton className={styles.icon}>
                            <i className="fas fa-cog "></i>
                        </IconButton>
                    </div>
                </div>
	     		<div className={styles.mainContent}>
	     			{this.props.children}
	     		</div>
                 <div className={styles.footer}>
                </div>
	      	</div>
	    );
  	}
}
