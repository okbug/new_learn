import React from './react';
import ReactDOM from './react-dom/client';
class ClassComponent extends React.Component{
	parentBubble(){
		console.log('React中父节点冒泡')
	}
	childBubble(event){
		console.log('React子节点冒泡')
		event.stopPropagation();
	}
	parentCapture(event){
		console.log('React父节点捕获');
		//阻止事件传播
		//event.stopPropagation();
	}
	childCapture(){
		console.log('React子节点捕获')
	}
	clickLink = (event)=>{
		console.log('clickLink');
		//阻止a标签默认跳转行为
		//event.preventDefault();
	}
	render(){
		return (
			<div 
			id="parent" 
			onClick={this.parentBubble} 
			onClickCapture={this.parentCapture} >
				<button 
				id="child" 
				onClick={this.childBubble} 
				onClickCapture={this.childCapture}>点击</button>
				<a onClick={this.clickLink} href="http://www.baidu.com">link</a>
			</div>
		)
	}
}
const element = <ClassComponent/>
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(element);

setTimeout(()=>{
	document.getElementById('root').addEventListener('click',()=>{
		console.log(`  Native根节点捕获`)
	},true);
	document.getElementById('root').addEventListener('click',()=>{
		console.log(`  Native根节点冒泡`)
	},false);
	document.getElementById('parent').addEventListener('click',()=>{
		console.log(`  Native父节点捕获`)
	},true);
	document.getElementById('child').addEventListener('click',()=>{
		console.log(`  Native子节点捕获`)
	},true);
	document.getElementById('parent').addEventListener('click',()=>{
		console.log(`  Native父节点冒泡`)
	});
	document.getElementById('child').addEventListener('click',()=>{
		console.log(`  Native子节点冒泡`)
	});
},1000);