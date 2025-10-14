import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
class ChildComponent extends React.Component{
	render(){
		return <div>{this.props.text}</div>
	}
}
class ParentComponent extends React.Component{
	state = {text:'loading....'}
	componentDidMount(){
		setTimeout(()=>{
			this.setState({
				text:'从网络中获取到的数据'
			});
		},2000);
	}
	render(){
		return (
			<div>
				<h1>父组件</h1>
				<ChildComponent text={this.state.text}/>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);