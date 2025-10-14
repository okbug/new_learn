import {combineReducers} from '../../redux';
import counter1 from './counter1';
import counter2 from './counter2';
//先把不同的子reducer引进来，再把它们合并成一个大对象
//最终store.getState返回的总状态就长这样子 {counter1:{number:0},counter2:{number:0}}
const reducers = {
    counter1,
    counter2
}
/* 
const rootState = {
    counter1:{number:0},
    counter2:{number:0}
} */
//再把它传入返回合并后的根reducer
let rootReducer = combineReducers(reducers)
export default rootReducer;