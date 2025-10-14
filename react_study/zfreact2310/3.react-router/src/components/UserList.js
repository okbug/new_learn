import React from 'react';
import { Link } from '../react-router-dom';
import { UserAPI } from '../utils';
function UserList() {
    let [users, setUsers] = React.useState([]);
    React.useEffect(() => {
        let users = UserAPI.list();
        setUsers(users);
    }, []);
    return (
        <ul>
            {
                users.map((user, index) => (
                    <li key={user.id}>
                        <Link to={`/user/detail/${user.id}`} state={user}>{user.name}</Link>
                    </li>
                ))
            }
        </ul>
    )
}
export default UserList;