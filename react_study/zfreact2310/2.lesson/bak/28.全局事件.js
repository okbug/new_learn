import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
const globalData = {
	message: ''
}
const MessageSetter = () => {
	const setMessage = (msg) => {
		globalData.message = msg;//先给全局变量赋值
		window.dispatchEvent(new Event('globalDataChanged'));//派发一个全局事件
	}
	return (
		<div>
			<button onClick={() => setMessage('hello from setter')}>Set Message</button>
		</div>
	)
}
const MessageViewer = () => {
	const [message, setMessage] = useState(globalData.message);
	React.useEffect(() => {
		const globalDataChangedHandler = () => setMessage(globalData.message);
		window.addEventListener('globalDataChanged', globalDataChangedHandler);
		return ()=>{
			window.removeEventListener('globalDataChanged', globalDataChangedHandler)
		}
	}, []);
	return (
		<div>
			Message:{message}
		</div>
	)
}
//需要两个组件在发送消息的时候都已经初始化了
//而且要求先初始化MessageViewer。再触发globalDataChanged事件
function App() {
	return (
		<div>
			<MessageSetter />
			<MessageViewer />
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);