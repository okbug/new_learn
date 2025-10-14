import React from './react';
import ReactDOM from './react-dom/client';
//ref比较特殊，是放在虚拟DOM上的，或者说React元素上的，而不是放在属性上的
function FancyInput(props,forwardRef){
	const inputRef = React.useRef();
	//1参数是forward转发过来的ref,第2个参数是一个工厂函数，可以返回一个对象，此对象将传递给forward转发过来的ref
	React.useImperativeHandle(forwardRef,()=>(
		{
			focus(){
				inputRef.current.focus();
			}
		}
	));
	return <input ref={inputRef}/>
}
const ForwardFancyInput = React.forwardRef(FancyInput);
function ParentComponent(){
	const inputRef = React.useRef();
	const  focus = ()=>{
		//inputRef.current可以取到子组件的真实DOM
		//这样做的话有可能不安全，破坏了子组件的封装性
		inputRef.current?.focus();
		//inputRef.current.remove();
	}
	return (
		<div>
			<ForwardFancyInput ref={inputRef}/>
			<button onClick={focus}>focus</button>
		</div>
	)
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);
