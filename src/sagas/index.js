import { fork } from 'redux-saga/effects';
import { socketUpdates } from './socket.saga';

export default function *rootSaga() {
    yield fork(socketUpdates);
}

