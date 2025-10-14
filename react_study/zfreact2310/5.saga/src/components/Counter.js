import * as actionTypes from '../store/action-types';
import {useSelector,useDispatch} from 'react-redux';
function Counter(){
    const number = useSelector(state=>state.number);
    const dispatch = useDispatch();
    return (
        <div>
            <p>{number}</p>
            <button onClick={()=>dispatch({type:actionTypes.ADD})}>+</button>
            <button onClick={()=>dispatch({type:actionTypes.ASYNC_ADD})}>ASYNC_ADD</button>
            <button onClick={()=>dispatch({type:actionTypes.STOP_ADD})}>STOP_ADD</button>
            <button onClick={()=>dispatch({type:actionTypes.REQUEST,payload:'/users.json'})}>发请求</button>
            <button onClick={()=>dispatch({type:actionTypes.STOP_REQUEST})}>取消请求</button>
        </div>
    )
}
export default Counter;