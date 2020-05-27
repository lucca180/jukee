import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ElectronStore from 'electron-store';

import IconButton from '@material-ui/core/IconButton';
import Fade from '@material-ui/core/Fade';

import * as GlobalState from '../../actions/globalState';

import styles from './style.css';


class ScorePage extends React.PureComponent  {
	constructor(props) {
	    super(props);

	    this.state = {
			isHighScore: false,
	    }
	}

	goHome = () => {
		this.props.setState({
			currentScore: 0,
		});
		
		this.props.history.push("/");
	}

	checkHighScore = () => {
		const {selectedSong, currentScore} = this.props.globalState;
		const highScores = new ElectronStore({name: "highScores"});

		var highScore = highScores.get(selectedSong.id, false);

		if(!highScore || currentScore > highScore) {
			highScores.set(selectedSong.id, currentScore);
			this.setState({isHighScore: true});
		}
	}

	componentDidMount(){
		if(!this.props.globalState.selectedSong) return this.goHome();
		this.checkHighScore();
	}

	render(){
		const {selectedSong, currentScore} = this.props.globalState;
		console.log(selectedSong)
		return (
			<div className={styles.root}>
				<Fade in timeout={500}>
					<div className={styles.container}>
						<div className={styles.header}>
							<div className={styles.logo}></div>
							<div className={styles.musicInfo}>
								<h2>{selectedSong?.artist}</h2>
								<h1>{selectedSong?.title}</h1>
							</div>
						</div>
						<div className={styles.content}>
							<h1>VOCÊ FEZ {currentScore} PONTOS </h1>
							{this.state.isHighScore && <h2>É seu novo recorde!</h2>}
						</div>
						<div className={styles.backButton}>
							<IconButton onClick={this.goHome} aria-label="delete">
							<i className="fas fa-chevron-circle-left"></i>
							</IconButton>
						</div>
					</div>
				</Fade>
			</div>
	  	);
	}
}

function mapStateToProps(state) {
  return {
    globalState: state.globalState,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(GlobalState, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ScorePage);