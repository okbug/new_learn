import {createRouterMiddleware} from './middleware';
import {createRouterReducer} from './reducer';
import {push,locationChangeAction} from './actions'
/**
 * 创建基于redux实现的历史对象上下文
 * @param {*} history 浏览器历史对象 
 */
export function createReduxHistoryContext({history}){
    const routerMiddleware = createRouterMiddleware(history);
    const routerReducer = createRouterReducer(history);
    function createReduxHistory(store){
        store.dispatch(locationChangeAction({
            action:history.action,
            location:history.location
        }));
        //当路径发生变化的时候要向仓库派发动作
        history.listen(({action,location})=>{
            store.dispatch(locationChangeAction({location,action}));
        });
        //返回一个 基于仓库实现的history对象，里面的方法名和原来的history 是一样，但是实现变了
        return {
            ...history,
            push:(...args)=>store.dispatch(push(...args)),
            get location(){
                return store.getState().router.location;
            },
            get action(){
                return store.getState().router.action;
            }
        }
    }
    return {
        routerMiddleware,//路由中间件
        routerReducer,//路由状态计算函数
        createReduxHistory//创建redux版本的history对象
    }
}