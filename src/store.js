// it's an anti-pattern to have a mono-store, but it's OK in small amounts

import {createStore, applyMiddleware} from "redux"
import thunkMiddleware from "redux-thunk"
import promiseMiddleware from "redux-promise"
import loggingMiddleware from "redux-logger"

const storeWithMiddleware = applyMiddleware(promiseMiddleware, thunkMiddleware, loggingMiddleware);
export const store = storeWithMiddleware(createStore);