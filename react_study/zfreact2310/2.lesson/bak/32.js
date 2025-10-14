import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
//import {produce} from 'immer';
function memoizeOne(func) {
    let lastArgs = null;
    let lastResult = null;
    return function(...args) {

        if (lastArgs !== null && args.length === lastArgs.length && args.every((val, index) => val === lastArgs[index])) {
            return lastResult; 
        }
        lastArgs = args;
        lastResult = func.apply(this, args);
        return lastResult;
    };
}
function produce(recipe) {
	return (baseState) => {
		//源码里并非这样实现，因为这种方式比较浪费 内存，源码是通过代理Proxy实现
		const draft = JSON.parse(JSON.stringify(baseState));
		recipe(draft);
		return draft;
	}
}
class ChildCounter extends React.PureComponent {
	render() {
		console.log('ChildCounter render');
		return <button onClick={this.props.add}>{this.props.count.number}</button>
	}
}
class App extends React.Component {
	state = {
		count: { number: 0 },
		text: ''
	}
	add = () => {
		//this.setState({ count: { number: this.state.count.number +1} })
		//可以使用immer的produce方法生成一个新的状态
		//最后总是会返回一个新的状态对象，而且 此新的状态对象会尽可能的复用老的数据结构
		//这种模式可以避免引用地址一样，但是深度的值不一样的情况	
		//this.setState(produce((draft)=>{
		//	//在这个方法可以任意的操作此对象，而不用担心 对老对象有任何的影响
		//	draft.count.number+=1;
		//  draft.x.y.z.d=1;
		//}));
		const count = this.state.count;
		count.number++;
		//手工构建一个新的对象，是可行的，但如果字段特别多，构建新的地象就会特别的麻烦
		//所以immer 更新可以解决两个问题，一个保证只要内容改了，内存地址肯定变，该更新肯定更新
		//另一个就是修改起来非常的方便
		this.setState({
			count: { number: this.state.count.number + 1 }
		});
	}
	setText = (event) => {
		this.setState({ text: event.target.value });
	}
	getStyle = memoizeOne(
		() => ({width:'100%'})
	);
	render() {
		const style = this.getStyle();
		return (
			<div>
				<input value={this.state.text} onChange={this.setText} />
				<ChildCounter style={style} count={this.state.count} add={this.add} />
			</div>
		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);