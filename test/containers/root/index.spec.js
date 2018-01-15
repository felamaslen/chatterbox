/* eslint-disable newline-per-chained-call */
import '../../browser';
import { expect } from 'chai';
import React from 'react';
import { Provider } from 'react-redux';
import { shallow } from 'enzyme';
import { createMockStore } from 'redux-test-utils';
import Root from '../../../src/containers/root';
import App from '../../../src/containers/app';

describe('<Root />', () => {
    const store = createMockStore({});

    const props = { store };

    const wrapper = shallow(<Root {...props} />);

    it('should render its basic structure', () => {
        expect(wrapper.is(Provider)).to.equal(true);
        expect(wrapper.children()).to.have.length(1);
        expect(wrapper.props()).to.deep.include({ store });
    });

    it('should render an <App /> container', () => {
        expect(wrapper.childAt(0).is(App)).to.equal(true);
    });
});

