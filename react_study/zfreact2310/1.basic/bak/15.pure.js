import React from './react';
import ReactDOM from './react-dom/client';
class RegularComp extends React.Component{
	render(){
		console.log(`Rendering RegularComp`)
		return <div>{this.props.value}</div>
	}
}
class PureComp extends React.PureComponent{
	render(){
		console.log(`Rendering PureComponent`)
		return <div>{this.props.value}</div>
	}
}
class App extends React.Component {
	state = {data:{value:1}}
	render(){
		return (
			<div>
				<button onClick={()=>this.setState({data:this.state.data})}>+</button>
				<RegularComp value={this.state.data.value}/>
				<PureComp value={this.state.data.value}/>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
