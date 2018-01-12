import { fromJS } from 'immutable';

export default fromJS({
    clients: {},
    socketShadows: {},
    broadcast: [],
    lastConnectionId: null,
    messages: []
});

