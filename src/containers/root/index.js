import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import App from '../app';

export default function Root({ store }) {
    return <Provider store={store}>
        <App />
    </Provider>;
}

Root.propTypes = {
    store: PropTypes.object.isRequired
};

