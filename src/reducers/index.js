import { createReducer } from 'redux-create-reducer';

import * as A from '../constants/actions';

import * as socket from './socket.reducer';

import initialState from '../initialState';

const reducers = [
    [A.SOCKET_CREATED, socket.onCreate],
    [A.SOCKET_ERROR_OCCURRED, socket.onError],
    [A.SOCKET_LOCAL_STATE_UPDATED, socket.onUpdateFromLocal],
    [A.SOCKET_REMOTE_STATE_UPDATED, socket.onPushFromRemote]
];

const createReducerObject = array => array.reduce((obj, item) => ({
    ...obj,
    [item[0]]: (state, action) => item[1](state, action)
}), {});

export default createReducer(initialState, createReducerObject(reducers));

