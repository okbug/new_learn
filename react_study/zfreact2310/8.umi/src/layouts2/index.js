import {Link,Outlet} from 'umi';
function Layout(){
    return (
        <>
            <ul>
                <li><Link to="/">首页</Link></li>
                <li><Link to="/user">用户管理</Link></li>
                <li><Link to="/profile">个人中心</Link></li>
            </ul>
            <div><Outlet/></div>
        </>
    )
}
export default Layout;