import {scheduleUpdate} from '../react';
//定义一个事件类型的方法字典
const eventTypeMethods = {
    //key是原生的事件名 值是一个对象，对象有key和值，key是事件阶段，值是对应的绑定元素上的方法
    click:{
        capture:'onClickCapture',
        bubble:'onClick'
    }
}
//事件传播的二个阶段
const phases = ['capture','bubble'];
/**
 * 根据原生事件对象创建合成事件对象
 * @param {*} nativeEvent 
 */
function createSyntheticEvent(nativeEvent){
    //声明一个变量，表示当前的事件是否已经阻止传播了
    let isPropagationStopped = false;
    //声明一个变量，表示当前的事件是否已经阻止默认行为了
    let isDefaultPrevented = false;
    const handler = {
        get(target,key){
            //如果此属性是target的自己定义的属性，则返回重写后的方法和属性
            if(target.hasOwnProperty(key)){
                //则直接返回被代理的对象的属性
                return Reflect.get(target,key);
            }else{
                //先取出属性上的值
                const value =  Reflect.get(nativeEvent,key);
                //如果是函数的话绑死一下this,保证你在调用这些函数的时候它的this指向原生的事件对象
                return typeof value === 'function'?value.bind(nativeEvent):value;
            }
        }
    }
    const target ={
        nativeEvent,//指向的是原生事件对象
        preventDefault(){
            if(nativeEvent.preventDefault){
                nativeEvent.preventDefault();//标准浏览器
            }else{
                nativeEvent.returnValue = false;//IE
            }
            isDefaultPrevented=true;
        },
        stopPropagation(){
            if(nativeEvent.stopPropagation){
                nativeEvent.stopPropagation();
            }else{
                nativeEvent.cancelBubble = true;
            }
            isPropagationStopped=true;
        },
        stopImmediatePropagation(){
            if(nativeEvent.stopImmediatePropagation){
                nativeEvent.stopImmediatePropagation();
            }else{
                nativeEvent.cancelBubble = true;
            }
            isPropagationStopped=true;
        },
        isDefaultPrevented(){
            return isDefaultPrevented;
        },
        isPropagationStopped(){
            return isPropagationStopped;
        }
    }
    //可以根据原生事件创建一个代理对象
    const syntheticEvent = new Proxy(target,handler);
    return syntheticEvent;
}
/**
 * 设置事件委托，把所有的事件都绑到容器container上
 * @param {*} container root根节点
 */
function setupEventDelegation(container){
    //遍历所有的事件
    Reflect.ownKeys(eventTypeMethods).forEach((eventType)=>{
        //遍历二个阶段capture bubble
        phases.forEach((phase)=>{
            //给容器添加监听函数 eventType 事件的名称click nativeEvent 原生的事件对象
            //在React17以前此处绑定为document
            //在React17之后此处绑定为根节点根容器中 div#root
            container.addEventListener(eventType,(nativeEvent)=>{
                //根据原生事件创建和合成事件
                const syntheticEvent = createSyntheticEvent(nativeEvent);
                //要模拟事件传播的顺序，事件传递路径上所有的DOM元素上绑定的React事件取出来按顺序执行
                //composedPath() 是 Event 接口的一个方法，当对象数组调用该侦听器时返回事件路径
                //返回一个 EventTarget对象数组，表示将在其上调用事件侦听器的对象。
                const composedPath = syntheticEvent.composedPath();
                //因为模拟冒泡和模拟捕获顺序是相反的
                //因为数组的顺序是从子向父，从内到外，其实是冒泡的顺序，如果是在捕获阶段执行需要倒序
                const domElements = phase==='capture'?composedPath.reverse():composedPath;
                //domElement.reactEvents[onClick]=就是对应监听函数
                //拼出来方法名 onClick onClickCapture
                const methodName = eventTypeMethods[eventType][phase];
                //遍历所有的DOM元素，执行它身上绑定的React事件监听函数
                //在整个处理过程中，共享同一个syntheticEvent合成事件象
                //syntheticEvent.target定死的不变的，点谁就是谁
                //但是syntheticEvent.currentTarget是会变的，在哪个DOM元素执行事件回调，它就是指向谁
                //在执行事件处理器之前先把批量更新打开，设置为true
                //setIsBatchingUpdates(true);
                for(let domElement of domElements){
                    //如果某个方法执行的时候，已经调用了event.stopPropagation();,则表示阻止传播了，跳出循环
                    if(syntheticEvent.isPropagationStopped()){
                        break;
                    }
                    //currentTarget是会变的，而target是不变的
                    syntheticEvent.currentTarget = domElement;
                    //如果此DOM节点上绑定有回调函数，则执行它
                    domElement.reactEvents?.[methodName]?.(syntheticEvent);
                }
                //等事件处理器执行完成后进行实际的更新
                scheduleUpdate();
            },phase==='capture');
        });
    });

}
export default setupEventDelegation;