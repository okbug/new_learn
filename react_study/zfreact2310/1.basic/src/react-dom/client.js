import { REACT_TEXT, REACT_FORWARD_REF, REACT_MEMO } from '../constants';
import { isDefined, isUndefined, shallowEqual, wrapToArray } from '../utils';
import setupEventDelegation from './event';
//当前正在渲染的函数组件
let currentVdom = null;
export let currentRoot = null;//导出当前的根节点
let currentRootVdom = null;
export function useRef(initialValue) {
    const { hooks } = currentVdom;
    const { hookIndex, hookStates } = hooks;
    if (isUndefined(hookStates[hookIndex])) {
        hookStates[hookIndex] = { current: initialValue }
    }
    return hookStates[hooks.hookIndex++];
}
export function applyEffectHook(effect, deps, schedule) {
    //获取当前的函数组件虚拟DOM内部存放的hooks
    const { hooks } = currentVdom;
    //从此对象上解构出当前hook的索引，和hookStates数组
    const { hookIndex, hookStates } = hooks;
    //是否要执行effect函数
    let shouldRunEffect = true;
    //尝试读取老的useEffect数据状态
    const previousHookState = hookStates[hookIndex];
    let previousCleanup;
    //第一次执行的时候，它的值肯定是undefined
    if (previousHookState) {
        //第二次的时候，previousHookState已经保存了一次执行effect返回的销毁函数和上次执行effect时的依赖数组
        const { cleanup, prevDeps } = previousHookState;
        previousCleanup = cleanup;
        if (deps) {
            //判断新的依赖数组中是否有某一项和老的依赖数组对应的值不相等
            //判断新数组中每一项和旧数组中的每一项是否完全相同，如果完全相同，则不需要重新执行false。如果有某一项
            //不同，则就需要重新执行
            //只有一某一项不相等就要重新执行，就要把shouldRunEffect设置为true
            shouldRunEffect = deps.some((dep, index) => !Object.is(dep, prevDeps[index]))
            //如果每一项都一样，那就不需要执行了，所以需要对结果 取反
            //shouldRunEffect=!deps.every((deps,index)=>Object.is(deps[index],prevDeps[index]));
        }
    }
    //如果shouldRunEffect的值为true,表示要重新执行effect,如果为false，则不执行
    if (shouldRunEffect) {
        //其实effect并不是立刻执行的，而是会包装成一个宏任务，在浏览器绘制渲染页面之后执行
        schedule(() => {
            previousCleanup?.();//如果上一次执行effect函数返回一个清理函数，则需要再执行下次的effect之前行执行清理函数
            //执行副作用函数，返回一个清理函数
            const cleanup = effect();
            //在hooksState数组中保存执行effect得到的清理函数,以及当前的依赖数组
            hookStates[hookIndex] = { cleanup, prevDeps: deps };
        });
    }
    //完事后让当前的hook索引向后走一步
    hooks.hookIndex++;
}
export function useLayoutEffect(effect, deps) {
    applyEffectHook(effect, deps, queueMicrotask)
}
export function useEffect(effect, deps) {
    applyEffectHook(effect, deps, setTimeout)
}
/**
 * 可以记忆对象
 * @param {*} factory  创建对象的函数
 * @param {*} deps 依赖的值数组，如果依赖的值有任意某项发生变化，会重新创建，如果依赖的值全都没有变化，则不会重新创建
 */
export function useMemo(factory, deps) {
    const { hooks } = currentVdom;
    const { hookIndex, hookStates } = hooks;
    //获取状态数组中的hookIndex对应的值 [newMemo,deps]
    const prevHook = hookStates[hookIndex];
    //如果有值，说明当前处于更新的过程
    if (prevHook) {
        //取出上一个对象和上一个依赖数组
        const [prevMemo, prevDeps] = prevHook;
        //对比新的依赖数组和老的依赖数组中的每一项，如果全部相等的话
        if (deps.every((dep, index) => dep === prevDeps[index])) {
            //直接索引加1，往后走下一个hook,并且返回上一次缓存的对象
            hooks.hookIndex++;
            return prevMemo;
        }
    }
    //第一次肯定是执行工厂方法，返回newMemo
    const newMemo = factory();
    //把计算出来的对象和依赖数组保存在hookStates数组中
    hookStates[hookIndex] = [newMemo, deps];
    hooks.hookIndex++;
    return newMemo;
}
export function useCallback(callback, deps) {
    //可以使用useMemo很方便的实现useCallback
    return useMemo(() => callback, deps);
}
//如果action是一个函数，则把老状态传入函数返回计算的新的状态，否则 就是直接把action当成新状态
const defaultReducer = (state, action) => typeof action === 'function' ? action(state) : action;
//其实在源码里面useState仅仅是一种特殊 的useReducer
//特殊在于直接给状态，不需要经过计算
export function useState(initialState) {
    //useState内置一个特殊的reducer,这个reducer会把dispatch派发动作当成新的状态
    return useReducer(defaultReducer, initialState);
}
/**
 * 派发动作，然后经过reducer计算获取新状态，可以很好的封装计算新状态的逻辑
 * @param {*} reducer 新状态的计算函数
 * @param {*} initialState 初始状态
 * @returns 数组，包括当前的状态，和派发状态的方法
 */
export function useReducer(reducer, initialState) {
    const { hooks } = currentVdom;//获取hooks对象
    //当第一更新的时候hookIndex=0,hookStates[0]={count:1}
    const { hookIndex, hookStates } = hooks;//获取hooks对象上保存的索引和状态数组
    const oldState = hookStates[hookIndex];//获取当前的索引对应的状态
    //如果hookState不存在，表示可能是第一次挂载
    if (isUndefined(oldState)) {
        //赋默认值
        hookStates[hookIndex] = initialState;//{count:0}
    }
    //这是一个派发动作的函数
    function dispatch(action) {
        const oldState = hookStates[hookIndex];
        //根据老状态和派发的动作计算新状态，并且覆盖hookStates中对应的索引
        const newState = reducer(oldState, action);
        //用计算出来的新状态和老状态进行对比，如果状态不一样才进行更新逻辑，如果状态一样则不更新
        if (newState !== oldState) {
            hookStates[hookIndex] = newState;
            //如果新的状态和老状态是一样的话，则不更新
            //调用根节点的更新方法
            currentRoot.update();
        }
    }
    //当执行完useReducer函数的时候，索引就要++了
    return [hookStates[hooks.hookIndex++], dispatch];
    //return {state:hookStates[hooks.hookIndex++],dispatch};
}
/**
 * 创建DOM容器
 * @param {*} container 
 */
function createRoot(container) {
    const root = {
        //把虚拟DOM变成真实DOM并且插入容器container
        render(rootVdom) {
            currentRoot = root;//此处保存当前的根容器节点
            currentRootVdom = rootVdom;//根虚拟DOM
            mountVdom(rootVdom, container);
            //设置事件代理 
            setupEventDelegation(container);
        },
        update() {
            //比较新老的DOM-DIFF
            //container父DOM节点 currentRootVdom老的根虚拟DOM currentRootVdom新的根虚拟DOM
            compareVdom(container, currentRootVdom, currentRootVdom);
        }
    }
    return root;
}
function mountVdom(vdom, parentDOM, nextDOMElement) {
    //把虚拟DOM变成真实DOM
    const domElement = createDOMElement(vdom);
    //如果没有从虚拟DOM得到真实DOM，则不需要添加到容器里
    if (!domElement) return;
    //把此真实DOM添加到容器中
    if (nextDOMElement) {
        parentDOM.insertBefore(domElement, nextDOMElement);
    } else {
        parentDOM.appendChild(domElement);
    }
    //此时此DOM元素已经挂载到页面上，可以执行挂载完成的钩子函数
    domElement.componentDidMount?.();
}
function createDOMElementFromTextComponent(vdom) {
    const { props } = vdom;
    const domElement = document.createTextNode(props);
    //让文本节点的虚拟DOM的domElement属性向了真实DOM
    vdom.domElement = domElement;
    return domElement;
}
/**
 * 通过类组件的虚拟DOM创建真实DOM
 * @param {*} vdom 类组件的虚拟DOM
 * @returns 真实DOM
 */
function createDOMElementFromClassComponent(vdom) {
    const { type, props, ref } = vdom;
    //把属性对象传递给类组件的构造函数，返回类组件的实例
    const classInstance = new type(props);
    //如果类型上有contextType静态属性的话，取出context里的当前值并且赋给实例的context属性
    if (type.contextType) {
        classInstance.context = type.contextType._currentValue;
    }
    //组件将要挂载 ,如果在此方法的就执行
    classInstance.componentWillMount?.();
    //根据类组件的定义创建完类组件的实例后，判断ref是否有值，如果有值的话则给ref.current赋值为类的实例
    if (ref) ref.current = classInstance;
    //让类组件的虚拟DOM的classInstance属性指向类组件的实例
    vdom.classInstance = classInstance;
    //调用实例上的render方法，返回将要渲染的虚拟DOM
    const renderVdom = classInstance.render();
    //让类的实例的oldRenderVdom属性指向它调用render方法渲染出来的虚拟DOM
    classInstance.oldRenderVdom = renderVdom;
    //把虚拟DOM传递给createDOMElement返回真实DOM
    //此处只是生成得到真实DOM，但此真实DOM此时还没有挂载到页中，也就是还没有插入到父节点当中
    const domElement = createDOMElement(renderVdom);
    //因为我们也不知道这个DOM元素是什么插入页面的，所以可以把此挂载完成的钩子函数先暂存在DOM元素
    //等它真正挂载完成的时候再执行就可以了
    //正常来说真实DOM肯定不能调用任何的生命周期钩子
    if (classInstance.componentDidMount) {
        domElement.componentDidMount = classInstance.componentDidMount.bind(classInstance);
    }
    return domElement;
}
//初始化hooks
function initializeHooks(vdom) {
    //在vdom上保存一个属性，用于存放当前函数组件上的hook信息
    vdom.hooks = {
        hookIndex: 0,//当前hook的索引，指的是当在执行函数组件中的哪个hook
        hookStates: []//当前hook的状态保存的数组,保存hook状态的数组
    }
    //在初始挂载函数组件的时候可以把vdom保存在全局变量上
    currentVdom = vdom;
}
function finalizeHooks(vdom, renderVdom) {
    //在获取到函数组件的返回的虚拟DOM之后，记录一下
    //让当前的函数组件的虚拟DOM的oldRenderVdom属性指向它返回虚拟DOM
    vdom.oldRenderVdom = renderVdom;
    currentVdom = null;
    //把函数组件返回的React元素传递给createDOMElement，创建真实DOM
    return createDOMElement(renderVdom);
}
//挂载函数组件，在第一次挂载的时候就需要创建保存hooks状态的对象
function createDOMElementFromFunctionComponent(vdom) {
    initializeHooks(vdom);
    const { type, props } = vdom;
    //把属性对象传递给函数组件这个函数，返回一个用来渲染的虚拟DOM
    const renderVdom = type(props);
    return finalizeHooks(vdom, renderVdom)
}
function createReactForwardDOMElement(vdom) {
    initializeHooks(vdom);
    const { type, props, ref } = vdom;//type={$$typeof ,render} render其实就是转发前的函数组件
    //把自己接收到的属性对象和ref作为实参传递给render函数
    const renderVdom = type.render(props, ref);
    return finalizeHooks(vdom, renderVdom);
}
function createDOMElementFromNativeComponent(vdom) {
    const { type, props, ref } = vdom;
    //先根据类型创建真实DOM
    const domElement = document.createElement(type);
    //如果ref有值的话，把真实的DOM元素赋值给ref.current
    if (ref) ref.current = domElement;
    //根据属性更新DOM元素
    updateProps(domElement, {}, props)
    //把所有的子节点变成真实DOM并且插入父节点上
    mountChildren(vdom, domElement);
    //如果虚拟DOM是一个真实DOM节点的类型的话，就让它的domElement属性指向它创建出来的真实DOM
    vdom.domElement = domElement;
    return domElement;
}
/**
 * 把所有的子节点也从虚拟DOM变成真实DOM并且挂载到父节点上
 * @param {*} vdom 虚拟DOM
 * @param {*} domElement  真实DOM
 */
function mountChildren(vdom, domElement) {
    //遍历children数组
    wrapToArray(vdom?.props?.children).forEach(childVdom => {
        //把每个儿子都从虚拟DOM变成真实DOM,并插入到父节点里面
        mountVdom(childVdom, domElement)
    });
}
/**
 * 根据属性更新DOM元素
 * 抽离此方法是为了后面在更新的时候可以复用
 * @param {*} domElement  真实DOM元素
 * @param {*} oldProps  老属性
 * @param {*} oldProps  新属性
 */
function updateProps(domElement, oldProps = {}, newProps = {}) {
    //如果一个属性在老的属性里有，新的属性里没有，则删除删除
    Object.keys(oldProps).forEach(name => {
        //如果新的属性对象中已经没有此属性了
        if (!newProps.hasOwnProperty(name)) {//children是特殊处理的，不在此处进行处理
            if (name === 'style') {
                //如果原来有行内样式，现在没有了，则需要清空原来的行内样式
                Object.keys(oldProps.style).forEach(styleProp => {
                    domElement.style[styleProp] = null;
                });
            } else if (name.startsWith('on')) {
                delete domElement.reactEvents[name];
            } else if (name === 'children') {

            } else {
                delete domElement[name];
            }
        }
    });
    //再处理属性,先出属性的数组
    Object.keys(newProps).forEach((name) => {
        //如果属性是children则先跳过不处理, 后面会单独处理
        if (name === 'children') {
            return;
        }
        //如果是行内样式属性的话，则直接覆盖到真实DOM的style上
        if (name === 'style') {
            //把newProps.style上所属性直接覆盖到domElement.style对象上
            Object.assign(domElement.style, newProps.style);
        } else if (name.startsWith('on')) {
            //我们在domElement添加一个自定义属性reactEvents，用来存放React事件回调
            if (isUndefined(domElement.reactEvents)) {
                domElement.reactEvents = {};
            }
            //domElement.reactEvents[onClick]=就是对应监听函数
            //domElement.reactEvents[onClickCapture]=就是对应监听函数
            domElement.reactEvents[name] = newProps[name];
        } else {
            domElement[name] = newProps[name];
        }
    });
}
function createReactMemoDOMElement(vdom) {
    initializeHooks(vdom);
    const { type, props } = vdom;
    const renderVdom = type.render(props);
    return finalizeHooks(vdom, renderVdom)
}
/**
 * 把虚拟DOM变成真实DOM
 * @param {*} vdom 虚拟DOM
 * @return  真实DOM
 */
export function createDOMElement(vdom) {
    //如果传递的vdom是空，则直接返回null
    if (isUndefined(vdom)) return null;
    //取出元素类型和属性对象
    const { type } = vdom;
    //说明这是一个转发的函数组件
    if (type.$$typeof === REACT_MEMO) {
        return createReactMemoDOMElement(vdom);//memo是包装后的函数组件，里面也有hook,所以也需要初始化hooks
    } else if (type.$$typeof === REACT_FORWARD_REF) {
        return createReactForwardDOMElement(vdom);//forward也是包装后的函数组件，里面也有hook,所以也需要初始化hooks
    } else if (type === REACT_TEXT) {   //如果这个虚拟DOM是一个文本节点的话
        return createDOMElementFromTextComponent(vdom);
        // 如果虚拟DOM的类型是一个函数的话
    } else if (typeof type === 'function') {
        //说明这是一个类组件
        if (type.isReactComponent) {
            return createDOMElementFromClassComponent(vdom);
        } else {//这里处理函数组件
            return createDOMElementFromFunctionComponent(vdom);
        }
    } else { //根据type创建真实的DOM节点
        return createDOMElementFromNativeComponent(vdom);
    }
}
export function getParentDOMByVdom(vdom) {
    return getDOMElementByVdom(vdom)?.parentNode;
}
/**
 * 获取虚拟DOM对应的真实DOM
 * @param {*} vdom 虚拟DOM
 */
export function getDOMElementByVdom(vdom) {
    if (isUndefined(vdom)) return null;
    let { type } = vdom;
    //如果虚拟DOM的类型type是一个函数的话.或者type的render属性是一个函数的话
    if (typeof type === 'function' || typeof type.render === 'function') {
        //如果是类组件的话
        if (type.isReactComponent) {
            //先获取类组件渲染了来的虚拟DOM，然后再进行递归查找
            return getDOMElementByVdom(vdom.classInstance.oldRenderVdom);
        } else {//函数组件
            return getDOMElementByVdom(vdom.oldRenderVdom);
        }
    } else {//否则 就是原生DOM节点了，可以直接获取属性
        return vdom.domElement;
    }
}
/**
 * 卸载或者说删除老的节点
 * @param {*} vdom 虚拟DOM对象
 * @returns 
 */
export function unMountVdom(vdom) {
    if (isUndefined(vdom)) return;
    const { ref, props } = vdom;
    //递归卸载子节点
    wrapToArray(props.children).forEach(unMountVdom);
    //获取此虚拟DOM对应的真实DOM，如果存在的话删除它
    getDOMElementByVdom(vdom)?.remove();
    //如果这是一个类组件，并且类组件实例上还有组件将要卸载的函数，则执行它
    vdom.classInstance?.componentWillUnmount?.();
    //把ref的current重置为null
    if (ref) ref.current = null;
}
function updateNativeComponent(oldVdom, newVdom) {
    //先获取老的文本节点的真实DOM， 然后传递给newVdom.domElement,会赋值给domElement
    let domElement = newVdom.domElement = getDOMElementByVdom(oldVdom);
    //根据旧的属性对象和新的属性对象进行更新
    updateProps(domElement, oldVdom.props, newVdom.props);
    //再更新子节点
    updateChildren(domElement, oldVdom.props.children, newVdom.props.children);
}
/**
 * 判断两个虚拟DOM是否相同
 * @param {*} oldVnode 第1个虚拟DOM节点
 * @param {*} newVnode 第2个虚拟DOM节点
 * @returns 布尔值，相同为true,不相同为false
 */
function isSameVnode(oldVnode, newVnode) {
    //如果都存在，并且类型相同，并且key也相同，认为他们是同一个可以复用的节点
    return isDefined(oldVnode) && isDefined(newVnode)
        && oldVnode.key === newVnode.key
        && oldVnode.type === newVnode.type;
}

/**
 * 更新子节点
 * @param {*} parentDOM 父真实DOM
 * @param {*} oldVChildren 老的子虚拟DOM
 * @param {*} newVChildren 新的子虚拟DOM
 */
function updateChildren(parentDOM, oldVChildren, newVChildren) {
    oldVChildren = wrapToArray(oldVChildren);
    newVChildren = wrapToArray(newVChildren);
    let lastPlacedNode = null;
    function placeChild(domElement) {
        if (isDefined(lastPlacedNode)) {//A
            //如果上一个确定好的位置的元素是A，则把C插入到A的下一个节点的前面
            //如果oldDOMElement不在lastPlacedNode的后面才需要移动，如果刚好在lastPlacedNode的后面就不用动了
            if (lastPlacedNode.nextSibling !== domElement) {
                parentDOM.insertBefore(domElement, lastPlacedNode.nextSibling);
            }
        } else {//第一次的时候lastPlacedNode是个null,
            ///因为oldDOMElement将会成为父节点的第一个子节点，可以把它插到父节点的第一个子节点的前面
            //oldDOMElement将会成为新的第一个子节点,然后相同于oldDOMElement位置就确定
            parentDOM.insertBefore(domElement, parentDOM.firstChild);
            //然后把oldDOMElement赋值给lastPlacedNode,表示此节点的位置已经固定下来，不能再移动
        }
        lastPlacedNode = domElement;
    }
    //直接遍历新数组
    for (let index = 0; index < newVChildren.length; index++) {
        //获取新的虚拟DOM节点
        const newVChild = newVChildren[index];
        //如果新的虚拟DOM是一个空节点，则直接进行下一次循环
        if (isUndefined(newVChild)) continue;
        //试图在老的DOM节点找一找有没有能够复用的老节点
        const oldVChildIndex = oldVChildren.findIndex(oldVChild => isSameVnode(oldVChild, newVChild));
        //如果索引等于-1表示没有找到可以复用的老节点
        if (oldVChildIndex == -1) {
            const newDOMElement = createDOMElement(newVChild);
            placeChild(newDOMElement);
        } else {//如果不等于-1，说明找到了可以复用的老节点
            //说明可以复用老节点
            const oldVChild = oldVChildren[oldVChildIndex];
            //可以深度更新此老节点
            updateVdom(oldVChild, newVChild);
            //获取老的虚拟DOM对应的真实DOM
            const oldDOMElement = getDOMElementByVdom(oldVChild);//C
            placeChild(oldDOMElement);
            //如果被复用的老节点不从数组中删除，则在最后会被 全部删除掉
            oldVChildren.splice(oldVChildIndex, 1);
        }
    }
    //在新节点遍历完成了，会把留在数组中，没有被复用到的老节点全部删除
    oldVChildren.forEach(oldVChild => getDOMElementByVdom(oldVChild)?.remove());
}
/**
 * 查找startIndex后面的第一个真实DOM节点
 * @param {*} vChildren 老的虚拟DOM数组
 * @param {*} startIndex 开始查找的索引
 */
function getNextVdom(vChildren, startIndex) {
    for (let i = startIndex; i < vChildren.length; i++) {
        let domElement = getDOMElementByVdom(vChildren[i]);
        if (domElement) return domElement;
    }
    return null;
}
function updateReactMemoComponent(oldVdom, newVdom) {
    updateHook(oldVdom,newVdom);
    let { type, props } = newVdom;
    const { render, compare } = type;
    //比较新的虚拟DOM和老的虚拟DOM
    if (compare(props, oldVdom.props)) {//如果相等说明属性没有变化
        //复用一次的渲染结果
        newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
        return;
    }
    //如果属性不相等，则重新执行渲染函数得到新的虚拟DOM
    let renderVdom = render(props);
    //进行DOM-DIFF更新
    compareVdom(getParentDOMByVdom(oldVdom), oldVdom.oldRenderVdom, renderVdom);
    //缓存本次渲染的虚拟DOM ， 以便进行下次的对比
    newVdom.oldRenderVdom = renderVdom;
}
/**
 * 更新虚拟DOM
 */
function updateVdom(oldVdom, newVdom) {
    const { type } = oldVdom;
    if (type.$$typeof === REACT_MEMO) {
        return updateReactMemoComponent(oldVdom, newVdom);
        //如果这是一个转发的REF的话
    } if (type.$$typeof === REACT_FORWARD_REF) {
        return updateReactForwardComponent(oldVdom, newVdom);
        //如果这个节点是一个文本节点的话
    } else if (type === REACT_TEXT) {
        return updateReactTextComponent(oldVdom, newVdom);
    } else if (typeof type === 'string') {//说明这是一个普通的原生节点div span
        return updateNativeComponent(oldVdom, newVdom);
    } else if (typeof type === 'function') {
        if (type.isReactComponent) {
            return updateClassComponent(oldVdom, newVdom);
        } else {
            return updateFunctionComponent(oldVdom, newVdom)
        }
    }
}
function updateHook(oldVdom, newVdom) {
    const hooks = (newVdom.hooks = oldVdom.hooks);
    //再重新执行函数前把hookIndex重置为0
    hooks.hookIndex = 0;
    //让当前的虚拟DOM等于新的函数组件的虚拟DOM
    currentVdom = newVdom;
}
/**
 * 更新函数组件 
 * @param {*} oldVdom 
 * @param {*} newVdom 
 */
function updateFunctionComponent(oldVdom, newVdom) {
    updateHook(oldVdom,newVdom);
    //获取新的虚拟DOM对应的类型和属性
    const { type, props } = newVdom;
    //计算新的虚拟DOM
    const renderVdom = type(props);
    //进行虚拟DOM的对比
    compareVdom(getParentDOMByVdom(oldVdom), oldVdom.oldRenderVdom, renderVdom);
    newVdom.oldRenderVdom = renderVdom;
}
function updateClassComponent(oldVdom, newVdom) {
    //复用类组件的实例
    const classInstance = newVdom.classInstance = oldVdom.classInstance;
    //类组件的父组件更新了，向子组件传递新的属性
    classInstance.componentWillReceiveProps?.(newVdom.props);
    //触发子组件的更新
    classInstance.emitUpdate(newVdom.props);
}

function updateReactTextComponent(oldVdom, newVdom) {
    //先获取老的文本节点的真实DOM， 然后传递给newVdom.domElement,会赋值给domElement
    let domElement = newVdom.domElement = getDOMElementByVdom(oldVdom);
    //如果老的文本和新的文本不一样的话，则修改文本节的文本内容
    if (oldVdom.props !== newVdom.props) {
        domElement.textContent = newVdom.props;
    }
}
function updateReactForwardComponent(oldVdom, newVdom) {
    updateHook(oldVdom,newVdom);
    const { type, props, ref } = newVdom;
    //重新执行函数组件渲染的函数，得到渲染的虚拟DOM
    const renderVdom = type.render(props, ref);
    //获取老的真实DOM的父节点，再传入老的虚拟DOM和新的虚拟DOM
    compareVdom(getParentDOMByVdom(oldVdom), oldVdom.oldRenderVdom, renderVdom)
    newVdom.oldRenderVdom = renderVdom;
}
/**
 * 进行深度的DOM-DIFF
 * @param {*} parentDOM 真实的父DOM oldVdom对应的真实DOM的父节点
 * @param {*} oldVdom 上一次render渲染出来的虚拟DOM
 * @param {*} newVdom 最新的render渲染出来的虚拟DOM
 */
export function compareVdom(parentDOM, oldVdom, newVdom, nextDOMElement) {
    //如果新的节点和老的节点都是空的，什么都不用做
    if (isUndefined(oldVdom) && isUndefined(newVdom)) {
        return;
        //如果老的有值，新的没有值 ，比如说3=>4{this.state.number===4?null:<ChildCounter />}    
    } else if (isDefined(oldVdom) && isUndefined(newVdom)) {
        //卸载老DOM节点
        unMountVdom(oldVdom);
        //如果老的虚拟DOM是空，新的不为空    
    } else if (isUndefined(oldVdom) && isDefined(newVdom)) {
        mountVdom(newVdom, parentDOM, nextDOMElement);
        //如果新旧都有，但是类型不同的，也不有复用    
    } else if (isDefined(oldVdom) && isDefined(newVdom) && oldVdom.type !== newVdom.type) {
        //如果新的有，老的也有，但是类型不一样，则不能复用，则卸载老节点，插入新节点
        unMountVdom(oldVdom);
        mountVdom(newVdom, parentDOM, nextDOMElement);
    } else {
        //新老都有，并且类型也一样，那就可以进入深度对比属性和子节点
        updateVdom(oldVdom, newVdom);
    }
}
const ReactDOM = {
    createRoot
}
export default ReactDOM;