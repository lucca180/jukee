import React, { Component } from 'react';
import { ipcRenderer } from 'electron';


import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ListSubheader from '@material-ui/core/ListSubheader';
import IconButton from '@material-ui/core/IconButton';
import Skeleton from '@material-ui/lab/Skeleton';

import RemoveDialog from '../Dialogs/RemoveDialog';

import styles from './style.css';

function toBuffer(ab) {
    var buf = Buffer.alloc(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

/**
 * Converts a long string of bytes into a readable format e.g KB, MB, GB, TB, YB
 * 
 * @param {Int} num The number of bytes.
 */
function readableBytes(bytes) {
    if(bytes === 0) return "0 KB"

    var i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

function RenderItem(props){
    const [artist, title] = props.data.name ? props.data.name.split('-') : [null, null];
    const progress = props.data.progress * 100;
    const isDone = props.data.done;
    const downSpeed = props.data.downloadSpeed;
    const upSpeed = props.data.uploadSpeed;
    const {imgDone, capa} = props.data

    if(artist === null) return (
        <MenuItem disableGutters dense onClick={() => props.onClick(props.data)} className={styles.downItem}>
            <Skeleton animation="wave" variant="rect" width="100%" height={40} />
        </MenuItem>
    )

    return (
        <MenuItem onClick={() => props.onClick(props.data)} className={styles.downItem}>
                <div className={styles.cover}>{imgDone && <img src={capa} onError={i => i.target.style.display='none'} />}</div>
                <div className={styles.info}>
                    <p className={styles.title}>{title} - {artist}</p>
                    {!isDone && <p className={styles.details}>{progress.toFixed(0)}% - {readableBytes(downSpeed)}/s</p>}
                    {isDone && <p className={styles.details}>Pronto (Fazendo Upload) - {readableBytes(upSpeed)}/s</p>}
                </div>
                <div className={styles.deleteButton}>
                    <IconButton aria-label="delete" disabled color="primary">
                        <i className="fas fa-trash"></i>
                    </IconButton>
                </div>
        </MenuItem>
    )
}

export default class DownloadMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            downloadList: [],
            removeDialog: false,
            selectedSong: null,
            deleteFiles: true,
        };  

        this.fileInput = React.createRef();

        this.progressLoop = null
        this.maxDownload = 10;
      }

    getProgress = async () => {
         ipcRenderer.invoke('jk-progress');
    }

    handleChange = async (e) => {
        var arrBuffer = await e.target.files[0].arrayBuffer();
        var buffer = toBuffer(arrBuffer);
        ipcRenderer.invoke('jk-add-torrent', buffer);
    }

    openFileDialog = () => {
        this.fileInput.current.click();
    }

    toggleRemoveDialog = (song) => {
        this.setState({
            removeDialog: !this.state.removeDialog,
            deleteFiles: !Boolean(song?.done),
            selectedSong: song || null,
        })
    }

    shouldComponentUpdate(nextProps, nextState){
        if(Boolean(this.props.anchorEl) !== Boolean(nextProps.anchorEl)){

            if(!Boolean(nextProps.anchorEl)){
                this.setState({removeDialog: false});
                clearInterval(this.progressLoop);
                this.progressLoop = setInterval(this.getProgress, 5000);
            }


            else{
                clearInterval(this.progressLoop);
                this.progressLoop = setInterval(this.getProgress, 1000);
            }
        }

        return true;
    }

    componentDidMount(){
        this.getProgress();

        ipcRenderer.on("wt-progress-result", (e, result) => {
            this.setState({
                downloadList: Object.values(result),
            });
        });
    }

    componentWillUnmount(){
        if(this.progressLoop) clearInterval(this.progressLoop);
        ipcRenderer.removeAllListeners('wt-progress-result');
    }

	render() {
        const {anchorEl, handleClose} = this.props;
        const {downloadList, removeDialog, selectedSong, deleteFiles} = this.state;
	    return (
            <Popper className={styles.root} open={Boolean(anchorEl)} anchorEl={anchorEl} role={undefined} modifiers={{
                flip: {
                  enabled: true,
                },
                preventOverflow: {
                  enabled: true,
                  boundariesElement: 'viewport',
                },
              }} transition disablePortal>
                {({ TransitionProps, placement }) => (
                <Grow {...TransitionProps} style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}>
                    <Paper>
                        <RemoveDialog song={selectedSong} open={removeDialog} deleteFiles={deleteFiles} handleClose={this.toggleRemoveDialog}/>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList id="menu-list-grow"
                                subheader={
                                    <ListSubheader disableSticky component="div">
                                        Meus Downloads {downloadList.length} / {this.maxDownload} 
                                    </ListSubheader>
                                  }
                            >
                                <input type="file" ref={this.fileInput} onChange={this.handleChange} accept=".torrent" style={{display: 'none'}}/>
                                
                                {downloadList.map(item => <RenderItem onClick={this.toggleRemoveDialog} key={item.id} data={item}/>)}

                                <MenuItem className={styles.addDownload} disabled={downloadList.length >= this.maxDownload} onClick={this.openFileDialog}> + Adicionar Torrent</MenuItem>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
                )}
            </Popper>
	    );
  	}

}
