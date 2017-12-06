import * as A from './actions';
import * as R from './reducers';

const reducers = {
    [A.CLIENT_CONNECTED]: R.onClientConnection,
    [A.CLIENT_DISCONNECTED]: R.onClientDisconnection,
    [A.MESSAGE_RECEIVED]: R.onClientMessage
};

export default (state, { type, ...action }) => {
    if (type in reducers) {
        return reducers[type](state, action);
    }

    return state;
};

