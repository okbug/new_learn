# Promise 实现总结

本文档总结了 `promise.ts` 文件中实现的各种 Promise 相关功能，包括工具函数、Promise A+ 规范实现以及静态方法。

## 目录

1. [工具函数](#工具函数)
2. [Promise 静态方法实现](#promise-静态方法实现)
3. [MyPromise 类实现](#mypromise-类实现)
4. [使用示例](#使用示例)

## 工具函数

### isPromise

```typescript
function isPromise(value: any): value is PromiseLike<any>
```

**功能说明：**
- 类型守卫函数，用于判断一个值是否为 Promise 或 thenable 对象
- 通过检查对象是否存在且具有 `then` 方法来判断
- 返回类型守卫，帮助 TypeScript 进行类型推断

**实现原理：**
检查传入的值是否为真值且具有 `then` 方法，符合 thenable 接口规范。

## Promise 静态方法实现

### Promise.all

```typescript
function all<T>(promises: (Promise<T> | T)[]): Promise<T[]>
```

**功能说明：**
- 等待所有 Promise 完成，返回包含所有结果的数组
- 如果任何一个 Promise 被拒绝，整个 `all` 操作立即被拒绝
- 结果数组的顺序与输入数组的顺序一致
- 支持混合类型数组（Promise 和非 Promise 值）

**实现原理：**
1. 空数组直接返回空结果
2. 使用计数器跟踪完成的 Promise 数量
3. 使用索引确保结果顺序正确
4. 任何一个 Promise 失败都会导致整体失败

### Promise.race

```typescript
function race<T>(promises: (Promise<T> | T)[]): Promise<T>
```

**功能说明：**
- 返回第一个完成（无论成功或失败）的 Promise 结果
- 一旦有任何一个 Promise 完成，立即返回其结果
- 支持混合类型数组

**实现原理：**
1. 遍历所有输入值
2. 非 Promise 值立即返回
3. Promise 值注册 then/catch 回调
4. 第一个完成的 Promise 决定最终结果

### Promise.allSettled

```typescript
function allSettled<T>(promises: (Promise<T> | T)[]): Promise<({ status: 'fulfilled', value: T } | { status: 'rejected', reason: any })[]>
```

**功能说明：**
- 等待所有 Promise 完成，无论成功或失败
- 返回包含每个 Promise 状态和结果的对象数组
- 永远不会被拒绝，总是返回所有结果

**实现原理：**
1. 为每个 Promise 创建状态对象
2. 成功时记录 `{ status: 'fulfilled', value: T }`
3. 失败时记录 `{ status: 'rejected', reason: any }`
4. 等待所有 Promise 完成后返回结果数组

### Promise.any

```typescript
function any<T>(promises: (Promise<T> | T)[]): Promise<T>
```

**功能说明：**
- 返回第一个成功的 Promise 结果
- 只有当所有 Promise 都失败时才会被拒绝
- 失败时抛出 `AggregateError`，包含所有错误信息

**实现原理：**
1. 空数组直接拒绝
2. 非 Promise 值立即返回
3. 跟踪失败的 Promise 数量和错误
4. 第一个成功的 Promise 决定结果
5. 所有都失败时抛出 `AggregateError`

### withResolver 和 withResolvers

```typescript
function withResolver<T>(): { resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, promise: Promise<T> }
function withResolvers<T>(): { resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void, promise: Promise<T> }
```

**功能说明：**
- 创建一个 Promise 并返回其 resolve 和 reject 函数
- 允许在 Promise 构造函数外部控制 Promise 的状态
- `withResolvers` 是 `withResolver` 的别名，符合新的 Web 标准

**实现原理：**
1. 创建 Promise 并捕获 resolve/reject 函数
2. 返回包含 promise、resolve、reject 的对象
3. 允许外部代码控制 Promise 的完成

## MyPromise 类实现

### 核心特性

`MyPromise` 类实现了完整的 Promise A+ 规范，包括：

#### 状态管理
- `pending`：初始状态
- `fulfilled`：成功状态
- `rejected`：失败状态
- 状态只能从 pending 转换到 fulfilled 或 rejected，且不可逆

#### 构造函数

```typescript
constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void)
```

**实现要点：**
1. 接收 executor 函数并立即执行
2. 提供 resolve 和 reject 函数
3. 处理 thenable 对象的递归解析
4. 捕获 executor 执行中的异常
5. 确保状态只能改变一次

#### then 方法

```typescript
then<TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
): MyPromise<TResult1 | TResult2>
```

**实现要点：**
1. 返回新的 MyPromise 实例，支持链式调用
2. 处理已完成状态的立即执行（使用 setTimeout 确保异步）
3. 处理 pending 状态的回调队列
4. 异常处理和类型转换
5. 支持值穿透（当回调不是函数时）

#### catch 方法

```typescript
catch<TResult = never>(onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null): MyPromise<T | TResult>
```

**实现要点：**
- 基于 then 方法实现，传入 null 作为 onFulfilled 参数
- 专门用于处理错误情况

#### finally 方法

```typescript
finally(onFinally?: (() => void) | null): MyPromise<T>
```

**实现要点：**
1. 无论成功或失败都会执行 onFinally 回调
2. 不改变 Promise 的值或状态
3. 如果 onFinally 抛出异常，会改变 Promise 状态

#### 静态方法

**MyPromise.resolve**
- 创建已解决的 Promise
- 支持 thenable 对象的自动解析

**MyPromise.reject**
- 创建已拒绝的 Promise
- 直接使用提供的原因

**MyPromise.all 和 MyPromise.race**
- 基于实例方法实现
- 使用 MyPromise.resolve 统一处理输入值

### 关键技术细节

#### 异步执行
使用 `setTimeout` 确保回调函数异步执行，符合 Promise A+ 规范要求。

#### 回调队列管理
- `onFulfilledCallbacks`：存储成功回调
- `onRejectedCallbacks`：存储失败回调
- 状态改变时清空队列，避免内存泄漏

#### Thenable 处理
正确处理返回 thenable 对象的情况，递归解析直到获得最终值。

#### 类型安全
完整的 TypeScript 类型定义，支持泛型和类型推断。

## 使用示例

文件中包含了完整的测试示例，展示了：

1. **基本 Promise 使用**：创建、链式调用、错误处理
2. **静态方法测试**：resolve、reject、all、race
3. **异步操作模拟**：使用 setTimeout 模拟异步任务

### 运行测试

取消注释 `testPromise()` 调用即可运行所有测试用例：

```typescript
// 取消注释下面这行来运行测试
testPromise();
```

## 总结

这个实现提供了：

1. **完整的 Promise A+ 规范实现**
2. **所有主要的 Promise 静态方法**
3. **类型安全的 TypeScript 实现**
4. **良好的错误处理机制**
5. **完整的测试示例**

该实现可以作为学习 Promise 内部机制的参考，也可以在不支持原生 Promise 的环境中使用。