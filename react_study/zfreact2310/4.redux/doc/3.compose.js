//compose
//如果一个函数需要经过多个函数处理才能得到最终值，这个时候就可以把中间过程的函数合并成一个函数

function add1(str){
    return '1'+str;
}
function add2(str){
    return '2'+str;
}
function add3(str){
    return '3'+str;
}
function compose_bak(...funcs){
  return function(...args){
    let result;
    for(let i=funcs.length-1;i>=0;i--){
        let func = funcs[i];
        //如果是第一次执行，则执行函数，并传入args参数
        if(i===funcs.length-1){
            result=func(...args);
        //如果不是第一次执行，则执行函数，并传入上一次函数的返回值    
        }else{
            result=func(result);
        }
    }
    return result;
  }
}
function compose(...funcs){
    //如果没有传入任何的函数，则返回一个自定义函数，给什么参数，返回什么结果
    if(funcs.length===0)return args=>args;
    //如果传入了一个函数，则返回这一个函数 
    if(funcs.length===1)return funcs[0];
    return funcs.reduce((a,b)=>(...args)=>a(b(...args)));
}
/**
 * let funcs = [add3,add2,add1];
 * 第一次执行循环函数 a=add3,b=add2 返回 (...args)=>add3(add2(...args))
 * 第二次执行循环函数 a=(...args)=>add3(add2(...args)),b=add1
 * 返回 (...args)=>add3(add2((add1(...args))));
 */
let fn = compose(add3,add2,add1);
let result = fn('zhufeng');
console.log(result)