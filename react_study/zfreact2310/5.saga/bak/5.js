import { put, take, fork, takeEvery, call, cps, all,cancel } from '../../redux-saga/effects';
import * as actionTypes from '../action-types';
const delay = ms => new Promise((resolve) => setTimeout(() => resolve(), ms));
function* addWorker() {
    while (true) {
        yield call(delay, 1000);
        yield put({ type: actionTypes.ADD });
    }
}
function* addWatcher() {
    //先开启一个新的runSaga函数运行addWorker，返回一个任务
    const task= yield fork(addWorker);
    console.log('task',task);
    //再监听一个动作停止加1
    yield take(actionTypes.STOP_ADD);
    //向saga中间件发送一个指令，表示我要取消这个任务
    yield cancel(task);
}
function* rootSaga() {
    yield addWatcher();
}
export default rootSaga;