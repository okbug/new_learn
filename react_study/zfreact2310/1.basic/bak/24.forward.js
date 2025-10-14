import React from './react';
import ReactDOM from './react-dom/client';
//ref比较特殊，是放在虚拟DOM上的，或者说React元素上的，而不是放在属性上的
function FancyInput(props,forwardRef){
	let [count,setCount] = React.useState(0);
	return <p onClick={()=>setCount(count=>count+1)}>{count}</p>
}
const ForwardFancyInput = React.forwardRef(FancyInput);
function ParentComponent(){
	let [count,setCount] = React.useState(0);
	return (
		<div>
			<ForwardFancyInput/>
			<hr/>
			<button onClick={()=>setCount(count=>count+1)}>{count}</button>
		</div>
	)
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);
