import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
function App() {
	const [value, setValue] = useState(0);
	const prevValueRef = useRef('');//创建一个用来引用上一次渲染的值的ref对象
	//添加一个effect函数，给prevValueRef.current赋值为value
	//useEffect(()=>{//给ref重新赋值并不会导致 组件重新渲染
	//	prevValueRef.current=value;
	//});
	const prevValue = prevValueRef.current;
	return (
		<div>
			<p>当前值:{value}</p>
			<p>上一轮的值:{prevValue}</p>
			<button onClick={() => setValue(count => {
				prevValueRef.current = count;
				return count + 1;
			})}>更新</button>
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

