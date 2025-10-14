import { isDefined, wrapToVdom, shallowEqual } from './utils';
import { REACT_FORWARD_REF, REACT_MEMO } from './constants';
import {
  compareVdom, getParentDOMByVdom,currentRoot
} from './react-dom/client';
import * as hooks from './react-dom/client';
//定义一个布尔值的变量，用来控制当前是否处于批量更新模式
//let isBatchingUpdates = false;
//定义一个元素是不能重复的集合,有待更新的组件称为dirtyComponent
//const dirtyComponents = new Set();
//定义一个可以给isBatchingUpdates赋值的函数
//export function setIsBatchingUpdates(value) {
//  isBatchingUpdates = value;
//}
//是否已经调度过更新了
let isScheduledUpdate = false;
//调度更新
export function scheduleUpdate(){
  if(isScheduledUpdate)return;
  isScheduledUpdate=true;
  queueMicrotask(()=>{
    currentRoot?.update();
    isScheduledUpdate=false;
    //isBatchingUpdates=false;
  });
  //调用此方法的话会从根节点开始DIFF比较 
}
/**
 * 更新脏组件
export function flushDirtyComponents() {
  dirtyComponents.forEach(component => component.updateIfNeeded());
  dirtyComponents.clear();//清空集合
  isBatchingUpdates = false;//更新完成要关闭批理更新
}
 */
/**
 * 创建React元素也就是虚拟DOM的工厂方法
 * @param {*} type DOM的类型
 * @param {*} config 配置对象，也就是属性
 * @param {*} children 儿子或儿子们
 */
function createElement(type, config, children) {
  delete config.__self;
  delete config.__source;
  //创建props对象，也就是属性对象
  //const props = { ...config };
  const { ref, key, ...props } = config;
  //如果参数数量大于3个，说明不止一个儿子
  if (arguments.length > 3) {
    //以arguments作为this指针 ，调用数组的上的slice 方法，把从第3个参数开始的实参都放到数组里
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom);
  } else {
    //如果没有儿子，或者只有一个儿子，那么直接把children赋值给props.children就可以了
    props.children = wrapToVdom(children);
  }
  return {
    type,
    props,
    ref,
    key
  }
}
//在ES6中类其实是一个语法糖，本质上也是一个函数
class Component {
  //给Component类添加一个静态属性，表示这是类组件而不是函数组件
  static isReactComponent = true
  constructor(props) {
    //把收到的属性对象保存在自己的实例上 自己实例就是子类的实例
    this.props = props;
    //这里保存需要但是还没有生效的更新
    this.pendingStates = [];
    //它用来存放新的属性
    this.nextProps = null;
  }
  shouldComponentUpdate() {
    return true;
  }
  setState(partialState) {
    this.pendingStates.push(partialState);
    scheduleUpdate();
    /**
    //如果当前处于批量更新模式，则把此当前的实例添加到脏组件集合中
    if (isBatchingUpdates) {
      //dirtyComponents.add(this);
      //另外把更新添加到待更新队列中 partialState可能是一个对象，也可能是一个函数
      this.pendingStates.push(partialState);
      scheduleUpdate();
    } else {//如果当前处于非批量更新模式，则直接更新
      //如果partialState是一个函数的话，传入老状态，计算新状态
      const newState = typeof partialState === 'function' ? partialState(this.state) : partialState;
      //合并老状态和新状态为最终的状态
      this.state = {
        ...this.state,
        ...newState
      }
      //计算完新的状态后要更新组件
      scheduleUpdate();
    }
     */
  }
  //根据this.pendingStates计算新状态
  accumulateState = () => {
    //取出老状态，然后依次执行更新队列中的新状态，计算出最终的新状态
    let state = this.pendingStates.reduce((state, partialState) => {
      const newState = typeof partialState === 'function' ? partialState(state) : partialState;
      //合并老状态和新状态为最终的状态
      return {
        ...state,
        ...newState
      }
    }, this.state);
    //清空更新队列
    this.pendingStates.length = 0;
    //返回新状态
    return state;
  }
  //如果有必要的话进行更新，如果没有必要就算了
  updateIfNeeded() {
    //先计算新状态
    let nextState = this.accumulateState();
    //如果当前的实例对应的类上有getDerivedStateFromProps静态方法的话
    if (this.constructor.getDerivedStateFromProps) {
      //调用此方法计算一个派生的状态出来
      const derivedState = this.constructor.getDerivedStateFromProps(this.nextProps, this.state);
      //如果返值不为空
      if (isDefined(derivedState)) {
        //则可以使用此返回值计算新的状态
        nextState = { ...nextState, ...derivedState }
      }
    }
    //现在我们还没有处理子组件更新，当父组件传递给子组件的属性发生变化后，子组件也要更新
    //调用shouldComponentUpdate钩子计算是否要更新
    const shouldUpdate = this.shouldComponentUpdate?.(this.nextProps, nextState);
    //不管要不要重新渲染组件，this.state都会赋值为新状态
    this.state = nextState;
    //如果有新属性，则赋值给props
    if (this.nextProps) {
      this.props = this.nextProps;
      this.nextProps = null;
    }
    //如果返回了false，就表示不更新，直接结束
    if (!shouldUpdate) return;
    //如果shouldComponentUpdate返回了false,则不进行更新，也更不进DOMDIFF
    this.forceUpdate();
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps;//暂存新属性对象
    //如果有新的属性或者有待更新的状态的话，就进入试图更新的逻辑
    if (this.nextProps || this.pendingStates.length > 0) {
      this.updateIfNeeded();
    }
  }
  forceUpdate() {
    //组件将要更新componentWillUpdate
    this.componentWillUpdate?.();
    if (this.constructor.contextType) {
      this.context = this.constructor.contextType._currentValue;
    }
    //重新调用render方法，计算新的虚拟DOM
    const renderVdom = this.render();
    //替换掉老的真实DOM 老的真实DOM=>老的真实DOM父节点
    //这样写有一个前提，就是render返回的虚拟DOM对应的是真实DOM
    //const oldDOMElement=this.oldRenderVdom.oldRenderVdom.domElement;//button
    const parentDOM = getParentDOMByVdom(this.oldRenderVdom);
    const snapshot = this.getSnapshotBeforeUpdate?.(this.props, this.state);
    //比较新旧虚拟DOM，找出最小化的差异，以最小的代价更新真实DOM
    compareVdom(parentDOM, this.oldRenderVdom, renderVdom);
    //最后把oldRenderVdom指向最新的render得到虚拟DOM
    this.oldRenderVdom = renderVdom;
    //在更新完成后调用componentDidUpdate
    this.componentDidUpdate?.(this.props, this.state, snapshot);
  }
}
function createRef() {
  return { current: null }
}
/**
 * 转发ref，可以实现ref的转发,可以接收ref，并且转发给函数组件
 * @param {*} render 是一个函数组件，也就是一个渲染函数
 */
function forwardRef(render) {
  //type 字符串原生组件 函数组 可能是一个类
  return {
    $$typeof: REACT_FORWARD_REF,
    render
  }
}
function createContext(defaultValue) {
  const context = {
    _currentValue: defaultValue,//这个表示当前的值
    Provider: (props) => {
      //把属性中接收过来的value属性保存在context的_currentValue属性上
      context._currentValue = props.value;
      return props.children;//真正就是它的子元素
    },
    Consumer: (props) => {// Consumer也是一个函数组件，
      //它渲染的是子组件函数返回的结果 。函数的参数是context的当前值
      return props.children(context._currentValue)
    }
  }
  return context;
}
class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    //如果属性不相等，或者状态不相等，就返回true进行更新
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState)
  }
}
/**
 * 
 * @param {*} render 老的函数组件
 * @param {*} compare 比较函数，默认值如果不传的话就是浅比较
 */
function memo(render, compare = shallowEqual) {
  return {
    $$typeof: REACT_MEMO,//类型标志
    render,//老的渲染函数
    compare//浅比较属性对象的方法
  }
}
function useContext(context){
  return context._currentValue;
}
function useImperativeHandle(ref,factory){
  ref.current = factory();
}
const React = {
  createElement,//创建元素
  Component,
  createRef,
  forwardRef,
  createContext,
  PureComponent,
  memo,
  ...hooks,
  useContext,
  useImperativeHandle
}
//默认导到React对象
export default React;