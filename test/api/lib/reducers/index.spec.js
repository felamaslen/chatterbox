/* eslint-disable no-undefined */
import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../../../api/lib/reducers';
import { SEND } from '../../../../api/lib/sockets';
import * as CB from '../../../../api/lib/constants/broadcast';

describe('API reducers', () => {
    describe('onSocketCommandExecution', () => {
        it('should reset pending communications to clients', () => {
            expect(R.onSocketCommandExecution(fromJS({
                socketShadows: [
                    {
                        instructions: ['foo', 'bar']
                    },
                    {
                        nothing: 'here'
                    }
                ],
                broadcast: ['baz']
            })).toJS()).to.deep.equal({
                socketShadows: [
                    {
                        instructions: []
                    },
                    {
                        instructions: [],
                        nothing: 'here'
                    }
                ],
                broadcast: []
            });
        });
    });

    describe('onBroadcast', () => {
        it('should push a SEND item to the broadcast list', () => {
            expect(R.onBroadcast(fromJS({
                broadcast: []
            }), { action: { foo: 'bar' } }).toJS())
                .to.deep.equal({
                    broadcast: [
                        { broadcastType: SEND, action: { foo: 'bar' } }
                    ]
                });
        });
    });

    describe('onClientConnection', () => {
        const state = fromJS({
            clients: {},
            socketShadows: {},
            broadcast: [],
            messages: ['baz', 'bak']
        });

        const result = R.onClientConnection(state, { connectionId: 'foo', origin: 'bar' });

        it('should add the client', () => {
            expect(result.getIn(['clients', 'foo']).toJS()).to.deep.equal({ origin: 'bar' });
        });

        it('should add a socket shadow with initialisation broadcasts to the client', () => {
            expect(result.getIn(['socketShadows', 'foo']).toJS()).to.deep.equal({
                instructions: [
                    {
                        broadcastType: SEND,
                        action: {
                            type: CB.CLIENT_INIT,
                            connectionId: 'foo'
                        }
                    },
                    {
                        broadcastType: SEND,
                        action: {
                            type: CB.MESSAGE_HISTORY,
                            messages: ['baz', 'bak']
                        }
                    }
                ]
            });
        });

        it('should broadcast the new client to everybody', () => {
            expect(result.getIn(['broadcast']).toJS()).to.deep.equal([
                {
                    broadcastType: SEND,
                    action: {
                        type: CB.NEW_CLIENT,
                        connectionId: 'foo',
                        origin: 'bar'
                    }
                }
            ]);
        });
    });

    describe('onClientDisconnection', () => {
        const state = fromJS({
            clients: {
                foo: { some: 'client' }
            },
            socketShadows: {
                foo: { some: 'socketShadow' }
            },
            broadcast: []
        });

        const result = R.onClientDisconnection(state, { connectionId: 'foo' });

        it('should remove the client', () => {
            expect(result.getIn(['clients', 'foo'])).to.equal(undefined);
        });
        it('should remove the socket shadow', () => {
            expect(result.getIn(['socketShadows', 'foo'])).to.equal(undefined);
        });

        it('should broadcast the client disconnection to everybody', () => {
            expect(result.getIn(['broadcast']).toJS()).to.deep.equal([
                {
                    broadcastType: SEND,
                    action: {
                        type: CB.CLIENT_WENT_AWAY,
                        connectionId: 'foo'
                    }
                }
            ]);
        });
    });

    describe('validateMessage', () => {
        it('should accept and return valid messages', () => {
            expect(R.validateMessage({
                text: 'foo',
                timeSent: 10,
                timeReceived: 11
            })).to.deep.equal({
                text: 'foo',
                timeSent: 10,
                timeReceived: 11
            });
        });

        it('should throw an error for invalid messages', () => {
            expect(() => R.validateMessage({ text: 'foo' })).to.throw();
            expect(() => R.validateMessage({ timeSent: 10 })).to.throw();
            expect(() => R.validateMessage({ timeReceived: 11 })).to.throw();
            expect(() => R.validateMessage({ text: 'foo', timeSent: 10 })).to.throw();
            expect(() => R.validateMessage({ text: 'foo', timeReceived: 11 })).to.throw();
            expect(() => R.validateMessage({ timeSent: 10, timeReceived: 11 })).to.throw();
        });
    });

    describe('onClientMessageSent', () => {
        const state = fromJS({
            messages: [],
            broadcast: []
        });

        const result = R.onClientMessageSent(state, { connectionId: 'foo', text: 'bar', timeSent: 10, timeReceived: 11 });

        it('should push the validated message to the state', () => {
            expect(result.get('messages').toJS()).to.deep.equal([
                {
                    connectionId: 'foo',
                    timeSent: 10,
                    timeReceived: 11,
                    text: 'bar'
                }
            ]);
        });

        it('should broadcast the message', () => {
            expect(result.get('broadcast').toJS()).to.deep.equal([
                {
                    broadcastType: SEND,
                    action: {
                        type: CB.NEW_MESSAGE,
                        connectionId: 'foo',
                        timeSent: 10,
                        timeReceived: 11,
                        text: 'bar'
                    }
                }
            ]);
        });
    });

    describe('onClientMessage', () => {
        const state = fromJS({
            clients: {
                foo: {
                    origin: 'bar'
                }
            }
        });

        it('(for type: NEW_MESSAGE) should return onClientMessageSent(state) with an action', () => {
            const connectionId = 'foo';

            const time = 10;

            const res = JSON.stringify({
                type: CB.NEW_MESSAGE,
                bar: 'baz'
            });

            const result = R.onClientMessage(state, { connectionId, time, res });

            expect(result).to.deep.equal(R.onClientMessageSent(state, {
                connectionId,
                timeReceived: 10,
                bar: 'baz'
            }));
        });

        it('should not do anything if the client doesn\'t exist', () => {
            expect(R.onClientMessage(state, { connectionId: 'noexist', time: 10, res: '{}' }))
                .to.deep.equal(state);
        });

        it('should not do anything if the client JSON request is invalid', () => {
            expect(R.onClientMessage(state, { connectionId: 'foo', time: 10, res: 'invalid-json' }))
                .to.deep.equal(state);
        });

        it('should not do anything if the broadcast type is unrecognised', () => {
            expect(R.onClientMessage(state, {
                connectionId: 'foo',
                time: 10,
                res: JSON.stringify({
                    type: 'unknown_type',
                    bar: 'baz'
                })
            }))
                .to.deep.equal(state);
        });
    });
});

