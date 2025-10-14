import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom/client';
//这是一个自定义的Hooks，践行了外观模式，封装了对用户的所有的操作
function useUserManagement(){
	const [users,setUsers] = useState([]);
	const addUser = (user)=>{
		setUsers([...users,user]);
	}
	const deleteUser = (userId)=>{
		setUsers(users.filter(user=>user.id !== userId));
	}
	return {
		users,addUser,deleteUser
	}
}
const UserTable = ({users,onDelete})=>{
	return (
		<table>
			<thead>
				<tr>
					<td>姓名</td>
					<td>操作</td>
				</tr>
			</thead>
			<tbody>
				{
					users.map(user=>(
					<tr key={user.id}>
						<td>{user.name}</td>
						<td><button onClick={()=>onDelete(user.id)}>Delete</button></td>
					</tr>
					))
				}
			</tbody>
		</table>
	)
}
const Users = ()=>{
	const {users,addUser,deleteUser} = useUserManagement();
	return (
		<div>
			<button onClick={()=>addUser({id:Date.now(),name:`user_${Date.now()}`})}>添加用户</button>
			<UserTable users={users} onDelete={deleteUser}/>
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Users />);

