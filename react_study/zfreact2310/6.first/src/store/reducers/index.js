import {combineReducers} from 'redux';
import counter from './counter'
import { routerReducer } from '../../history';
const reducers = {
    counter,
    router:routerReducer//负责监听用户派发的动作，把最新的路由信息存放到仓库中
}
const rootReducer = combineReducers(reducers);
export default rootReducer;