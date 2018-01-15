import { expect } from 'chai';
import * as A from '../../src/actions/socket.actions';
import * as C from '../../src/constants/actions';

describe('Socket actions', () => {
    describe('socketCreated', () => {
        it('should return SOCKET_CREATED with socket', () => {
            expect(A.socketCreated({ foo: 'bar' })).to.deep.equal({
                type: C.SOCKET_CREATED,
                socket: { foo: 'bar' }
            });
        });
    });

    describe('socketErrorOccurred', () => {
        it('should return SOCKET_ERROR_OCCURRED with error', () => {
            expect(A.socketErrorOccurred('foo error')).to.deep.equal({
                type: C.SOCKET_ERROR_OCCURRED,
                err: 'foo error'
            });
        });
    });

    describe('socketLocalStateUpdated', () => {
        it('should return SOCKET_LOCAL_STATE_UPDATED with broadcast type and payload', () => {
            expect(A.socketLocalStateUpdated('foo', { bar: 'baz' })).to.deep.equal({
                type: C.SOCKET_LOCAL_STATE_UPDATED,
                broadcastType: 'foo',
                payload: { bar: 'baz' }
            });
        });
    });

    describe('socketRemoteStateUpdated', () => {
        it('should return SOCKET_REMOTE_STATE_UPDATED with response', () => {
            expect(A.socketRemoteStateUpdated({ foo: 'bar' })).to.deep.equal({
                type: C.SOCKET_REMOTE_STATE_UPDATED,
                res: { foo: 'bar' }
            });
        });
    });
});

