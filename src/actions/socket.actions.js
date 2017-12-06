import * as A from '../constants/actions';

export const socketCreated = socket => ({ type: A.SOCKET_CREATED, socket });

export const socketErrorOccurred = err => ({ type: A.SOCKET_ERROR_OCCURRED, err });

export const socketLocalStateUpdated = req => ({ type: A.SOCKET_LOCAL_STATE_UPDATED, req });

export const socketRemoteStateUpdated = res => ({ type: A.SOCKET_REMOTE_STATE_UPDATED, res });

