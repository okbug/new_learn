import {Link,Outlet} from 'umi';
function UserLayout(){
    return (
        <>
            <ul>
                <li><Link to="/user/list">用户列表</Link></li>
                <li><Link to="/user/add">添加用户</Link></li>
            </ul>
            <div><Outlet/></div>
        </>
    )
}
export default UserLayout;