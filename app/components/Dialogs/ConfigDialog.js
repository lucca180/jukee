import React, { PureComponent } from 'react';

import {remote} from 'electron';
import ElectronStore from 'electron-store';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';


import Grow from '@material-ui/core/Grow';

import styles from './configStyles.css';

const userConfigs = new ElectronStore();

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

export default class ConfigDialog extends PureComponent {
	constructor(props){
        super(props);
        
        this.state = {
            downloadPath: userConfigs.get('downloadPath'),
        }
    }
    

    selectDownloadPath = () => {
        var path = remote.dialog.showOpenDialogSync({
            buttonLabel: "Selecionar",
            properties: ['openDirectory', 'promptToCreate', 'createDirectory']
        });

        if(!path) return;

        this.setState({
            downloadPath: path[0]
        })
    }


    saveConfig = () => {
        userConfigs.set("downloadPath", this.state.downloadPath);
        this.props.toggle();
    }

    reset = () => {
        this.setState({
            downloadPath: userConfigs.get('downloadPath'),
        })

    }

	render() {
        const {open} = this.props;
        const {downloadPath} = this.state;

	    return (
	    	<Dialog
                fullWidth
                open={open}
                onClose={this.props.toggle}
                onExited={this.reset}
		        TransitionComponent={Transition}
		    >
		    	<DialogTitle>Configurações</DialogTitle>

                <DialogContent>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <Icon className="fas fa-download" />
                            </ListItemIcon>
                            <ListItemText id="switch-list-label-wifi" 
                                primary="Local dos Downloads"
                                secondary={downloadPath}
                            />
                            <ListItemSecondaryAction>
                                <Button onClick={this.selectDownloadPath} variant="outlined">Escolher Pasta</Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </DialogContent>

                <DialogActions>
                    <Button onClick={this.props.toggle} color="primary">
                        Fechar
                    </Button>
                    <Button onClick={this.saveConfig} color="primary">
                        Salvar
                    </Button>
                </DialogActions>
	      	</Dialog>
	    );
	}
}