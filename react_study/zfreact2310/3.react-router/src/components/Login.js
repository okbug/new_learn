import React from 'react';
import { useNavigate, useLocation } from '../react-router-dom';
function Login() {
    //获取用来导航的方法
    const navigate = useNavigate();
    //获取当前的路径
    const location = useLocation();
    //当点击登录按钮的时候先设置localStorage状态
    const login = () => {
      localStorage.setItem('login','true');
      let to = '/';
      if(location.state){
        to=location.state.from||'/';
      }
      navigate(to);  
    }
    return (
        <button onClick={login}>登录</button>
    )
}
export default Login;