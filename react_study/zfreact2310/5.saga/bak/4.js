import { put, take, fork, takeEvery, call, cps,all } from '../../redux-saga/effects';
import * as actionTypes from '../action-types';
export function * add1(){
    for(let i=0;i<1;i++){
        yield take(actionTypes.ASYNC_ADD);
        yield put({type:actionTypes.ADD})
    }
    console.log('add1 done')
    return 'add1Result';
}
export function * add2(){
    for(let i=0;i<2;i++){
        yield take(actionTypes.ASYNC_ADD);
        yield put({type:actionTypes.ADD})
    }
    console.log('add2 done')
    return 'add2Result';
}
function* rootSaga() {
   console.log('start rootSaga')
   const result = yield all([add1(),add2()]);
   console.log('end rootSaga',result)
}
export default rootSaga;