import React from './react';
import ReactDOM from './react-dom/client';
class Counter extends React.Component {
	state = { count: 0 }
	handleClick = () => {
		this.setState({ count: this.state.count + 1 });
		console.log(this.state.count)
		this.setState({ count: this.state.count + 1 });
		console.log(this.state.count)
		setTimeout(() => {
			this.setState({ count: this.state.count + 1 });
			console.log(this.state.count)
			this.setState({ count: this.state.count + 1 });
			console.log(this.state.count)
		});
	}
	render() {
		return (
			<button onClick={this.handleClick}>{this.state.count}</button>
		)
	}
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
