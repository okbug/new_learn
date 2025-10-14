import React from './react';
import ReactDOM from './react-dom/client';//React18的写法
//import ReactDOM from 'react-dom';//React17的写法
class Counter extends React.Component {
	state = { number: 0 }//以后可以在这里直接定义状态，而不需要使用构造函数
	//监听函数一定要使用箭头函数，保证函数中的this指向类组件的实例
	handleClick = () => {
		//如果你在一个事件处理器中多次调用 setState，React 可能会将它们合并成一个单一的更新以提高性能
		this.setState({ number: this.state.number + 1 });//{number:1}
		//调用完setState之后，this.state并没有立刻更新，而先缓存起来了
		console.log(this.state)
		this.setState({ number: this.state.number + 1 });//{number:1}
		console.log(this.state)
		//在setTimeout里面是同步更新，非批量更新的
		setTimeout(() => {
			this.setState({ number: this.state.number + 1 });//{number:2}
			console.log(this.state)//2
			this.setState({ number: this.state.number + 1 });//{number:3}
			console.log(this.state)
		});
		//最后等事件处理器执行完成后才进行实际的更新
	}
	render() {
		return (
			<button onClick={this.handleClick}>{this.state.number}</button>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
//把虚拟DOM渲染到容器中
//ReactDOM.render(<Counter />, document.getElementById('root'));
/**
 * React17
 * 在事件处理器中、在生命周期函数中等React能够管理到的地方setState都是异步的
 * 在其它地方，React无法管理的地方，setState都是同步的
 * React18后面讲，在React18中，不管在什么地方，setState都是批量的
 */