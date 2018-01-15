/* eslint-disable newline-per-chained-call */
import { fromJS } from 'immutable';
import '../../browser';
import { expect } from 'chai';
import React from 'react';
import { shallow } from 'enzyme';
import Messages, { Message } from '../../../src/components/messages';

describe('<Messages />', () => {
    const props = {
        messages: fromJS([
            { connectionId: 'foo', text: 'bar', timeSent: 10 },
            { connectionId: 'bar', text: 'baz', timeSent: 12 }
        ])
    };

    const wrapper = shallow(<Messages {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('div.messages-outer')).to.equal(true);

        expect(wrapper.children()).to.have.length(1);
    });

    it('should render a messages list', () => {
        expect(wrapper.childAt(0).is('ul.messages-list')).to.equal(true);

        expect(wrapper.childAt(0).children()).to.have.length(2);

        expect(wrapper.childAt(0).childAt(0).is(Message)).to.equal(true);
        expect(wrapper.childAt(0).childAt(0).props()).to.deep.include({
            message: fromJS({ connectionId: 'foo', text: 'bar', timeSent: 10 })
        });

        expect(wrapper.childAt(0).childAt(1).is(Message)).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).props()).to.deep.include({
            message: fromJS({ connectionId: 'bar', text: 'baz', timeSent: 12 })
        });
    });
});

describe('<Message />', () => {
    const props = {
        message: fromJS({ connectionId: 'foo', text: 'bar', timeSent: 10 })
    };

    const wrapper = shallow(<Message {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is('li.message-outer')).to.equal(true);
        expect(wrapper.children()).to.have.length(3);
    });

    it('should render an origin', () => {
        expect(wrapper.childAt(0).is('span.origin')).to.equal(true);
        expect(wrapper.childAt(0).text()).to.equal('foo');
    });

    it('should render the message text', () => {
        expect(wrapper.childAt(1).is('span.text')).to.equal(true);
        expect(wrapper.childAt(1).text()).to.equal('bar');
    });

    it('should render the time sent', () => {
        expect(wrapper.childAt(2).is('span.time-sent')).to.equal(true);
        expect(wrapper.childAt(2).text()).to.equal('10');
    });
});

