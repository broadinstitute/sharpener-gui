import {
    FETCH_TRANSFORMATION_ERROR,
    FETCH_TRANSFORMATION_SUCCESS,
    REQUEST_GENE_LIST_CREATION,
    REQUEST_GENE_LIST_TRANSFORMATION,
    TOGGLE_PIVOT
} from "../actions";

const initialState = {
    focusOrBlur: false, // start off blurred
    pivot: true,

    isFetching: null,
    isCreateFetching: null,
    transactionsFetching: [],
    transactionLedger: [],
    transactionsNormalized: {
        byOutputId: {}
    },
    sourceCount: {}
};

const app = (state=initialState, action) => {
    switch (action.type) {
        case TOGGLE_PIVOT:
            return {
                ...state,
                pivot: action.payload.pivot
            }
        //case REQUEST_GENE_LIST_CREATION:
          //  return {
            //    isCreateFetching: action.payload.isCreateFetching,
	//	transactionsFetching: state.transactionsFetching.concat(action.payload.query.name)
          //  }
        case REQUEST_GENE_LIST_TRANSFORMATION:
            return {
                ...state,
                isFetching: action.payload.isFetching, // should generally be true,
                transactionsFetching: state.transactionsFetching.concat(action.payload.query.name)
            };
        case FETCH_TRANSFORMATION_SUCCESS:
            return {
                ...state,
                isFetching: [
                    ...state.transactionsFetching.slice(0, state.transactionsFetching.indexOf(action.payload.query.name)),
                    ...state.transactionsFetching.slice(state.transactionsFetching.indexOf(action.payload.query.name) + 1),
                ].length > 0,
                isCreateFetching: false,
                transactionsFetching: [
                    ...state.transactionsFetching.slice(0, state.transactionsFetching.indexOf(action.payload.query.name)),
                    ...state.transactionsFetching.slice(state.transactionsFetching.indexOf(action.payload.query.name) + 1),
                ],
                transactionLedger: state.transactionLedger.concat([
                    {   query: action.payload.query,
                        // function: transformersNormalized.byName[action.payload.query.name].function,
                        size: action.payload.size,
                        gene_list_id: action.payload.geneList.gene_list_id  }]),
                transactionsNormalized: {
                    byOutputId: {
                        [action.payload.geneList.gene_list_id]: {
                            query: action.payload.query,
                            size: action.payload.size,
                            // function: transformersNormalized.byName[action.payload.query.name].function,
                            gene_list_id: action.payload.geneList.gene_list_id }
                    }
                },
                sourceCount: {...state.sourceCount, [action.payload.query.name]: state.sourceCount[action.payload.query.name] ? state.sourceCount[action.payload.query.name] + 1 : 1  }
            };
        case FETCH_TRANSFORMATION_ERROR:
            return {
                ...state,
                transactionsFetching: [
                    ...state.transactionsFetching.slice(0, state.transactionsFetching.indexOf(action.payload.query.name)),
                    ...state.transactionsFetching.slice(state.transactionsFetching.indexOf(action.payload.query.name) + 1),
                ],
                isFetching: [
                    ...state.transactionsFetching.slice(0, state.transactionsFetching.indexOf(action.payload.query.name)),
                    ...state.transactionsFetching.slice(state.transactionsFetching.indexOf(action.payload.query.name) + 1),
                ].length > 0,
                isCreateFetching: false
            };
        default:
            return state;
    }
};
export default app
