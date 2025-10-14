import React from 'react';
import ReactDOM from 'react-dom/client';
//这种写法是非常错误的，因为违反单一数据源的设计
//input的value来自于this.state.email
//而这个this.state.email有两个数据来源，一个是组件内的输入，一个是来自于属性
//这样做会导致 state 更新丢失
//我们可以通过仅在props.email变化时更新状态来避免意外地擦除状态：
class EmailInput extends React.Component{
	state = {email:this.props.email,propEmail:this.props.email}
	handleChange = (event)=>{
		console.log('event.target.value',event.target.value);
		this.setState({email:event.target.value});
	}
	//getDerivedStateFromProps只在 props “改变”时被调用。 
	//无论 props 是否与之前“不同”。因此，使用这些生命周期函数无条件覆盖 state 一直是不安全的
	static getDerivedStateFromProps(nextProps,prevState){
		console.log('getDerivedStateFromProps',nextProps);
		//只有收到的属性和原来的老email不相等的话才会返回一个对象
		if(nextProps.email !== prevState.propEmail){
			//只会在属性变化的时候擦除我们所输入的内容
			return {email:nextProps.email,propEmail:nextProps.email};
		}
		return null;
	}
	render(){
		return <input value={this.state.email} onChange={this.handleChange}/>
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
				<EmailInput email={this.state.email}></EmailInput>
				<hr/>
				<input value={this.state.email} onChange={this.handleChange}/>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);