import * as actions from '../constants/actions';

export const socketCommandsExecuted = () => ({ type: actions.SOCKET_COMMANDS_EXECUTED });

export const clientConnected = req => ({ type: actions.CLIENT_CONNECTED, ...req });

export const messageReceived = (connectionId, time, res) => ({ type: actions.MESSAGE_RECEIVED, connectionId, time, res });

export const clientDisconnected = connectionId => ({ type: actions.CLIENT_DISCONNECTED, connectionId });

export const broadcastSent = data => ({ type: actions.BROADCAST_SENT, data });

