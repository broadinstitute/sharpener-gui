import {call, delay, put, cancel, cancelled, takeEvery} from "@redux-saga/core/effects";
import {SERVICE_URL} from "../parameters/EndpointURLs";

const TRANSFORM_GENES = 'TRANSFORM_GENES';
const PRODUCE_GENES = 'PRODUCE_GENES';
const GENES_COMPLETE = 'GENES_COMPLETE';
const GENES_ERROR = 'GENES_ERROR';

function* pollTask(action) {
    while(true) {
        try {
            /* run your task */
            const statusRequest =
                (request_id) => fetch(SERVICE_URL.concat('/status/').concat(request_id))
                    .then(response => response.json())
                    .catch(err => err);

            const geneTransaction = yield call(statusRequest, action.payload.request_id);
            console.log(geneTransaction.status);
            if (geneTransaction.status === "success") {
                yield put({
                    type: GENES_ERROR,
                    status: geneTransaction.status,
                    payload: {
                        type: action.type,
                        gene_list_id: geneTransaction.gene_list_id,
                        query: action.payload.query
                    }
                });
                yield cancel()
            } else if (geneTransaction.status === "failed") {
                yield put({
                    type: GENES_ERROR,
                    status: geneTransaction.status,
                    payload: {
                        type: action.type,
                        request_id: action.payload.request_id,
                        query: action.payload.query
                    }
                });
                yield cancel()
            }
            yield delay(1000);
        } catch (err) {
            yield put({
                type: GENES_ERROR,
                status: err,
                payload: {
                    type: action.type,
                    request_id: action.payload.request_id,
                    query: action.payload.query
                }
            });
            yield cancel()
        } finally {
            if (yield cancelled()) {
                /* handle cancellation */
                console.log('Cancelled: ', action);
            }
        }
    }
}

export default function* pollBackgroundSaga() {
    yield takeEvery([TRANSFORM_GENES, PRODUCE_GENES], pollTask)
}