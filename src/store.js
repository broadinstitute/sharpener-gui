// it's an anti-pattern to have a mono-store, but it's OK in small amounts

import {compose, createStore, applyMiddleware} from "redux"
import reducers from "./reducers"

import thunkMiddleware from "redux-thunk"
import promiseMiddleware from "redux-promise"
import loggingMiddleware from "redux-logger"

import createSagaMiddleware from "redux-saga";
import recordSagaWatch from "./sagas/record_saga";
import pollSagaWatch from "./sagas/poll_saga";
import transactionSagaWatch from "./sagas/transaction_saga";

// https://github.com/zalmoxisus/redux-devtools-extension#installation
const composeEnhancers =
    typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
            // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
        }) : compose;

const sagaMiddleware = createSagaMiddleware();
const async_middleware = [
    promiseMiddleware, thunkMiddleware
];
let storeWithMiddleware = composeEnhancers(
    applyMiddleware(...async_middleware),
    // saga middleware must be placed after thunk middleware to capture its dispatches
    applyMiddleware(sagaMiddleware),
    // logging middleware must be placed after all middleware (including sagas) to get prev and nextState (why?),
    // as well as saga-dispatched actions
    applyMiddleware(loggingMiddleware)
);
export const store = storeWithMiddleware(createStore)(reducers);

sagaMiddleware.run(pollSagaWatch);
sagaMiddleware.run(transactionSagaWatch);
sagaMiddleware.run(recordSagaWatch);
