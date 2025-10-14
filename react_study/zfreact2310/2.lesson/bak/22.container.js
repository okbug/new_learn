import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

function UserList(props){
	return (
		<ul>
			{
				props.users.map(user=>(
					<li key={user.id}>{user.name}</li>
				))
			}
		</ul>
	)
}
function UserListContainer(){
	const [users,setUsers] = React.useState([]);
	const  [isLoading,setIsLoading] =useState(true);
	React.useEffect(()=>{
		setTimeout(()=>{
			setUsers([{id:1,name:'zs'},{id:2,name:'lisi'}]);
			setIsLoading(false);
		},2000);
	},[]);
	if(isLoading){
		return <div>loading</div>
	}
	return <UserList users={users}></UserList>
}
function App(){
	return (
		<div>
			<UserListContainer></UserListContainer>
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);