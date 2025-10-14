import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
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
function ParentComponent(){
	const [firstProp,setFirstProp] = useState(0);
	const [secondProp,setSecondPro] = useState('初始值');
	const MemoChildComponent = useMemo(()=>{
		//这里useMemo缓存的是一个虚拟DOM类型是ChildComponent
		//只在firstProp发生变化的时候才会重新计算新的ChildComponent虚拟DOM
		return <ChildComponent firstProp={firstProp} secondProp={secondProp}/>
	},[firstProp]);
	return (
		<div>
			<h1>父组件</h1>
			<button onClick={()=>setFirstProp(prev=>prev+1)}>改变第1个属性</button>
			<button onClick={()=>setSecondPro(prev=>prev+'更新')}>改变第2个属性</button>
			{MemoChildComponent}
		</div>
	)

}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);

