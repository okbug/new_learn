/**
 * 定义一个redux中间件，这是一个标准的结构，
 * @param {*} store getState 获取状态 dispatch派发动作
 * @param {*} next 其实在只有一个中间件的情况下，它指的就是原始的store.dispatch
 * @param {*} action 就是向仓库派发的动作
 * @returns 改造后的dispatch方法
 */
function thunk({getState,dispatch}){
    return function(next){//原始的store.dispatch
        return function(action){//这个就是改造后的 dispatch
            //判断action的类型，如果类型是一个函数，执行此函数，传入dispatch和getState
           if(typeof action === 'function'){
            return action(dispatch,getState)
           }
           return next(action);
        }
    }
}
export default thunk;