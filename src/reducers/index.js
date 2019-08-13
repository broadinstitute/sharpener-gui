import {combineReducers} from "redux";
import appReducer from "./app_reducer"
import producerControlsReducer from "./producer_controls_reducer";

const rootReducer = combineReducers(
    {
        appReducer,
        producerControlsReducer
    }
);

export default rootReducer;