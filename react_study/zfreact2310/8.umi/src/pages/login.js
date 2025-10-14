
import {useLocation,history,useNavigate} from 'umi';
export default function(){
    //history是在React路由V5中的一个对象，历史对象，可以用来跳转路径
    //但是React路由V6中没有这个对象了，但是因为它非常的方便，所以umi做了兼容
    const location = useLocation();
    const navigate = useNavigate();
    return (
        <div>
            <h1>登录页</h1>
            <button onClick={()=>{
                localStorage.setItem('isLogin','true');
                if(location.state && location.state.from){
                    //history.push(location.state.from);
                    navigate(location.state.from);
                }

            }}>登录</button>
        </div>
    )
}