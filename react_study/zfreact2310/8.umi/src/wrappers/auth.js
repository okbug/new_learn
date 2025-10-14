import {Outlet,Navigate} from 'umi';
export default ()=>{
    //判断用户是否登录过,如果登录过则直接渲染匹配的子组件，如果没有登录则跳到登录页进行登录
    const isLogin = localStorage.getItem('isLogin');
    if(isLogin){
        return <Outlet/>
    }else{
        return <Navigate to={{pathname:'/login'}} state={{from:'/profile'}}/>
    }
}