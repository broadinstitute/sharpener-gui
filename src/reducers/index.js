import { combineReducers } from 'redux'
import history from "./graph_reducer"
import geneLists from "./genelist_reducer";
import transformers from './transformers_reducer'
import app from './transaction_reducer'

export default combineReducers({
    app,
    geneLists,
    transformers,
    history,
})
