import { Server as WebSocketServer, OPEN } from 'ws';
import logger from '../helpers/logger';
import {
    socketCommandsExecuted, clientConnected, clientDisconnected, messageReceived
} from './actions';
import { SOCKET_COMMANDS_EXECUTED } from './constants/actions';
import { getRemoteIp, getNewConnectionId } from '../helpers/ip';

export const SEND = 'SEND';

function socketInstructionHandler(socket, connectionId, instructions) {
    instructions.forEach(instruction => {
        const broadcastType = instruction.get('broadcastType');

        if (broadcastType === SEND && socket.readyState === OPEN) {
            const action = JSON.stringify(instruction.get('action'));

            logger.verbose('SOCKET::SEND', connectionId, action);

            socket.send(action);
        }
    });
}

export default function createWebSocketServerMiddleware(server) {
    const secure = (process.env.WEB_URI || '').indexOf('https://') === 0;

    const wsServer = new WebSocketServer({
        server,
        path: '/socket',
        secure,
        autoAcceptConnections: false
    });

    const sockets = {};

    return ({ dispatch, getState }) => {
        wsServer.on('connection', (socket, req) => {
            const ip = getRemoteIp(req);
            const connectionId = getNewConnectionId(ip);

            const origin = ip; // could do DNS reverse lookup here

            sockets[connectionId] = socket;

            logger.info('New connection from', connectionId);

            const opened = socket.readyState === OPEN;
            if (opened) {
                logger.debug('Socket already open for', connectionId);

                dispatch(clientConnected({ connectionId, origin }));
            }
            else {
                socket.on('open', () => {
                    logger.debug('Socket opened for', connectionId);

                    dispatch(clientConnected({ connectionId, origin }));
                });
            }

            socket.on('message', res => {
                logger.verbose('Received message from', connectionId);

                dispatch(messageReceived(connectionId, Date.now(), res));
            });

            socket.on('close', () => {
                logger.info('Connection closed for', connectionId);

                Reflect.deleteProperty(sockets, connectionId);

                dispatch(clientDisconnected(connectionId));
            });
        });

        return next => action => {
            const nextAction = next(action);

            if (action.type === SOCKET_COMMANDS_EXECUTED) {
                return nextAction;
            }

            const nextState = getState();

            const socketShadowsAfter = nextState.get('socketShadows');

            logger.debug('ALL SOCKET SHADOWS', socketShadowsAfter.toJS());

            logger.debug('FILTERED SOCKET SHADOWS', socketShadowsAfter
                .filter((socketShadow, connectionId) =>
                    socketShadow.get('instructions').size && connectionId in sockets
                )
                .toJS()
            );

            socketShadowsAfter
                .filter((socketShadow, connectionId) =>
                    socketShadow.get('instructions').size && connectionId in sockets
                )
                .forEach((socketShadow, connectionId) => {
                    socketInstructionHandler(
                        sockets[connectionId], connectionId, socketShadow.get('instructions')
                    );
                });

            const broadcast = nextState.get('broadcast');

            logger.debug('BROADCAST', broadcast.toJS());

            if (broadcast.size) {
                Object.keys(sockets)
                    .forEach(socketConnectionId => socketInstructionHandler(
                        sockets[socketConnectionId], socketConnectionId, broadcast
                    ));
            }

            setTimeout(() => dispatch(socketCommandsExecuted()), 0);

            return nextAction;
        };
    };
}

