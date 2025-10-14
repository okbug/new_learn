老师有时候  把一个虚拟dom对象 存到localStorage  用的时候再取出来  这个时候好像会报错 这个是怎么回事呢
因为localStorage只能存字符串，如果要想存对象，需要序列化成字符串再保存，但是有些对象是不能序列化成字符串的话，再还原的时候会掉

因为React元素等同于虚拟DOM
以后我们全部统一使用vdom 代表React元素
DOMElement指的就是真实DOM

parentCapture(event){
		console.log('React父节点捕获');
		//阻止事件传播
		event.stopPropagation();
}

React父节点捕获
Native根节点捕获

React父节点捕获  因为在这里阻止事件传播了，不走后面的React子节点捕获
   Native根节点捕获 走了原生的根节点捕获，但是不会继续向下传播

childBubble(event){
		console.log('React子节点冒泡')
		event.stopPropagation();
}
React父节点捕获
React子节点捕获
   Native根节点捕获
   Native父节点捕获
   Native子节点捕获
   Native子节点冒泡
   Native父节点冒泡
React子节点冒泡
   Native根节点冒泡

React父节点捕获
React子节点捕获
   Native根节点捕获
   Native父节点捕获
   Native子节点捕获
   Native子节点冒泡
   Native父节点冒泡
React子节点冒泡
   Native根节点冒泡

vdom classComponent
classInstance.oldRenderVdom=render就去返回的虚拟DOM button虚拟DOM
vdom.domElement = domElement;
button虚拟DOM.domElement=真实buttonDOM元素


看看合成事件，nativeEvent 哪里来


document.addEventListener('click',(nativeEvent)=>{
  console.log(nativeEvent);
});


最外面一层是document吗
不是的
在React17以前，写死的都是 document

父元素和子元素的是同一个nativeEvent 吗
是的
原生事件对象和合成事件对象一个，共享 的

阻止捕获那里 为什么还执行了native 根事件？

比如在div#root绑了二个监听函数
监听函数1
监听函数2
如果在监听函数1里调用了event.stopPropagation
同监听函数2还是会执行。只不过不同继续向下一层元素传播 
自己身上的其它的事监听函数还是会执行的

如果在监听函数1里调用了event.stopImmediatePropagation
监听函数2也不会再执行了


event.stopPropagation

event.stopImmediatePropagation(阻止相同的事件类型)
如果某个元素有多个相同类型事件的事件监听函数,则当该类型的事件触发时,多个事件监听函数将按照顺序依次执行.如果某个监听函数执行了 event.stopImmediatePropagation()方法,则除了该事件的冒泡行为被阻止之外(event.stopPropagation方法的作用),该元素绑定的后序相同类型事件的监听函数的执行也将被阻止.（摘自MDN）



那我要拿到函数组件内部的变量呢


转换成真实  DOM的时候ref  是怎么给的 不是和props分开了吗

const {type,props,ref} = vdom;
const domElement = document.createElement(type);
ref.current = domElement;


Counter 1.constructor
Counter 2.componentWillMount
Counter 3.render
Counter 4.componentDidMount
Counter 5.shouldComponentUpdate
Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
Counter 7.componentDidUpdate

Counter 1.constructor
Counter 2.componentWillMount
Counter 3.render
Counter 4.componentDidMount
Counter 5.shouldComponentUpdate
Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
Counter 7.componentDidUpdate


初次挂载
Counter 1.constructor 父组件初始化属性和状态
Counter 2.componentWillMount 父组件将要挂载
Counter 3.render 父组件渲染
    ChildCount 1.componentWillMount 子组件将要挂载
    ChildCounter 2.render 子组件将要渲染
    ChildCounter 3.componentDidMount 子组件挂载完成
Counter 4.componentDidMount 父组件挂载完成

第一次更新 父number=1
Counter 5.shouldComponentUpdate 父组件要不要更新

第二次更新 父number=2
Counter 5.shouldComponentUpdate 父组件要不要更新 true
Counter 6.componentWillUpdate 父组件更新前
Counter 3.render 父组件渲染
    ChildCounter 4.componentWillReceiveProps 子组件收到新的属性对象
    ChildCounter 5.shouldComponentUpdate 子组件要不要更新
Counter 7.componentDidUpdate 父组件更新后

第三次更新 父number=3
Counter 5.shouldComponentUpdate 父组件要不要更新 false

第四次更新 父number=4
Counter 5.shouldComponentUpdate 父组件要不要更新
Counter 6.componentWillUpdate 父组件更新前
Counter 3.render 父组件渲染
    ChildCounter 6.componentWillUnmount 子组件将要卸载
Counter 7.componentDidUpdate 父组件更新后

第五次更新 父number=5
Counter 5.shouldComponentUpdate 父组件要不要更新 false
第六次更新 父number=6
Counter 5.shouldComponentUpdate 父组件要不要更新 true
Counter 6.componentWillUpdate 父组件更新前
Counter 3.render 父组件渲染
    ChildCount 1.componentWillMount 子组件将要挂载
    ChildCounter 2.render 子组件将要渲染
    ChildCounter 3.componentDidMount 子组件挂载完成
Counter 7.componentDidUpdate 父组件更新后

第七次更新 父number=7
Counter 5.shouldComponentUpdate 父组件要不要更新 false

第8次更新 父number=8
Counter 5.shouldComponentUpdate 父组件要不要更新 true
Counter 6.componentWillUpdate 父组件更新前
Counter 3.render 父组件渲染
    ChildCounter 4.componentWillReceiveProps 子组件收到新的属性对象
    ChildCounter 5.shouldComponentUpdate 子组件要不要更新 false
Counter 7.componentDidUpdate 父组件更新后
第?次更新 父number=? 子组件会更新呢？


李志超 2023/11/4 22:41:01
splice  不用是不是不影响结果？

小海 2023/11/4 22:41:03
key 哪里对比用到了


如果数据没有key,用index好，还是自己用一个随机数作为key？

肯定不要随机
用索引好


小海 2023/11/8 21:20:51
contentType 和 this.content 都是固定的吗 是的
是固定 定死的

李志超 2023/11/8 21:29:41
如果子组件不在一个js文件内，如何获取到ThemeContext？

jdyl 2023/11/8 21:30:06
context单独一个文件  导出就行 是的

xiaoyan 2023/11/8 21:30:21
是的

李志超 2023/11/8 21:31:33
哦可以

jdyl 2023/11/8 21:33:56
默认值也要给他吧
看情况，如果你要单独赋值，则不需要给默认值，因为给了也会被覆盖

比哑巴吃黄连还要苦 2023/11/8 21:41:30
多次使用会不会混乱
肯定不会的 ，它其实就是一个全局变量

小江大浪 2023/11/8 21:41:49
如果嵌套了多个provider 了，那值不是一直改
不会的。因为每一个Provider都是独立的

jdyl 2023/11/8 21:41:59
value可能不传值  所以还需要默认值 判断一下给个默认值

jdyl 2023/11/8 21:45:03
每个provider都是独立的 
 不会一直改 是的

张仁阳 2023/11/8 21:48:47
1

可以平替redux?  和redux有什么优劣势？
没有必要多个  一个都都提供所有的数据了
有些时候是需要的，有些功能是由不同作用实现
路由 Provider
react-redux出提供了Provider


如果是同一个provider , 然后嵌套多次，过程赋值了不同的value, 那最终的cusumer 不是被改了最后一次的了吗，
Provider实现并没有这么简单，里面其实有一个栈结构


不是有 dom diff吗  为什么还会更新呢



比哑巴吃黄连还要苦 2023/11/11 21:55:02
不是还有新老状态对比吗😄

王强 2023/11/11 21:55:13
useState是同步还是异步的问题能讲一下吗
在我们这个安全中useState是同步的


王强 2023/11/11 21:58:15
setState同步还是异步

分情况
React17和React18中是不一样的

在React18之前，在React能够管理的地方或说 控制的地方
比如事件回调，生命周期函数中都是批量的。
但React管理不到地方，比如说setInterval,setTimeout都是同步的，非批量的
关键是因为React18之前是根据一个变量控制的，isBatchingUpdate.

但是React18之后，不管在什么地方，都是批量的，都是异步的


我说的 是setstate 新老状态对比

在setState有一个优化，当在调用setState的时候如果传入的新状态和老状态一样，则没有任意效果，不
进行更新

##