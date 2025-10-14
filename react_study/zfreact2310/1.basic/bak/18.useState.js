import React from './react';
import ReactDOM from './react-dom/client';
const initialState = { count: 0 };
function Counter(){
	const [state1,setState1] = React.useState(initialState);//0
	const [state2,setState2] = React.useState(initialState);//0
	return (
		<div>
			<p>state1.count:{state1.count}</p>
			<button onClick={()=>setState1(prevState=>({count:prevState.count+1}))}>addState1</button>
			<button onClick={()=>setState1({count:state1.count-1})}>-</button>
			<hr/>
			<p>state2.count:{state2.count}</p>
			<button onClick={()=>setState2({count:state2.count+1})}>addState2</button>
			<button onClick={()=>setState2({count:state2.count-1})}>-</button>
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
