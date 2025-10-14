import React from './react';
import ReactDOM from './react-dom/client';
//现在希望如果改变的是输入框的值，ChildButton组件并不依赖输入框的值，所以ChildButton不要重新渲染
//要想让ChildButton不重新渲染有两个条件
//第一个条件需要使用React.memo
function ChildButton({displayData,incrementCount}){
	console.log('Rendering ChildButton');
	return <button onClick={incrementCount}>{displayData.count}</button>
}
//使用了React.memo之后返回一个新组件，这个新组件可以保证如果新组件的属性不变，则不需要得新渲染这个新组件
const MemoChildButton = React.memo(ChildButton);
function App(){
  console.log('Rendering App');
  const [username,setUsername] = React.useState('zhufeng');
  const [count,setCount] = React.useState(0);
  //使用React.memo可以缓存对象，此对象可做到在App组件多次渲染执行的时候保持引用地址不变
  //第二个参数是依赖值 的数组，当依赖数组中的值不变时，则会复用上一次的值，如果变化了，则重新计算新的对象
  const displayData = React.useMemo(()=>({count}),[count]);
  //使用React.useCallback可以缓存回调函数callback,此函数会在App组件多次渲染执行的时候保持引用地址不变
  const incrementCount = React.useCallback(()=>{
	setCount(count=>count+1);
  },[count])
  return (
	<div>
		<input
		  type='text'
		  value={username}
		  onChange={(event)=>setUsername(event.target.value)}
		/>
		<MemoChildButton
			displayData={displayData}
			incrementCount={incrementCount}
		/>
	</div>
  )
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
