import React from 'react';
import dva, { connect } from './dva';
import { Routes, Route, Link,routerRedux } from './dva/router';
const delay = ms => new Promise((resolve) => {
	setTimeout(resolve, ms)
});
//获取dva应用
const app = dva();
//定义模型
app.model({
	namespace: 'counter1',//定义此模型的名称
	state: { number: 0 },//定义此模型的初始状态
	reducers: {//定义状态处理函数
		add(state) {//对象的属性名就是动作类型 actionType,值就是状态计算函数，计算的时候会传入老状态
			return { number: state.number + 1 };
		}
	},
	//effect也就是我们的指令对象，专门用来处理副作用的
	effects: {
		//属性也同样是动作的类型,也同样要添加命名空间的前缀
		//第1个参数就是派发的动作，第2个参数就是redux-saga/effect,就是创建指令对象的创建函数
		*asyncAdd(action, { call, put }) {
			//call的意思就是返回一个调用某个函数的指令对象，并传递参数
			//并且等待它返回的Promise变成成功态，再往下执行
			yield call(delay, 1000);
			//put就是向仓库派发一个新的动作对象
			//如果派发动动是发给自己命名的话，前面的命名空间前缀可以不写
			//如果要派发动作给别的命名空间，则需要加命名空间前缀
			yield put({ type: 'add' });
		},
		*navigate({payload},{put}){
			//把payload也就是要跳转的路径传递给push方法
			//push方法会返回一个用来跳转路径的动作对象
			//{type:'@@router/CALL_HISTORY_METHOD',payload:{method:'push',args:['/counter2']}}
			yield put(routerRedux.push(payload));
		}
	}
});
app.model({
	namespace: 'counter2',//定义此模型的名称
	state: { number: 0 },//定义此模型的初始状态
	reducers: {//定义状态处理函数
		add(state) {//对象的属性名就是动作类型 actionType,值就是状态计算函数，计算的时候会传入老状态
			return { number: state.number + 1 };
		}
	}
});
//要渲染的组件
function Counter1({ number, dispatch }) {
	return (
		<div>
			<p>{number}</p>
			<button onClick={() => dispatch({ type: 'counter1/add' })}>+</button>
			<button onClick={() => dispatch({ type: 'counter1/asyncAdd' })}>1秒后加1</button>
			<button onClick={() => dispatch({ type: 'counter1/navigate',payload:'/counter2' })}>跳到/counter2</button>
		</div>
	)
}
//关联仓库和组件，获得关联仓库后的组件
const ConnectedCounter1 = connect(
	state => state.counter1//mapStateToProps 把仓库状态映射为组件属性对象的函数
	//mapDispatchToProps 1传一个映射函数 2传一个actionCreator对象 3 不传
)(Counter1);
//要渲染的组件
function Counter2({ number, dispatch }) {
	return (
		<div>
			<p>{number}</p>
			<button onClick={() => dispatch({ type: 'counter2/add' })}>+</button>
		</div>
	)
}
//关联仓库和组件，获得关联仓库后的组件
const ConnectedCounter2 = connect(
	state => state.counter2//mapStateToProps 把仓库状态映射为组件属性对象的函数
	//mapDispatchToProps 1传一个映射函数 2传一个actionCreator对象 3 不传
)(Counter2);
//定义路由函数，最后在页面上进行渲染的其实就是它的返回值
const Home = () => <div>Home</div>
app.router(() => (
	<>
		<ul>
			<li><Link to="/">首页</Link></li>
			<li><Link to="/counter1">Counter1</Link></li>
			<li><Link to="/counter2">Counter2</Link></li>
		</ul>
		<Routes>
			<Route path='/' exact={true} element={<Home />} />
			<Route path='/counter1' element={<ConnectedCounter1 />} />
			<Route path='/counter2' element={<ConnectedCounter2 />} />
		</Routes>
	</>
));
//把路由渲染函数返回的React元素渲染到页面的#root元素的内部
app.start('#root');