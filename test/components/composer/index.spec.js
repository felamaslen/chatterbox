/* eslint-disable newline-per-chained-call */
import '../../browser';
import { expect } from 'chai';
import React from 'react';
import { mount } from 'enzyme';
import Composer from '../../../src/components/composer';

describe('<Composer />', () => {
    let sent = null;
    beforeEach(() => {
        sent = null;
    });

    const props = {
        onSend: value => {
            sent = value;
        }
    };

    const wrapper = mount(<Composer {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.childAt(0).is('div.composer-outer')).to.equal(true);

        expect(wrapper.childAt(0).children()).to.have.length(2);
    });

    it('should render a text input', () => {
        expect(wrapper.childAt(0).childAt(0).is('input.composer-input')).to.equal(true);

        expect(wrapper.childAt(0).childAt(0).props()).to.deep.include({
            type: 'text',
            value: '',
            placeholder: 'Write a message'
        });
    });

    it('should render a send button', () => {
        expect(wrapper.childAt(0).childAt(1).is('button.composer-submit')).to.equal(true);
        expect(wrapper.childAt(0).childAt(1).text()).to.equal('Send');
    });

    it('should change the state of the component when entering text into the input', () => {
        expect(wrapper.state()).to.have.property('text', '');

        wrapper.childAt(0).childAt(0).simulate('change', { target: { value: 'foo' } });

        expect(wrapper.state()).to.have.property('text', 'foo');
    });

    it('should run onSend when the sent button is clicked', () => {
        expect(sent).to.equal(null);

        wrapper.childAt(0).childAt(1).simulate('click');

        expect(sent).to.equal('foo');
    });
});

