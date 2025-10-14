import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
class SiblingComponentOne extends React.Component{
  render(){
	return (
		<button onClick={()=>this.props.onSendData('来自兄弟One的数据')}>发送数据给兄弟组件Two</button>
	)
  }
}
class SiblingComponentTwo extends React.Component{
	render(){
		return <p>从兄弟One接收过来的数据:{this.props.data}</p>
	}
}
class ParentComponent extends React.Component{
	state = {data:''}
	handleData = (data)=>{
		this.setState({data});
	}
	render(){
		return (
			<div>
				<h1>父组件</h1>
				<SiblingComponentOne onSendData={this.handleData}/>
				<SiblingComponentTwo data={this.state.data}/>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);