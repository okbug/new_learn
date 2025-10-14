import React from './react';
import ReactDOM from './react-dom/client';
function Counter(props){
	console.log('Rendering Counter');
	return <h1>{props.count}</h1>
}
//memo是一个高阶组件，高阶组件就是一个函数，接收一个老组件，返回一个新组件
//如果当一个组件被 React.memo包裹的时候，React会记住该组件上一次渲染的结果
//当这个组件再次重新渲染的时候，React会进行浅比较当前的属性对象和上一次的属性对象
//如果属性没有发生变化，React会重用上一次的渲染结果，而不是重新渲染组件
//如果属性发生了变化，则组件会重新渲染
const MemoCounter = React.memo(Counter);
class App extends React.Component{
	state = {count:0}
	incrementCount = ()=>{
		this.setState((prevState)=>({count:prevState.count+0}));
	}
	render(){
		return (
			<div>
				<MemoCounter count={this.state.count}/>
				<button onClick={this.incrementCount}>+</button>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
