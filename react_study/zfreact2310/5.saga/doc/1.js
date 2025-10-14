
function * rootSaga(){
    //每次执行next都会产出一个新的effect指令对象
    // type是用来区分不同的指令的，比如说PUT就是想要向仓库派发一个动作action
    yield {type:'PUT',action:{type:'ADD'}};
    //产出一个Promise,
    yield new Promise(resolve=>setTimeout(resolve,1000));
    yield {type:'PUT',action:{type:'MINUS'}};
    console.log('over');
    return 'over';
}
function runSaga(saga){
  const it = saga();
  function next(){
    const {done,value:effect} = it.next();
    //如果说effect是一个Promise,等这个promise完成，完成后继续执行next
    if(effect instanceof Promise){
        effect.then(next);
    }else if(effect.type ==='PUT' ){
        console.log(`向仓库派发一个动作,${JSON.stringify(effect.action)}`);
        if(!done)next();
    }else{
        //如果此saga尚未完成，则继续调用next
        if(!done)next();
    }
  }
  next();
}
runSaga(rootSaga);
//执行生成器，得到迭代器
/**
let it = rootSaga();
let result1 = it.next();
console.log(result1);
let result2 = it.next();
console.log(result2);
let result3 = it.next();
console.log(result3);
let result4 = it.next();
console.log(result4);
 */
