import * as effectTypes from './effectTypes';
/**
 * 创建TAKE的effect的工厂函数
 * @param {*} actionType  动作类型
 * @returns effect
 */
export function take(actionType){
    return {type:effectTypes.TAKE,actionType}
}
/**
 * 创建PUT的effect的工厂函数,用来告诉saga中间件，请帮我向仓库派发此动作
 * @param {*} actionType  动作类型
 * @returns effect
 */
export function put(action){
    return {type:effectTypes.PUT,action}
}

export function fork(saga,...args){
    return {type:effectTypes.FORK,saga,args};
}
/**
 * 监听每一个actionType,当监听到之后以非阻塞的方式执行saga
 * @param {*} actionType 动作类型
 * @param {*} saga 执行的saga任务
 */
export function takeEvery(actionType,saga){
    function *takeEveryHelper(){
        while(true){
            //等待有人向仓库派发 actionType
            yield take(actionType);
            //等到这后以非阻塞的方式执行saga任务
            yield fork(saga);
        }
    }
    return fork(takeEveryHelper);
}
/**
 * 返回一个effect,用来执行某个函数
 * @param {*} func 执行的函数
 * @param  {...any} args 传递给函数的参数
 * @returns effect
 */
export function call(func,...args){
  return {type:effectTypes.CALL,func,args}
}

export function cps(func,...args){
  return {type:effectTypes.CPS,func,args};
}
export function all(iterators){
  return {
    type:effectTypes.ALL,
    iterators
  }
}
export function cancel(task){
  return {
    type:effectTypes.CANCEL,
    task
  }
}
const delayFn = (ms)=>{
  return new Promise((resolve)=>{
    setTimeout(resolve,ms)
  });
}
export function delay(...args){
  return call(delayFn,...args)
}