import React from 'react';
import actionCreators from '../store/actionCreators/counter1';
import {useSelector,useBoundDispatch} from '../react-redux';
function Counter1(){
    let {number} = useSelector(state=>state.counter1);
    let {add1,minus1,thunkAdd1,promiseAdd1,payloadPromiseAdd1}  = useBoundDispatch(actionCreators);
    return (
        <div>
            <p>{number}</p>
            <button onClick={add1}>+</button>
            <button onClick={thunkAdd1}>异步加1</button>
            <button onClick={promiseAdd1}>Promise异步加1</button>
            <button onClick={()=>{
                payloadPromiseAdd1().then((result)=>{
                    console.log('result===',result)
                },error=>{
                    console.log('error===',error)
                })
            }}>payloadPromise异步加1</button>
        </div>
    )
}
export default Counter1;