import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, BrowserRouter, Routes, Route, NavLink,Navigate,useRoutes } from './react-router-dom'
import routesConfig from './routesConfig';
//import Post from './components/Post';//这是同步加载
const LazyPost = React.lazy(()=>import('./components/Post'));
const root = ReactDOM.createRoot(document.getElementById('root'));
//定义一个激活样式，背景色为绿色
const activeStyle = {backgroundColor:'green'};
//激活的类名
const activeClassName = 'active';
//激活导航属性对象
const activeNavProps = {
	style:({isActive})=>isActive?activeStyle:{},
	className:({isActive})=>isActive?activeClassName:''
}
function App(){
	const [routes,setRoutes] = React.useState(routesConfig);
	const addRoute = ()=>{
		setRoutes((prevRoutes)=>[
			...prevRoutes,
			{
				path:'/post/:id',
				element:(
					<React.Suspense fallback={<div>loading...</div>}>
						<LazyPost/>
					</React.Suspense>
				)
			}
		]);
	}
	return (
		<div>
			{useRoutes(routes)}
			<button onClick={addRoute}>增加Post路由</button>
		</div>
	)
}
root.render(
	<BrowserRouter>
		<ul>
			<li><NavLink end={true} to="/" {...activeNavProps}>首页</NavLink></li>
			<li><NavLink to="/user/list" {...activeNavProps}>用户管理</NavLink></li>
			<li><NavLink to="/profile" {...activeNavProps}>个人中心</NavLink></li>
			<li><NavLink to="/post/100" {...activeNavProps}>文章</NavLink></li>
		</ul>
		<App/>
	</BrowserRouter>
);