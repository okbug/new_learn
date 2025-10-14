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
	if(keys1.length !== keys2.length){
		return false;
	}
	for(const key of keys1){
		if(!keys2.includes(key) || !deepCompare(obj1[key],obj2[key])){
			return false;
		}
	}
	return true;
}
//import whyDidYouRender from '@welldone-software/why-did-you-render';
//它可以检测到那些明明属性没有变，却因为浅比较的问题导致不必要的刷新
function whyDidYouRender(React) {
	//缓存老的创建元素的方法
	const originalCreateElement = React.createElement;
	//创建React创建元素的方法
	React.createElement = (type, props, ...children) => {
		//如果这个类型是一个类组件的实例的话
		if (type.prototype instanceof React.Component) {
			///添加一个更新后的钩子函数，参数是老的属性和老的状态对象
			type.prototype.componentDidUpdate = function (prevProps, prevState) {
				const newProps = this.props;
				const newState = this.state;
				//用新属性对象和老的属性对象进行深度对比,判断属性是否改变了
				const propsChanged = !deepCompare(newProps, prevProps);
				//用新状态对象和老的状态对象进行深度对比,判断状态是否改变了
				const statesChanged = !deepCompare(newState, prevState);
				//如果经过深度对比，属性也没有，状态也没变
				if (!(propsChanged || statesChanged)) {
					console.warn(`[why-did-you-render] ${type.name} re-rendered without any changes in props or state`);
				}
			}
			return originalCreateElement(type, props, ...children);
		} else {
			return originalCreateElement(type, props, ...children);
		}
	}
}
whyDidYouRender(React, {
	trackAllPureComponents: true//默认跟踪所有的纯组件
});
class ChildComponent extends React.PureComponent {
	render() {
		console.log(`ChildComponent render`);
		return <div style={this.props.style}>ChildComponent</div>
	}
}

class ParentComponent extends React.Component {
	state = { count: 0 }
	add = () => {
		this.setState((prevState) => ({ count: prevState.count + 1 }));
	}
	render() {
		const style = { width: '100%' };
		return (
			<div>
				<button onClick={this.add}>{this.state.count}</button>
				<ChildComponent style={style} />
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);