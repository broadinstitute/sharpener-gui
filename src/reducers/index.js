import {combineReducers} from "redux";
import app from "./app_reducer"

const rootReducer = combineReducers(
    {
        app
    }
);

export default rootReducer;