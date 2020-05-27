// @flow
import { SET_STATE } from '../actions/globalState';

const initState = {
  user: null,
  selectedSong: null,
  currentLobby: '',
  lobbyUsers: null,
  currentScore: 0,
  songList: {},
}

export default function setState(state = initState, action) {
  switch (action.type) {
    case SET_STATE:
      return {...state, ...action.payload}
    default:
      return state;
  }
}
