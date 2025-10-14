
import {put,take} from '../../redux-saga/effects';
import * as actionTypes from '../action-types'
const delay = (ms)=>new Promise((resolve)=>setTimeout(resolve,ms))
function * workerSaga(){
    //如果产出的一个Promise,那么会等这Promise执行完成后才会继续向下执行
    yield delay(1000);
    //产出一个put的指令表示要向仓库派发一个动作{type:ADD}
    yield put({type:actionTypes.ADD});
}
function * watcherSaga(){
    console.log('run watcherSaga')
    //产出一个指令对象，对象类型为take,表示监听某个action的动作，
    //只有当有人向仓库派发此动作后才会继续往下执行，否则会卡在这里
    const action = yield take(actionTypes.ASYNC_ADD);
    console.log('action',action)
    yield workerSaga();
}
function * rootSaga(){
    console.log('run rootSaga')
    //直接产出一个迭代器，产出后迭代器会自动启动执行
    yield watcherSaga();
    console.log('continue run rootSaga')
}
export default rootSaga;