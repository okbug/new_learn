
import React from 'react';
//从react-router中导出Router组件
import { Router,Routes,Route,useNavigate,Outlet,useParams,useLocation,Navigate,useRoutes } from '../react-router';
import { createHashHistory, createBrowserHistory } from '../history';
//导出react-router导出的所有的内容
export {
    Routes,
    Route,
    useNavigate,
    Outlet,
    useParams,
    useLocation,
    Navigate,
    useRoutes
}
export function HashRouter({ children }) {
    //使用useRef先创建一个可变的ref对象，用于存储历史对象的引用
    let historyRef = React.useRef(null);
    //如果说current为null,说明是初次渲染，尚未创建历史对象
    if (historyRef.current === null) {
        //创建一个hash历史对象并且赋值给current
        historyRef.current = createHashHistory();
    }
    //获取当前的历史对象 history.push replace go forward back
    let history = historyRef.current;
    //使用useState创建一个状态，用来存放当前的动作和路径位置 
    let [state, setState] = React.useState({
        //history.push action=PUSH history.replace action=REPLACE go forward back action=POP
        action: history.action,
        //路径对象 pathname当前的路径名 /user /profile
        location: history.location
    });
    //使用useLayoutEffect给history历史对象添加一个监听函数，当历史对象发生变化的时候执行setState
//history.listen的意思就是监听路径的改变，当路径改变之后重新
//当此组件将要销毁的时候要取消监听路径变化
    React.useLayoutEffect(() => history.listen(({action,location})=>{
        setState({action,location})
    }), [history]);
    return (
        <Router
            children={children}
            location={state.location}
            navigationType={state.action}
            navigator={history}
        />
    )
}

export function BrowserRouter({ children }) {
    //使用useRef先创建一个可变的ref对象，用于存储历史对象的引用
    let historyRef = React.useRef(null);
    //如果说current为null,说明是初次渲染，尚未创建历史对象
    if (historyRef.current === null) {
        //创建一个hash历史对象并且赋值给current
        historyRef.current = createBrowserHistory();
    }
    //获取当前的历史对象 history.push replace go forward back
    let history = historyRef.current;
    //使用useState创建一个状态，用来存放当前的动作和路径位置 
    let [state, setState] = React.useState({
        //history.push action=PUSH history.replace action=REPLACE go forward back action=POP
        action: history.action,
        //路径对象 pathname当前的路径名 /user /profile
        location: history.location
    });
    //使用useLayoutEffect给history历史对象添加一个监听函数，当历史对象发生变化的时候执行setState
    React.useLayoutEffect(() => history.listen(setState), [history]);
    return (
        <Router
            children={children}
            location={state.location}
            navigationType={state.action}
            navigator={history}
        />
    )
}

export function Link({to,children,...rest}){
    //可以调用自定义hook获取navigate函数，用来跳转路径
    const navigate = useNavigate();
    return (
        <a {...rest} href={to} onClick={(event)=>{
            event.preventDefault();
            navigate(to);
        }}>
            {children}
        </a>
    )
}
export function NavLink(
    {style:styleProp,
    className:classNameProp,
    end,children,to,...rest
    }){
   const path = {pathname:to};     
    //获取路径对象
   const location = useLocation();
   //获取路径名
   const locationPathname = location.pathname;
   //你想要跳转的路径
   const toPathname = path.pathname;
   //计算当前的地址路径和此导航链接的路径是否匹配
   //第一种情况，就是是完全相同 locationPathname=/user toPathname=/user 肯定 匹配
   //第二种情况 end=false，也就是不需要完整匹配，只需要匹配前缀即可
   //并且locationPathname=/user/user toPathname=/user
   let isActive = locationPathname === toPathname||(
    !end  && locationPathname.startsWith(toPathname)&&locationPathname.charAt(toPathname.length)==='/'
   )
   let className='';
   if(typeof classNameProp  === 'function'){
    className = classNameProp({isActive});
   }
   let style={};
   if(typeof styleProp  === 'function'){
    style = styleProp({isActive});
   }
   return (
    <Link {...rest} to={to} className={className} style={style}>{children}</Link>
   )
}