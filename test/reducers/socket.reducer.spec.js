import { fromJS } from 'immutable';
import { expect } from 'chai';
import * as R from '../../src/reducers/socket.reducer';
import * as CB from '../../api/lib/constants/broadcast';

describe('Socket reducers', () => {
    describe('onCreate', () => {
        it('should add the socket to the state', () => {
            expect(R.onCreate(fromJS({
                sync: {
                }
            }), { socket: { foo: 'bar' } }).toJS())
                .to.deep.equal({
                    sync: {
                        socket: { foo: 'bar' }
                    }
                });
        });
    });

    describe('onError', () => {
        it('should set the error in state', () => {
            expect(R.onError(fromJS({
                sync: {
                }
            }), 'some error').toJS())
                .to.deep.equal({
                    sync: {
                        error: 'some error'
                    }
                });
        });
    });

    describe('addPendingMessage', () => {
        it('should push a new message to the pending state', () => {
            const state = fromJS({
                sync: {
                    connectionId: 'foo',
                    local: {
                        messages: []
                    }
                }
            });

            const result = R.addPendingMessage(state, { text: 'some message' });

            expect(result.toJS()).to.deep.equal({
                sync: {
                    connectionId: 'foo',
                    local: {
                        messages: [
                            { connectionId: 'foo', text: 'some message' }
                        ]
                    }
                }
            });
        });
    });

    describe('onUpdateFromLocal', () => {
        it('(for type: NEW_MESSAGE) should add a pending message', () => {
            const state = fromJS({
                sync: {
                    connectionId: 'foo',
                    local: {
                        messages: []
                    }
                }
            });

            const result = R.onUpdateFromLocal(state, {
                broadcastType: CB.NEW_MESSAGE,
                payload: { text: 'some message' }
            });

            expect(result).to.deep.equal(R.addPendingMessage(state, { text: 'some message' }));
        });

        it('(otherwise) should do nothing', () => {
            const state = fromJS({
                sync: {
                    connectionId: 'foo'
                }
            });

            expect(R.onUpdateFromLocal(state, { broadcastType: 'some-type' })).to.deep.equal(state);
        });
    });

    describe('onPushFromRemote', () => {
        const state = fromJS({
            sync: {
                local: {
                    messages: ['foo']
                }
            },
            messages: []
        });

        it('should not do anything if no response was given', () => {
            expect(R.onPushFromRemote(state, { res: null })).to.deep.equal(state);
        });

        it('should not do anything if the response was bad JSON', () => {
            expect(R.onPushFromRemote(state, { res: 'bad-json' })).to.deep.equal(state);
        });

        describe('if the type is CLIENT_INIT', () => {
            it('should set the connectionId', () => {
                expect(R.onPushFromRemote(state, { res: `{"type":"${CB.CLIENT_INIT}","connectionId":"foo"}` }).toJS())
                    .to.deep.equal({
                        sync: {
                            connectionId: 'foo',
                            local: {
                                messages: ['foo']
                            }
                        },
                        messages: []
                    });
            });
        });

        describe('if the type is MESSAGE_HISTORY', () => {
            it('should set the message history', () => {
                expect(R.onPushFromRemote(state, { res: `{"type":"${CB.MESSAGE_HISTORY}","messages":["foo","bar"]}` }).toJS())
                    .to.deep.equal({
                        sync: {
                            local: {
                                messages: ['foo']
                            }
                        },
                        messages: ['foo', 'bar']
                    });
            });
        });

        describe('if the type is NEW_MESSAGE', () => {
            const res = JSON.stringify({
                type: CB.NEW_MESSAGE,
                text: 'foo',
                timeSent: 10,
                connectionId: 'bar'
            });

            const result = R.onPushFromRemote(state, { res });

            it('should push the new message onto the current list', () => {
                expect(result.get('messages').toJS()).to.deep.equal([
                    { text: 'foo', timeSent: 10, connectionId: 'bar' }
                ]);
            });

            it('should clear the list of pending messages', () => {
                expect(result.getIn(['sync', 'local', 'messages'])).to.have.property('size', 0);
            });
        });

        describe('if the type is NEW_CLIENT', () => {
            it('should do nothing', () => {
                expect(R.onPushFromRemote(state, { res: `{"type":"${CB.NEW_CLIENT}"}` }))
                    .to.deep.equal(state);
            });
        });
    });
});

