const createStore = (reducer,preloadedState)=>{
    //在仓库的状态，先定义一个初始状态，默认值现在是undefined
    let state=preloadedState;
    //监听函数的数组
    let listeners = [];
    //返回当前仓库中的状态
    function getState(){
        return state;
    }
    //向仓库派发一个动作
    function dispatch(action){
        //把老状态和动作对象传给reducer,计算出新的状态
        state = reducer(state,action);
        //通知所有的监听函数执行
        listeners.forEach(l=>l());
        return action;
    }
    //添加一个订阅函数，或者说添加一个监听函数
    function subscribe(listener){
        //把订阅函数添加到监听数组中
        listeners.push(listener);
        //返回一个取消此监听函数的销毁函数
        return ()=>{
            let index = listeners.indexOf(listener);
            listeners.splice(index,1);
        }
    }
    //派发一个初始化的action,目的是为让reducer的初始值生效
    dispatch({type:'@@REDUX/INIT'});
    return {
        getState,
        dispatch,
        subscribe
    }
}
export default createStore;