import compose from './compose';
function applyMiddleware(...middlewares) {
    return function (createStore) {
        return function (reducer,preloadedState) {
            //创建仓库
            let store = createStore(reducer,preloadedState);
            //创建新的dispatch方法
            let dispatch;
            //1.为什么在这里使用middlewareAPI，而不是直接把store
            let middlewareAPI = {
                getState:store.getState,
                dispatch:(action)=>dispatch(action)
            }
            //先做一次映射，把第一层脱掉
            const chain = middlewares.map(middleware=>middleware(middlewareAPI));
            dispatch = compose(...chain)(store.dispatch);
            return {
                ...store,
                dispatch
            };
        }
    }
}
export default applyMiddleware;