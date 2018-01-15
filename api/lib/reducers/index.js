import { Map as map, List as list } from 'immutable';
import { createReducer } from 'redux-create-reducer';
import joi from 'joi';
import logger from '../../helpers/logger';
import initialState from '../state';
import * as actions from '../constants/actions';
import { SEND } from '../sockets';
import {
    CLIENT_INIT, NEW_CLIENT, CLIENT_WENT_AWAY, NEW_MESSAGE, MESSAGE_HISTORY
} from '../constants/broadcast';

export function onSocketCommandExecution(state) {
    return state
        .set('socketShadows', state.get('socketShadows')
            .map(socketShadow => socketShadow.set('instructions', list.of()))
        )
        .set('broadcast', list.of());
}

export function onBroadcast(state, { action }) {
    // we are broadcasting a message to all clients

    return state.set('broadcast', state.get('broadcast')
        .push(map({ broadcastType: SEND, action }))
    );
}

export function onClientConnection(state, { connectionId, origin }) {
    // a client connected
    return onBroadcast(
        state
            .setIn(['clients', connectionId], map({ origin }))
            .setIn(['socketShadows', connectionId], map({
                instructions: list.of(
                    map({
                        broadcastType: SEND,
                        action: {
                            type: CLIENT_INIT,
                            connectionId
                        }
                    }),
                    map({
                        broadcastType: SEND,
                        action: {
                            type: MESSAGE_HISTORY,
                            messages: state.get('messages').toJS()
                        }
                    })
                )
            })),
        {
            action: {
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
            action: {
                type: CLIENT_WENT_AWAY,
                connectionId
            }
        }
    );
}

export function validateMessage(payload) {
    const schema = joi.object().keys({
        text: joi.string().required(),
        timeSent: joi.number().integer()
            .required(),
        timeReceived: joi.number().integer()
            .required()
    });

    const { error, value } = joi.validate(payload, schema);

    if (error) {
        throw error;
    }

    return value;
}

export function onClientMessageSent(state, { connectionId, ...payload }) {
    let message = null;
    try {
        message = validateMessage(payload);
    }
    catch (validationErr) {
        logger.warn('Invalid message from client:', validationErr.message);

        return state;
    }

    const messageWithId = map({ connectionId, ...message });

    return onBroadcast(
        state.set('messages', state.get('messages').push(messageWithId)),
        {
            action: {
                type: NEW_MESSAGE,
                connectionId,
                ...message
            }
        }
    );
}

export function onClientMessage(state, { connectionId, time: timeReceived, res }) {
    // a new message is coming in from one of our connected clients
    const origin = state.getIn(['clients', connectionId, 'origin']);

    if (!origin) {
        logger.warn('Message came in from unknown client!');

        return state;
    }

    try {
        const { type, ...payload } = JSON.parse(res);

        const action = { connectionId, timeReceived, ...payload };

        if (type === NEW_MESSAGE) {
            return onClientMessageSent(state, action);
        }

        logger.warn('Received unknown instruction from client:', connectionId, type);
    }
    catch (parseErr) {
        logger.error('Error parsing message from client:', parseErr.stack);
    }

    return state;
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

