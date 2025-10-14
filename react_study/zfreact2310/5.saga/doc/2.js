function * gen(){
    yield 1;
    yield 2;
    yield 3;
}
let it = gen();
let result1 = it.next();
console.log(result1)
//手工抛错误，让这个迭代器直接中止
//it.throw();
//也可以直接调用return方法直接结束并返回
let r2 = it.return('over');
console.log(r2)
let result2 = it.next();
console.log(result2)