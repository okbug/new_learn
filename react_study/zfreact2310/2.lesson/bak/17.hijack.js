import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
/**
 * 渲染劫持其实也是高阶组件的一个概念，
 * 它指的是在不改变被 包裹的组件本身的情况下，改变其渲染输出的结果
 * 条件渲染 根据特定的条件改变渲染的结果或者决定是否渲染
 * 属性操作 可以向被 包裹的组件传递新的属性或者修改老的属性
 * 结构变更 改变组件的DOM结构和样式
 * 通过继承实现渲染劫持
 */
class MyComponent extends React.Component {
	render() {
		return (
			<h1 style={this.props.style}>hello,{this.props.name}</h1>
		)
	}
}
function withRenderHijacking(WrappedComponent) {
	return class extends WrappedComponent{
		render(){
			if(this.props.loading){
				return <div>loading......</div>
			}
			//调用老的render方法返回老的渲染的React元素
			const oldElement = super.render();
			return (
				<div style={{color:'red'}}>
					<h2>Hijacked</h2>
					{
						React.cloneElement(oldElement,{
							style:{color:'green'}
						},`hello,hijack`)
					}
				</div>
			)

		}
	}
}
const HijackedComponent = withRenderHijacking(MyComponent);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HijackedComponent loading={false} />);