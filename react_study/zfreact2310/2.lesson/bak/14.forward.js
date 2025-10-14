import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
/**
 * 当你在父组件中使用ref时，React会处理这个Ref并将其附加到相应的元素或组件实例上
 * 而不是将其作为属性传递
 */
class MyComponent extends React.Component {
	render() {
		return (
			<div>hello {this.props.name}</div>
		)
	}
}
function withHOC(WrappedComponent) {
	//ref不能传递给WrappedComponent
	//ref放不会放入props
	//解决方案 可以使用React.forwardRef进行转发，这个方法可以允许你将ref自动转发到另一个组件
	return React.forwardRef((props,forwardRef) => {
		return <WrappedComponent {...props} ref={forwardRef} name='张三' />
	})
}
const EnhancedComponent =  withHOC(MyComponent);
class App extends React.Component {
	myComponentRef = React.createRef()
	componentDidMount() {
		console.log(this.myComponentRef.current)
	}
	//Function components cannot be given refs
	render() {
		return <EnhancedComponent ref={this.myComponentRef}/>
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);