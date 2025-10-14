import React from 'react';
import {Navigate} from '../react-router-dom';
function Protected(props){
    //从属性中获取要渲染的组件和本来想渲染哪个路径
    const {RouteComponent,from} = props;
    //如果用户已经登录了则直接渲染该 渲染的路由组件，如果没有登录，则导航到登录页
    return localStorage.getItem('login')?(
        <RouteComponent/>
    ):<Navigate to={{pathname:'/login',state:{from}}}/>
}
export default Protected;