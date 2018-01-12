import { List as list } from 'immutable';
import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import Messages from '../../components/messages';

function App({ messages }) {
    return <div className="chatterbox-app">
        <Messages messages={messages} />
    </div>;
}

App.propTypes = {
    messages: PropTypes.instanceOf(list).isRequired
};

const mapStateToProps = state => ({
    messages: state.get('messages')
});

export default connect(mapStateToProps)(App);

