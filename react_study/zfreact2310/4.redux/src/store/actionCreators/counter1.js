import { ADD1, MINUS1 } from '../action-types';
const actionCreators = {
    add1() {
        return { type: ADD1 };
    },
    minus1() {
        return { type: MINUS1 };
    },
    thunkAdd1() {
        //现在此actionCreator返回的action是一个函数
        //redux规定派发的action必须是一个纯对象，不能是函数
        return function (dispatch, getState) {
            setTimeout(() => {
                dispatch(function (dispatch, getState) {
                    setTimeout(() => {
                        dispatch(new Promise((resolve)=>{
                            setTimeout(() => {
                                resolve({ type: ADD1 });
                            }, 1000);
                        }));
                    }, 1000);
                });
            }, 1000);
        }
    },
    promiseAdd1(){
        return new Promise((resolve)=>{
            setTimeout(() => {
                resolve({ type: ADD1 });
            }, 1000);
        });
    },
    payloadPromiseAdd1(){
        return {
            type:ADD1,
            payload:new Promise((resolve,reject)=>{
                setTimeout(() => {
                    let result = parseFloat(Math.random().toFixed(2));
                    console.log('result',result)
                    if(result > .5){
                        resolve(result);
                    }else{
                        reject(result);
                    }
                }, 1000);
            })
        }
    }
}
export default actionCreators;