import {legacy_createStore as createStore} from '../redux';
import rootReducer from './reducers';
const store = createStore(rootReducer);
//缓存原始的dispatch方法
let originalDispatch = store.dispatch;
store.dispatch= function(action){
  setTimeout(()=>{
    originalDispatch(action);
  },1000)
  return action;
}
export default store;

/**
 * 实现日志打印的功能，在状态变更的前后打印变化前的状态和变化后的状态
 * 这个需求就可以通过中间件实现，核心思路或者说原理是靠重新store.dispatch实现
 * 
 */