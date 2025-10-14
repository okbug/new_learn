let promise = new Promise((resolve)=>{resolve('a')});
promise.aaa = 'aaa'
console.log(promise.aaa)