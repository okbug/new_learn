/**
 * 定义一个redux中间件，这是一个标准的结构，
 * @param {*} store getState 获取状态 dispatch派发动作
 * @param {*} next 其实在只有一个中间件的情况下，它指的就是原始的store.dispatch
 * @param {*} action 就是向仓库派发的动作
 * @returns 改造后的dispatch方法
 */
function logger({getState,dispatch}){
    return function(next){//原始的store.dispatch
        return function(action){//这个就是改造后的 dispatch
            console.log('prev state',getState());
            let result = next(action);
            console.log('next state',getState());
            return result;
        }
    }
}
export default logger;