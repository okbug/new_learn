import React,{useState,useEffect} from 'react';
import ReactDOM from 'react-dom/client';
/**
 * 1.高阶组件是一个函数，高阶组件是一种函数式编程的模式。高阶组件参数是函数，返回值也是函数
 * 高阶组件就是参数是组件，返回值也是组件
 * 2.High Order Component HOC允许你抽象公共的逻辑，避免代码的重复
 * 比如你可能有很多组件都需要使用到添加loading效果的功能，就可以把它封装成高阶组件
 * 3.高阶组件不直接修改原组件，可以保证原始组件的纯净 和可重用性
 */
const withLoading = (WrappedComponent)=>{
	return (props)=>{
		const [isLoading,setIsLoading] = useState(true);
		useEffect(()=>{
			setTimeout(()=>{
				setIsLoading(false)
			},2000);
		},[]);
		if(isLoading){
			return <div>loading....</div>
		}
		return <WrappedComponent {...props} isLoading={isLoading}/>
	}
}
function MyComponent(){
	return <div>内容加载完成</div>
}
const MyComponentWithLoading = withLoading(MyComponent);
function App(){
	return <MyComponentWithLoading/>
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);