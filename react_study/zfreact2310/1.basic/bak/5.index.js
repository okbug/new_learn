import React from './react';
import ReactDOM from './react-dom/client';
function ChildCounter(props) {
	return <button
		onClick={props.handleClick}>{props.title}:{props.number}</button>
}
class Counter extends React.Component {
	constructor(props) {
		super(props);
		//可以在组件里定义状态，状态是可以通过组件的setState方法进行更新的
		//调用了setState方法之后，组件会重新渲染更新
		//类的构造函数是唯一可以给类组件定义状态的地方
		this.state = { number: 0, title: '计数器' }
	}
	handleClick = () => {
		//可以调用setState方法更新状态，更新之后自动触发组件的更新
		//在组件更新时候只需要传递变更的属性即可，不需要变更的属性，不需要传递，会保留原来的值
		//this.setState({number: this.state.number + 1});
		//setState参数可以是一个对象，也可以是一个函数，推荐使用函数，可以根据老状态计算新状态
		this.setState(
			(prevState) => ({ number: prevState.number + 1 }),() => {
				console.log("State updated!", this.state.number);
			  }
			);
	}
	render() {
		return (
			<ChildCounter
				title={this.state.title}
				number={this.state.number}
				handleClick={this.handleClick} />
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
