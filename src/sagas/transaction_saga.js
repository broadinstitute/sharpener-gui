import {call, race, take, put} from "@redux-saga/core/effects";
import {SERVICE_URL} from "../parameters/EndpointURLs";

const GENES_COMPLETE = 'GENES_COMPLETE';
const GENES_RECEIVED = 'GENES_RECEIVED';

function* transactionSaga(action) {

    const geneList = (gene_list_id) =>
        fetch(SERVICE_URL.concat("/gene_list/").concat(gene_list_id))
            .then(response => response.json()).then(data => { return data });

    const transformerResults = yield call(geneList, action.payload.gene_list_id);

    yield put({
        type: GENES_RECEIVED,
        status: "success",
        payload: {
            ...action.payload,
            results: transformerResults
        }
    });

}

export default function* transactionSagaWatch() {
    while (true) {
        // Taking the POLL_START dispatch action.
        const action = yield take(GENES_COMPLETE);
        // // Custom payload will be available at action object.
        yield call(transactionSaga, action);
    }
}