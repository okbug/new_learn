
import React from 'react';
import ReactReduxContext from './ReactReduxContext';
import {bindActionCreators} from '../redux';
/**
 * 连接仓库和组件
 * 有两个环节，一个是叫输入 ，就是把仓库的属性传递给组件，让组件渲染使用
 * 另一个是输出，就是把在组件中可以派发动作，修改仓库里的状态
 * mapStateToProps 把仓库的状态映射组件的属性
 * mapDispatchToProps 把组件中的动作变成向仓库派发的action
 */
function connectClassComponent(mapStateToProps,mapDispatchToProps){
    return function(OldComponent){
        return class extends React.Component{
            static contextType = ReactReduxContext
            constructor(props,context){
                super(props);
                //1.获取仓库
                //在类组件的构造函数中是获取不到this.context,需要通过构造函数的第二个参数获取context
                const {store} = context;
                const {getState,subscribe,dispatch} = store;
                this.dispatch = dispatch;
                //2.先获取仓库的状态，然后进行映射 
                this.state = mapStateToProps(getState());
                //3.让当前的组件订阅仓库的状态变化，当仓库状态发生变化后重新更新组件
                this.unsubscribe = subscribe(()=>{
                    this.setState(mapStateToProps(getState()));
                });
            }
            componentWillUnmount(){
                this.unsubscribe();//在组件将要卸载前取消订阅
            }
            render(){
                let dispatchProps={};
                //如果mapDispatchToProps是一个函数的话
                if(typeof mapDispatchToProps =='function'){
                    //直接传入store.dispatch方法并执行mapDispatchToProps函数
                    dispatchProps=mapDispatchToProps(this.dispatch);
                }else if(typeof mapDispatchToProps =='object'){
                    //如果mapDispatchToProps是一个对象的话，
                    dispatchProps=bindActionCreators(mapDispatchToProps,this.dispatch);
                }
                return <OldComponent {...this.state} {...dispatchProps}/>
            }
        }
    }
}
function connect(mapStateToProps,mapDispatchToProps){
    return function(OldComponent){
        return function(props){
            //获取仓库
            const {store} =React.useContext(ReactReduxContext);
            const {getState,dispatch,subscribe} = store;
            //调用getState返回仓库的状态
            //const prevState = getState();
            //const stateProps = React.useMemo(()=>mapStateToProps(prevState),[prevState]);
            const dispatchProps = React.useMemo(()=>{
                let dispatchProps={};
                if(typeof mapDispatchToProps =='function'){
                    dispatchProps=mapDispatchToProps(dispatch);
                }else if(typeof mapDispatchToProps =='object'){
                    dispatchProps=bindActionCreators(mapDispatchToProps,dispatch);
                }
                return dispatchProps;
            },[dispatch]);
            //此方法只是为了得到一个可以渲染当前函数组件的一个更新函数
            //const [,setState] = React.useReducer(x=>x+1,0);
            //当要订阅的时候一般会使用useLayoutEffect而不是useEffect
           /*  React.useLayoutEffect(()=>{
                当仓库的状态发生变化之后会执行setState让组件更新
                return subscribe(setState);
            },[subscribe]); */
            //这是React18添加的用来让组件监听外部数据源的新hooks
            let stateProps = useSyncExternalStore(subscribe, ()=>mapStateToProps(getState()));
            return <OldComponent {...props} {...stateProps} {...dispatchProps}/>;
        }
    }
}
/**
 * 使用外部数据源，并且可以做到订阅外部数据源的变化，当外部数据源发生变化后让组件重新渲染
 * subscribe 订阅外部状态变化的监听函数
 * getSnapshot 返回最新的外部状态
 */
function useSyncExternalStore(subscribe,getSnapshot){
    const [state,setState] = React.useReducer(()=>getSnapshot(),getSnapshot());
    React.useLayoutEffect(()=>{
        return subscribe(setState);
    },[subscribe]);
    return state;
}
export default connect;