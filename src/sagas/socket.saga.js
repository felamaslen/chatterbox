import { fork, select, take, takeEvery, call, put } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { getWSUrl } from '../helpers';

import * as A from '../constants/actions';
import * as S from '../actions/socket.actions';

export const selectSocket = state => state.getIn(['sync', 'socket']);

export function initWebSocket() {
    return eventChannel(emitter => {
        const wsUrl = getWSUrl(process.env.WEB_URI);

        const socket = new WebSocket(`${wsUrl}/socket`, 'echo-protocol');

        setTimeout(() => emitter(S.socketCreated(socket)), 0);

        socket.addEventListener('error', err => emitter(S.socketErrorOccurred(err)));

        socket.addEventListener('message', event => emitter(S.socketRemoteStateUpdated(event.data)));

        return () => emitter(S.socketCreated(null));
    });
}

export function *notifySocketOfLocalUpdate({ broadcastType: type, payload }) {
    const socket = yield select(selectSocket);

    if (!socket) {
        return;
    }

    yield call([socket, 'send'], JSON.stringify({ type, ...payload }));
}

export function *socketChannelListener() {
    const channel = yield call(initWebSocket);

    while (true) {
        const action = yield take(channel);

        yield put(action);
    }
}

export function *localStateChangeListener() {
    yield takeEvery(A.SOCKET_LOCAL_STATE_UPDATED, notifySocketOfLocalUpdate);
}

export function *socketUpdates() {
    yield fork(socketChannelListener);

    yield fork(localStateChangeListener);
}
