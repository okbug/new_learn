import React from 'react';
import { useLocation ,useParams} from '../react-router-dom';
import { UserAPI } from '../utils';
function UserDetail() {
    let location = useLocation();
    let params = useParams();
    console.log('UserDetail.params',params)
    let [user, setUser] = React.useState({});
    React.useEffect(() => {
        let user = location.state;
        if(!user){
            user = UserAPI.find(params.id);
        }
        if (user) {
            setUser(user);
        }
    }, []);
    return (
        <div>
            <p>ID:{user.id}</p>
            <p>Name:{user.name}</p>
        </div>
    )
}
export default UserDetail;