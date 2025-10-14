import React from './react';
import ReactDOM from './react-dom/client';
/**
 * React.forwardRef 允许你将ref从父组件传递子组件
 */
function  ChildComponent(props,forwardRef){
	return <input ref={forwardRef}/>
}
//可以把函数组件传递检forwardRef,它会返回一个新组件
//在你需要在子组件内部DOM节点的时候使用，
//forwardRef可以接收一个函数组件的渲染函数，返回一个新组件。此函数可以接收ref
const ForwardChildComponent = React.forwardRef(ChildComponent);
console.log(ForwardChildComponent)
//$$typeof: Symbol(react.forward_ref) render: ƒ ChildComponent(props, forwardRef)
class ParentComponent extends React.Component{
	inputRef = React.createRef();
	handleClick = ()=>{
		this.inputRef.current.focus();
	}
	render(){
		return (
			<div>
				<ForwardChildComponent ref={this.inputRef}/>
				<button onClick={this.handleClick}>focus</button>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);
/**
Warning: 
Function components cannot be given refs. 不能给函数组件传递 refs
Attempts to access this ref will fail.尝试访问此ref将会失败
 Did you mean to use React.forwardRef()? 你是否希望使用转发的Ref
 */