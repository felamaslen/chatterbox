import { fromJS } from 'immutable';

export default fromJS({
    sync: {
        socket: null,
        error: null,
        connectionId: null,
        local: {
            // this is "stuff" which is waiting to be sent
            // it should be represented in the UI as "loading" - the single source
            // of global truth is reflected in the rest of the state, once updates
            // are processed by the WebSocket connection
            messages: []
        }
    },
    messages: []
});

