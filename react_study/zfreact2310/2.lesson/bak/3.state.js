import React from 'react';
import ReactDOM from 'react-dom/client';
//开发一个密码管理应用，当在两个使用相同电子邮箱账号的详情之间切换的时候，输入框将无法重置
class EmailInput extends React.Component {
	state = { inputValue: this.props.email }
	static getDerivedStateFromProps(nextProps,prevState){
		if(nextProps.email !== prevState.inputValue){
			return {inputValue:nextProps.email}
		}
		return null;
	}
	render() {
		return (
			<input 
			  value={this.state.inputValue} 
			  onChange={(event) => this.setState({ inputValue: event.target.value })} />
		)
	}
}
const App = () => {
	const [currentAccount, setCurrentAccount] = React.useState({ id: 1, email: '123@qq.com' });
	const switchAccount = () => {
		setCurrentAccount({
			id: currentAccount.id === 1 ? 2 : 1, email: '123@qq.com'
		});
	}
	return (
		<div>
			<h1>密码管理应用</h1>
			<button onClick={switchAccount}>切换账号</button>
			<EmailInput email={currentAccount.email} />
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);