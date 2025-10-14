import React from 'react';
import ReactReduxContext from '../ReactReduxContext';
import { shallowEqual } from 'react-redux';
function useSelector(selector,equalityFn=shallowEqual){
    let lastSelectedStateRef = React.useRef(null);
    //获取context中的仓库
    const {store} = React.useContext(ReactReduxContext);
    //获取仓库中最新的状态
    let state = store.getState();
    //进行状态映射，获取选择的状态
    let selectedState = selector(state);
    //定义一个更新组件的函数
    let [,setState] = React.useReducer(x=>x+1,0);
    React.useLayoutEffect(()=>{
        lastSelectedStateRef.current=selectedState;
    });
    //让当前的组件订阅状态变化函数，当状态发生变化后重新执行setState让组件更新
    React.useLayoutEffect(()=>{
        return store.subscribe(()=>{
            //当仓库中的状态发生变化后，进入此监听函数。不要着急马上更新组件
            //而是可以判断一下新的状态和老状态浅比较是否相等，如果相等则不需要更新组件
            let newSelectedState = selector(store.getState());
            if(!equalityFn(newSelectedState,lastSelectedStateRef.current)){
                setState();
            }
        });
    },[]);
    return selectedState;
}
export default useSelector;