import ReactDOM from 'react-dom/client';
import { legacy_createStore as createStore,combineReducers,applyMiddleware } from 'redux';
import {connect,Provider} from 'react-redux'
import createSagaMiddleware from 'redux-saga';
import * as sagaEffects from 'redux-saga/effects';
import prefixNamespace from './prefixNamespace'
import {createBrowserHistory} from 'history';
import {HistoryRouter} from 'redux-first-history/rr6';
import {createReduxHistoryContext} from 'redux-first-history';
const history = createBrowserHistory();
const {routerReducer,routerMiddleware,createReduxHistory} = createReduxHistoryContext({history});
export {connect}
function dva(){
    const app = {
        _models:[],
        model,
        _router:null,
        router,
        start
    }
    /**
     * 添加模型的函数
     * @param {*} model 模型定义 
     */
    function model(model){
        const prefixedModel = prefixNamespace(model);
        //把传进来的模型定义对象保存到app._models数组中
        app._models.push(prefixedModel);
        return prefixedModel;
    }
    /**
     * 定义路由渲染函数
     * @param {*} router 
     */
    function router(router){
        //把传过来的路由渲染函数保存在app._router的内部
        app._router=router;
    }
    //初始化的reducers里就添加router的reducer,用来把路径信息保存到仓库中去
    const initialReducers = {router:routerReducer};
    function start(selector){
        //遍历模型数组
        for(const model of app._models){
            //initialReducers.counter = counterReducer
            initialReducers[model.namespace]=getReducer(model);
        }
        //合并成一个reducer函数
        let rootReducer = combineReducers(initialReducers);
        //提取app中的saga数组
        const sagas = getSagas(app);
        //得到saga中间件
        const sagaMiddleware = createSagaMiddleware();
        //应用saga中间件来创建仓库 sagaMiddleware作用是拦截向仓库派发的动作
        const store = applyMiddleware(sagaMiddleware,routerMiddleware)(createStore)(rootReducer)
        window.store = store;
        //遍历saga数组，启动数组里面的每个saga
        sagas.forEach(saga=>sagaMiddleware.run(saga));
        const container = document.querySelector(selector);
        ReactDOM.createRoot(container).render(
            <Provider store={store}>
                <HistoryRouter history={createReduxHistory(store)}>
                    {app._router()}
                </HistoryRouter>
            </Provider>
        );
        function getSagas(app){
            let sagas = [];
            for(const model of app._models){
                sagas.push(getSaga(model));
            }
            return sagas;
        }
    }
    return app;
}
/**
 * 得到每个模型对应的saga
 * @param {*} model 模型
 */
function getSaga(model){
    const {effects} = model;
    return function *(){
        for(const key in effects){//asyncAdd
            //监听每一个asyncAdd动作，当有人向仓库派发此asyncAdd动作后，执行后面的saga函数
            //如果使用takeEvery监听动作类型的话，当监听到的对应的动作后，会执行后面的saga。
            //执行后面的saga的时候 会把监听到的动作传递进去
            yield sagaEffects.takeEvery(key,function*(action){
                yield effects[key](action,{
                    ...sagaEffects,
                    put:(action)=>{
                        return sagaEffects.put({
                            ...action,
                            type:prefixOwnNamespace(action.type,model.namespace)
                        });
                    }
                });
            });
        }
    }
}
function prefixOwnNamespace(type,namespace){
    //如果类型里没有添加命名前缀，是需要手工添加自己的命名空间前缀
    if(type.indexOf('/')===-1){
        return `${namespace}/${type}`;
    }
    return type;
}
/**
 * 把一个模型变成一个函数
 * @param {*} model 模型
 */
function getReducer(model){
    //获取模型中的初始状态和状态计算对象
    const {state:initialState,reducers} = model;
    //定义转换后的新的reducer函数
    return (state=initialState,action)=>{
        //获取动作类型，然后去reducers对象中查找此类型对应的reducer函数
        const reducer = reducers[action.type];
        ///如果找到了说明类型匹配上了，就要使用此reducer函数计算新的状态
        if(reducer){
            return reducer(state,action);
        }
        //如果没找到，直接返回老状态
        return state;
    }
}
export default dva;