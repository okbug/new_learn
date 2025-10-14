import React from './react';
import ReactDOM from './react-dom/client';
class Counter extends React.Component{
	//setup props和state
	constructor(props){
		super(props);
		this.state = {number:0};
		console.log(`Counter 1.constructor 父组件初始化属性和状态`);
	}
	componentWillMount(){
		console.log(`Counter 2.componentWillMount 父组件将要挂载`)
	}
	handleClick = ()=>{
		this.setState({number:this.state.number+1});
	}
	componentDidMount(){
		console.log(`Counter 4.componentDidMount 父组件挂载完成`)
	}
	shouldComponentUpdate(nextProps,nextState){
		console.log(`Counter 5.shouldComponentUpdate 父组件要不要更新`);
		return nextState.number % 2 ===0;//如果是偶数就返回true,更新，如果是奇数就返回false,不更新
	}
	componentWillUpdate(){
		console.log(`Counter 6.componentWillUpdate 父组件更新前`)
	}
	componentDidUpdate(){
		console.log(`Counter 7.componentDidUpdate 父组件更新后`)
	}
	render(){
		console.log(`Counter 3.render 父组件渲染`);
		return (
			<div id={`counter${this.state.number}`}>
				<p>{this.state.number}</p>
				{this.state.number===4?null:<ChildCounter count={this.state.number}/>}
				<button onClick={this.handleClick}>+</button>
			</div>
		)
	}
}
class ChildCounter extends React.Component{
	//当此子组件收到父组件传递过来的新属性
	componentWillReceiveProps(){
		console.log(`    ChildCounter 4.componentWillReceiveProps 子组件收到新的属性对象`)
	}
	shouldComponentUpdate(nextProps){
		console.log(`    ChildCounter 5.shouldComponentUpdate 子组件要不要更新`)
		return nextProps.count%3===0;
	}
	componentWillUnmount(){
	    console.log(`    ChildCounter 6.componentWillUnmount 子组件将要卸载`)
	}
	componentWillMount(){
		console.log(`    ChildCount 1.componentWillMount 子组件将要挂载`)
	}
	render(){
		console.log(`    ChildCounter 2.render 子组件将要渲染`)
		return <div>{this.props.count}</div>
	}
	componentDidMount(){
		console.log(`    ChildCounter 3.componentDidMount 子组件挂载完成`)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
/**
 * React类组件的生命周期可以分为三个阶段
 * 挂载 mounting 挂载的钩子会在组件创建并插入到DOM之后调用 
 *     constructor 组件的构造函数，最先被 调用，用于初始化本地状态
 *     componentWillMount 组件将要被挂载 此方法在React18中标识为废弃
 *     render 计算得将要渲染的虚拟DOM  render是一个计算虚拟DOM的纯函数，不能调用setState,也不能有副作用
 *     componentDidMount 在组件渲染到真实DOM之后触发，这里可以发起网络请求和订阅信息
 * 更新 updating 当组件的属性或者状态发生改变时，会进入更新生命周期
 *     shouldComponentUpdate 根据组件的props和state的变化，返回一个布尔值来决定React是否要重新渲染组件
 *     如果返回true就表示要更新，如果返回了false则表示不更新，此处是性能优化最重要的关键点
 *     componentWillUpdate 组件将要更新
 *     render 重新计算新的虚拟DOM
 *     componentDidUpdate  在更新之后立刻调用
 * 
 *     当组件的属性变化的时候也会进入更新的流程
 * 卸载 unmounting
 *     当组件从DOM中移除的时候会调
 *    componentWillUnmount 在组件卸载及销毁前直接调用，可以在此进行一些清理操作
 *    比如清除无用的定时器，或者取消网络请求
 */