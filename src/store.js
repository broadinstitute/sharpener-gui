// it's an anti-pattern to have a mono-store, but it's OK in small amounts

import {compose, createStore, applyMiddleware} from "redux"
import reducers from "./reducers"

import thunkMiddleware from "redux-thunk"
import promiseMiddleware from "redux-promise"
import loggingMiddleware from "redux-logger"
import createSagaMiddleware from "redux-saga";
import transformerSaga from "./sagas/transformer_saga";

const sagaMiddleware = createSagaMiddleware();

const async_middlewares = [
    promiseMiddleware, thunkMiddleware
];
let storeWithMiddleware = compose(
    applyMiddleware(...async_middlewares),
    // saga middleware must be placed after thunk middleware to capture its dispatches
    applyMiddleware(sagaMiddleware),
    // logging middleware must be placed after all middleware (including sagas) to get prev and nextState (why?),
    // as well as saga-dispatched actions
    applyMiddleware(loggingMiddleware));
export const store = storeWithMiddleware(createStore)(reducers);

sagaMiddleware.run(transformerSaga);