/* eslint-disable prefer-reflect */
import { fromJS } from 'immutable';
import '../browser';
import { expect } from 'chai';
import { testSaga } from 'redux-saga-test-plan';
import * as S from '../../src/sagas/socket.saga';

describe('Socket saga', () => {
    describe('selectSocket', () => {
        it('should get the socket from the state', () => {
            expect(S.selectSocket(fromJS({
                sync: {
                    socket: { foo: 'bar' }
                }
            }))).to.deep.equal(fromJS({ foo: 'bar' }));
        });
    });

    describe('notifySocketOfLocalUpdate', () => {
        it('should send data to the socket', () => {
            const testSocket = {
                send: () => null
            };

            testSaga(S.notifySocketOfLocalUpdate, {
                broadcastType: 'SOME_BROADCAST_TYPE',
                payload: { foo: 'bar' }
            })
                .next()
                .select(S.selectSocket)
                .next(testSocket)
                .call([testSocket, 'send'], '{"type":"SOME_BROADCAST_TYPE","foo":"bar"}')
                .next()
                .isDone();
        });

        it('should not do anything if the socket hasn\'t been initialised', () => {
            testSaga(S.notifySocketOfLocalUpdate, {})
                .next()
                .select(S.selectSocket)
                .next(null)
                .isDone();
        });
    });

    describe('socketChannelListener', () => {
        it('should create a WebSocket channel and listen to it', () => {
            const testChannel = S.initWebSocket();

            testSaga(S.socketChannelListener)
                .next()
                .call(S.initWebSocket)
                .next(testChannel)
                .take(testChannel)
                .next({ type: 'foo', payload: 'bar' })
                .put({ type: 'foo', payload: 'bar' })
                .next()
                .take(testChannel)
                .next({ type: 'baz', payload: 'bak' })
                .put({ type: 'baz', payload: 'bak' });
        });
    });
});

