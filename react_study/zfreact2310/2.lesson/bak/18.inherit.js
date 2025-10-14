import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
class BaseComponent extends React.Component {
	static sharedStaticProperty = 'shared value'
	constructor(props) {
		super(props);
		this.state = {
			sharedState: 'initial state'
		}
	}
	sharedMethod() {
		console.log(`shared method called`)
	}
	render() {
		return (
			<div>
				<h2>BaseComponent</h2>
				<p>sharedStaticProperty{this.constructor.sharedStaticProperty}</p>
				<p>state:{this.state.sharedState}</p>
			</div>
		)
	}
}
class DerivedComponent extends BaseComponent {
	componentDidMount(){
		this.sharedMethod();//从父类继承过来的实例方法
	}
	render() {
		return (
			<div>
				<h2>DerivedComponent</h2>
				<p>从父类继承过来的静态属性 sharedStaticProperty{this.constructor.sharedStaticProperty}</p>
				<p>从父类继承过来的状态 state:{this.state.sharedState}</p>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<DerivedComponent />);