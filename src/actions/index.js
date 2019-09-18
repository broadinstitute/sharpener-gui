import {SERVICE_URL} from "../parameters/EndpointURLs";
import {FEATURE_FLAG} from "../parameters/FeatureFlags";
import {store} from "../store";
import _ from "lodash";
import {geneListTitleOf, properCase} from "../helpers";

/*
    Application Actions
 */

// general app actions
export const GET_GENE_LIST_BY_ID = 'GET_GENE_LIST_BY_ID';
export const GET_TRANSFORMERS = 'GET_TRANSFORMERS';
export const GET_EXPANDERS_FROM_TRANSFORMERS = 'GET_EXPANDERS_FROM_TRANSFORMERS';
export const GET_PRODUCERS_FROM_TRANSFORMERS = 'GET_PRODUCERS_FROM_TRANSFORMERS';
export const DISPLAY_NEW_GENE_LIST = 'DISPLAY_NEW_GENE_LIST';

export const PRODUCE_GENES = 'PRODUCE_GENES';
export const SELECT_PRODUCER = 'SELECT_PRODUCER';

export const TRANSFORM_GENES = 'TRANSFORM_GENES';
export const TOGGLE_EXPANDER_SELECTION = 'TOGGLE_EXPANDER_SELECTION';
export const CLEAR_EXPANDER_SELECTIONS = 'CLEAR_EXPANDER_SELECTIONS';

export const FILTER_GENES = 'FILTER_GENES';
export const TOGGLE_FILTER_SELECTION = 'TOGGLE_FILTER_SELECTION';
export const CLEAR_FILTER_SELECTIONS = 'CLEAR_FILTER_SELECTIONS';

export const AGGREGATE_GENES = 'AGGREGATE_GENES';

export const CREATE_GENE_LIST = 'CREATE_GENE_LIST';
export const TOGGLE_GENE_LIST_SELECTION = 'TOGGLE_GENE_LIST_SELECTION';
export const CLEAR_SINGLE_GENE_LIST = 'CLEAR_SINGLE_GENE_LIST';
export const CLEAR_ALL_GENE_LISTS = 'CLEAR_ALL_GENE_LISTS';
export const UNDO_LAST_CLEAR = 'UNDO_LAST_CLEAR';

export const DIFFERENCE_GENE_LISTS = 'DIFFERENCE_GENE_LISTS';
export const CLEAR_SELECTIONS = 'CLEAR_SELECTIONS';
export const COMPUTE_GENE_LIST_NAME = 'COMPUTE_GENE_LIST_NAME';

export const GENES_ERROR = 'GENES_ERROR';
export const COMPLETE_ERROR_REPORT = 'COMPLETE_ERROR_REPORT';
export const GENES_STATUS = 'GENES_STATUS';
export const GENES_COMPLETE = 'GENES_COMPLETE';
export const GENES_RECEIVED = 'GENES_RECEIVED';
export const RECORD_SHARPENER_ACTION = 'RECORD_SHARPENER_ACTION';

export function removeError(error) {
    return (dispatch) => {
        return dispatch({
            type: COMPLETE_ERROR_REPORT,
            payload: error
        })
    }
}

export function receiveGeneList(geneListID, transformerAction) {
    return (dispatch) => {
        const requestGeneList = fetch("/gene_list/".concat(geneListID))
            .then(response => response.json())
            .then(data => {
                return {
                    results: {
                        gene_list_id: data.gene_list_id,
                        genes: data.genes
                    },
                    type: transformerAction.type,
                    query: transformerAction.query
                }
            });
        return dispatch({
            type: GENES_RECEIVED,
            payload: requestGeneList
        })
    }
}

export function getGeneListStatus(requestID) {
    return (dispatch) => {
        const requestStatus = fetch(SERVICE_URL.concat("/status/").concat(requestID))
            .then(response => response.json());
        return dispatch({
            type: GENES_STATUS,
            payload: requestStatus
        })
    }
}

export function computeGeneListName(geneListID) {
    return (dispatch, getState) => {
        const { app: { transactionLedger } } = getState();
        const transaction =  transactionLedger.filter(transaction => transaction.gene_list_id === geneListID)[0];
        let geneListTitle = geneListTitleOf(transaction);
        return dispatch({
            type: COMPUTE_GENE_LIST_NAME,
            payload: geneListTitle
        })
    }
}

export function filterGenes(gene_list_id, gene_symbol) {
    return (dispatch) => {
        const removeGenesQuery = {
            gene_list_id: gene_list_id,
            controls: [
                {
                    name: "remove_genes",
                    value: gene_symbol
                }
            ]
        };
        const requestFilter = fetch(SERVICE_URL.concat('/remove_genes_filter'), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(removeGenesQuery)
            })
            .then(response => response.json())
            .then(data => {
                return data
            });
        return dispatch({
            type: FILTER_GENES,
            payload: requestFilter
        })
    }
}

export function getGeneListByID(geneListID) {
    return (dispatch) => {
        const requestGenes = fetch(SERVICE_URL.concat('/gene_list'))
                .then(response => response.json())
                .then(data => {
                    return data
                });
        return dispatch({
            type: GET_GENE_LIST_BY_ID,
            payload: requestGenes
        });
    }
}

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
                        filters: transformers.filter((item) => { return item['function'] === 'filter' }),
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
        const requestProduction = fetch(SERVICE_URL.concat('/submit'), {
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
                /*
                    Shape: Example:
                    {"request_id":"0LmFtcLjf",
                     "status":"running",
                     "gene_list_id":null,
                     "current_step":null,
                     "total_steps":null}
                 */
                if (data === undefined || data === null || data.length === 0) {
                    throw "Data is undefined or not there"
                } else {
                    // if (data.genes && data.genes.length > 0) {
                        return {
                            request_id: data.request_id,
                            status: data.status,
                            query: productionQuery
                        }
                    // } else {
                    //     console.error("no gene data received from", productionQuery);
                    // }
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
        const requestTransformation = fetch(SERVICE_URL.concat('/submit'), {
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
                    // if (data.genes && data.genes.length > 0) {
                    return {
                        request_id: data.request_id,
                        status: data.status,
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

export function toggleFilterSelection(filter) {
    return (dispatch, getState) => {
        // get store
        const {app: { selectedFilters }} = getState();
        // return new store state
        let new_filters;
        !(selectedFilters.map(prevSelectedFilter => prevSelectedFilter.name).includes(filter.name)) ?
            new_filters = selectedFilters.concat([filter]) :
            new_filters = selectedFilters.filter(el => el.name !== filter.name);

        return dispatch({
            type: TOGGLE_FILTER_SELECTION,
            payload: {
                selectedFilters: new_filters
            }
        });
    }
}

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

export function clearExpanderSelections() {
    return {
        type: CLEAR_EXPANDER_SELECTIONS,
        payload: {
            expanders: []
        }
    }
}

export function clearFilterSelections() {
    return {
        type: CLEAR_FILTER_SELECTIONS,
        payload: {
            filters: []
        }
    }
}

export function clearSingleGeneList(clearedGeneListID) {
    return (dispatch, getState) => {
        const { app: { recently_cleared_gene_lists } } = getState();

        let new_recently_cleared_gene_lists = recently_cleared_gene_lists; new_recently_cleared_gene_lists.push(clearedGeneListID);

        return dispatch({
            type: CLEAR_SINGLE_GENE_LIST,
            payload: {
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

export function differentiateGeneLists(gene_list_id_left, gene_list_id_right) {
    return (dispatch) => {
        const requestLeftGenes =
            fetch(SERVICE_URL.concat("/gene_list").concat("/"+gene_list_id_left),
                {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    return { gene_list_id: data.gene_list_id, genes: data.genes }
                })
                .catch(error => {
                    console.error(error)
                });

        const requestRightGenes =
            fetch(SERVICE_URL.concat("/gene_list").concat("/"+gene_list_id_right),
                {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    return { gene_list_id: data.gene_list_id, genes: data.genes }
                })
                .catch(error => {
                    console.error(error)
                });


        const differenceGenes = Promise.all(requestLeftGenes, requestRightGenes).then(results => {
            const difference = _.difference(...results.map(result => result.genes));
            const leftResidual = _.difference(results[0], difference);
            const rightResidual = _.difference(results[1], difference);
            return {
                difference: difference,
                left: {
                    id: results[0].gene_list_id,
                    residual: leftResidual
                },
                right: {
                    id: results[1].gene_list_id,
                    residual: rightResidual
                }
            }
        });

        return dispatch({
            type: DIFFERENCE_GENE_LISTS,
            payload: differenceGenes
        });
    }
}