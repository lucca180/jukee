// @flow
import type { GetState, Dispatch } from '../reducers/types';

export const SET_STATE = 'SET_STATE';

export function setState(state){
  return {
    type: SET_STATE,
    payload:{
      ...state,
    },
  };
}