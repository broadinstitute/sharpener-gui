import { race, call, put, takeEvery, takeLatest, take, delay } from 'redux-saga/effects'
import {differentiateGeneLists, GENES_COMPLETE, getGeneListByID, getGeneListStatus, receiveGeneList} from "../actions";
import {SERVICE_URL} from "../parameters/EndpointURLs";
import _ from "lodash";
import {properCase} from "../helpers";

// todo: refactor to using 'actions'
const CREATE_GENE_LIST = 'CREATE_GENE_LIST';
const PRODUCE_GENES = 'PRODUCE_GENES';
const TRANSFORM_GENES = 'TRANSFORM_GENES';
const AGGREGATE_GENES = 'AGGREGATE_GENES';
const RECORD_SHARPENER_ACTION = 'RECORD_SHARPENER_ACTION';
const GENES_RECEIVED = 'GENES_RECEIVED';

// keep count of what transactions
let transactionFrequencies = {};

/* Transaction Records */
function* recordSaga(action) {

    // TODO: refactor out to two actions
    let difference = [];
    const gene_list_left = action.payload.query.gene_list_id;
    const gene_list_right = action.payload.results.gene_list_id;


    if (action.payload.type === TRANSFORM_GENES) {
        // TODO: replace with a call to the sharpener (making it serverside!)
        const requestLeftGenes =
            fetch(SERVICE_URL.concat("/gene_list").concat("/"+gene_list_left),
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
            fetch(SERVICE_URL.concat("/gene_list").concat("/"+gene_list_right),
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


        const differenceGenes = Promise.all([requestLeftGenes, requestRightGenes]).then(results => {
            const difference = _.xorBy(...results.map(results=>results.genes), "gene_id");
            // TODO: not performant
            // const leftResidual = results[0].genes.filter(el => difference.includes(el));
            // const rightResidual = results[1].genes.filter(el => difference.includes(el));

            return {
                difference: difference,
                addedOrRemoved:  results[0].genes.length < results[1].genes.length ? "additional" : "removed"
            }
        });

        difference = yield Promise.resolve(differenceGenes);
    }

    let freqIndex = null;
    if (action.type === CREATE_GENE_LIST) {
        freqIndex = "Custom Gene List";
    } else if (action.payload.type === TRANSFORM_GENES) {
        freqIndex = action.payload.query.name;
    } else if (action.payload.type === PRODUCE_GENES) {
        freqIndex = action.payload.query.name;
    } else if (action.type === AGGREGATE_GENES) {
        freqIndex = (action.payload.query.operation);
    }
    transactionFrequencies[freqIndex] = freqIndex in transactionFrequencies ? transactionFrequencies[freqIndex] += 1 : 1;

    yield put({
        type: RECORD_SHARPENER_ACTION,
        payload: {
            gene_list_id: action.payload.results.gene_list_id,
            query: action.payload.query,
            frequency: { name: freqIndex, value: transactionFrequencies[freqIndex]},
            difference: { difference: difference ? difference : [] },
            size: action.payload.results.genes.length,
            type: action.payload.type ? action.payload.type : action.type,
            timestamp: Date.now(),  // TODO: should this be done inside of the action, for immediacy/sync?
        }
    })
}

function* recordSagaWatch() {
    /* TAKE TRANSACTIONS */
    yield takeEvery(CREATE_GENE_LIST, recordSaga);
    yield takeEvery(GENES_RECEIVED, recordSaga);
    yield takeEvery(AGGREGATE_GENES, recordSaga);
}

export default recordSagaWatch;

