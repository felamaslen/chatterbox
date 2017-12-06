import { Map as map } from 'immutable';

export const onClientConnection = (state, { connectionId, origin }) => state
    .setIn(['clients', connectionId], origin);

export const onClientDisconnection = (state, { connectionId }) => state
    .deleteIn(['clients', connectionId]);

export function onClientMessage(state, { connectionId, ...message }) {
    const origin = state.getIn(['clients', connectionId]);

    if (!origin) {
        return state;
    }

    return state
        .set('messages', state.get('messages').push(map({ origin, ...message })));
}

