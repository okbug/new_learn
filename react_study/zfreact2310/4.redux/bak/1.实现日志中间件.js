import {legacy_createStore as createStore} from '../redux';
import rootReducer from './reducers';
const store = createStore(rootReducer);
//缓存原始的dispatch方法
let originalDispatch = store.dispatch;
store.dispatch= function(action){
    //先打印老状态
    console.log('prev state',store.getState());
    let result = originalDispatch(action);
    console.log('next state',store.getState());
    return result;
}
export default store;

/**
 * 实现日志打印的功能，在状态变更的前后打印变化前的状态和变化后的状态
 * 这个需求就可以通过中间件实现，核心思路或者说原理是靠重新store.dispatch实现
 * 
 */