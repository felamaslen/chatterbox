import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Composer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: ''
        };
    }
    render() {
        const { onSend } = this.props;

        const onChange = evt => this.setState({ text: evt.target.value });

        const onSubmit = () => {
            onSend(this.state.text);

            this.setState({ text: '' });
        };

        return (
            <div className="composer-outer">
                <input
                    type="text"
                    className="composer-input"
                    value={this.state.text}
                    onChange={onChange}
                    placeholder="Write a message"
                />
                <button className="composer-submit" onClick={onSubmit}>
                    {'Send'}
                </button>
            </div>
        );
    }
}

Composer.propTypes = {
    onSend: PropTypes.func.isRequired
};

