import React from 'react';
import ReactDOM from 'react-dom/client';
function Counter() {
	const [count, setCount] = React.useState(0);
	React.useEffect(() => {
		console.log(`开启一个新的定时器`);
		const timer = setInterval(() => {
			setCount(count => count + 1);
		}, 1000);
		return ()=>{//effect函数会返回一个清理函数cleanup，此函数会在下次执行effect函数之前被调用
			console.log(`销毁老的定时器`);
			clearInterval(timer);
		}
	},[]);//空数组意味着没有依赖，也意味着依赖项永远不会改变 
	return (
		<div>{count}</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
