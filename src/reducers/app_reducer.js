import {
    GET_TRANSFORMERS,
    CREATE_GENE_LIST,
    PRODUCE_GENES,
    TRANSFORM_GENES,
    AGGREGATE_GENES,
    GET_EXPANDERS_FROM_TRANSFORMERS,
    GET_PRODUCERS_FROM_TRANSFORMERS,
    DISPLAY_NEW_GENE_LIST,
    SELECT_PRODUCER,
    TOGGLE_EXPANDER_SELECTION,
    TOGGLE_GENE_LIST_SELECTION,
    CLEAR_SELECTIONS,
    CLEAR_ALL_GENE_LISTS,
    CLEAR_SINGLE_GENE_LIST,
    UNDO_LAST_CLEAR
} from "../actions"

const defaultState = {
    // these should default to a false-y value to allow us to check for their full presence
    producers: [
        {
            name: "Gene Symbols",
            function: "producer",
            parameters: [{name: "gene symbol", type: "list"}]
        }
    ],
    expanders: [],
    transformers: [],

    // gene list creation state
    selectedProducer: {
        name: "Gene Symbols",
        function: "producer",
        parameters: [{name: "gene symbol", type: "list"}]
    },

    // gene view state
    gene_list_ids: [],
    recently_cleared_gene_lists: [],

    // transformer query
    selectedGeneListsByID: [],
    selectedExpanders: [],

    // transaction history
    // list of dates -> geneListID -> query
    transactionLedger: [],
    loading: true

};

export default function(state=defaultState, action) {
    switch(action.type) {
        case GET_TRANSFORMERS:
            return {
                ...state,
                transformers: state.transformers.concat(action.payload.transformers),
                expanders: state.expanders.concat(action.payload.expanders),
                producers: state.producers.concat(action.payload.producers),
                loading: false
            };
        case CREATE_GENE_LIST:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.creation.gene_list_id])
            };
        case PRODUCE_GENES:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.production.gene_list_id])
            };
        case TRANSFORM_GENES:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.transformation.gene_list_id])
            };
        case AGGREGATE_GENES:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.aggregation.gene_list_id])
            };
        case GET_EXPANDERS_FROM_TRANSFORMERS:
            return {
                ...state,
                expanders: action.payload.expanders
            }
        case GET_PRODUCERS_FROM_TRANSFORMERS:
            return {
                ...state,
                producers: action.payload.producers
            };
        case DISPLAY_NEW_GENE_LIST:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.gene_list_id])
            };
        case SELECT_PRODUCER:
            return {
                ...state,
                selectedProducer: action.payload.producer
            };
        case TOGGLE_EXPANDER_SELECTION:
            return {
                ...state,
                selectedExpanders: action.payload.selectedExpanders
            };
            // TODO
        case TOGGLE_GENE_LIST_SELECTION:
            return {
                ...state,
                selectedGeneListsByID: action.payload.selectedGeneListsByID
            };
        case CLEAR_SELECTIONS:
            return {
                ...state,
                selectedExpanders: action.payload.noExpanders,
                selectedGeneListsByID: action.payload.noGeneLists
            };
        case CLEAR_ALL_GENE_LISTS:
            return {
                ...state,
                gene_list_ids: action.payload.gene_list_ids,
                recently_cleared_gene_lists: action.payload.recently_cleared_gene_lists
            };
        case CLEAR_SINGLE_GENE_LIST:
            return {
                ...state,
                gene_list_ids: action.payload.gene_list_ids,
                recently_cleared_gene_lists: action.payload.recently_cleared_gene_lists
            };
        case UNDO_LAST_CLEAR:
            return {
                ...state,
                gene_list_ids: action.payload.gene_list_ids,
                recently_cleared_gene_lists: action.payload.recently_cleared_gene_lists
            };
        default:  // do nothing
            return state;
    }
}