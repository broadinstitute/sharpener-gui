import {combineReducers} from "redux";
import app from "./app_reducer"
import networks from "./network_reducer"

const rootReducer = combineReducers(
    {
        app,
        networks
    }
);

export default rootReducer;