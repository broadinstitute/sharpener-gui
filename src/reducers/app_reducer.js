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
    CLEAR_SELECTIONS,
    TOGGLE_FILTER_SELECTION,
    TOGGLE_EXPANDER_SELECTION,
    TOGGLE_GENE_LIST_SELECTION,
    CLEAR_FILTER_SELECTIONS,
    CLEAR_EXPANDER_SELECTIONS,
    GENES_COMPLETE,
    GENES_ERROR,
    CLEAR_ALL_GENE_LISTS,
    CLEAR_SINGLE_GENE_LIST,
    UNDO_LAST_CLEAR,
    RECORD_SHARPENER_ACTION,
    DIFFERENCE_GENE_LISTS, FILTER_GENES, COMPUTE_GENE_LIST_NAME, GENES_RECEIVED
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
    filters: [],
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
    selectedFilters: [],

    // transaction history
    // list of dates -> geneListID -> query
    transactionLedger: [],
    loadingQueryNames: [],
    loading: false
};

export default function(state=defaultState, action) {
    console.log("reducing", action);
    switch(action.type) {
        case GET_TRANSFORMERS:
            return {
                ...state,
                transformers: state.transformers.concat(action.payload.transformers),
                expanders: state.expanders.concat(action.payload.expanders),
                filters: state.expanders.concat(action.payload.filters),
                producers: state.producers.concat(action.payload.producers),
            };
        case CREATE_GENE_LIST:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.results.gene_list_id]),
                // loading: true
            };
        // TODO: loadingRequest ID and the Query Details
        case PRODUCE_GENES:
            return {
                ...state,
                // gene_list_ids: state.gene_list_ids.concat([action.payload.results.gene_list_id]),
                loadingQueryNames: state.loadingQueryNames.concat(action.payload.query.name),
                loading: true
            };
        // TODO: loadingRequest ID and the Query Details
        case TRANSFORM_GENES:
            return {
                ...state,
                // gene_list_ids: state.gene_list_ids.concat([action.payload.results.gene_list_id]),
                loadingQueryNames: state.loadingQueryNames.concat(action.payload.query.name),
                loading: true
            };
        case FILTER_GENES:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.results.gene_list_id]),
                // loading: true
            };
        case AGGREGATE_GENES:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.results.gene_list_id]),
                // loading: true
            };
        case GET_EXPANDERS_FROM_TRANSFORMERS:
            return {
                ...state,
                expanders: action.payload.expanders
            };
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
        case TOGGLE_FILTER_SELECTION:
            return {
                ...state,
                selectedFilters: action.payload.selectedFilters
            };
        case TOGGLE_GENE_LIST_SELECTION:
            return {
                ...state,
                selectedGeneListsByID: action.payload.selectedGeneListsByID
            };
        case CLEAR_SELECTIONS:
            return {
                ...state,
                selectedExpanders: [],
                selectedFilters: [],
                selectedGeneListsByID: []
            };
        case CLEAR_FILTER_SELECTIONS:
            return {
                ...state,
                selectedFilters: action.payload.filters,
            };
        case CLEAR_EXPANDER_SELECTIONS:
            return {
                ...state,
                selectedExpanders: action.payload.expanders,
            };
        case CLEAR_ALL_GENE_LISTS:
            return {
                ...state,
                selectedGeneListsByID: action.payload.selectedGeneListsByID,
                recently_cleared_gene_lists: action.payload.recently_cleared_gene_lists
            };
        case CLEAR_SINGLE_GENE_LIST:
            return {
                ...state,
                selectedGeneListsByID: action.payload.selectedGeneListsByID,
                recently_cleared_gene_lists: action.payload.recently_cleared_gene_lists
            };
        case UNDO_LAST_CLEAR:
            return {
                ...state,
                gene_list_ids: action.payload.gene_list_ids,
                recently_cleared_gene_lists: action.payload.recently_cleared_gene_lists
            };
        case RECORD_SHARPENER_ACTION:
            return {
                ...state,
                transactionLedger: state.transactionLedger.concat([action.payload])
            };
        case GENES_RECEIVED:
            // receiving genes means we're not loading anymore
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.results.gene_list_id]),
                // loadingRequest: pop out the request id and query title form the loading request index
                loadingQueryNames: state.loadingQueryNames.filter(names => names !== action.payload.query.name),
                loading: state.loadingQueryNames.filter(names => names !== action.payload.query.name).length > 0
            };
        case GENES_ERROR:
            return {
                ...state,
                gene_list_ids: state.gene_list_ids.concat([action.payload.results.gene_list_id]),
                // loadingRequest: pop out the request id and query title form the loading request index
                loadingQueryNames: state.loadingQueryNames.filter(names => names !== action.payload.query.name),
                loading: state.loadingQueryNames.filter(names => names !== action.payload.query.name).length > 0,
                errorQueryNames: action.payload.query.name,
                error: true
            };
        case DIFFERENCE_GENE_LISTS:
            // it's a query: do nothing
            return state;
        case COMPUTE_GENE_LIST_NAME:
            // it's a projection: do nothing
            return state;
        default:  // do nothing
            return state;
    }
}