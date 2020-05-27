import React, { PureComponent } from 'react';
import {remote, ipcRenderer } from 'electron';
import path from 'path';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grow from '@material-ui/core/Grow';

// import styles from './style.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

export default class RemoveDialog extends PureComponent {
	constructor(props){
		super(props);
    }
    
    removeSong = () => {
		const song = this.props.song;
		const deleteFiles = this.props.deleteFiles === false ? false : true;
		
		ipcRenderer.invoke('jk-remove-torrent', {id: song.id, path: song.path, deleteFiles: deleteFiles});
		this.props.handleClose(true);
    }

	render() {
		const {open, handleClose, deleteFiles = true} = this.props
	    return (
	    	<Dialog
		        open={open}
                TransitionComponent={Transition}
		    >
		    	<DialogTitle id="alert-dialog-slide-title">
					Remover Música
				</DialogTitle>
		        <DialogContent>
					{deleteFiles && 
						<DialogContentText id="alert-dialog-slide-description">
						Você quer remover essa música do jogo? <b>Todos os arquivos serão excluídos.</b>
						</DialogContentText>
				  	}

					{!deleteFiles && 
						<DialogContentText id="alert-dialog-slide-description">
							Você quer remover essa música da fila? Os arquivos <b>não</b> serão excluídos.
						</DialogContentText>
				  	}

		        </DialogContent>
		        <DialogActions>
		          <Button onClick={() => handleClose()} color="primary">
		            Cancelar
		          </Button>
		           <Button onClick={this.removeSong} color="primary">
		        	Remover
		          </Button>
		        </DialogActions>
	      	</Dialog>
	    );
	}
}