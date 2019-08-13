import {SERVICE_URL} from "./parameters/EndpointURLs"

// general app actions
const GET_TRANSFORMERS = 'GET_TRANSFORMERS';
const CREATE_GENE_LIST = 'CREATE_GENE_LIST';
const PRODUCE_GENES = 'PRODUCE_GENES';
const TRANSFORM_GENES = 'TRANSFORM_GENES';
const AGGREGATE_GENES = 'AGGREGATE_GENES';
const GET_EXPANDERS_FROM_TRANSFORMERS = 'GET_EXPANDERS_FROM_TRANSFORMERS';
const GET_PRODUCERS_FROM_TRANSFORMERS = 'GET_PRODUCERS_FROM_TRANSFORMERS';
const DISPLAY_NEW_GENE_LIST = 'DISPLAY_NEW_GENE_LIST';
const SELECT_PRODUCER = 'SELECT_PRODUCER'
const TOGGLE_EXPANDER_SELECTION = 'TOGGLE_EXPANDER_SELECTION';
const TOGGLE_GENE_LIST_SELECTION = 'TOGGLE_GENE_LIST_SELECTION';
const CLEAR_SELECTIONS = 'CLEAR_SELECTIONS';
const CLEAR_GENE_LISTS = 'CLEAR_GENE_LISTS';
const UNDO_LAST_CLEAR = 'UNDO_LAST_CLEAR';

export function getTransformers() {
    const requestTransformers = fetch(SERVICE_URL.concat('/transformers'))
        .then(response => response.json())
        .then(response => { console.log(response); return response; })
        .then(data => {
            if (data === undefined || data.length === 0) {
                throw "No data or undefined data";
            } else {
                return data;
            }
        })
        .catch(error => {
            console.log(error);
        });

    return {
        type: GET_TRANSFORMERS,
        payload: requestTransformers
    }
}

export function getExpandersFromTransformers(transformers) {
    const onlyExpanders = transformers.filter((item) => { return item['function'] === 'expander' });
    return {
        type: GET_EXPANDERS_FROM_TRANSFORMERS,
        payload: onlyExpanders
    }
}

export function getProducersFromTransformers(transformers) {
    const onlyProducers = transformers.filter((item) => { return item['function'] === 'producer' });
    return {
        type: GET_PRODUCERS_FROM_TRANSFORMERS,
        payload: onlyProducers
    }
}

// TODO query
export function createGeneList() {
    return {
        type: CREATE_GENE_LIST,
        payload: null
    }
}

// TODO query
export function produceGenes() {
    return {
        type: PRODUCE_GENES,
        payload: null
    }
}

export function transformGenes(transformerQuery) {
    const requestTransformation = fetch(SERVICE_URL.concat('/transform'), {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transformerQuery)
    })
    .then(response => response.json())
    .then(data => {
        if (data === undefined || data === null || data.length === 0 ) {
            throw "Data is undefined or not there"
        } else {
            if (data.genes && data.genes.length > 0) {
                return data;
            } else {
                console.log("no gene data received from", transformerQuery);
            }
        }
    });

    return {
        type: TRANSFORM_GENES,
        payload: requestTransformation
    }
}

export function aggregateGenes(operation, geneLists) {

    let aggregationQuery = {
        operation: action,
        gene_list_ids: selectedGeneLists
    };
    const requestAggregation =
            fetch(this.SERVICE_URL.concat("/aggregate"), {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aggregationQuery)
            })
            .then(response => response.json())
            .then(response => {
                return response
            });

    return {
        type: AGGREGATE_GENES,
        payload: requestAggregation
    }
}

// TODO
export function displayNewGeneList(gene_list_id) {
    return {
        type: DISPLAY_NEW_GENE_LIST,
        payload: gene_list_id
    }
}

// TODO - filter
export function selectProducer(producerName) {
    return {
        type: SELECT_PRODUCER,
        payload: producerName
    }
}

// TODO - filter
export function toggleExpanderSelection(expanderName) {
    return {
        type: TOGGLE_EXPANDER_SELECTION,
        payload: expanderName
    }
}

// TODO - filter
export function toggleGeneListSelection(geneListID) {
    return {
        type: TOGGLE_GENE_LIST_SELECTION,
        payload: geneListID
    }
}

// TODO undo stack
export function clearSelections() {
    return {
        type: CLEAR_SELECTIONS,
        payload: null
    }
}

// TODO undo stack
export function clearGeneLists() {
    return {
        type: CLEAR_GENE_LISTS,
        payload: null
    }
}

// TODO redo op
export function undoLastClear() {
    return {
        type: UNDO_LAST_CLEAR,
        payload: null
    }
}