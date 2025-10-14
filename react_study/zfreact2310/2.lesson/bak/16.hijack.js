import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
/**
 * 渲染劫持其实也是高阶组件的一个概念，
 * 它指的是在不改变被 包裹的组件本身的情况下，改变其渲染输出的结果
 * 条件渲染 根据特定的条件改变渲染的结果或者决定是否渲染
 * 属性操作 可以向被 包裹的组件传递新的属性或者修改老的属性
 * 结构变更 改变组件的DOM结构和样式
 */
function MyComponent(props){
  return (
	<h1 style={props.style}>hello,{props.name}</h1>
  )
}
function withRenderHijacking(WrappedComponent){
	return class extends React.Component{
		render(){
			//1.条件渲染 根据特定的条件改变渲染的结果或者决定是否渲染
			if(this.props.loading){
				return <div>loading......</div>
			}
			//先获得老的虚拟DOM
			const oldElement = <WrappedComponent {...this.props}/>
			/**const newElement = React.cloneElement(oldElement,{
				...this.props,
				name:'Hijacked name',
				style:{color:'green'}
			})**/
			const newElement = <WrappedComponent {...this.props} 
			name={'Hijacked name'} style={{color:'green'}}/>
			//结构变更 改变组件的DOM结构和样式
			return (
				<div style={{color:'red'}}>
					<h2>Hijacked</h2>
					{newElement}
				</div>
			)

		}
	}
}
const HijackedComponent = withRenderHijacking(MyComponent);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HijackedComponent  loading={false}/>);