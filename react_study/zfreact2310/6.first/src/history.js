import {createBrowserHistory} from 'history';
import {createReduxHistoryContext} from './redux-first-history';
//创建一个浏览器路由历史对象
const history = createBrowserHistory();
const {
    routerReducer,// 用来合并的reducer ，用来实现把收到的路径信息保存到仓库对象中
    routerMiddleware,//路由中间件，来实监听派发的动作，当收到派发的动作后，跳转到指定的路径 
    createReduxHistory//创建基于redux实现的历史对象
} = createReduxHistoryContext({history});
export {
    routerReducer,
    routerMiddleware,
    createReduxHistory
}