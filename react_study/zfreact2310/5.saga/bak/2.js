import { put, take,fork } from '../../redux-saga/effects';
import * as actionTypes from '../action-types';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function* workerSaga() {
  yield delay(1000);
  yield put({
    type: actionTypes.ADD
  });
}
function* watcherSaga() {
  console.log('run watcherSaga');
  while(true){
    const action = yield take(actionTypes.ASYNC_ADD);
    //不希望这个saga阻塞当前的saga
    //而是希望这个saga开启后，当前的saga自动向下执行
    //yield workerSaga();
    //这样写相关于开启了一个新的子进程去执行workerSaga,而不会阻塞当前的saga继续向下执行
    yield fork(workerSaga)
  }
  console.log('continue watcherSaga');
}
function* rootSaga() {
  yield watcherSaga();
}
export default rootSaga;