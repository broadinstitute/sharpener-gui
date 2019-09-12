import {call, race, take, delay, put} from "@redux-saga/core/effects";
import {GENES_RECEIVED, getGeneListStatus} from "../actions";
import {SERVICE_URL} from "../parameters/EndpointURLs";

const TRANSFORM_GENES = 'TRANSFORM_GENES';
const PRODUCE_GENES = 'PRODUCE_GENES';
const POLL_STOP = 'POLL_STOP';
const GENES_COMPLETE = 'GENES_COMPLETE';
const GENES_ERROR = 'GENES_ERROR';

function* pollSaga(action) {
    while (true) {
        try {
            const statusRequest =
                (request_id) => fetch(SERVICE_URL.concat('/status/').concat(request_id))
                    .then(response => response.json())
                    .catch(err => err);

            const geneTransaction = yield call(statusRequest, action.payload.request_id);
            console.log(geneTransaction.status);
            if (geneTransaction.status === "success") {
                yield put({
                    type: GENES_COMPLETE,
                    payload: {
                        type: action.type,
                        gene_list_id: geneTransaction.gene_list_id,
                        query: action.payload.query
                    }
                });
                yield put({
                    type: POLL_STOP
                })
            } else if (geneTransaction.status === "failed") {
                yield put({
                    type: GENES_ERROR,
                    payload: {
                        type: action.type,
                        gene_list_id: geneTransaction.gene_list_id,
                        query: action.payload.query
                    }
                });
                yield put({
                    type: POLL_STOP
                });
            }
            yield delay(2*1000);
        } catch (err) {
            // Once the polling has encountered an error, it should be stopped immediately
            yield put({
                type: POLL_STOP,
                err
            });
            // // Default error handling action called.
            // yield put({
            //     type: payload.errorAction,
            //     err
            // });
        }
    }
}

export default function* pollSagaWatch() {
    while (true) {
        // Taking the POLL_START dispatch action.
        const action = yield take([TRANSFORM_GENES, PRODUCE_GENES]);
        // // Custom payload will be available at action object.
        yield race([call(pollSaga, action), take(POLL_STOP)]);
    }
}