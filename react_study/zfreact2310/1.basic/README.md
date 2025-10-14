## 1.什么是React？
React是一个由Facebook开发的维护的JavaScript库，用于构建用户界面，特别是单页应用

它的主要特点
 1. 虚拟DOM
 2. 声明式编程
 3. JSX
 4. 组件化
 5. 单向数据流
 6. 生态丰富 

## 2.什么是虚拟DOM
虚拟DOM
因为直接操作DOM代价是高昂的，可能会引起浏览器的重排和重绘
虚拟DOM其实是一个真实DOM的轻量级表示，本质上是一个JS对象，映射为真实DOm的结构和属性
引入虚拟DOM的目的是是为了最小化与真实DOM操作的次数，从而提高性能

工作机制
   - 当初次渲染的时候，会先创建一个描述UI的虚拟DOM，然后由React负责把此虚拟DOM变成真实DOM并且渲染到页面
   - 当某个部分发生变化时，比如说用户输入或者数据变化，React会创建一个新的虚拟DOM并与老的虚拟DOM进行对比，找出二者的差异，这就是所谓的DOM-DIFF
   - 找到后确定应该如何最小化的修改真实DOM，以反应UI的变化。最后React会负责把这些更新映射到真实DOM让，让界面上的真实DOM和新的虚拟DOM一致
优势
  - 性能提升了 批量修改真实DOM，另外只会进行最小化的更新，只修改必要的部分，可以避免昂贵的DOM操作和不必要重排重绘
  - 简化编程  开发者不需要关心如何操作DOM，只需要声明UI外观就可以。
  - 跨平台 因为虚拟DOM只是普通 的JS对象，就可以在不同的环境复用相同的逻辑 ReactNative React360(VR)   


## 3.为什么React要使用JSX?
JSX是为了提供一种更直观的方式，以声明式的方式来描述UI，并且在编写UI代码的时候保持JS的功能

1. **声明式的语法** JSX提供了一种看起来很像HTML的语法，能够直观的描述UI的外观和结构，
这样可以让代码更易读和易于维护
2. **组件化** 通过JSX,我们可以直接在JSX中定义组件，这使得UI的复用、测试和关注点的分离更简单
3. **整合能力** 由于JSX本质上还是JS,所以我们可以在其中插入任意有效的JS表达式，也可能把JS当作函数的参数或返回值，这样的话为UI组件的创建提供了灵活性

除了JSX还有别的方案吗？其它的方案为啥React没有选择呢

1. **纯JS** React.createElement就是纯JS写法，但是使用纯JS会让代码变的冗长并难以阅读
尤其是在UI特别复杂的情况，与此相反，JSX更简洁，更直观
2. **模板语言** 在传统的前端框架中经常会使用模板来定义描述UI，比如angular、vue.虽然模板是声明式的，但是它会带来额外的学习成本，需要学习模板的编写方法，比如Vue里的指令。另外使用模板的话无法使用全量的JS功能，无法使用完整的JS功能。
3. **字符串的拼接**  直接使用字符串拼接最大的问题就是不安全，容易受到XSS也就是跨站脚本攻击。而JSX会自动进行安全转译，可以从根本上防止这种攻击


```js
let data = ['A','B','C'];
let html ='';
for(let i=0;i<data.length;i++){
   html+=`<li>${data[i]}</li>`;
}
container.innerHTML = html;
```

## 4.类组件和函数组件有什么区别？

React组件是独立的、可重用的代码片段，用于描述UI的一部分
组件可双是简单的UI，比经如说是一个按钮，也可以是一个复杂的容器，比如一个页面

相同点
1. 功能都是渲染UI的，目标都是渲染UI
2. 都可以接收属性并返回虚拟DOM，并进行渲染
3. 从本质来说它们表现的结果是一样的

不同点
**编程思想**
1. 类组件基于面向对象编程思想，使用ES6的类的语法，需要掌握this的使用
2. 函数组件是基于函数式编程，更简单更容易理解，没有this


## 5.React中的合成事件?

React中的合成事件(SyntheticEvent) 是为了解决跨浏览器事件一致性而设计的
它是 一个浏览器原生事件的跨浏览器包装器，具有和原生事件相同的接口，但提供了更多的功能和保持浏览器行为一致性的特性

## 浏览器中的事件模型
事件可以在DOM上进行监听和处理

1 事件流 事件流描述了页面中接收事件的顺序，主要分为二个阶段捕获阶段，冒泡阶段
  - 捕获阶段 事件从根节点开始，向下传递至目标元素的外层，但是不包括目标元素本身
2 事件监听器 可以使用JS在DOM元素上添加事件监听器来响应特定的事件
3. 事件对象 当事件发生时，事件监听器会收到事件对象event
4. 取消默认行为 event.preventDefault() event.returnValue =false
5.停止事件传播 event.propagation()  cancelBubble=true

为什么React会使用合成事件
1.提供跨浏览器的一致性
2.为了性能 在合成事件中，根据浏览器冒泡的特性，可以在父元素监听子元素的事件。不需要把事件绑定到每个子元素上，而只需要在根节点绑一次就可以。其实是用了事件委托或者说事件代理

合成事件在React17之前和之后发生了重大的变化
在React17之前合成事件是委托给了文档对象
在React17之后合成事件是委托给了root,也就是根节点 `<div id="root"></div>`

<div>
				<p>{this.state.number}</p>
				{this.state.number===4?null:<ChildCounter count={this.state.number}/>}
				<button onClick={this.handleClick}>+</button>
			</div>

Counter组件第一次渲染的时候得到虚拟DOM
{
  type:'div',
  props:{
    children:[
      {type:'p'},
      {type:ChildCounter},
      {type:'button'}
    ]
  }
}

{
  type:'div',
  props:{
    children:[
      {type:'p'},
      {type:ChildCounter},
      {type:'button'}
    ]
  }
}


## getDerivedStateFromProps
专为类组件设计
它的主要目的是让组件在收到新的属性的时候有机会产生新的状态
这是一个静态方法，这意味着不能通过实例来调用

## getSnapshotBeforeUpdate

在DOM更新之前获取老的DOM的快照 

也是一个生命周期钩子，它允许 你在DOM的实际变更之前捕获一些信息，比如滚动的位置 
然后此信息可以传递给componentDidUpdate方法的最后一个参数，在函数里就可以使用此信息了


## Context
React中的Context是一种传递数据的方法，允许 数据能够被 传递到组件树中的任意层级
而不必通过每一个层级明确的传递
Vue provide inject

## 说一下 React 如何避免不必要的渲染?
其实在React里面每次更新都是从根节点开始的，这一点和Vue是不同的
因为每次都是根节点开始对比DOMDIFF的，所以渲染的工作量很大。
所以我们需要尽量减少渲染

对于类组件来说
我们可以使用一个React.PureComponent
是一个React的基类，它的核心特性是演唱会有当它的属性或状态发生浅层变化的时候才会重新渲染
，浅层比较会检查 对象的顶层属性，而不是深度检查，这样可以提高 性能


对于函数组件来说
React.memo是一个高阶组件，它可以用于优化那些仅仅依赖于其属性变化的组件重新渲染的行为
也就是说如果组件属性在多次渲染的时候没有发生变化，那么memo就可以避免不必要组件渲染

## ReactHooks
为解决类组件的一些问题
- this指向不明
- 业务逻辑分散在不同的生命周期方法中
- 复用逻辑不方便比较复杂 


函数组件虽然简单，但是它没有状态。
为了让函数组件可以有状态，就出现ReactHooks


## useReducer
- 当你的状态变化比较复杂的时候，可以使用useReducer

useReducer接受一个reducer函数和一个初始状态作为参数，返回当前的state和一个与该reducer函数关联的dispatch方法
```js
const [state,dispatch] = useReducer(reducer,initialState);
```

在React中，每次更新都是从根节点开始的


会飞的鱼 2023/11/11 20:53:25
const {hooks} = currentVdom; currentVdom初始为null; 不会报错吗？

杨澜 2023/11/11 20:53:32
hookIndex什么是变化呀


 compareVdom(container,currentRootVdom,currentRootVdom);

因这个操作可以触发函数组件更新
而函数的组件更新的时候要重新执行useReducer
而在执行useReducer的时候要读取hookStates数组最新的状态，并返回对应的状态
从而计算出新的虚拟DOM

小江大浪 2023/11/11 21:14:36
这样子从头到尾都重新走一遍，不会影响性能吗
会的。所以React的性能的确差一点
 这也是为什么在React需要自己进行性能优化的原因，尽量减少组件的重新渲染
 PureComponent React.memo



@ 2023/11/11 21:24:37
只要hookstate变化 hookindex旧得从0开始

@ 2023/11/11 21:26:38
React.uesReduce返回数组有什么说法吗

@ 2023/11/11 21:26:58
返回对象是不是更好点
返回数组方便命名


比哑巴吃黄连还要苦 2023/11/11 21:29:22
我理解它从dispatch绑定得组件开始更新也是可以的，没办法做到吗？还是它就是专门这样设计的
没有办法，因为一个组件的更新不单单会影响自己和它的子节点，还可以可能影响 别的不相关的组件


useState


和Context相结合是不是useReducer最多的应用场景？
redux的时候会讲react-redux 里面就是这样的


## 
在React中，因为每次更新都是从根节点开始进行对比的，所以为了提升性能，尽量减少组件渲染的次数就非常非常重要

- useMemo 返回一个记忆后的值，只有当依赖项发生变化的时候，才会重新计算这个值
- useCallback 返回一个记后的callback函数，它会返回一个不变的函数，直到依赖项发生变化 

PureComponent React.memo
为了尽量减少组件渲染的次数，所以需要尽量保持属性不变


## useContext
- 它允许你无需明确的传递props,就能让组件订阅context的变化


## useEffect
- useEffect是也是一个React Hook,允许你在函数组件中执行有副作用的操作。比如开启定时器，比如操作DOM
- 它与类组件中的生命周期方法，像componentDidMount、componentDidUpdate、componentWillUnmount类型

```js
useEffect(()=>{
  //这是执行副作用操作的函数
  //副作用的函数体，这里的代码默认在每次渲染之后都会执行
},[依赖]);//依赖数组 这是一个可选参数，如果提供了此数组，useEffect对应的副作用函数只会在这些依赖发生变化时执行
//如果没有提供此函数，则每次渲染都会执行
```

**注意事项**
- 不要在循环、条件或嵌套函数中调用useEffect,此规则针对所有的hook都适用
- 清除副作用 useEffect可以返回一个函数，这个函数会在组件卸载前或重新执行新的副作用之前被调用，可以在这里
清除副作用，比如取消事件监听，取消网络请求清除定时器


为啥副作用一定要在这个钩子中调用呢，在外面调用会有什么问题吗？
因为React规定此钩子是执行副作用的地方

清理函数 始终都会是一样的吧 还区分上次 本次的吗 代码又不会中途变了
不一定一样

useEffect其实执行时机比较晚，会在浏览器绘制之后执行 

## useLayoutEffect
useLayoutEffect和useEffect具有相同的签名，但是也有一些差异

### 执行时机不同
- useEffect是在浏览器绘制之后异步执行的，这意味着执行这个effect可以会延迟
- useLayoutEffect是在浏览器执行绘制之前同步执行的，它不会延迟
- 因为useEffect是在浏览器绘制之后执行的，所以不需阻止页面的渲染
- 因为useLayoutEffect是在浏览器执行绘制之前同步调用，可能会阻止页面的渲染
## useRef
useRef也是一个react hook,它会返回一个可变的ref对象，这个对象的current属性可以被 修改，并且修改current属性并不会导致组件的重新渲染

## useImperativeHandle
- useImperativeHandle是一个高级的hook,通常与forwardRef配合使用，
- 它允许你在使用ref的时候，自定义暴露给父组件的实例值，而不是默认的实例


老师 刚才说useLayoutEffect 是在DOM绘制之前同步执行的     微任务不是异步的吗
useLayoutEffect它对应的effect函数会放在微任务队列中，不会立刻执行，会先把当前的代码执行完
再去清空微任务队列。
清空微任务队列的时候，取出effect函数执行，effect函数执行的时候是同步的
等后微任务队列清空后才会去绘制页面


以前说过React更新都是从根节点开始的，


如果是根节点开始比较 子组件更新的话 父组件也会render  我试了原版父组件并不会render
在React源码中有一个机制叫 bailout 可以跳过中间件环节的渲染
