import React, { PureComponent } from 'react';

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
import Switch from '@material-ui/core/Switch';
import Icon from '@material-ui/core/Icon';


import Grow from '@material-ui/core/Grow';

import styles from './configStyles.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Grow ref={ref} {...props} />;
});

export default class ConfigDialog extends PureComponent {
	constructor(props){
        super(props);
        
        this.state = {
            checked: [],
        }
    }
    
    handleToggle = (value) => () => {
        const {checked} = this.state;
        
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];
    
        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }
    
        this.setState({
            checked: newChecked
        });
    }

	render() {
        const {open, handleClose} = this.props;
        const {checked} = this.state;

	    return (
	    	<Dialog
                fullWidth
		        open={open}
		        TransitionComponent={Transition}
		    >
		    	<DialogTitle>Configurações</DialogTitle>

                <DialogContent>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <Icon className="fas fa-download" />
                            </ListItemIcon>
                            <ListItemText id="switch-list-label-wifi" primary="Pausar downloads ao iniciar música" />
                            <ListItemSecondaryAction>
                                <Switch
                                    edge="end"
                                    onChange={this.handleToggle('wifi')}
                                    checked={checked.indexOf('wifi') !== -1}
                                    inputProps={{ 'aria-labelledby': 'switch-list-label-wifi' }}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                        
                        <ListItem>
                            <ListItemIcon>
                          
                            </ListItemIcon>
                            <ListItemText id="switch-list-label-bluetooth" primary="Bluetooth" />
                            <ListItemSecondaryAction>
                                <Switch
                                    edge="end"
                                    onChange={this.handleToggle('bluetooth')}
                                    checked={checked.indexOf('bluetooth') !== -1}
                                    inputProps={{ 'aria-labelledby': 'switch-list-label-bluetooth' }}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    </List>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => handleClose(true)} color="primary">
                        Fechar
                    </Button>
                    <Button onClick={() => handleClose(true)} color="primary">
                        Salvar
                    </Button>
                </DialogActions>
	      	</Dialog>
	    );
	}
}