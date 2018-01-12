import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import createWebSocketServerMiddleware from './sockets';
import logger from '../helpers/logger';

import initialState from './state';
import rootReducer from './reducers';
import rootSaga from './sagas';

const __DEV__ = process.env.NODE_ENV === 'development';

export default function configureStore(app, srv) {
    const middleware = [];

    const sagaMiddleware = createSagaMiddleware();
    middleware.push(sagaMiddleware);

    const webSocketServerMiddleware = createWebSocketServerMiddleware(srv);
    middleware.push(webSocketServerMiddleware);

    if (__DEV__) {
        const loggerMiddleware = ({ getState }) => next => action => {
            const { type, ...payload } = action;

            logger.verbose('[DISPATCHING]', type, payload);

            logger.debug('[STATE BEFORE]', JSON.stringify(getState().toJS()));

            const nextAction = next(action);

            logger.debug('[STATE AFTER]', JSON.stringify(getState().toJS()));

            return nextAction;
        };

        middleware.push(loggerMiddleware);
    }

    const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore);

    const store = createStoreWithMiddleware(rootReducer, initialState);

    sagaMiddleware.run(rootSaga);

    return store;
}

