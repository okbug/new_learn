// Promise A+ 测试套件适配器
const { MyPromise } = require('./promise-compiled.js');

// Promise A+ 测试套件需要的适配器接口
const adapter = {
  // 创建已解决的 Promise
  resolved(value) {
    return MyPromise.resolve(value);
  },

  // 创建已拒绝的 Promise
  rejected(reason) {
    return MyPromise.reject(reason);
  },

  // 创建延迟对象（可外部控制的 Promise）
  deferred() {
    let resolve, reject;
    
    const promise = new MyPromise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return {
      promise,
      resolve,
      reject
    };
  }
};

module.exports = adapter;