// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import globalState from './globalState';

export default function createRootReducer(history) {
  return combineReducers({
    router: connectRouter(history),
    globalState
  });
}
