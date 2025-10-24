# 如何测试 Promise A+ 规范符合性

本文档介绍如何测试我们实现的 MyPromise 是否符合 Promise A+ 规范。

## 目录

1. [Promise A+ 规范简介](#promise-a-规范简介)
2. [官方测试套件](#官方测试套件)
3. [适配器实现](#适配器实现)
4. [自定义测试用例](#自定义测试用例)
5. [运行测试](#运行测试)

## Promise A+ 规范简介

Promise A+ 规范是一个开放标准，定义了 Promise 的行为规范。主要包括：

- **状态管理**：pending、fulfilled、rejected 三种状态
- **状态转换**：只能从 pending 转换到其他状态，且不可逆
- **then 方法**：必须返回新的 Promise，支持链式调用
- **值穿透**：非函数参数的处理
- **异步执行**：回调必须异步执行
- **异常处理**：正确处理各种异常情况

## 官方测试套件

Promise A+ 规范提供了官方测试套件 `promises-aplus-tests`，包含 872 个测试用例。

### 安装测试套件

```bash
npm install promises-aplus-tests --save-dev
```

### 测试套件特点

- **全面性**：覆盖规范的所有要求
- **严格性**：测试边界情况和异常处理
- **权威性**：由规范制定者维护
- **标准化**：业界公认的测试标准

## 适配器实现

要使用官方测试套件，需要创建一个适配器文件，将我们的 MyPromise 适配到测试套件的接口。

### 创建适配器文件

```typescript
// promise-adapter.ts
import { MyPromise } from './promise';

// Promise A+ 测试套件需要的适配器接口
interface PromiseAdapter {
  resolved(value?: any): MyPromise<any>;
  rejected(reason?: any): MyPromise<any>;
  deferred(): {
    promise: MyPromise<any>;
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  };
}

const adapter: PromiseAdapter = {
  // 创建已解决的 Promise
  resolved(value?: any): MyPromise<any> {
    return MyPromise.resolve(value);
  },

  // 创建已拒绝的 Promise
  rejected(reason?: any): MyPromise<any> {
    return MyPromise.reject(reason);
  },

  // 创建延迟对象（可外部控制的 Promise）
  deferred() {
    let resolve: (value?: any) => void;
    let reject: (reason?: any) => void;
    
    const promise = new MyPromise<any>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    
    return {
      promise,
      resolve: resolve!,
      reject: reject!
    };
  }
};

module.exports = adapter;
```

### 适配器说明

1. **resolved**：创建已解决状态的 Promise
2. **rejected**：创建已拒绝状态的 Promise  
3. **deferred**：创建可外部控制的 Promise，类似 withResolvers

## 自定义测试用例

除了官方测试套件，我们还可以编写自定义测试用例来验证特定功能。

### 基础功能测试

```typescript
// custom-tests.ts
import { MyPromise } from './promise';

// 测试基本状态转换
function testBasicStates() {
  console.log('=== 测试基本状态转换 ===');
  
  // 测试 resolve
  const p1 = new MyPromise((resolve) => {
    setTimeout(() => resolve('success'), 100);
  });
  
  p1.then(value => {
    console.log('✓ Resolve 测试通过:', value);
  });
  
  // 测试 reject
  const p2 = new MyPromise((_, reject) => {
    setTimeout(() => reject('error'), 100);
  });
  
  p2.catch(reason => {
    console.log('✓ Reject 测试通过:', reason);
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
}

// 测试异常处理
function testErrorHandling() {
  console.log('=== 测试异常处理 ===');
  
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
}

// 测试值穿透
function testValuePenetration() {
  console.log('=== 测试值穿透 ===');
  
  MyPromise.resolve('original')
    .then(null) // 非函数，应该穿透
    .then(value => {
      console.log('✓ 值穿透测试通过:', value); // 应该是 'original'
    });
}

// 测试异步执行
function testAsyncExecution() {
  console.log('=== 测试异步执行 ===');
  
  let order: string[] = [];
  
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
}

// 运行所有测试
export function runCustomTests() {
  testBasicStates();
  testChaining();
  testErrorHandling();
  testValuePenetration();
  testAsyncExecution();
  testThenable();
}
```

### 性能测试

```typescript
// performance-tests.ts
import { MyPromise } from './promise';

// 测试大量 Promise 的性能
function testPerformance() {
  console.log('=== 性能测试 ===');
  
  const count = 10000;
  const start = Date.now();
  
  const promises = Array.from({ length: count }, (_, i) => 
    MyPromise.resolve(i)
  );
  
  MyPromise.all(promises)
    .then(() => {
      const end = Date.now();
      console.log(`✓ 创建并解决 ${count} 个 Promise 耗时: ${end - start}ms`);
    });
}

// 测试内存使用
function testMemoryUsage() {
  console.log('=== 内存测试 ===');
  
  // 创建长链式调用
  let promise = MyPromise.resolve(0);
  
  for (let i = 0; i < 1000; i++) {
    promise = promise.then(value => value + 1);
  }
  
  promise.then(value => {
    console.log('✓ 长链式调用测试通过，最终值:', value);
  });
}

export function runPerformanceTests() {
  testPerformance();
  testMemoryUsage();
}
```

## 运行测试

### 1. 运行官方测试套件

```bash
# 安装依赖
npm install promises-aplus-tests --save-dev

# 运行测试
npx promises-aplus-tests promise-adapter.js
```

### 2. 运行自定义测试

```typescript
// test-runner.ts
import { runCustomTests } from './custom-tests';
import { runPerformanceTests } from './performance-tests';

console.log('开始运行 Promise A+ 符合性测试...');

// 运行自定义测试
runCustomTests();

// 运行性能测试
setTimeout(() => {
  runPerformanceTests();
}, 2000);
```

### 3. 集成到 package.json

```json
{
  "scripts": {
    "test:aplus": "promises-aplus-tests promise-adapter.js",
    "test:custom": "ts-node test-runner.ts",
    "test:all": "npm run test:custom && npm run test:aplus"
  }
}
```

## 测试要点

### 关键测试场景

1. **状态不可逆性**：确保状态只能改变一次
2. **异步执行**：then 回调必须异步执行
3. **链式调用**：then 必须返回新的 Promise
4. **值穿透**：非函数参数的正确处理
5. **异常处理**：各种异常情况的正确处理
6. **Thenable 处理**：正确处理返回 thenable 对象的情况

### 常见问题

1. **同步执行问题**：then 回调必须异步执行
2. **状态泄露**：已完成的 Promise 状态被意外修改
3. **内存泄漏**：回调队列没有正确清理
4. **类型错误**：TypeScript 类型定义不正确
5. **异常吞没**：异常没有正确传播

## 测试结果解读

### 官方测试套件结果

- **872 passing**：完全符合 Promise A+ 规范
- **部分失败**：需要检查具体失败的测试用例
- **全部失败**：基础实现有问题

### 自定义测试结果

- **功能测试**：验证基本功能是否正常
- **性能测试**：评估性能表现
- **边界测试**：验证边界情况处理

## 总结

通过官方测试套件和自定义测试用例的组合，可以全面验证 Promise 实现的正确性：

1. **官方测试套件**：确保符合规范
2. **自定义测试**：验证特定功能
3. **性能测试**：评估实际使用效果
4. **持续测试**：在开发过程中持续验证

这样的测试策略可以确保我们的 MyPromise 实现既符合标准又满足实际需求。