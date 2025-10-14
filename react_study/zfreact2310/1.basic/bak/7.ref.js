import React from './react';
import ReactDOM from './react-dom/client';
/**
 * createRef会返回一个对象，类似于{current:null}
 * 我们可以把此对象作为属性给DOM元素，然后当此DOM元素变成真实的DOM元素之后，这个真实的DOM元素会赋值给current
 * ref允许我们可以直接访问DOM元素
 */
class RefComponent extends React.Component {
	inputRef = React.createRef()//{current:null}
	handleButtonClick = ()=>{
		//通过此方法可以获得输入框的真实DOM元素，并让它获得焦点
		this.inputRef.current.focus();
	}
	render() {
		return (
			<div>
				<input ref={this.inputRef}
					type="text"
					placeholder='点击按钮让我获得焦点'></input>
				<button onClick={this.handleButtonClick}>让输入框获得焦点</button>
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RefComponent />);
