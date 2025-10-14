import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
//在子组件收到父组件传递过来的value后会在控制台每秒打印一次这个值
class ChildComponent1 extends React.Component {
	componentDidMount() {
		this.startInterval();
	}
	startInterval = () => {
		this.intervalId = setInterval(() => {
			console.log(this.props.value);
		}, 1000);
	}
	clearInterval = () => {
		clearInterval(this.intervalId);
	}
	componentDidUpdate(prevProps) {
		if (this.props.value !== prevProps.value) {
			this.clearInterval();
			this.startInterval();
		}
	}
	componentWillUnmount() {
		this.clearInterval();
	}
	render() {
		return (
			<div>
				<h2>子组件</h2>
				<p>接收的值:{this.props.value}</p>
			</div>
		)
	}
}
function useIntervalLogger(value) {
	useEffect(() => {
		const intervalId = setInterval(() => {
			console.log(value);
		}, 1000);
		//如果value变化了，则执行上一次的effect销毁函数，取消上一个定时器，开启下一个定时器
		return () => {
			clearInterval(intervalId);
		}
	}, [value]);//依赖属生时的value
}
function ChildComponent2({ value }) {
	useIntervalLogger(value);
	return (
		<div>
			<h2>子组件</h2>
			<p>接收的值:{value}</p>
		</div>
	)
}
function ParentComponent() {
	const [value, setValue] = useState(0);
	return (
		<div>
			<h1>父组件</h1>
			<button onClick={() => setValue(prev => prev + 1)}>增加值</button>
			<ChildComponent2 value={value} />
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);

