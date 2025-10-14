import {REACT_TEXT} from './constants';
/**
 * 判断一个值是不是未定义的，也就是null或者undefined
 * @param {*} val 
 * @returns 
 */
export function isUndefined(val){
    return val === undefined || val === null;
}
/**
 * 判断一个值是不是定义的，也就是不是null并且不同undefined
 * @param {*} val 
 * @returns 
 */
export function isDefined(val){
    return val !== undefined && val !== null;
}
/**
 * 为了更加语义化，也为了方便后面进行DOMDIFF，我们把文本节点包装成虚拟DOM
 * @param {*} element 
 */
export function wrapToVdom(element){
  return typeof element==='string'|| typeof element==='number'?{
    type:REACT_TEXT,
    props:element
  }:element;
}
/**
 * 把一个任意的值包装成一个数组
 * 如果是多维数组的话要打平成一维 [[a,b],[c,d]]
 * @param {*} val 
 * @returns 数组
 */
export function wrapToArray(val){
    return Array.isArray(val)?val.flat():[val];
}

export function shallowEqual(obj1,obj2){
  if(obj1 === obj2){
    return true;
  }
  if(typeof obj1 !== 'object' || obj1 === null || typeof obj2!=='object'|| obj2===null){
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if(keys1.length !== keys2.length){
    return false;
  }
  for(let key of keys1){
    //如果obj2中没有这个属性，或者有此属性但是值不相等
    if(!obj2.hasOwnProperty(key) || obj1[key]!==obj2[key]){
      return false;
    }
  }
  return true;
}