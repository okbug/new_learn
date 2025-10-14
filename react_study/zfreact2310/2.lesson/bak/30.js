import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
class ChildCounter extends React.PureComponent {
	render() {
		console.log('ChildCounter render');
		return <button onClick={this.props.add}>{this.props.count.number}</button>
	}
}
class App extends React.Component {
	state = {
		count: { number: 0 },
		text: ''
	}
	add = () => {
		this.setState({ count: { number: this.state.count.number + 1 } })
	}
	setText = (event) => {
		this.setState({ text: event.target.value });
	}
	render() {
		return (
			<div>
				<input value={this.state.text} onChange={this.setText} />
				<ChildCounter count={this.state.count} add={this.add} />
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);