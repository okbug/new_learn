import React from './react';
import ReactDOM from './react-dom/client';
window.globalCount = 5;
class Child1 extends React.Component{
	state = {count:1}
	handleClick = ()=>{
		window.globalCount=10;
		this.setState(state=>({count:state.count+1}));
	}
	render(){
		return <button onClick={this.handleClick}>{this.state.count+window.globalCount}</button>
	}
}
class Child2 extends React.Component{
	state = {count:2}
	render(){
		return <button>{this.state.count+window.globalCount}</button>
	}
}
class App extends React.Component{
	render(){
		return (
			<div>
				<Child1></Child1>
				<Child2></Child2>
			</div>

		)
	}
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
