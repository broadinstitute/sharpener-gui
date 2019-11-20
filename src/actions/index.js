export const INIT_TRANSFORMERS = 'INIT_TRANSFORMERS'
export const GET_EXPANDERS = 'GET_EXPANDERS'
export const GET_PRODUCERS = 'GET_PRODUCERS'
export const GET_FILTERS = 'GET_FILTERS'
export const CLEAR_TRANSFORMER_PARAMETER = 'CLEAR_TRANSFORMER_PARAMETER'
export const UPDATE_PARAMETER_ON_TRANSFORMER = 'UPDATE_PARAMETER_ON_TRANSFORMER'
export const SEND_TRANSFORMER_QUERY = 'SEND_TRANSFORMER_QUERY'
export const SEND_TRANSFORMER_QUERY_ALL = 'SEND_TRANSFORMER_QUERY_ALL'
// get all transformers call
export const REQUEST_TRANSFORMERS = 'REQUEST_TRANSFORMERS'
export const INVALIDATE_TRANSFORMERS = 'INVALIDATE_TRANSFORMERS'
export const FETCH_TRANSFORMERS_ERROR = 'FETCH_TRANSFORMERS_ERROR'
export const FETCH_TRANSFORMERS_SUCCESS = 'FETCH_TRANSFORMERS_SUCCESS'

export const initializeTransformers = () => dispatch => {
    console.log("init");
    return dispatch({
        type: INIT_TRANSFORMERS,
        payload: fetchTransformers()
    });
};

export const fetchTransformers = () => dispatch => {
    dispatch(requestTransformers());
    return fetch('https://indigo.ncats.io/sharpener/transformers')
        .then(response => response.json())
        .then(json => dispatch(receiveTransformers(json)))
        .catch(error => dispatch(failToReceiveTransformers(error)))
};

// TODO
export const requestTransformers = () => ({
    type: REQUEST_TRANSFORMERS,
    payload: {
        isFetching: true
    }
});

export const failToReceiveTransformers = error => ({
    type: FETCH_TRANSFORMERS_ERROR,
    payload: {
        isFetching: false,
        status: "error",
        transformers: null,
        error: error,
        receivedAt: Date.now()
    }
});

export const receiveTransformers = transformers => ({
    type: FETCH_TRANSFORMERS_SUCCESS,
    payload: {
        isFetching: false,
        status: "success",
        transformers: transformers,
        receivedAt: Date.now()
    }
});

// get transformer info call
export const FETCH_TRANSFORMER_INFO = 'FETCH_TRANSFORMERS'
export const REQUEST_TRANSFORMER_INFO = 'FETCH_TRANSFORMERS'
export const INVALIDATE_TRANSFORMER_INFO = 'INVALIDATE_TRANSFORMER_INFO'
export const FETCH_TRANSFORMER_INFO_SUCCESS = 'FETCH_TRANSFORMER_INFO_SUCCESS'
export const FETCH_TRANSFORMER_INFO_ERROR = 'FETCH_TRANSFORMER_INFO_ERROR'


export const fetchTransformerInfo = () => dispatch => {
    dispatch(requestTransformers());
    return fetch('https://indigo.ncats.io/sharpener/transformers')
        .then(response => response.json())
        .then(json => dispatch(receiveTransformerInfo(json)))
        .catch(error => dispatch(failToReceiveTransformerInfo(error)))
};

// TODO
export const requestTransformerInfo = () => ({
    type: REQUEST_TRANSFORMER_INFO,
    payload: {
        isFetching: true
    }
});

export const receiveTransformerInfo = transformerInfo => ({
    type: FETCH_TRANSFORMER_INFO_SUCCESS,
    payload: {
        isFetching: false,
        status: "success",
        transformerInfo: transformerInfo,
        receivedAt: Date.now()
    }
});

export const failToReceiveTransformerInfo = error => ({
    type: FETCH_TRANSFORMER_INFO_ERROR,
    payload: {
        isFetching: false,
        status: "error",
        transformerInfo: null,
        error: error,
        receivedAt: Date.now()
    }
});

export const ADD_TRANSFORMER = 'ADD_TRANSFORMER';
export const REMOVE_TRANSFORMER = 'REMOVE_TRANSFORMER';

const addTransformer = (transformer) => ({
    type: ADD_TRANSFORMER,
    payload: {
        name: transformer.name
    }
});


export const REQUEST_GENE_LIST_CREATION = 'REQUEST_GENE_LIST_CREATION';
export const createGeneList = geneSymbols => dispatch => {
    let geneSymbolsQuery = {
        name: "Custom Gene List",
        gene_list_id: null,
        controls: [
            { name: "Gene Symbols", value: geneSymbols }
        ]
    };
    dispatch( { type: REQUEST_GENE_LIST_CREATION, payload: { isFetching: true, query: geneSymbolsQuery } });
    return fetch('https://indigo.ncats.io/sharpener/create_gene_list', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(geneSymbols)
        })
        .then(response => response.json())
        .then(data => { if (data.gene_list_id !== "Error") { return data; } else { throw "Transformer Error"; } })
        .then(json => dispatch(receiveGeneList(json, geneSymbolsQuery)))
        .catch(error => dispatch(failToReceiveGeneList(error)))
};

export const REQUEST_GENE_LIST_AGGREGATION = 'REQUEST_GENE_LIST_AGGREGATION'
export const RECEIVE_GENE_LIST_AGGREGATION = 'RECEIVE_GENE_LIST_AGGREGATION'

export const fetchGeneListAggregation = (name, values) => dispatch => {
    const { gene_list_ids, ...parameters } = values;
    let aggregationQuery = {
        operation: name,
        gene_list_ids: gene_list_ids ? gene_list_ids : null, // handle the producer case, against the form behavior
        controls: Object.entries(parameters).map(parameter=> ({ name: parameter[0], value: parameter[1] }))
    };

    dispatch({ type: REQUEST_GENE_LIST_AGGREGATION, payload: { isFetching: true, query: aggregationQuery } });
    return fetch('https://indigo.ncats.io/sharpener/aggregate', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(aggregationQuery)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.gene_list_id !== "Error") { return data; } else { throw "Aggregator Error"; }
        })
        .then(json => dispatch(receiveGeneList(json,
            Object.assign({}, { ...aggregationQuery, name: aggregationQuery.operation })  // if i don't do it here i'm going to have a lot of duplications handling two cases for the names elsewhere
        )))
        .catch(error => dispatch(failToReceiveGeneList(error)))
};

export const REQUEST_GENE_LIST_TRANSFORMATION = 'REQUEST_GENE_LIST_TRANSFORMATION'
export const RECEIVE_GENE_LIST_TRANSFORMATION = 'RECEIVE_GENE_LIST_TRANSFORMATION'
export const FETCH_TRANSFORMATION_SUCCESS = 'FETCH_TRANSFORMATION_SUCCESS'
export const FETCH_TRANSFORMATION_ERROR = 'FETCH_TRANSFORMATION_ERROR'

export const fetchGeneListTransformation = (name, values) => dispatch => {
    const { gene_list_id, ...parameters } = values;
    let transformerQuery = {
        name: name,
        gene_list_id: gene_list_id ? gene_list_id : null, // handle the producer case, against the form behavior
        controls: Object.entries(parameters).map(parameter=> ({ name: parameter[0], value: parameter[1] }))
    };

    dispatch({ type: REQUEST_GENE_LIST_TRANSFORMATION, payload: { isFetching: true, query: transformerQuery } });
    return fetch('https://indigo.ncats.io/sharpener/transform', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformerQuery)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.gene_list_id !== "Error") { return data; } else { throw "Transformer Error"; }
    })
    .then(json => dispatch(receiveGeneList(json, transformerQuery)))
    .catch(error => dispatch(failToReceiveGeneList(error)))
};

export const receiveGeneList = (geneListInfo, query=null) => {
    return {
        type: FETCH_TRANSFORMATION_SUCCESS,
        payload: {
            isFetching: false,
            geneList: { ...geneListInfo },
            size: geneListInfo.genes.length,
            query: query,
            status: "success",
            receivedAt: Date.now()
        }
    }
};

export const failToReceiveGeneList = error => {
    return {
        type: FETCH_TRANSFORMATION_ERROR,
        payload: {
            isFetching: false,
            status: "error",
            geneList: null,
            error: error,
            receivedAt: Date.now()
        }
    }
};

/* Gene List Actions */
export const SELECT_MULTIPLE_GENE_LIST = 'SELECT_MULTIPLE_GENE_LIST'
export const UNSELECT_MULTIPLE_GENE_LIST = 'UNSELECT_MULTIPLE_GENE_LIST'
export const UNSELECT_SINGLE_GENE_LIST = 'UNSELECT_SINGLE_GENE_LIST'
export const SELECT_SINGLE_GENE_LIST = 'SELECT_SINGLE_GENE_LIST'
export const REMOVE_GENE_LIST = 'REMOVE_GENE_LIST'

export function selectGeneList(geneListId) {
    return {
        type: SELECT_SINGLE_GENE_LIST,
        payload: {
            selectedGeneList: geneListId
        }
    }
}

export function selectGeneListMultiple(geneListId) {
    return {
        type: SELECT_MULTIPLE_GENE_LIST,
        payload: {
            selectedGeneList: geneListId
        }
    }
}

export function unselectGeneListMultiple(geneListId) {
    return {
        type: UNSELECT_MULTIPLE_GENE_LIST,
        payload: {
            selectedGeneList: geneListId
        }
    }
}

export function removeGeneList(geneListId) {
    return {
        type: REMOVE_GENE_LIST,
        payload: {
            removedGeneListId: geneListId
        }
    }
}

/* Graph Actions */
// dispatch is handled in the container
export const undo = () => ({ type: 'undo' });
export const redo = () => ({ type: 'redo' });

export const GET_SELECTIONS = 'GET_SELECTIONS';
export const getSelections = () => (dispatch, getState) => {
    const selectedGeneLists = getState().geneLists.selectedMultipleGeneListsById;
    return {
        type: GET_SELECTIONS,
        payload: {
            selections: selectedGeneLists
        }
    }
};

/* Navigation */
export const TOGGLE_PIVOT = 'TOGGLE_PIVOT'
export const togglePivot = () => (dispatch, getState) => {
    const currentPivot = getState().app.pivot;
    return dispatch({
        type: TOGGLE_PIVOT,
        payload: {
            pivot: !currentPivot
        }
    })
};
