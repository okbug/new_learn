import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
//import hoistNoReactStatics from 'hoist-non-react-statics';
/**
 * 把sourceComponent类组件上的非React内部静态属性和静态方法传递给targetComponent
 */
function hoistNoReactStatics(targetComponent, sourceComponent) {
	const REACT_STATICS = {
		displayName: true,//React内部的静态属性表示显示的名称
		propTypes: true,//React内部的静态属性表示对属性进行类型校验
		defaultProps: true,//React内部的静态属性表示默认属性
		contextTypes: true,//React内部的静态属性表示React Context
		childContextTypes: true//React内部的静态属性 子Context，现在已经废弃
	}
	Object.getOwnPropertyNames(sourceComponent).forEach((key) => {
		if (!REACT_STATICS[key]) {//如果此属性不在REACT_STATICS，说明此属性不是React内部的，而是自定义，需要拷贝
			//如果targetComponent上没有这个属性，或者有这个属性，但是可以重新配置
			if (!Object.getOwnPropertyDescriptor(targetComponent, key)
				|| Object.getOwnPropertyDescriptor(targetComponent, key).configurable) {
				//重新定义targetComponent身上的key属性，值是sourceComponent身上key对应的属性描述器
				Object.defineProperty(targetComponent, key,
					Object.getOwnPropertyDescriptor(sourceComponent, key));
			}
		}
	});
}
/**
 * 高阶组件有两个问题和缺陷
 * 1.它不能透传静态属性 
 */
function withAuth(WrappedComponent) {
	class WithAuthComponent extends React.Component {
		isLogin() {
			return !!localStorage.getItem('isLogin');
		}
		render() {
			if (!this.isLogin()) {
				return <div>请登录后再访问此页面</div>
			}
			return <WrappedComponent />
		}
	}

	hoistNoReactStatics(WithAuthComponent, WrappedComponent)
	return WithAuthComponent;
}
class MyComponent extends React.Component {
	static someStaticProperty = 'some value';
	static someStaticMethod = () => {
		console.log('someStaticMethod')
	}
	render() {
		return <div>欢迎来到受保护的页面</div>
	}
}
const ProtectedComponent = withAuth(MyComponent);
console.log('ProtectedComponent.someStaticProperty', ProtectedComponent.someStaticProperty)
ProtectedComponent.someStaticMethod();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<ProtectedComponent />
);