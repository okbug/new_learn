const {produce} = require('immer');
//可以判断一个值是不是一个对象
const isObject = val=>Object.prototype.toString.call(val)==='[object Object]';
//可以判断一个值是不是一个数组
const isArray = val=>Array.isArray(val)
const isFunction = (val)=>typeof val === 'function'
//创建一个唯一的标识，用于标识内部的状态的存储
const INTERNAL = Symbol('INTERNAL')
const baseState = {
    ids:[1,2],
    pos:{
        x:1,
        y:1
    }
}
const nextState = produce2(baseState,(proxy)=>{
    proxy.ids.push(3);
});
console.log(baseState === nextState);//false
console.log(baseState.ids === nextState.ids);//false
console.log(baseState.pos === nextState.pos);//true
function createDraftState(baseState){
    if(isArray(baseState)){//如果是数组，则返回浅拷贝的数组
        return [...baseState];
    }else if(isObject(baseState)){//如果是对象，则返回浅拷贝的对象
        return Object.assign({},baseState);
    }else{//直接返回值 string number boolean
        return baseState;
    }
}
/**
 * 把基础状态对象转成代理对象的函数
 */
function toProxy(baseState,valueChange){
    //定义一个对象，用来存放每个属性的代理对象
    let keyToProxy = {};
    //内部状态，包含草稿的状态、属性代理和是否值发生了变化的标志
    let internal = {
        draftState:createDraftState(baseState),//草稿的状态
        keyToProxy,//属性代理 这里是一个懒代理，不是一上来对所有的属性进行代理，而是访问哪个属性代理哪个属性
        mutated:false//它的某个属性是否发生了改变
    }
    //返回baseState对应的代理对象
    return new Proxy(baseState,{
        //拦截对象属性的获取
        get(target,key){
            //如果读取的是INTERNAL属性，则返回内部的状态
            if(key === INTERNAL){
                return internal;
            }
            //获取目标对象上的值
            const value = target[key];
            //如果值是对象或者数组，需要特殊处理
            if(isObject(value)||isArray(value)){
                //如果说该属性已经被 代理过了，则直接返回代理对象
                if(key in keyToProxy){
                    return keyToProxy[key];
                }else{
                    //如果此属性还没有创建对应的代理对象，则需要创建它的代理对象,并保存到keyToProxy
                    const keyProxy =toProxy(value,()=>{
                        //在子对象发生改变时，更新内部的状态
                        internal.mutated=true;
                        //获取它的子属性的代理对象
                        const proxyOfChild = keyToProxy[key];
                        //获取子属性的代理地象的草稿对象
                        const {draftState} = proxyOfChild[INTERNAL];
                        //让内部的草稿对象的key属性指向新的儿子的草稿对象
                        internal.draftState[key]=draftState;
                        //向上进行通知更新
                        valueChange&&valueChange();
                    });
                    keyToProxy[key]=keyProxy;
                    return keyProxy;
                }
            }else if(isFunction(value)){
                internal.mutated=true;
                valueChange&&valueChange();
                return value.bind(internal.draftState);
            }
            //如果internal.mutated为真，说明它的某个属性经过了修改,则返回draftState中的key属性
            //如果internal.mutated为false,说没有任何属性修改过，则可以返回老状态
            return internal.mutated?internal.draftState[key]:baseState[key];
        },
        //拦截对象属性的设置
        set(target,key,value){
            //只要修改了此对象的某个属性的值，那么就把internal.mutated设置为true
            internal.mutated=true;
            //修改的话永远不能修改原始对象的属性，只能修改草稿对象
            //先获取此属性的草稿对象
            let {draftState} = internal;
            //确保草稿对象上包含所有的原始对象上的属性
            for(const key in target){
                draftState[key]= key in draftState?draftState[key]:target[key]
            }
            //设置新的值
            draftState[key]=value;
            //如果有值改变回调的话调用此修改变回调方法
            valueChange&&valueChange();
            //返回true表示设置属性的值成功
            return true;
        }
    });
}
/**
 * 这是一个用来生产新的状态的函数 
 * @param {*} baseState 老状态
 * @param {*} producer 修改草稿函数
 */
function produce2(baseState,producer){
    debugger
    //创建基础对象对应的代理对象
   const proxy = toProxy(baseState);
   //应用状态修改函数
   producer(proxy);
   //先获取内部的状态
   const internal = proxy[INTERNAL]
   //如果发生了属性变化，返回新的草稿对象，否则直接返老对象
   return internal.mutated?internal.draftState:baseState;
}









//produce 1.每次修改都会返回新的对象 2.如果属性没有变，则可以复用上次的属性
//核心实现是利用 ES6 的 proxy,几乎以最小的成本实现了 js 的不可变数据结构