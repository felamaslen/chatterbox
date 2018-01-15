import { Map as map, List as list } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';

export function Message({ message }) {
    return (
        <li className="message-outer">
            <span className="origin">{message.get('connectionId')}</span>
            <span className="text">{message.get('text')}</span>
            <span className="time-sent">{message.get('timeSent')}</span>
        </li>
    );
}

Message.propTypes = {
    message: PropTypes.instanceOf(map).isRequired
};

export default function Messages({ messages }) {
    const items = messages.map((message, key) => (
        <Message key={key} message={message} />
    ));

    return (
        <div className="messages-outer">
            <ul className="messages-list">
                {items}
            </ul>
        </div>
    );
}

Messages.propTypes = {
    messages: PropTypes.instanceOf(list).isRequired
};

