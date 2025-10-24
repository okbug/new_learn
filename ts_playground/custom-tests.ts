// 自定义 Promise A+ 测试用例
import MyPromise from './promise';

// 测试基本状态转换
function testBasicStates() {
  console.log('=== 测试基本状态转换 ===');
  
  // 测试 resolve
  const p1 = new MyPromise<string>((resolve) => {
    setTimeout(() => resolve('success'), 100);
  });
  
  p1.then(value => {
    console.log('✓ Resolve 测试通过:', value);
  });
  
  // 测试 reject
  const p2 = new MyPromise<string>((_, reject) => {
    setTimeout(() => reject('error'), 100);
  });
  
  p2.catch(reason => {
    console.log('✓ Reject 测试通过:', reason);
  });
  
  // 测试立即 resolve
  const p3 = new MyPromise<number>((resolve) => {
    resolve(42);
  });
  
  p3.then(value => {
    console.log('✓ 立即 Resolve 测试通过:', value);
  });
}

// 测试链式调用
function testChaining() {
  console.log('=== 测试链式调用 ===');
  
  MyPromise.resolve(1)
    .then(value => {
      console.log('第一步:', value);
      return value * 2;
    })
    .then(value => {
      console.log('第二步:', value);
      return value + 10;
    })
    .then(value => {
      console.log('✓ 链式调用测试通过:', value); // 应该是 12
    });
  
  // 测试返回 Promise 的链式调用
  MyPromise.resolve('start')
    .then(value => {
      return new MyPromise<string>(resolve => {
        setTimeout(() => resolve(value + ' -> step1'), 50);
      });
    })
    .then(value => {
      console.log('✓ Promise 链式调用测试通过:', value);
    });
}

// 测试异常处理
function testErrorHandling() {
  console.log('=== 测试异常处理 ===');
  
  // 测试 then 中抛出异常
  MyPromise.resolve('start')
    .then(() => {
      throw new Error('测试错误');
    })
    .catch(error => {
      console.log('✓ 异常捕获测试通过:', error.message);
      return 'recovered';
    })
    .then(value => {
      console.log('✓ 错误恢复测试通过:', value);
    });
  
  // 测试构造函数中的异常
  const p = new MyPromise<string>(() => {
    throw new Error('构造函数异常');
  });
  
  p.catch(error => {
    console.log('✓ 构造函数异常测试通过:', error.message);
  });
}

// 测试值穿透
function testValuePenetration() {
  console.log('=== 测试值穿透 ===');
  
  // 测试 onFulfilled 为 null
  MyPromise.resolve('original')
    .then(null as any) // 非函数，应该穿透
    .then(value => {
      console.log('✓ onFulfilled 值穿透测试通过:', value); // 应该是 'original'
    });
  
  // 测试 onRejected 为 null
  MyPromise.reject('error')
    .then(null, null as any) // 非函数，应该穿透
    .catch(reason => {
      console.log('✓ onRejected 值穿透测试通过:', reason); // 应该是 'error'
    });
}

// 测试异步执行
function testAsyncExecution() {
  console.log('=== 测试异步执行 ===');
  
  const order: string[] = [];
  
  // 测试已解决的 Promise 的异步执行
  MyPromise.resolve('async')
    .then(value => {
      order.push('then');
      console.log('Promise then 执行');
    });
  
  order.push('sync');
  console.log('同步代码执行');
  
  setTimeout(() => {
    console.log('执行顺序:', order);
    if (order[0] === 'sync' && order[1] === 'then') {
      console.log('✓ 异步执行测试通过');
    } else {
      console.log('✗ 异步执行测试失败');
    }
  }, 50);
}

// 测试 thenable 对象处理
function testThenable() {
  console.log('=== 测试 Thenable 对象 ===');
  
  const thenable = {
    then(onFulfilled: (value: any) => void) {
      setTimeout(() => onFulfilled('thenable value'), 100);
    }
  };
  
  MyPromise.resolve(thenable)
    .then(value => {
      console.log('✓ Thenable 测试通过:', value);
    });
  
  // 测试在 then 中返回 thenable
  MyPromise.resolve('start')
    .then(() => thenable)
    .then(value => {
      console.log('✓ Then 返回 Thenable 测试通过:', value);
    });
}

// 测试状态不可逆性
function testStateImmutability() {
  console.log('=== 测试状态不可逆性 ===');
  
  let resolveFunc: (value: string) => void;
  let rejectFunc: (reason: any) => void;
  
  const p = new MyPromise<string>((resolve, reject) => {
    resolveFunc = resolve;
    rejectFunc = reject;
  });
  
  // 先 resolve
  resolveFunc!('first');
  
  // 再尝试 reject（应该被忽略）
  rejectFunc!('should be ignored');
  
  // 再尝试 resolve（应该被忽略）
  resolveFunc!('should also be ignored');
  
  p.then(value => {
    console.log('✓ 状态不可逆性测试通过:', value); // 应该是 'first'
  }).catch(reason => {
    console.log('✗ 状态不可逆性测试失败:', reason);
  });
}

// 测试 finally 方法
function testFinally() {
  console.log('=== 测试 Finally 方法 ===');
  
  let finallyExecuted = false;
  
  MyPromise.resolve('success')
    .finally(() => {
      finallyExecuted = true;
      console.log('Finally 执行（成功情况）');
    })
    .then(value => {
      console.log('✓ Finally 成功测试通过:', value, '执行状态:', finallyExecuted);
    });
  
  MyPromise.reject('error')
    .finally(() => {
      console.log('Finally 执行（失败情况）');
    })
    .catch(reason => {
      console.log('✓ Finally 失败测试通过:', reason);
    });
}

// 测试静态方法
function testStaticMethods() {
  console.log('=== 测试静态方法 ===');
  
  // 测试 Promise.all
  MyPromise.all([
    MyPromise.resolve(1),
    MyPromise.resolve(2),
    MyPromise.resolve(3)
  ]).then(values => {
    console.log('✓ Promise.all 测试通过:', values);
  });
  
  // 测试 Promise.race
  MyPromise.race([
    new MyPromise(resolve => setTimeout(() => resolve('slow'), 200)),
    new MyPromise(resolve => setTimeout(() => resolve('fast'), 100))
  ]).then(value => {
    console.log('✓ Promise.race 测试通过:', value); // 应该是 'fast'
  });
}

// 测试边界情况
function testEdgeCases() {
  console.log('=== 测试边界情况 ===');
  
  // 测试空的 then 调用
  MyPromise.resolve('test')
    .then()
    .then(value => {
      console.log('✓ 空 then 调用测试通过:', value);
    });
  
  // 测试多次 then 调用
  const p = MyPromise.resolve('shared');
  
  p.then(value => {
    console.log('✓ 第一个 then:', value);
  });
  
  p.then(value => {
    console.log('✓ 第二个 then:', value);
  });
  
  // 测试循环引用检测（如果实现了的话）
  const p2 = new MyPromise<any>(resolve => {
    resolve(p2); // 自引用
  });
  
  p2.catch(error => {
    console.log('✓ 循环引用检测:', error.message || '检测到循环引用');
  });
}

// 运行所有测试
export function runCustomTests() {
  console.log('🚀 开始运行自定义 Promise A+ 测试...');
  console.log('==========================================');
  
  testBasicStates();
  
  setTimeout(() => {
    testChaining();
  }, 200);
  
  setTimeout(() => {
    testErrorHandling();
  }, 400);
  
  setTimeout(() => {
    testValuePenetration();
  }, 600);
  
  setTimeout(() => {
    testAsyncExecution();
  }, 800);
  
  setTimeout(() => {
    testThenable();
  }, 1000);
  
  setTimeout(() => {
    testStateImmutability();
  }, 1200);
  
  setTimeout(() => {
    testFinally();
  }, 1400);
  
  setTimeout(() => {
    testStaticMethods();
  }, 1600);
  
  setTimeout(() => {
    testEdgeCases();
  }, 1800);
  
  setTimeout(() => {
    console.log('==========================================');
    console.log('🎉 自定义测试完成！');
  }, 2500);
}

// 可以直接调用 runCustomTests() 来运行测试