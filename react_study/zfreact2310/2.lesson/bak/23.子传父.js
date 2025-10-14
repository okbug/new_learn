import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
class ChildComponent extends React.Component{
	render(){
		return (
			<button onClick={()=>this.props.onReceiveData('子组件发给父组件的数据')}>发送数据给父组件</button>
		)
	}
}
class ParentComponent extends React.Component{
	state = {dataFromChild:''}
	handleDataFromChild = (data)=>{
		this.setState({
			dataFromChild:data
		});
	}
	render(){
		return (
			<div>
				<h1>父组件</h1>
				<ChildComponent onReceiveData={this.handleDataFromChild}/>
				<p>父组件接收到的来自于子组件的数据:{this.state.dataFromChild}</p>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);