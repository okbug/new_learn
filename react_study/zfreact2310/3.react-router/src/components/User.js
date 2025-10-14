import {Link,Outlet,useParams} from '../react-router-dom'
function User(){
    let params = useParams();
    console.log('User.params',params)
    return (
        <div>
            <ul>
                <li><Link to="/user/list">用户列表</Link></li>
                <li><Link to="/user/add">添加用户</Link></li>
            </ul>
            <Outlet/>
        </div>
    )
}
export default User;
//Outlet出口的意思，相当于vue-router中的router-view