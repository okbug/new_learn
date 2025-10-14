/**
 * 把多个小的分开的reducer函数合并成一个最终的reducer函数
 * @param {*} reducers reducers对象
 * @returns 合并后的reducer函数
 */
function combineReducers(reducers){
    /**
     * 返回的根reducer,也就是说如果有人向仓库派发动作之后是先交给了此reducer,
     * 由它来返回最终的新状态
     */
    return function combination(state={},action){
        //定义一个新的状态对象
        let nextState = {};
        for(let key in reducers){//counter1
            //获取老的状态对象中此key对应的老状态
            let nextStateForKey = state[key];
            //获取此key对应的reducer函数
            let reducerForKey = reducers[key];//counter1
            //把老的分状态和派发的动作传给分reducer函数计算出新的分状态，存放到nextState对象对应的key中
            nextState[key] = reducerForKey(nextStateForKey,action);
        }
        //最终要返回新的状态对象
        return nextState;
    }
}
export default combineReducers;