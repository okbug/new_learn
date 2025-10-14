import React from './react';
import ReactDOM from './react-dom/client'
/**
 * 函数组就是一个函数，可以返回一个虚拟DOM
 * @param props 代表传递给此组件的属性对象
 */
function FunctionComponent(props){
	return (
		<div>hello {props.name} {props.age}</div>
	)
}
//这是JSX的写法
const element1 = <FunctionComponent name="zhangsan" age={18}/>
//这是普通的JS写法
//其实最终JSX在webpack打包编辑的时候会使用babel编译成普通JS
//babel负责把name="zhangsan" age={18}转成props对象并传递给props
const element2 = React.createElement(FunctionComponent,{name:'lisi',age:21});
const root = ReactDOM.createRoot(document.getElementById('root'));
//要把哪个React元素，也就是虚拟DOM渲染到容器中
root.render(element1);