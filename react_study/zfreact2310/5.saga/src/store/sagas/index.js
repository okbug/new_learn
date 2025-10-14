import { put, take, fork, takeEvery, call, cps, all,cancel,delay } from '../../redux-saga/effects';
import * as actionTypes from '../action-types';
function * request(action){
    let url = action.payload;
    yield delay(3000);
    const controller = new AbortController();
    try{
        let result = yield fetch(url,{signal:controller.signal}).then(res=>res.json())
        console.log('result',result)
    }catch(error){
        console.log('error',error)
        controller.abort();
    }
}
function * requestWatcher(){
    //监听派发请求的动作
    const requestAction = yield take(actionTypes.REQUEST);
    //监听到动作获取派发的动作对象
    //开启一个新的子进程发起请求
    const requestTask = yield fork(request,requestAction)
    //请求开始后立刻开等待取消请求的动作
    const stopAction = yield take(actionTypes.STOP_REQUEST);
    //一旦派发动则可以取消请求任务
    yield cancel(requestTask)
}
function* rootSaga() {
    yield requestWatcher();
}
export default rootSaga;