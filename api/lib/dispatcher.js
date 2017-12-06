import logger from '../helpers/logger';
import { Dispatcher } from 'flux';

import globalReducer from './store';
import getInitialState from './state';

const __DEV__ = process.env.NODE_ENV === 'development';

export default function getDispatcher(onDispatch) {
    const dispatcher = new Dispatcher();

    let state = getInitialState();

    dispatcher.register(action => {
        if (__DEV__) {
            const { type, ...options } = action;

            logger.info(type, options);
        }

        const nextState = globalReducer(state, action);

        if (state.equals(nextState)) {
            return;
        }

        state = nextState;

        if (onDispatch) {
            onDispatch(state);
        }
    });

    return { dispatcher, state };
}

