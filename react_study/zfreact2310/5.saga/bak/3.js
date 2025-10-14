import { put, take, fork, takeEvery, call, cps } from '../../redux-saga/effects';
import * as actionTypes from '../action-types';
//在node.js里，异步函数实现有两种，一种是返回Promise,另一个种是传入回调函数
//const delay = ms => new Promise((resolve,reject) => setTimeout(()=>reject('fail'), ms));
const delay = (ms, callback) => setTimeout(() => callback('wrong', 'ok'), ms)
function* workerSaga() {
    try {
        let result = yield call(delay, 1000);
        console.log('result', result)
        yield put({
            type: actionTypes.ADD
        });
    } catch (error) {
        console.log(error);
    }
}
function* watcherSaga() {
    console.log('start watcherSaga')
    yield takeEvery(actionTypes.ASYNC_ADD, workerSaga);
    console.log('continue watcherSaga')
}
function* rootSaga() {
    yield watcherSaga();
}
export default rootSaga;