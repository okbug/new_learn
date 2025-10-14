import React from 'react';
import ReactDOM from 'react-dom/client';
//现在EmailInput就变成了一个完全的受控组件，它内部没有状态，所有的数据和变更都委托父组件的进行
//这样的话就不会引起父组件的属性和子组件的状态修改冲突的问题了
class EmailInput extends React.Component{
	render(){
		return (
			<input value={this.props.email} onChange={this.props.handleChange}/>
		)
	}
}
class App extends React.Component{
	state = {email:'123@qq.com'}
	handleChange = (event)=>{
		this.setState({email:event.target.value});
	}
	render(){
		return (
			<div>
				<EmailInput email={this.state.email} handleChange={this.handleChange}/>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);