import React from './react';
import ReactDOM from './react-dom/client';
class ScrollList extends React.Component{
	state = {items:Array.from({length:10},(_,i)=>i).reverse()}
	listRef = React.createRef()
	addMoreItem = ()=>{
		this.setState(prevState=>({
			items:[prevState.items.length,...prevState.items]
		}));
	}
	componentDidMount(){
		/**this.timer = setInterval(()=>{
			this.addMoreItem();
		},1000)**/
		this.listRef.current.scrollTop = 20;
	}
	componentWillUnmount(){
		clearInterval(this.timer);
	}
	//在DOM更新前获取DOM的快照prevProps老属性对象 prevState老状态对象
	getSnapshotBeforeUpdate(prevProps,prevState){
		const list = this.listRef.current;
		//list就是ul容器的真实DOM
		//scrollHeight容器里内容的高度 20*10=200
		//scrollTop是向上卷去的高度 20
		//console.log('list.scrollHeight - list.scrollTop',list.scrollHeight - list.scrollTop)
		//return list.scrollHeight - list.scrollTop;
		console.log('list.scrollHeight',list.scrollHeight)
		//直接返回更新的前的内容高度
		return list.scrollHeight;//200
	}
	//组件到时更新之后prevProps 老属性对象 prevState老的状态对象  snapshot 快照
	componentDidUpdate(prevProps,prevState,snapshot){
		const list = this.listRef.current;
		//用新的内容高度220-180=40
		//list.scrollTop = list.scrollHeight-snapshot;
		//让当前的向上滚去的高度加上增加的高度
		//list.scrollTop  = 20+(220-200)=20+20=40
		console.log('list.scrollTop',list.scrollTop)
		console.log('list.scrollHeight',list.scrollHeight)
		console.log('snapshot',snapshot)
		//以前的话在上面添加新元素的话，是需要自己计算新的滚动位置的
		//但是现在不需要了。因为滚动位置 会自动改变
		//list.scrollTop = list.scrollTop+(list.scrollHeight-snapshot);
		//console.log(list.scrollTop );
	}
	render(){
		return (
			<div>
				<button onClick={this.addMoreItem}>addMoreItem</button>
				<ul
				 ref={this.listRef}
				 style={{height:'100px',overflowY:'auto',
				 border:'1px solid black',boxSizing:'border-box',width:'200px'}}
				>
					{
						this.state.items.map((item,index)=>(
							<li 
							style={{fontSize:'10px',height:'20px',backgroundColor:index%2==0?'red':'green'}}
							key={item}>{item}</li>
						))
					}
				</ul>
			</div>

		)
	}
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<ScrollList />);
