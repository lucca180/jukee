import React, { PureComponent } from 'react';
import { ipcRenderer } from 'electron';

import IconButton from '@material-ui/core/IconButton';

import Dropzone from 'react-dropzone'
import DownloadMenu from '../DownloadMenu';

import styles from './style.css';

function toBuffer(ab) {
    var buf = Buffer.alloc(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

export default class Layout extends PureComponent {
	constructor(props){
        super(props);
        
		this.state = {
            anchorEl: null,
            dropOverlay: false,
        }
        
        this.downloadIcon = React.createRef();
    }
    
    handleClick = (event) => {
        this.setState({
            anchorEl: event.currentTarget
        });

        this.downloadIcon.current.classList.remove(styles.blink)
    }
    
    handleClose = () => {
        this.setState({
            anchorEl: null
        });
    }

    toggleOverlay = (e) => {
        if(e.type === "dragenter"){
            this.setState({
                dropOverlay: true,
            })
        }
        else 
            this.setState({
                dropOverlay: false,
            })
    }

    handleDrop = async (files) => {
        this.setState({
            dropOverlay: false,
        })

        if(files.length === 0) return;

        var arrBuffer = await files[0].arrayBuffer();
        var buffer = toBuffer(arrBuffer);
        ipcRenderer.invoke('jk-add-torrent', buffer);

        if(!Boolean(this.state.anchorEl)) this.downloadIcon.current.classList.add(styles.blink);
    }

	render() {
        const {anchorEl, dropOverlay} = this.state;
        return (
            <Dropzone 
                noClick 
                noKeyboard 
                noDragEventsBubbling 
                onDragEnter={this.toggleOverlay}
                onDragLeave={this.toggleOverlay}
                onDrop={this.handleDrop}
                accept=".torrent"
                >
            
            {({getRootProps, getInputProps}) => (
	     	<div  {...getRootProps()} className={styles.container}>

                {dropOverlay && <div className={styles.dropOverlay}><i className="fas fa-download"></i></div>}

                <input {...getInputProps()} />
                <div className={styles.header}>
                    <div className={styles.logo}></div>
                    
                    <div className={styles.right}>
        
                        <IconButton onClick={this.handleClick} className={styles.icon}>
                            <i ref={this.downloadIcon} className="fas fa-download"></i>
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
            )}
            </Dropzone>
	    );
  	}
}
