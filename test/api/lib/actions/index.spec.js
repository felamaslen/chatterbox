import { expect } from 'chai';
import * as A from '../../../../api/lib/actions';
import * as C from '../../../../api/lib/constants/actions';

describe('API actions', () => {
    describe('socketCommandsExecuted', () => {
        it('should return SOCKET_COMMANDS_EXECUTED', () => {
            expect(A.socketCommandsExecuted()).to.deep.equal({
                type: C.SOCKET_COMMANDS_EXECUTED
            });
        });
    });

    describe('clientConnected', () => {
        it('should return CLIENT_CONNECTED with req object', () => {
            expect(A.clientConnected({ foo: 'bar' })).to.deep.equal({
                type: C.CLIENT_CONNECTED,
                foo: 'bar'
            });
        });
    });

    describe('messageReceived', () => {
        it('should return MESSAGE_RECEIVED with connectionId, time and response object', () => {
            expect(A.messageReceived('foo', 100, { foo: 'bar' })).to.deep.equal({
                type: C.MESSAGE_RECEIVED,
                connectionId: 'foo',
                time: 100,
                res: { foo: 'bar' }
            });
        });
    });

    describe('clientDisconnected', () => {
        it('should return CLIENT_DISCONNECTED with connectionId', () => {
            expect(A.clientDisconnected('foo')).to.deep.equal({
                type: C.CLIENT_DISCONNECTED,
                connectionId: 'foo'
            });
        });
    });

    describe('broadcastSent', () => {
        it('should return BROADCAST_SENT with data object', () => {
            expect(A.broadcastSent({ foo: 'bar' })).to.deep.equal({
                type: C.BROADCAST_SENT,
                data: { foo: 'bar' }
            });
        });
    });
});

