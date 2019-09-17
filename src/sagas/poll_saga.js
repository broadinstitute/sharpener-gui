import {call, race, take, delay, put, spawn, fork, cancel, cancelled, takeEvery} from "@redux-saga/core/effects";
import {SERVICE_URL} from "../parameters/EndpointURLs";

const TRANSFORM_GENES = 'TRANSFORM_GENES';
const PRODUCE_GENES = 'PRODUCE_GENES';
const POLL_STOP = 'POLL_STOP';
const GENES_COMPLETE = 'GENES_COMPLETE';
const GENES_ERROR = 'GENES_ERROR';
const GENES_REQUESTED = 'GENES_REQUESTED';
import {GENES_RECEIVED} from "../actions";


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
                    type: GENES_COMPLETE,
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
                    payload: {
                        type: action.type,
                        gene_list_id: geneTransaction.gene_list_id,
                        query: action.payload.query
                    }
                });
                yield cancel()
            }
            yield delay(1000);
        } catch (err) {
            yield put({
                type: GENES_ERROR,
                err
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


// function* pollTask(action) {
//     const statusRequest =
//         (request_id) => fetch(SERVICE_URL.concat('/status/').concat(request_id))
//             .then(response => response.json())
//             .catch(err => err);
//
//     const geneTransaction = yield call(statusRequest, action.payload.request_id);
//     console.log(geneTransaction.status);
//     if (geneTransaction.status === "success") {
//         yield put({
//             type: GENES_COMPLETE,
//             payload: {
//                 type: action.type,
//                 gene_list_id: geneTransaction.gene_list_id,
//                 query: action.payload.query
//             }
//         });
//         yield put({
//             type: POLL_STOP,
//         });
//     } else if (geneTransaction.status === "failed") {
//         yield put({
//             type: GENES_ERROR,
//             payload: {
//                 type: action.type,
//                 gene_list_id: geneTransaction.gene_list_id,
//                 query: action.payload.query
//             }
//         });
//         yield put({
//             type: POLL_STOP,
//         });
//     }
//     yield delay(2*1000);
// }
//
// function* pollWatcher(action) {
//     while(true) {
//         const actionTask = yield fork(pollTask, action);
//         yield take(POLL_STOP);
//         yield cancel(actionTask);
//     }
// }
//
// export default function* pollSaga() {
//     while(true) {
//         const action = yield take([TRANSFORM_GENES, PRODUCE_GENES]);
//         yield call(pollWatcher, action)
//     }
// }