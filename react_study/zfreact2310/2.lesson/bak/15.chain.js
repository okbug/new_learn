import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
/**
 * 高阶组件可以组合和级联
 */
//在组件挂载后和卸载前打印日志
function withLogging(WrappedComponent) {
	return class extends React.Component {
		componentDidMount() {
			console.log(`${WrappedComponent.name}已经挂载完成`)
		}
		render() {
			return <WrappedComponent />
		}
	}
}
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
	return WithAuthComponent;
}
class MyComponent extends React.Component {
	render() {
		return <div>欢迎来到受保护的页面</div>
	}
}
const EnhancedMyComponent = withLogging(withAuth(MyComponent));
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<EnhancedMyComponent />
);