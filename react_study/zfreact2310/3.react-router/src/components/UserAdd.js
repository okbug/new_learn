import React from 'react';
import { UserAPI } from '../utils';
import {useNavigate} from '../react-router-dom';
function UserAdd(){
    const navigate = useNavigate();
    const nameRef = React.useRef();
    const handleSubmit = (event)=>{
        event.preventDefault();
        let name = nameRef.current.value;
        UserAPI.add({id:Date.now()+"",name});
        navigate('/user/list')
    }
    return (
       <form onSubmit={handleSubmit}>
        <input type="text" ref={nameRef}/>
        <button type='submit'>添加</button>
       </form>
    )
}
export default UserAdd;