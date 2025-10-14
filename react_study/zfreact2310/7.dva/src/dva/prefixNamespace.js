/**
 * 返回一个新的对象
 * key全部加上命名空间的前缀
 * 值不变
 * @param {*} obj 
 * @param {*} namespace 
 * @returns 
 */
function prefix(obj,namespace){
    //获取obj属性的数组进行遍历
    return Object.keys(obj).reduce((memo,key)=>{
        //创建新的key,也就是加上命名空间后的属性名
        const newKey = `${namespace}/${key}`;
        //给memo赋上新的属性名，值为老的reducer函数
        memo[newKey]=obj[key];
        return memo;
    },{});
}
/**
 * 重写model中的reducers对象
 * 把reducers对象中的属性名加上此模型的命名空间的前缀 add  => counter1/add
 * @param {*} model 
 */
function prefixNamespace(model){
  if(model.reducers){
    //用prefix计算得到的新的reducers覆盖model.reducers
    model.reducers = prefix(model.reducers,model.namespace);
  }
  if(model.effects){
    //用prefix计算得到的新的effects覆盖model.effects
    model.effects = prefix(model.effects,model.namespace);
  }
  return model;
}
export default prefixNamespace;