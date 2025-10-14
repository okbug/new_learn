import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
//其实作为ChildComponent我只关心firstProp,不关心secondProp
//希望只有当firstProp发生变化了才重新渲染，secondProp变化了不管
function ChildComponent({firstProp,secondProp}){
	console.log(`ChildComponent render`);
	return (
		<div>
			<h2>子组件</h2>
			<p>firstProp:{firstProp}</p>
			<p>secondProp:{secondProp}</p>
		</div>
	)
}
const MemoChildComponent = React.memo(ChildComponent,function propsAreEqual(prevProps, nextProps){
	//只要第一个属性相等就相等，就算属性不变，就可以不重新渲染
	return prevProps.firstProp === nextProps.firstProp;
});
function ParentComponent(){
	const [firstProp,setFirstProp] = useState(0);
	const [secondProp,setSecondPro] = useState('初始值');
	return (
		<div>
			<h1>父组件</h1>
			<button onClick={()=>setFirstProp(prev=>prev+1)}>改变第1个属性</button>
			<button onClick={()=>setSecondPro(prev=>prev+'更新')}>改变第2个属性</button>
			<MemoChildComponent firstProp={firstProp} secondProp={secondProp}/>
		</div>
	)

}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);

