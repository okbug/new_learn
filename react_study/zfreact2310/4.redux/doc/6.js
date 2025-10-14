function compose(...funcs){
    //如果没有传入任何的函数，则返回一个自定义函数，给什么参数，返回什么结果
    if(funcs.length===0)return args=>args;
    //如果传入了一个函数，则返回这一个函数 
    if(funcs.length===1)return funcs[0];
    return funcs.reduce((a,b)=>(...args)=>a(b(...args)));
}
let promise = (next) => {
    return action => {
        console.log('promise')
        next(action);
    }
}
let thunk = (next) => {
    return action => {
        console.log('thunk')
        next(action);
    }
}
let logger = (next) => {
    return action => {
        console.log('logger')
        next(action);
    }
}
let chain = [promise,thunk,logger];
let fn = compose(...chain);
const originDispatch = (action)=>console.log(`原始的dispatch方法`,action)
const newDispatch = fn(originDispatch);
newDispatch({type:'ADD1'});