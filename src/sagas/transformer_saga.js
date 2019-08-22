import { call, put, takeEvery, takeLatest } from 'redux-saga/effects'

// todo: refactor to using 'actions'
const CREATE_GENE_LIST = 'CREATE_GENE_LIST';
const PRODUCE_GENES = 'PRODUCE_GENES';
const TRANSFORM_GENES = 'TRANSFORM_GENES';
const AGGREGATE_GENES = 'AGGREGATE_GENES';
const RECORD_SHARPENER_ACTION = 'RECORD_SHARPENER_ACTION';

function* recordSharpenerAction(action) {
    yield put({
        type: RECORD_SHARPENER_ACTION,
        payload: {
            gene_list_id: action.payload.results.gene_list_id,
            query: action.payload.query,
            timestamp: Date.now(),  // TODO: should this be done inside of the action, for immediacy/sync?
        }
    })
}

function* transformerSaga() {
    yield takeEvery(CREATE_GENE_LIST, recordSharpenerAction);
    yield takeEvery(PRODUCE_GENES, recordSharpenerAction);
    yield takeEvery(TRANSFORM_GENES, recordSharpenerAction);
    yield takeEvery(AGGREGATE_GENES, recordSharpenerAction);
}

export default transformerSaga;