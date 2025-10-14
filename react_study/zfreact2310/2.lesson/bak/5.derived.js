import React from 'react';
import ReactDOM from 'react-dom/client';
//另一种替代方案是让我们组件完全的掌握草稿状态的电子邮箱状态
//在这种情况下，组件仍然可以接受一个email属性作为默认值，但会忽略 它对后续属性变更
//子组件内部状态完全由子组件内部管理，父组件管理不了，无法控制子组件的状态
class EmailInput extends React.Component{
	state = {email:this.props.defaultEmail}
	handleChange= (event)=>{
		this.setState({email:event.target.value});
	}
	render(){
		return (
			<input value={this.state.email} onChange={this.handleChange}/>
		)
	}
}
class App extends React.Component{
	render(){
		return (
			<div>
				<EmailInput defaultEmail='123@qq.com' />
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);