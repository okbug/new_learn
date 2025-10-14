import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
class ModalComponent extends React.Component{
	state = {isVisible:false}
	show = ()=>{
		this.setState({isVisible:true});
	}
	hide = ()=>{
		this.setState({isVisible:false});
	}
	render(){
	  return (
		<div style={{display:this.state.isVisible?'block':'none'}}>
			<h2>模态窗口</h2>
			<button onClick={this.hide}>关闭</button>
		</div>
	  )
	}
}
class ParentComponent extends React.Component{
	modalRef = React.createRef()
	openModal = ()=>{
		this.modalRef.current.show();
	}
	render(){
		return (
			<div>
				<button onClick={this.openModal}>打开模态窗口</button>
				<ModalComponent ref={this.modalRef}/>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ParentComponent />);