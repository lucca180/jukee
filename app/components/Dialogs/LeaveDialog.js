import React, { PureComponent } from 'react';

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

export default class LeaveDialog extends PureComponent {
	constructor(props){
		super(props);
	}

	render() {
		const {open, handleClose} = this.props
	    return (
	    	<Dialog
		        open={open}
				TransitionComponent={Transition}
		    >
		    	<DialogTitle id="alert-dialog-slide-title">Você quer sair da partida?</DialogTitle>
		        <DialogContent>
		          <DialogContentText id="alert-dialog-slide-description">
		            Sua pontuação atual será perdida
		          </DialogContentText>
		        </DialogContent>
		        <DialogActions>
		          <Button onClick={() => handleClose(true)} color="primary">
		            Sair
		          </Button>
		           <Button onClick={() => handleClose(false)} color="primary">
		        	Continuar no Jogo
		          </Button>
		        </DialogActions>
	      	</Dialog>
	    );
	}
}