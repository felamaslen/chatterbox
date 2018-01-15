import 'babel-polyfill';
import { URL } from 'url';

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

import { JSDOM } from 'jsdom';

const exposedProperties = ['window', 'navigator', 'document'];

global.window = (new JSDOM('')).window;
global.document = window.document;

window.URL = URL;
global.URL = URL;

class TestWebSocket {
    constructor(url, protocol) {
        this.url = url;
        this.protocol = protocol;

        this.eventListeners = {};
    }
    addEventListener(event, callback) {
        if (event in this.eventListeners) {
            this.eventListeners[event].push(callback);
        }
        else {
            this.eventListeners[event] = [callback];
        }
    }
    removeEventListener(event, callback) {
        if (event in this.eventListeners) {
            const index = this.eventListeners[event].indexOf(callback);

            if (index > -1) {
                this.eventListeners.splice(index, 1);
            }
        }
    }
}

window.WebSocket = TestWebSocket;

Object.keys(window).forEach(property => {
    if (typeof global[property] === 'undefined') {
        exposedProperties.push(property);
        global[property] = window[property];
    }
});

global.navigator = {
    userAgent: 'node.js'
};

global.documentRef = document; // eslint-disable-line no-undef

