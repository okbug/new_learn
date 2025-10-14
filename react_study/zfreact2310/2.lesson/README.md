## 1.在使用React生命周期函数的时候，应该注意哪些问题？
- 避免使用旧的已经废弃的生命周期方法
  - 构造函数初始化状态 不推荐使用，可以直接使用类属性
  - componentWillMount 组件将要挂载 原有逻辑可以放在componentDidMount中编写
  - componentWillReceiveProps 组件将要接收到新的属性，可以使用getDerivedStateFromProps进行替代
  - componentWillUpdate 组件将要更新 可以使用getSnapshotBeforeUpdate和componentDidUpdate来替代
- 关于render函数需要注意
  - render函数是一个纯函数，所以不要在里面编写副作用代码
  - 避免在render函数中调用setState，因为这个可有会引起死循环 render=>setState=>render  
  - 避免在render函数中绑定原生的事件，放在render里面的话会引起重复绑定，影响性能
- 资源清理
  - 在componentDidMount中创建的资源，比如像事件绑定或者定时器一定要在组件将要卸载的componentWillUnmount的时候清除掉，防止内存泄露 

## 2. getDerivedStateFromProps
- When to use derived state
- getDerivedStateFromProps它的唯一存在的目的是使组件能够因为属性的变化而更新其内部的状态
- loading external data specified by a source prop.

第一次挂载的时候，先走getDerivedStateFromProps
state= {
				externalData:null,
				prevId:1
}
挂载完成后
componentDidMount
loadAsyncData 成功后会调用setState({externalData:'data1'})
又进入 getDerivedStateFromProps 因为新属性的ID和老状态里的prevID相同，则返回null，也就是不影响状态

进入更新过程
先输入2
会给User组件传递ID=2的属性
state {
				externalData:null,
				prevId:2
			}
重新走render,因为这个时候externalData变为null了，所以显示<div>loading......</div>
然后进入 componentDidUpdate钩子方法
this.state.externalData === null
并且this.state.prevId !== prevState.prevId 2!=1
this.loadAsyncData(2);
又走getDerivedStateFromProps，返回null不修改状态
最后state = {prevId:2,externalData:'data2'}


## 错误的例子
我意思是父组件那边定义个改变email的方法传过去给子组件使用

## 解决方案
- 完全的受控组件
- 在以前我们说到受授组件一般都是指的input输入框，input输入框的值受状态控制，不受状态控制叫非受控组件

- 这个受控组件的概念也可以应用在类组件上。我们可以完全去掉组件内部的状态
- 还可以使用完全的非受控组件


两个解决方案，一个是完全的受控组件，一个是完全的非受控组件
但是不要既受控，又不受控。这意味着数据来源有两个，会出现相互冲突和覆盖的情况，也会导致来源混乱

## memoization
我们也见过使用派发状态来确保在渲染的时候，使用昂贵值仅在输入改变的重新计算，这称为记忆化


## ErrorBoundary
ErrorBoundary是一个React组件，用于捕获子组件树中的JS错误
并记录这些错误，并显示一个回退的UI，而 会让整个组件树崩溃
ErrorBoundary仅能捕获子组件树中的错误，并不能捕获自身的错误


## React函数组件和类组件有什么相同点和不同点？
### 相同点
- 不管是哪个组件，都能正常的渲染UI，都可以接收属性并返回显示的内容，也就是说表现上是一样的
- 使用方式和表达效果是完全相同的。也就是说用的时候是一样的

### 不同点
- 设计思想不同，类组件是面向对象编程，函数组件是面向函数式编程
- 从语法的结构上来说，从实现上来说，一个是class类，拥有生命周期函数，功能强大，一个是JS函数，更简洁
- 类组件有生命周期函数，函数组件没有，函数组件有hooks,类组件没有
- 状态管理 类组件通过this.state获取状态，通过 this.setState修改状态。函数组件使用useState管理状态
- this关键字，类组件里this指向是类的实例，需要通过this访问属性和状态。而函数组件没有实例，也没有this
- 生命周期 类组件有实例，有完整的生命周期钩子，而函数组件可以通过useEffect模拟这些生命周期钩子
- 组件的重用的组合 函数组件倾向于小组件的组合，功能比较 简单，类组件更适合拥有复杂的逻辑和生命周期管理的场景 
- Context 类组件可以通过static contextType或者 Consumer消费Context,而函数组件可以使用useContext获取context
- **性能优化** 函数使用可以使用React.memo进行包裹，返回一个新组件，当属性变化了才会重新渲染属性不变不会重新渲染。
  另外函数里面还可以使用useMemo缓存实例，还可以使用useCallback返回回调函数，它们只有在依赖项发生变化的时候才会重新计算。而类组件是通过PureComponent或者重写shouldComponentUpdate方法来实现避免组件渲染更新
- **逻辑复用方式** 函数组件可以使用自定义hooks，高阶组件、组合、renderProps等方式进行性能优化。而类组件可以使用高阶组件、继承和mixin的方法进行性能优化
- 发展趋势 随着React的发展，函数组件越来越强大，越来越简单洁，不同的钩子也越来越多，所以也越来越流行，未来趋势肯定是函数式组件。但是类组件也不会废弃，未来 React团队也没有计划完全 移除类组件。因为它们在某些复杂场景中也有其独特的优势



ErrorBoundary 是怎么知道子组件报错了的

如何捕获自身错误？

老师，有哪些是类组件能做 但是函数组件不能做的呢，感觉基本上都是函数组件了

function Header(){
  return <div>Header</div>
}


要想使用ErroryBoundary需要创个类组件，
并且至少定义一个错误的生命周期方法，即
getDerivedStateFromError
此方法会在后代组件抛出错误时被调用，它返回一个值以更新状态state
以便在下次渲染的时候显示回退的UI
componentDidCatch
此方法可以在后代组件抛出错误时调用，以便于记录错误信息

ErrorBoundary并不能捕获事件处理器内部的错误、异步代码(setTimeout setInterval
requestAnimationFrame)

## React中如何进行逻辑复用?
### 函数组件
#### 自定义hooks
React中的自定义hooks是一个功能扩展，允许你在函数组件中重用状态逻辑
而无需改变组件的结构 
自定义hooks本质上是JS函数，但是它们遵循一些特定的规则 
- 命名约定 要求自定义必须use开头，这不仅仅是一种命名的约定，也是ReactHOOks规则 的一部分
- 自定义Hooks还可以封装业务逻辑，使代码更容易维护 ，比如创建 一个useForm的自定义hooks来封装表单的输入逻辑
- 自定义hooks可以使用基础的hook 
- 自定义hook最核心的要点是把组件的一些逻辑提取到可重用的函数，这意味着相同的状态管理和副作用逻辑可以在多个组件间共享


老师 什么场景下需要自定义 hooks  
比如说我有个请求 需要在很多的地方使用 返回数据 
这种一直很纠结是hooks封装 还是直接写个函数到处用
这个取决于你在哪里使用，如果你希望把返回的数据和组件进行绑定，并且让组件响应数据的变化
肯定要写成自定义hook
ahook useRequest

#### 高阶组件
高阶组件是React中复用组件逻辑的一种高级技术
这是一个函数，参数是一个组件，返回值为一个新的组件，这个新的组件可以具有增强的能力，拥有额外的属性和行为

#### renderProps
使用一个值为函数的prop属性，这个函数返回要渲染的React元素
通过这种方式，就可以在多个组件中共享业务逻辑

### 类组件

#### 高阶组件
和函数式组件一样，HOC也可以用于类组件封装并复用逻辑
而且高阶组件还可以级联，串行，也就是可以用多个高阶组件装饰一个组件

##### 无法透传静属性

##### 无法透传refs

##### 高阶组件还可以链式调用，进行组合调用

Children也是render props
说明，因为原理是一样的
都是给组件提供了一个渲染虚拟DOM的函数用来决定渲染出来的真实DOM
它们都是把函数传递给组件，但是传递的位置 是不一样的，一个是传递人props.render,一个prop.children
就是说属性的名称不同

静态属性 不是和类一起存在的吗
是的啊

还有一问题就是不能透传refs
ref属性不会像其它的属性一样自动透传给被 包裹的组件

#### 渲染劫持

#### 类组件继承
不推荐
设计模式有原则   组合优于继承
因为继承耦合度太高了

#### Mixin
在React的早期版本中，Mixin用来共享 组件的逻辑，但是由于各种原因，已经废弃。


## 如何设计React组件
### 组件的分类
- React中组件分为两种，无状态组件和有状态组件
- 无状态组件也称为傻瓜组件、哑组件、展示组件 面向样式和布局，功能比较简单，复用性高，通用性强
- 有状态组件也称为聪明组件、灵巧组件，面向业务和组件的组合，功能比较复杂，通用性弱，复用性弱

#### 无状态组件 也就是展示组件
依赖传入的属性来决定显示的内容和行为，内部一般不管理状态

- 不保留 状态
-  一般是纯组件 只接收属性返回React元素
- 没有生命 周期
- 比较简单方便测试和维护 

function Welcome(props){
  return <div>{props.name}</div>
}
### 代理组件
代理组件其实是一种设计模式，它允许你在不改变原始组件代码的情况下增强或修改原组件的行为

### 样式组件
- 可以用来封装和复用组件的样式
styled-components

### 布局组件
用于封装和复用页面的布局

## 有状态组件
指的是在人部维护一个或多个状态，这些状态修改后会引起组件的重新渲染

特点
- 内部维护状态 this.state useState
- 一般是用类组件 this.state，但是也可以用函数组件 useState
- 一般会使用到生命周期钩子 类组件 componentDidMount 发请求改状态，如果函数组件的话useEffect中发请求改状态
- 适合用于基于用户的输入，请求服务器的响应来改变UI


一般用于容器组件，管理数据和业务逻辑

容器组件是一种专用处理数据获取的业务逻辑的组件
而展示组件关流如何展示这些数据


React项目中目录的划分肯定是有争议
```
src
  index.js入口文件 ReactDOM渲染的入口
  app.js 根组件
  utils 工具类和文件
  hoc 放通用的高阶组件
  hooks 通用的hooks
  components 通用组件
    Button 一般这种组件通用性强，可以使用storybook之类的工具进行管理
  pages/views 页面
    pageA
      components pageA专用的小组件
      hooks pageA专用的hooks
      index.js pageA的主组件入口  
      hoc 非通用的高阶组件

```

## React如何进行组件通信
- 父传子 父组件通过属性向子组件传递数据，这是一种单向数据流，保证数据的流行清晰而易于追踪
- 子传父 
  - 子组件向父组件传递数据通常是通过回调函数实现的,父组件定义一个函数并通过属性传递给子组件，子组件在某个事件发生时调用这个回调函数，从而将数据传递给父组件
  - 子传父其实还有一个方法，不太常用，实例方法
- 兄弟之间传递数据
  - 因为React是单向数据流，数据从父组件向子组件传递
  - 当需要在兄弟组件之间传递数据时，通常需要通过它们共同的父组件来协调这一个过程
- 无直接关系的组件之间如何传递数据
  - Context API 可以允许 我们跨组件树传递数据，非常适合用于管理国际化、主题色
  - 可以使用全局变量和全局事件来进行通信
  - 使用第三状态管理库 flux(废弃) redux   mobx        recoil
                                zustand   valtio     jotai

## React中如何减少组件的重新渲染？
### 什么需要性能优化
- 当页面出现卡顿的时候
- 页面的性能不符合业务要求的时候


### FPS
FPS称为每秒帧率或者说每秒画面数
是衡量游戏、动画、视频的流畅度的关键指标

FPS范围
- >=60 FPS流畅
- 30~60 可接受 虽然会有稍微的卡顿，但是可用的
- <30 卡顿 必须要优化

### 如何计算页面的FPS
#### chrome的性能工具
#### 自己手工计算
#### 什么组件会重新渲染
下一步如何说的确性能比较差，就需要优化，减少React组件渲染的次数
要知道什么时候组件会进行渲染
- 状态变化 setState
- 属性变化 props改变
- 强制渲染  forceUpdate方法
- 父组件重新渲染 一般来如果父组件重新渲染，子组件也会跟着重新渲染，除非子组件进行了优化React.memo PureComponent, shouldComponentUpdate方法
- Context 使用到了Context，如果组件依赖了React Context,并且该Context发生了变化，那么依赖于这个Context的组件也会重新渲染
- 某些hooks也会导致 重新渲染useState=>setState

#### 如何发现无效渲染呢?

- 可以使用React Developer Tools ,优点是比较直观，缺点如果组件树太复杂的话很难看清楚 ，也不适合批是检查 
- 可能用@welldone-software/why-did-you-render 是一个开发工具，主要 目的是帮助 开发者检测和识别不必要的更新，从而优化React应用的性能。

#### 如何避免无效的渲染
- PureComponent 浅对比，而且只对比第一层
- 手工实现shouldComponentUpdate实现深对比
  - 浅对比只比较第一层，优点是性能非常高，缺点是无法检测深层的变化
  - 深比较 可以实现深度对比，可以检测深层的变化，也可能实现如果两个对象引用地址不一样，但里面的值一样也可以判断为相等，但缺点是性能非常差
- immer 不可变数据
- PureComponent 浅比较，可能会带来两个问题
  - 第一个问题该更新没更新 这个可使用immer来解决，保证返回肯定是新的对象，而且 修改嵌套特别深的属性特别方便
  - 第二个问题是不该更新却更新 oldStyle = {width:100%} newStyle={width:100%} 这种可以通过深比较来解决
  但是深度对比性能非常差，不要轻易使用
  最好只能通过缓存解决了
   如果函数式组件，可以使用React.useMemo来缓存
   如果是类组件，可以用一些库，比如memoize-one或者 reselect
   可以缓存来解决，只要依赖项不改变，则始终使用同一个值



## 为什么会出现Hooks?
为了解决以下的问题
- 逻辑利用难高 以前类组件想要复用业务，需要使用高阶组件或者render props进行复用。导致代码结构比较 复杂 ，还有可能会产生回调地狱，难以理解 和维护 
- 组件复杂性 在类组件中，复杂的业务逻辑会散落在不同的生命周期方法中， 这会导致理解和维护困难。一个生命周期中可能会包含很多业务逻辑
- this容易混淆 类组中的this特别容易出错，特别是在事件处理函数或者异步操作，需要时刻注意绑定正确this
- 类组件难以在编译阶段进行优化 类组件的特性限制了现代的比如Tree shaking之类的编译技术，难以进行优化

## 为什么Hooks遵循一些原则
- 不要在循环语句、条件语句中或者嵌套函数中使用hooks
  - 这是为了保证Hooks每次渲染都以相同的顺序调用。这个对React内部跟踪Hook状态非常重要
  - 如果在条件语句或循环语句中使用hooks,可能导致在多次组件渲染的时候数量和顺序不一致，导致 状态混乱
- 只能在React的函数组件中使用hooks
  - 因为这可能保证Hooks只在React函数组件的上下文环境中调用。这可以帮助React管理组件的生命周期和状态

## useEffect和useLayoutEffect相同点和不同点？
- 相同点
  - 两者的功能类似，都是在组件渲染后执行副作用操作
  - 它们具有相同的API结构和签名，都是接收一个副作用函数和一个依赖数组
  - 清理机制相同 ，都允许返回一个清理函数，用于在组件卸载的时候，或者 重新执行的时候进行清理操作
- 不同点
  - 执行时机不同
     - useEffect在真个页面渲染和绘制完成后异步执行，不会阻塞浏览器的绘制过程
     - useLayoutEffect与DOM更新同步执行，会在浏览器绘制前之后，因此如果在useLayoutEffect中执行大量的计算操作，会导致 页面无法渲染，导致 性能问题
  - 使用场景不同
    - useEffect适用于大多数副作用场景 ，比如数据获取，消息订阅等
    - useLayoutEffect适用于需要同步读取或更新DOM的应用场景 ，或者在DOM更新后需要立刻执行操作，比如测试布局
- 官方建议 一律先使用useEffect,如果出现了问题，比如页面抖动，才可以有改为useLayoutEffect         


## 如何在ReactHooks获取上一轮的值？
用setState的函数参数去获取旧值也可以吧

## React Hooks作者说 "忘记生命周期，以effect的方式开始思考"，你是如何理解这句话的？
上面我们在讲到hooks出现原因的时候，因为使用生命周期有问题
不同的业务放在一个生命周期里，一个生命周期函数里面包含不同的业务

## React.memo和React.useMemo有什么区别？
- React.memo和React.useMemo都是为了优化性能，但是服务于不同的场景和目的，不好直接比较 
- React.useMemo
  - 目的是为了缓存复杂的计算过程
  - 适合场景 当组件的内部有昂贵的计算操作，而这个操作仅仅依赖于某些特定的属性或者状态，而且这些值不会经常改变，比较稳定，就可以使用useMemo缓存计算的结果，可以避免在每次组件渲染的时候重新计算
  - 限制 它仅对组件内部的值有效，不能防止组件重新渲染
- React.memo
  - 目的为了避免组件不必要的渲染
  - 适用场景是 当组件经常因为父组件的更新而重新渲染时，但是它的属性很少变化，就可以用React.memo防止不必要的渲染

 我之前一直以为 memo useMemo 需要2个配合才能不重新渲染
的确是这样的
React.memo保证属性不变，不重新渲染
如何保证属性不变呢?可以useMemo缓存属性，从而保证属性不变 
let callback = useCallback(callback);
let factoryResult = useMemo(factory);

## 封装自定义hooks可以考虑什么样的设计模式？
- 在使用自定义Hooks的时候，可以使用外观模式
- 外观模式通过简化复杂系统的接口来提高 易用性
- 在React中，可以通过自定义Hooks来实现，它们会封装和管理相关的逻辑，简化操作
