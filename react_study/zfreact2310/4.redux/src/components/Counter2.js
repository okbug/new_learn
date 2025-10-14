import React from 'react';
import actionCreators from '../store/actionCreators/counter2';
import {useSelector,useDispatch} from '../react-redux';
function Counter2(){
    //此写法对标的是以前mapStateToProps
    let {number} = useSelector(state=>state.counter2);
    //这个对标的是以前的mapDispatchToProps
    let dispatch  = useDispatch();
    return (
        <div>
            <p>{number}</p>
            <button onClick={()=>dispatch(actionCreators.add2())}>+</button>
            <button onClick={()=>dispatch(actionCreators.minus2())}>-</button>
        </div>
    )
}
export default Counter2;