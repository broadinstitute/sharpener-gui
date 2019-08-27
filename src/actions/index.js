import {SERVICE_URL} from "../parameters/EndpointURLs";
import {FEATURE_FLAG} from "../parameters/FeatureFlags";
import {store} from "../store";

/*
    Application Actions
 */

// general app actions
export const GET_TRANSFORMERS = 'GET_TRANSFORMERS';
export const CREATE_GENE_LIST = 'CREATE_GENE_LIST';
export const PRODUCE_GENES = 'PRODUCE_GENES';
export const TRANSFORM_GENES = 'TRANSFORM_GENES';
export const AGGREGATE_GENES = 'AGGREGATE_GENES';
export const GET_EXPANDERS_FROM_TRANSFORMERS = 'GET_EXPANDERS_FROM_TRANSFORMERS';
export const GET_PRODUCERS_FROM_TRANSFORMERS = 'GET_PRODUCERS_FROM_TRANSFORMERS';
export const DISPLAY_NEW_GENE_LIST = 'DISPLAY_NEW_GENE_LIST';
export const SELECT_PRODUCER = 'SELECT_PRODUCER';
export const TOGGLE_EXPANDER_SELECTION = 'TOGGLE_EXPANDER_SELECTION';
export const TOGGLE_GENE_LIST_SELECTION = 'TOGGLE_GENE_LIST_SELECTION';
export const CLEAR_SELECTIONS = 'CLEAR_SELECTIONS';
export const CLEAR_SINGLE_GENE_LIST = 'CLEAR_SINGLE_GENE_LIST';
export const CLEAR_ALL_GENE_LISTS = 'CLEAR_ALL_GENE_LISTS';
export const UNDO_LAST_CLEAR = 'UNDO_LAST_CLEAR';
export const RECORD_SHARPENER_ACTION = 'RECORD_SHARPENER_ACTION';

export function getTransformers(continuation = (result) => result) {
    return (dispatch) => {
        const requestTransformers = fetch(SERVICE_URL.concat('/transformers'))
            .then(response => response.json())
            .then(data => {
                if (data === undefined || data.length === 0) {
                    throw "No data or undefined data";
                } else {
                    let transformers = data;
                    return continuation({
                        transformers: transformers,
                        expanders: transformers.filter((item) => { return item['function'] === 'expander' }),
                        producers: transformers.filter((item) => { return item['function'] === 'producer' })
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
        return dispatch({
            type: GET_TRANSFORMERS,
            payload: requestTransformers
        })
    }
}

// TODO: refactor to using store? or take as arg?
export function getExpandersFromTransformers(transformers) {
    const onlyExpanders = transformers.filter((item) => { return item['function'] === 'expander' });
    console.log("only expanders", onlyExpanders);
    return {
        type: GET_EXPANDERS_FROM_TRANSFORMERS,
        payload: { expanders: onlyExpanders }
    }
}

// TODO: refactor to using store? or take as arg?
export function getProducersFromTransformers(transformers) {
    const onlyProducers = transformers.filter((item) => { return item['function'] === 'producer' });
    console.log("only producers", onlyProducers);
    return {
        type: GET_PRODUCERS_FROM_TRANSFORMERS,
        payload: { producers: onlyProducers }
    }
}

export function createGeneList(geneSymbolList) {
    return (dispatch) => {
        const requestGeneListID = fetch(SERVICE_URL.concat("create_gene_list"),
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(geneSymbolList)
            })
            .then(response => {
                console.log(response);
                return response;
            })
            .then(response => response.json())
            .then(data => {
                return {
                    results: {
                        gene_list_id: data.gene_list_id,
                        genes: data.genes
                    },
                    query: geneSymbolList
                }
            })
            .catch(error => {
                console.error(error)
            });

        return dispatch({
            type: CREATE_GENE_LIST,
            payload: requestGeneListID
        })
    }
}

export function produceGenes(productionQuery) {
    return (dispatch) => {
        const requestProduction = fetch(SERVICE_URL.concat('/transform'), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productionQuery)
        })
            .then(response => {
                console.log(response);
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (data === undefined || data === null || data.length === 0) {
                    throw "Data is undefined or not there"
                } else {
                    if (data.genes && data.genes.length > 0) {
                        return {
                            results: {
                                gene_list_id: data.gene_list_id,
                                genes: data.genes
                            },
                            query: productionQuery
                        };
                    } else {
                        console.error("no gene data received from", productionQuery);
                    }
                }
            });
        return dispatch({
            type: PRODUCE_GENES,
            payload: requestProduction
        });
    }
}

export function transformGenes(transformerQuery) {
    return (dispatch) => {
        const requestTransformation = fetch(SERVICE_URL.concat('/transform'), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transformerQuery)
        })
            .then(response => {
                console.log(response);
                return response;
            })
            .then(response => response.json())
            .then(data => {
                if (data === undefined || data === null || data.length === 0) {
                    throw "Data is undefined or not there"
                } else {
                    return {
                        results: {
                            gene_list_id: data.gene_list_id,
                            genes: data.genes
                        },
                        query: transformerQuery
                    }
                }
            })
            .catch(error => {
                console.error(error);
            });

        return dispatch({
            type: TRANSFORM_GENES,
            payload: requestTransformation
        })
    }
}

export function aggregateGenes(operation) {
    return (dispatch, getState) => {
        const { app: { selectedGeneListsByID } } = getState();

        let aggregationQuery = {
            operation: operation,
            gene_list_ids: selectedGeneListsByID
        };
        console.log("aggregationQuery", aggregationQuery);
        const requestAggregation =
                fetch(SERVICE_URL.concat("/aggregate"), {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(aggregationQuery)
                })
                .then(response => { console.log(response); return response; })
                .then(response => response.json())
                .then(data => {
                    return {
                        results: {
                            gene_list_id: data.gene_list_id,
                            genes: data.genes
                        },
                        operation: operation,
                        query: aggregationQuery
                    }
                });

        return dispatch({
            type: AGGREGATE_GENES,
            payload: requestAggregation
        });
    }
}

// TODO: refactor to Thunk
export function displayNewGeneList(gene_list_id) {
    return (dispatch, getState) => {
        // get store
        const { app: { gene_list_ids } } = getState();
        const new_gene_list_ids = gene_list_ids.concat(gene_list_id);
        return dispatch({
            type: DISPLAY_NEW_GENE_LIST,
            payload: {
                gene_list_ids: new_gene_list_ids
            }
        });
    }
}

// DONE: refactor to Thunk
export function selectProducer(producerName) {
    return (dispatch, getState) => {
        // get producers
        const { app: { producers } } = getState();
        // get producers
        // filter out the right producer based on the input
        let producer = producers.filter(el => el.name === producerName)[0];  // filter always returns a list
        return dispatch({
            type: SELECT_PRODUCER,
            payload: {producer: producer}
        });
    }
}

// TODO: refactor to Thunk
export function toggleExpanderSelection(expander) {
    return (dispatch, getState) => {
        // get store
        const {app: { selectedExpanders }} = getState();
        // return new store state
        let new_expanders;
        !(selectedExpanders.map(prevSelectedExpander => prevSelectedExpander.name).includes(expander.name)) ?
            new_expanders = selectedExpanders.concat([expander]) :
            new_expanders = selectedExpanders.filter(el => el.name !== expander.name);

        return dispatch({
            type: TOGGLE_EXPANDER_SELECTION,
            payload: {
                selectedExpanders: new_expanders
            }
        });
    }
}

// TODO: refactor to Thunk
export function toggleGeneListSelection(geneListID) {
    return (dispatch, getState) => {
        const {app: { selectedGeneListsByID } } = getState();
        // return new store state
        let new_gene_list_ids;
        !(selectedGeneListsByID.map(prevGeneLists => prevGeneLists).includes(geneListID)) ?
            new_gene_list_ids = selectedGeneListsByID.concat([geneListID]) :
            new_gene_list_ids = selectedGeneListsByID.filter(el => el !== geneListID);

        return dispatch({
            type: TOGGLE_GENE_LIST_SELECTION,
            payload: {
                selectedGeneListsByID: new_gene_list_ids
            }
        });
    }
}

export function clearSelections() {
    return {
        type: CLEAR_SELECTIONS,
        payload: {
            noExpanders: [],
            noGeneLists: []
        }
    }
}

export function clearAllGeneLists() {
    return (dispatch, getState) => {
        const { app: { gene_list_ids, recently_cleared_gene_lists } } = getState();
        // copy
        let new_recently_cleared_gene_lists = recently_cleared_gene_lists;
        new_recently_cleared_gene_lists.push(gene_list_ids);

        return dispatch({
            type: CLEAR_ALL_GENE_LISTS,
            payload: {
                gene_list_ids: [],  // equal to the unfiltered gene lists
                recently_cleared_gene_lists: new_recently_cleared_gene_lists,  // equal to the filtered gene lists
            }
        });
    }
}

export function clearSingleGeneList(clearedGeneListID) {
    return (dispatch, getState) => {
        const { app: { gene_list_ids, recently_cleared_gene_lists } } = getState();

        let new_gene_list_ids = gene_list_ids.filter(geneListID => geneListID != clearedGeneListID);
        let new_recently_cleared_gene_lists = recently_cleared_gene_lists; new_recently_cleared_gene_lists.push(clearedGeneListID);

        return dispatch({
            type: CLEAR_ALL_GENE_LISTS,
            payload: {
                gene_list_ids: new_gene_list_ids,  // equal to the unfiltered gene lists
                recently_cleared_gene_lists: new_recently_cleared_gene_lists,  // equal to the filtered gene lists
            }
        });
    }
}

export function undoLastClear() {
    return (dispatch, getState) => {
        const {app: {gene_list_ids, recently_cleared_gene_lists}} = getState();

        let new_recently_cleared_gene_lists = recently_cleared_gene_lists;
        let clearedGeneLists = new_recently_cleared_gene_lists.pop();
        let restoredGeneLists = gene_list_ids.concat(clearedGeneLists);

        return dispatch({
            type: UNDO_LAST_CLEAR,
            payload: {
                gene_list_ids: restoredGeneLists,
                recently_cleared_gene_lists: new_recently_cleared_gene_lists
            }
        });
    }
}

/*
    Graph Actions
 */

export const FETCH_NETWORKS = 'FETCH_NETWORKS';
export const FETCH_NETWORK = 'FETCH_NETWORK';
export const SELECT_NODE = 'SELECT_NODE';

export const CREATE_POST = 'CREATE_POSTS';
export const DELETE_POST = 'DELETE_POST';

const ROOT_URL = 'http://reduxblog.herokuapp.com/api';
const API_KEY = '?key=123456qwerty098765';

export function selectNode(node) {
    return {
        type: SELECT_NODE,
        payload: node
    }
}

export function fetchNetworks() {

    const movies = [
        {id: 1, name: "Matrix"}
    ];

    return {
        type: FETCH_NETWORKS,
        payload: movies
    };
}

export function fetchNetwork(id) {

    var nodes = [
        {id: 0, highlighted : false, reflexive: false, type: "person", name: "John"},
        {id: 1, highlighted : false, reflexive: false, type: "person", name: "Eddie"},
        {id: 3, highlighted : false, reflexive: false, type: "person", name: "Mariana"},
        {id: 4, highlighted : false, reflexive: false, type: "person", name: "Lauren"},
        {id: 5, highlighted : false, reflexive: false, type: "person", name: "George"},
        {id: 6, highlighted : false, reflexive: false, type: "movie", name: "Matrix I"},
        {id: 7, highlighted : true, reflexive: false, type: "person", name: "Keanu"},
        {id: 8, highlighted : true, reflexive: false, type: "movie", name: "Matrix II"},
        {id: 9, highlighted : true, reflexive: false, type: "movie", name: "Matrix III"}
    ];

    var links = [
        {sourceIndex: 0, targetIndex: 2, left: false, right: true},
        {sourceIndex: 0, targetIndex: 3, left: false, right: true},
        {sourceIndex: 0, targetIndex: 4, left: false, right: true},
        {sourceIndex: 1, targetIndex: 2, left: false, right: true},
        {sourceIndex: 1, targetIndex: 3, left: false, right: true},
        {sourceIndex: 1, targetIndex: 4, left: false, right: true},
        {sourceIndex: 3, targetIndex: 5, left: false, right: true},
        {sourceIndex: 4, targetIndex: 5, left: false, right: true},
        {sourceIndex: 6, targetIndex: 7, left: false, right: true},
        {sourceIndex: 6, targetIndex: 8, left: false, right: true}
    ];

    const graph = {
        nodes: [{id: "RtdNdLJlCK"}, {id: "A9FbgqOD79"}, {id: "nZL2QYoSxh"}],
        links: [{source: "RtdNdLJlCK", target: "A9FbgqOD79"},
            {source: "RtdNdLJlCK", target: "nZL2QYoSxh"},
            {source: "A9FbgqOD79", target: "nZL2QYoSxh"}]
    }

    return {
        type: FETCH_NETWORK,
        payload: { nodes: graph.nodes, links: graph.links }
    };
}


export function createPost(props) {
    const request = fetch(`${ROOT_URL}/posts${API_KEY}`, props);

    return {
        type: CREATE_POST,
        payload: request
    }
}

export function deletePost(id) {
    const request = fetch(`${ROOT_URL}/posts/${id}${API_KEY}`);

    return {
        type: DELETE_POST,
        payload: request
    };
}