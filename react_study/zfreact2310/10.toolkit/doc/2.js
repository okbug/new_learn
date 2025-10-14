/**
 * immer是一个不可变数据
 * 对于draft所有的修改都会应到nextState上
 * 对任何属性更新都会返回一个新的对象
 * immer在使的数据结构是共享的，nextState在结构上又与老状态共享未修改的部分
 * 
 */
const {produce} = require('immer');
const baseState = {
    ids:[1,2],
    pos:{
        x:1,
        y:1
    }
}
const nextState = produce2(baseState,(draft)=>{
    draft.ids.push(3);
});
console.log(baseState === nextState);
console.log(baseState.ids === nextState.ids);
console.log(baseState.pos === nextState.pos);
function produce2(baseState,producer){
    //相当于创建一个深拷贝的草稿对象
    let draft = JSON.parse(JSON.stringify(baseState));
    //把草稿对象传给producer进行修改
    producer(draft);
    const nextState = {};
    for(let key in baseState){
        if(JSON.stringify(baseState[key])!= JSON.stringify(draft[key])){
            nextState[key]=draft[key];
        }else{
            nextState[key]= baseState[key]
        }
    }
    //返回草稿对象
    return nextState;
}