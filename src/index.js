import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';

import {Provider} from "react-redux";
import reducers from "./reducers"
import {store} from "./store"

ReactDOM.render(
    <Provider store={store(reducers)}>
          <App />
    </Provider>,
  document.getElementById('root')
);
