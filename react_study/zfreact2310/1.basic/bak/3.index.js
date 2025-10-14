import React from './react';
import ReactDOM from './react-dom/client';
/**
 * 定义一个类组件继承自父类React.Component
 * 定义的类组件必须编写一个名为render的函数，负责返回要渲染的虚拟DOM
 */
class ClassComponent extends React.Component{
	constructor(props){
		super(props);//this.props = props;
		//super指的是父类的构造函数
		//在内部会把收到的属性对象放在自己的实例上,以后可以通过this.props
	}
	render(){
		return (<div>hello {this.props.name} {this.props.age}</div>)
	}
}
//babel会把属性收集起来变成一个props属性对象，并传递给类组件的构造函数
const element = <ClassComponent name="zhangsan" age={18}/>
const root = ReactDOM.createRoot(document.getElementById('root'));
//要把哪个React元素，也就是虚拟DOM渲染到容器中
root.render(element);