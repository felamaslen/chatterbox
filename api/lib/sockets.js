import logger from '../helpers/logger';
import { OPEN, Server as WebSocketServer } from 'ws';
import ShortUniqueId from 'short-unique-id';
import joi from 'joi';
import getDispatcher from './dispatcher';

import * as A from './actions';

const uid = new ShortUniqueId();

function validateMessage(req) {
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

function onMessage(dispatcher) {
    return connectionId => res => {
        try {
            const { text, timeSent } = JSON.parse(res);

            const timeReceived = Date.now();

            const req = { text, timeSent, timeReceived };

            let message = null;
            try {
                message = validateMessage(req);
            }
            catch (err) {
                logger.warn('Invalid message from client:', err.message);

                return;
            }

            dispatcher.dispatch({
                type: A.MESSAGE_RECEIVED,
                connectionId,
                ...message
            });
        }
        catch (genericErr) {
            logger.error('Error parsing message from client:', genericErr);
        }
    };
}

function onClose(dispatcher) {
    return connectionId => () => dispatcher.dispatch({
        type: A.CLIENT_DISCONNECTED,
        connectionId
    });
}

const getNewConnectionId = origin => `${origin}-${uid.randomUUID(6)}`;

function getRemoteIp(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

function onConnection(dispatcher, state) {
    return (socket, req) => {
        const ip = getRemoteIp(req);

        const origin = ip;

        const connectionId = getNewConnectionId(origin);

        socket.on('message', onMessage(dispatcher, state)(connectionId));

        socket.on('close', onClose(dispatcher, state)(connectionId));

        logger.info('New connection from', origin);

        dispatcher.dispatch({
            type: A.CLIENT_CONNECTED,
            connectionId,
            origin
        });
    };
}

function broadcast(socketServer, data) {
    socketServer.clients.forEach(client => {
        if (client.readyState === OPEN) {
            client.send(data);
        }
    });
}

function onDispatch(socketServer) {
    return state => {
        const data = JSON.stringify(state.toJS());

        logger.info('dispatching state update:', data);

        broadcast(socketServer, data);
    };
}

export default function setupWebSockets(app, server) {
    const secure = (process.env.WEB_URI || '').indexOf('https://') === 0;

    const socketServer = new WebSocketServer({
        server,
        path: '/socket',
        secure,
        autoAcceptConnections: false
    });

    const { dispatcher, state } = getDispatcher(onDispatch(socketServer));

    socketServer.on('connection', onConnection(dispatcher, state));
}

