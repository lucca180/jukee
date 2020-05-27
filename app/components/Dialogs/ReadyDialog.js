import React, { PureComponent } from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import Grow from '@material-ui/core/Grow';
import { Typography } from '@material-ui/core';

// import styles from './style.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

export default class ReadyDialog extends PureComponent {
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
		    	{this.props.ready === false && <DialogTitle disableTypography><CircularProgress/></DialogTitle>}
                {this.props.ready === true && <DialogTitle>Aperte qualquer botão para continuar</DialogTitle>}
                {(this.props.ready !== true && this.props.ready !== false) && <DialogTitle>Ocorreu um erro</DialogTitle>}

                {(this.props.ready !== true && this.props.ready !== false) &&
                    <>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                    {this.props.ready}
                    </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => handleClose(true)} color="primary">
                        Retornar ao menu principal
                    </Button>
                    </DialogActions>
                    </>
                }
	      	</Dialog>
	    );
	}
}