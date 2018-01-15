/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import '../../browser';
import { expect } from 'chai';
import React from 'react';
import shallow from '../../shallow-with-store';
import { createMockStore } from 'redux-test-utils';
import App from '../../../src/containers/app';
import { NEW_MESSAGE } from '../../../api/lib/constants/broadcast';
import { socketLocalStateUpdated } from '../../../src/actions/socket.actions';
import Messages from '../../../src/components/messages';
import Composer from '../../../src/components/composer';

describe('<App />', () => {
    const store = createMockStore(fromJS({
        messages: ['foo', 'bar']
    }));

    const wrapper = shallow(<App />, store).dive();

    it('should render its basic structure', () => {
        expect(wrapper.is('div.chatterbox-app')).to.equal(true);
        expect(wrapper.children()).to.have.length(2);
    });

    it('should render a <Messages /> component', () => {
        expect(wrapper.childAt(0).is(Messages)).to.equal(true);
        expect(wrapper.childAt(0).props()).to.deep.equal({
            messages: fromJS(['foo', 'bar'])
        });
    });

    it('should render a <Composer /> component', () => {
        expect(wrapper.childAt(1).is(Composer)).to.equal(true);
    });

    it('should attach an onSend handler to the composer', () => {
        const now = Date.now();

        const action = socketLocalStateUpdated(NEW_MESSAGE, {
            text: 'foo',
            timeSent: now
        });

        expect(store.isActionDispatched(action)).to.equal(false);

        wrapper.childAt(1).props().onSend('foo', now);

        expect(store.isActionDispatched(action)).to.equal(true);
    });
});

