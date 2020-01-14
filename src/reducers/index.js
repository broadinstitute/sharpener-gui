import { combineReducers } from 'redux'
import graph from "./graph_reducer"
import geneLists from "./genelist_reducer";
import transformers from './transformers_reducer'
import app from './transaction_reducer'

export default combineReducers({
    app,
    geneLists,
    transformers,
    graph,
})
