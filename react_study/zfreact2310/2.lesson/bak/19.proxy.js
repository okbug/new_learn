import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import {Button} from 'antd';
/**
 * 项目中经常会封装第三方组件
 * 用新组件代理少组件，可以在不修改老组件的情况下增强或修改组件行为
 */
class ButtonWithLogging extends React.Component{
	handleClick = (event)=>{
		this.props.onClick?.(event);
		//封装了公用逻辑
		console.log('Button was clicked')
	}
	render(){//提供默认值 
		//隔离了用户和第三方组件库,可以方便以后重构替换和实现公共逻辑
		return <Button type="primary" {...this.props} onClick={this.handleClick}/>
	}
}
function App(){
	return (
		<div>
			<ButtonWithLogging type="primary">Click</ButtonWithLogging>
		</div>
	)
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);