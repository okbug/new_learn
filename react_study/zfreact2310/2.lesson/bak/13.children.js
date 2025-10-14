import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
/**
 * render props
 * 给组件定义一个名为render属性，它是一个渲染函数，它返回一个JSX,或者说虚拟DOM决定显示什么样DOM
 * 
 */
class MouseTracker extends React.Component {
	state = { x: 0, y: 0 }
	handleMouseMove = (event) => {
		this.setState({
			x: event.clientX,
			y: event.clientY
		});
	}
	render() {
		return (
			<div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
				{this.props.children(this.state)}
			</div>
		)
	}
}
const App = () => {
	return (
		<div>
			<h1>请移动你的鼠标</h1>
			<MouseTracker>
				{
					({ x, y }) => {
						return <div>当前位置:{x},{y}</div>
					}
				}
			</MouseTracker>
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);