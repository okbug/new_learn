import React from 'react';
import ReactDOM from 'react-dom/client';
//这种实现可以避免不必要的频繁重新计算filteredList
//但是它其实并不是最佳的方案。因为它必须分别跟踪并检测属性的状态的变化，如果涉及字段太多，写起来非常的麻烦
class Todos extends React.Component {
	state = {
		filterText: '',
		filteredList: this.props.list,
		prevPropsList:this.props.list,
		prevFilterText:'',
		age:100
	}
	//此方法执行时机有四种 1.constructor 2.setState 3.props改变 4.forceUpdate
	static getDerivedStateFromProps(nextProps,prevState){
		//只在通过属性传递的新的列表的时候也就是新的列表和老的列表不一样
		//或者在上一个过滤关键字和这一次的过滤关键字不一样的话
		if(nextProps.list !== prevState.prevPropsList||
			prevState.prevFilterText!==prevState.filterText){
				console.log(`只有依赖的数据项发生了变化，才会重新执行过滤计算`);
				return {
					prevPropsList:nextProps.list,//把收到新的list列表赋给prevPropsList方便下次比较
					prevFilterText:prevState.filterText,//把最新的过滤文本保存到prevFilterText方便下次对比
					//我们这样优化主要是为了减少过滤操作的，因为如果列表太长的话，过滤操作会比较昂贵
					filteredList:nextProps.list.filter(
						item=>item.text.includes(prevState.filterText)
					)
				}
		}
		return null;
	}
	render() {
		return (
			<div>
				<input value={this.state.age} 
				onChange={event => this.setState({ age: event.target.value })}/>
				<input
					value={this.state.filterText}
					onChange={event => this.setState({ filterText: event.target.value })} />
				<ul>
					{
						this.state.filteredList.map(item => <li key={item.id}>{item.text}</li>)
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