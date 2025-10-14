import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

function deepCompare(obj1, obj2) {
	if (obj1 === obj2) {
		return true;
	}
	if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
		return false;
	}
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	if (keys1.length !== keys2.length) {
		return false;
	}
	for (const key of keys1) {
		if (!keys2.includes(key) || !deepCompare(obj1[key], obj2[key])) {
			return false;
		}
	}
	return true;
}
class ChildCounter extends React.Component {
	shouldComponentUpdate(nextProps) {
		//为了解决明明值是一样的，但是因为引用地址不一样，导致 的重新渲染，可以自己手写
		//shouldComponentUpdate方法实现深比较
		return !deepCompare(this.props, nextProps);
	}
	render() {
		console.log('ChildCounter render');
		return <button onClick={this.props.add}>{this.props.count.number}</button>
	}
}
class App extends React.Component {
	state = {
		count: { number: 0 },
		text: ''
	}
	add = () => {
		this.setState({ count: { number: this.state.count.number +1} })
	}
	setText = (event) => {
		this.setState({ text: event.target.value });
	}
	render() {
		return (
			<div>
				<input value={this.state.text} onChange={this.setText} />
				<ChildCounter count={this.state.count} add={this.add} />
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);