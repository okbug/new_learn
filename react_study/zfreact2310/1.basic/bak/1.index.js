import React from 'react';
import ReactDOM from 'react-dom/client'
/**
 * 在React中可以使用React.createElement方法创建虚拟DOM
 * 也可以认为React.createElement是创建虚拟DOM工厂
 * 它的返回值才是React元素，也是虚拟DOM
 */
const element = React.createElement(
	'div',//DOM的类型
	{//DOM的属性
		style:{color:'red'},//行内样式
		className:'container'//类名
	},
	'hello',
	React.createElement(
		"span",//DOM的类型
		{style:{color:'blue'}},//行内属性
		'world'//儿子
	)
);
let jsxElement = (
	<div style={{color:'red'}} className='container'>
		hello
		<span style={{color:'blue'}}>world</span>
	</div>
)
//root代表要渲染的目标容器
const root = ReactDOM.createRoot(document.getElementById('root'));
//要把哪个React元素，也就是虚拟DOM渲染到容器中
root.render(jsxElement);