import { Map as map, List as list } from 'immutable';
import { createReducer } from 'redux-create-reducer';
import joi from 'joi';
import logger from '../../helpers/logger';
import initialState from '../state';
import * as actions from '../constants/actions';
import { SEND } from '../sockets';
import { NEW_CLIENT, CLIENT_WENT_AWAY, NEW_MESSAGE, MESSAGE_HISTORY } from '../constants/broadcast';

export function onSocketCommandExecution(state) {
    return state
        .set('socketShadows', state.get('socketShadows')
            .map(socketShadow => socketShadow.set('instructions', list.of()))
        )
        .set('broadcast', list.of());
}

export function onBroadcast(state, { data }) {
    // we are broadcasting a message to all clients

    return state.set('broadcast', state.get('broadcast')
        .push(map({ type: SEND, data }))
    );
}

export function onClientConnection(state, { connectionId, origin }) {
    // a client connected
    return onBroadcast(
        state
            .setIn(['clients', connectionId], map({ origin }))
            .setIn(['socketShadows', connectionId], map({
                instructions: list.of(map({
                    type: MESSAGE_HISTORY,
                    data: state.get('messages').toJS()
                }))
            })),
        {
            data: {
                type: NEW_CLIENT,
                connectionId,
                origin
            }
        }
    );
}

export function onClientDisconnection(state, { connectionId }) {
    // a client disconnected

    return onBroadcast(
        state
            .deleteIn(['clients', connectionId])
            .deleteIn(['socketShadows', connectionId]),
        {
            data: {
                type: CLIENT_WENT_AWAY,
                connectionId
            }
        }
    );
}

export function validateMessage(req) {
    const schema = joi.object().keys({
        text: joi.string().required(),
        timeSent: joi.number().integer()
            .required(),
        timeReceived: joi.number().integer()
            .required()
    });

    const { error, value } = joi.validate(req, schema);

    if (error) {
        throw error;
    }

    return value;
}

export function onClientMessage(state, { connectionId, time: timeReceived, res }) {
    // a new message is coming in from one of our connected clients
    const origin = state.getIn(['clients', connectionId, 'origin']);

    if (!origin) {
        logger.warn('Message came in from unknown client!');

        return state;
    }

    try {
        const { text, timeSent } = JSON.parse(res);

        const req = { text, timeSent, timeReceived };

        let message = null;
        try {
            message = validateMessage(req);
        }
        catch (validationErr) {
            logger.warn('Invalid message from client:', validationErr.message);

            return state;
        }

        const messageWithId = map({ connectionId, ...message });

        return onBroadcast(
            state.set('messages', state.get('messages').push(messageWithId)),
            {
                data: {
                    type: NEW_MESSAGE,
                    connectionId,
                    text: message.text
                }
            }
        );
    }
    catch (parseErr) {
        logger.error('Error parsing message from client:', parseErr.stack);

        return state;
    }
}

const createReducerObject = array => array.reduce((obj, [action, handler]) => ({
    ...obj,
    [action]: (state, payload) => handler(state, payload)
}), {});

export default createReducer(initialState, createReducerObject([
    [actions.SOCKET_COMMANDS_EXECUTED, onSocketCommandExecution],
    [actions.BROADCAST_SENT, onBroadcast],
    [actions.CLIENT_CONNECTED, onClientConnection],
    [actions.CLIENT_DISCONNECTED, onClientDisconnection],
    [actions.MESSAGE_RECEIVED, onClientMessage]
]));
