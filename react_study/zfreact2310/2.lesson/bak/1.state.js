import React from 'react';
import ReactDOM from 'react-dom/client';
function loadAsyncData(id){
	let cancel;
	let asyncRequest = new Promise((resolve,reject)=>{
		cancel = reject;
		setTimeout(()=>{
			resolve(`loaded data for id: ${id}`);
		},1000);
	});
	//给这个请求的promise添加一个取消请求的属性，其实就是Promise的reject方法，一旦调用它Promise就会失败
	asyncRequest.cancel = cancel;
	return asyncRequest;
}
class User extends React.Component{
	state = {
		externalData:null,//用户数据
		prevId:null//上一次的用户ID
	}
	componentDidMount(){
		this.loadAsyncData(this.props.id);
	}
	loadAsyncData(id){
		loadAsyncData(id).then((externalData)=>{
			this.setState({
				externalData
			});
		});
	}
	//当此User组件接收到新的属性后，会执行此函数，映射出新的状态
	//什么时候会走getDerivedStateFromProps?
	//有4种情况，第1种初次渲染 第2种是属性改变 3.状态更新时候  第4种是调用组件的forceUpdate
	static getDerivedStateFromProps(nextProps,prevState){
		console.log('getDerivedStateFromProps',nextProps,prevState);
		//如果新的属性中的ID不等于上个状态对象中的用户ID的话，说明收到的是一个新的用户ID
		if(nextProps.id !== prevState.prevId){
			return {
				externalData:null,
				prevId:nextProps.id
			}
		}
		//否则 的话返回null,返回null意味着不修改状态，保持状态不变
		return null;
	}
	componentDidUpdate(prevProps,prevState){
		//只有在externalData为null并且当前状态中的老的用户ID不等于老状态中的的用户ID的时候才需要重新请求接口
		if(this.state.externalData === null && this.state.prevId !== prevState.prevId){
			this.loadAsyncData(this.props.id);
		}
	}
	render(){
		console.log('render',this.state);//{prevId:2,externalData:null}
		if(this.state.externalData === null){
			return <div>loading......</div>
		}else{
			return <div>{this.state.externalData}</div>
		}
	}
}
class App extends React.Component{
	state = {id:'1'}
	handleChange = (event)=>{
		this.setState({id:event.target.value});
	}
	render(){
		return (
			<div>
				<User id={this.state.id}/>
				<input  type='text' value={this.state.id} onChange={this.handleChange}/>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);