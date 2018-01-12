import { Map as map, List as list, fromJS } from 'immutable';
import * as broadcast from '../../api/lib/constants/broadcast';

export const onCreate = (state, { socket }) => state
    .setIn(['sync', 'socket'], socket);

export const onError = (state, err) => state
    .setIn(['sync', 'error'], err);

export function addPendingMessage(state, { text }) {
    return state.setIn(['sync', 'local', 'messages'], state.getIn(['sync', 'local', 'messages'])
        .push(map({ connectionId: state.getIn(['sync', 'connectionId']), text }))
    );
}

export function onUpdateFromLocal(state, { type, ...data }) {
    // Add data to the local ("pending") part of the state
    // Saga middleware will trigger the call to update the server
    // Once that's done, another action will be fired which triggers the
    // reducer below (onPushFromRemote)
    //
    // The objects passed into this reducer correspond to the objects
    // sent across the socket

    if (type === broadcast.NEW_MESSAGE) {
        return addPendingMessage(state, data);
    }

    return state;
}

export function onPushFromRemote(state, { res }) {
    if (!res) {
        return state;
    }

    let resObj = null;
    try {
        resObj = JSON.parse(res);
    }
    catch (err) {
        return state;
    }

    const { type, ...data } = resObj;

    if (type === broadcast.CLIENT_INIT) {
        return state.setIn(['sync', 'connectionId'], data.connectionId);
    }

    if (type === broadcast.MESSAGE_HISTORY) {
        return state.set('messages', fromJS(data.messages));
    }

    if (type === broadcast.NEW_MESSAGE) {
        const newMessages = state.get('messages').push(map(data));

        return state
            .set('messages', newMessages)
            .setIn(['sync', 'local', 'messages'], list.of());
    }

    if (type === broadcast.NEW_CLIENT) {
        return state;
    }

    return state;
}

