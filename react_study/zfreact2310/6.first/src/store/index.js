import {legacy_createStore as createStore,applyMiddleware} from 'redux';
import rootReducer from './reducers';
import {routerMiddleware,createReduxHistory} from '../history';
//routerMiddleware的作用是监听用户派发的动作，当派发的是要跳转路径的动作的话跳转路径
const store = applyMiddleware(routerMiddleware)(createStore)(rootReducer);
window.store = store;
const history = createReduxHistory(store);
export  {
    store,//redux仓库
    history//基于redux实现的历史对象
};