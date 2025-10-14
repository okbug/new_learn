/**
 * 定义一个redux中间件，这是一个标准的结构，
 * @param {*} store getState 获取状态 dispatch派发动作
 * @param {*} next 其实在只有一个中间件的情况下，它指的就是原始的store.dispatch
 * @param {*} action 就是向仓库派发的动作
 * @returns 改造后的dispatch方法
 */
function promise({getState,dispatch}){
    return function(next){//原始的store.dispatch
        return function(action){//这个就是改造后的 dispatch
           //判断action的类型是不是Promise
           if(action.then && typeof action.then === 'function'){
            return action.then(dispatch).catch(dispatch);
           }else if(action.payload && typeof action.payload.then === 'function'){
            //给action.payload这个promise注册一个成功的回调函数
            //如果payload这个promise成功了则会再次派发动作，在这个新动作类型不同，但是payload变成实际值了
            return action.payload.then(
                payload=>dispatch({...action,payload})
            ).catch(error=>{
                //如果失败了，也会派发一个action,action里会有一个error:true表示失败了
                dispatch({...action,payload:error,error:true});
                //因为返回了失败的Promise, 所以要对失败的Promise进行捕获处理
                return Promise.reject(error);
            });
           }else{
            return next(action);
           }
        }
    }
}
export default promise;