import React from './react';
import ReactDOM from './react-dom/client';
//定义一个初始状态
const initialState = { count: 0 };
/**
 * 计算新状态的函数
 * @param {*} state 老状态 
 * @param {*} action 动作 动作就是一个描述你想干啥的对象 {type:'ADD'} {type:"MINUS"}
 */
function reducer(state = initialState, action) {
	switch (action.type) {
		case 'ADD':
			//state.count = state.count + 1;
			return { count: state.count + 1 };
		case 'MINUS':
			return { count: state.count - 1 };
		default:
			return state;
	}
}
function Counter(){
	const [state1,dispatch1] = React.useReducer(reducer,initialState);//0
	const [state2,dispatch2] = React.useReducer(reducer,initialState);//1
	return (
		<div>
			<p>state1.count:{state1.count}</p>
			<button onClick={()=>dispatch1({type:'ADD'})}>addState1</button>
			<button onClick={()=>dispatch1({type:'MINUS'})}>-</button>
			<hr/>
			<p>state2.count:{state2.count}</p>
			<button onClick={()=>dispatch2({type:'ADD'})}>addState2</button>
			<button onClick={()=>dispatch2({type:'MINUS'})}>-</button>
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
