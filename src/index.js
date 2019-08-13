import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';

import Provider from "react-redux";
import {createStore, applyMiddleware} from "redux";

const storeWithMiddleware = applyMiddleware(promiseMiddleware)(createStore);

ReactDOM.render(
    <Provider store={storeWithMiddleware(reducers)}>
          <App />
    </Provider>,
  document.getElementById('root')
);
