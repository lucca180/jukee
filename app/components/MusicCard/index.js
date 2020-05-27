import React, { PureComponent } from 'react';

import Paper from '@material-ui/core/Paper';
import ButtonBase from '@material-ui/core/ButtonBase';

import styles from './style.css';

export class MusicCard extends PureComponent {
	render() {
        const {data, select} = this.props;
	    return (
            <ButtonBase component="div" onClick={()=> select(data.id)} className={styles.cardBase}>
                <Paper className={styles.card} elevation={3}>
                    <div className={styles.cover}><img src={data.capa}/></div>
                    <div className={styles.musicInfo}>
                        <p className={styles.title}>{data.title}</p>
                        <p className={styles.artist}>{data.artist}</p>
                    </div>
                </Paper>
            </ButtonBase>
	    );
	}
}


export function RenderMusicCards(props) {
    const songs = props.songs;
    const listItems = Object.values(songs).sort(function(a, b) {
       
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
     }).map((song) => <MusicCard key={song.id} data={song} select={props.select}/>);


    return (<>{listItems}</>);
  }