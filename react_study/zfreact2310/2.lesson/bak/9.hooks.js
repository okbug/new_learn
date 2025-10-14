import React from 'react';
import ReactDOM from 'react-dom/client';
/**
 * 1.自定义hook必须是use开头
 * 2.自定义hook可以使用基础的hook
 * 3.可以封装业务逻辑
 */
function useForm(initialValues){
	const [values,setValues] = React.useState(initialValues);
	const handleChange = (event)=>{
		const {name,value} = event.target;
		setValues({
			...values,
			[name]:value
		});
	}
	const handleSubmit = (event)=>{
		event.preventDefault();//阻止默认事件
		console.log(values)
	}
	return {
		values,
		handleChange,
		handleSubmit
	}
}
const LoginForm = ()=>{
	const {values,handleChange,handleSubmit} = useForm({username:'',password:''});
	return (
		<form onSubmit={handleSubmit}>
			<div>
				<label>用户名</label>
				<input type='text' name="username" value={values.username} onChange={handleChange}/>
			</div>
			<div>
				<label>密码</label>
				<input type='password' name="password" value={values.password} onChange={handleChange}/>
			</div>
			<button type='submit'>login</button>
		</form>
	)

}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<LoginForm />
);