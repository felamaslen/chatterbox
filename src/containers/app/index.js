import { List as list } from 'immutable';
import { connect } from 'react-redux';
import { socketLocalStateUpdated } from '../../actions/socket.actions';
import { NEW_MESSAGE } from '../../../api/lib/constants/broadcast';
import React from 'react';
import PropTypes from 'prop-types';
import Messages from '../../components/messages';
import Composer from '../../components/composer';

function App({ messages, onSend }) {
    return (
        <div className="chatterbox-app">
            <Messages messages={messages} />
            <Composer onSend={onSend} />
        </div>
    );
}

App.propTypes = {
    messages: PropTypes.instanceOf(list).isRequired,
    onSend: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    messages: state.get('messages')
});

const mapDispatchToProps = dispatch => ({
    onSend: (text, now = Date.now()) => dispatch(socketLocalStateUpdated(NEW_MESSAGE, {
        text,
        timeSent: now
    }))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);

