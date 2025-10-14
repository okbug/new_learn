import React from 'react';
import ReactDOM from 'react-dom/client';
//import memoizeOne from 'memoize-one';
//这种实现可以避免不必要的频繁重新计算filteredList
//但是它其实并不是最佳的方案。因为它必须分别跟踪并检测属性的状态的变化，如果涉及字段太多，写起来非常的麻烦
function memoizeOne(func){
  let lastArgs = null;//上次的参数
  let lastResult = null;//上次的执行
  return function(...args){
	//如果老的参数存在，并且新参数列表和老参数列表长度相同并且新的参数列表中的每一个值和老的参数列表中的每一个值都一样
	if(lastArgs!==null 
		&& args.length=== lastArgs.length 
		&& args.every((val,index)=>val === lastArgs[index])){
			return lastResult;
	}
	//如果是第一次执行或者说参数列表至少有一个值不一样,则
	lastArgs = args;//则缓存参数列表
	lastResult = func.apply(this,args);//重新执行函数获取最新的结果 
	return lastResult;//返回最新的结果 
  }
}
class Todos extends React.Component {
	state = {
		filterText: '',
		age:100
	}
	filter = memoizeOne((list, filterText) => {
		console.log('执行过滤函数')
		return list.filter(item => item.text.includes(filterText));
	})
	render() {
		console.log('render');
		//这种方法实现起来比较简单，也比较 清晰，但是有问题
		//对于大型的列表，过滤可能比较慢，而这种方案每次渲染都会重新过滤 
		//我们希望添加一个memo的功能，以避免不必要重新渲染
		const filteredList = this.filter(this.props.list,this.state.filterText);
		return (
			<div>
				<input value={this.state.age}
					onChange={event => this.setState({ age: event.target.value })} />
				<input
					value={this.state.filterText}
					onChange={event => this.setState({ filterText: event.target.value })} />
				<ul>
					{
						filteredList.map(item => <li key={item.id}>{item.text}</li>)
					}
				</ul>
			</div>
		)
	}
}
class App extends React.Component {
	list = [
		{ id: 1, text: 'item1' },
		{ id: 2, text: 'item2' },
		{ id: 3, text: 'item3' }
	]
	render() {
		return <Todos list={this.list} />
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<App />
);