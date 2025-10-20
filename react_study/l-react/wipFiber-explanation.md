# wipFiber 详解

## 问题：wipFiber 是干什么用的？

`wipFiber` 是 **Hooks 系统的上下文变量**，它解决了一个关键问题：**useState 如何知道自己属于哪个组件？**

---

## 核心问题

当你在组件中调用 `useState` 时：

```javascript
function Counter() {
  const [count, setCount] = useState(0);  // ← useState 怎么知道这是 Counter 组件的状态？
  const [name, setName] = useState('');   // ← 怎么区分这是第二个 useState？

  return ...
}
```

**问题：**
1. `useState` 是一个普通函数，它怎么知道自己在哪个组件中被调用？
2. 多个 `useState` 调用，状态存储在哪里？
3. 组件重新渲染时，如何找回之前的状态？

---

## 解决方案：wipFiber + hookIndex

React 使用 **全局变量** 来跟踪当前正在执行的组件：

```javascript
let wipFiber = null;      // 当前正在处理的组件 fiber
let hookIndex = null;     // 当前 hook 的索引
```

---

## 工作流程（完整示例）

### 步骤 1：开始处理函数组件

```javascript
function updateFunctionComponent(fiber) {
  // 设置全局上下文
  wipFiber = fiber;           // ← 告诉 hooks 系统：现在正在处理这个 fiber
  hookIndex = 0;              // ← 重置索引，准备收集 hooks
  wipFiber.hooks = [];        // ← 初始化这个 fiber 的 hooks 数组

  // 执行组件函数
  const children = [fiber.type(fiber.props)];

  reconcileChildren(fiber, children);
}
```

**关键点：**
- 在执行组件函数 **之前**，先设置 `wipFiber` 和 `hookIndex`
- 这样组件内部调用的 `useState` 就能通过这些全局变量找到对应的 fiber

---

### 步骤 2：组件执行时调用 useState

```javascript
// 假设组件是这样的
function Counter() {
  const [count, setCount] = useState(0);    // 第 1 次调用 useState
  const [name, setName] = useState('Tom');  // 第 2 次调用 useState
  return ...
}

// useState 内部
function useState(initial) {
  // 通过 wipFiber 获取当前组件的旧 hooks
  const oldHook =
    wipFiber.alternate &&              // wipFiber.alternate 是上一次的 fiber
    wipFiber.alternate.hooks &&        // 上一次的 hooks 数组
    wipFiber.alternate.hooks[hookIndex]; // 根据索引找到对应的旧 hook

  // 创建新 hook
  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  // ... 执行队列中的更新 ...

  // 关键：将 hook 存储到当前 fiber 的 hooks 数组中
  wipFiber.hooks.push(hook);  // ← 通过 wipFiber 存储状态

  // 索引递增，为下一个 useState 做准备
  hookIndex++;                // ← 0 -> 1 -> 2 ...

  return [hook.state, setState];
}
```

---

## 详细执行流程（图解）

```
时间线：Counter 组件首次渲染

1. performUnitOfWork(Counter 的 fiber)
   │
   ├─ updateFunctionComponent(fiber)
   │  │
   │  ├─ wipFiber = fiber          ← 设置全局上下文
   │  ├─ hookIndex = 0             ← 重置索引
   │  ├─ wipFiber.hooks = []       ← 初始化 hooks 数组
   │  │
   │  └─ Counter(props)            ← 执行组件函数
   │     │
   │     ├─ useState(0) 被调用     ← 第 1 次
   │     │  │
   │     │  ├─ 读取 wipFiber.alternate.hooks[0]  (undefined，首次渲染)
   │     │  ├─ 创建 hook: { state: 0, queue: [] }
   │     │  ├─ wipFiber.hooks.push(hook)  ← 存到 hooks[0]
   │     │  └─ hookIndex++  (0 -> 1)
   │     │
   │     ├─ useState('Tom') 被调用  ← 第 2 次
   │     │  │
   │     │  ├─ 读取 wipFiber.alternate.hooks[1]  (undefined，首次渲染)
   │     │  ├─ 创建 hook: { state: 'Tom', queue: [] }
   │     │  ├─ wipFiber.hooks.push(hook)  ← 存到 hooks[1]
   │     │  └─ hookIndex++  (1 -> 2)
   │     │
   │     └─ 返回 JSX
   │
   └─ reconcileChildren(...)

结果：
fiber.hooks = [
  { state: 0, queue: [] },      // ← 第 1 个 useState
  { state: 'Tom', queue: [] }   // ← 第 2 个 useState
]
```

---

## 为什么需要 wipFiber？

### 问题：没有 wipFiber 会怎样？

如果没有 `wipFiber`，`useState` 无法知道：
1. 状态应该存储在哪个 fiber 上
2. 应该读取哪个 fiber 的旧状态
3. setState 应该触发哪个组件重新渲染

### 解决方案：全局上下文

`wipFiber` 就像一个 **全局上下文指针**，告诉 hooks：
- "现在正在处理这个组件"
- "所有 hook 的状态都存在这个 fiber 上"
- "更新状态时，重新渲染这个 fiber"

---

## wipFiber 的完整生命周期

```javascript
// 1. 初始化（全局变量）
let wipFiber = null;
let hookIndex = null;

// 2. 开始处理组件 A
updateFunctionComponent(fiberA) {
  wipFiber = fiberA;      // ← 设置为 A
  hookIndex = 0;
  wipFiber.hooks = [];

  ComponentA(props);      // 组件 A 的所有 useState 都会访问 fiberA
}

// 3. 处理组件 A 的子组件 B
updateFunctionComponent(fiberB) {
  wipFiber = fiberB;      // ← 切换为 B（覆盖之前的值）
  hookIndex = 0;
  wipFiber.hooks = [];

  ComponentB(props);      // 组件 B 的所有 useState 都会访问 fiberB
}

// 4. 处理下一个组件 C...
updateFunctionComponent(fiberC) {
  wipFiber = fiberC;      // ← 切换为 C
  hookIndex = 0;
  wipFiber.hooks = [];

  ComponentC(props);
}
```

**关键：**
- `wipFiber` 是一个 **临时变量**，每次处理新组件时都会被覆盖
- 它只在组件执行期间有效，用于建立 hooks 和 fiber 的连接
- 一旦组件执行完毕，hooks 就已经存储到 `fiber.hooks` 数组中了

---

## 为什么 Hooks 必须按顺序调用？

因为 hooks 通过 **索引（hookIndex）** 来匹配状态！

### ❌ 错误示例：条件调用

```javascript
function Counter() {
  const [count, setCount] = useState(0);

  if (count > 0) {
    const [name, setName] = useState('');  // ❌ 条件调用
  }

  const [age, setAge] = useState(18);

  return ...
}
```

**问题：**

首次渲染（count = 0）：
```
hooks[0] = { state: 0 }      // count
hooks[1] = { state: 18 }     // age
```

第二次渲染（count = 1）：
```
hooks[0] = { state: 0 }      // count
hooks[1] = { state: '' }     // name  ← 新增
hooks[2] = { state: 18 }     // age   ← 索引错位！
```

**结果：** age 的状态错乱，因为索引从 1 变成了 2！

---

## setState 如何使用 wipFiber？

虽然 `setState` 本身不直接使用 `wipFiber`，但它通过 **闭包** 记住了自己所属的 fiber：

```javascript
function useState(initial) {
  // ...

  const setState = action => {
    hook.queue.push(action);

    // 触发重新渲染
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,  // ← 指向当前的 fiber 树
    };

    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  return [hook.state, setState];
}
```

**关键：**
- `setState` 创建时，`hook` 已经通过 `wipFiber.hooks.push(hook)` 存储了
- 下次渲染时，通过 `alternate` 可以找回这个 hook
- 这就是为什么 `setState` 总是能更新正确的状态

---

## 总结

### wipFiber 的三大作用

1. **上下文指针**
   - 告诉 hooks 当前正在处理哪个组件

2. **状态存储位置**
   - `wipFiber.hooks` 数组存储组件的所有 hook

3. **状态恢复桥梁**
   - 通过 `wipFiber.alternate` 找到上一次的状态

### 关键理解

```javascript
wipFiber = fiber              // "现在处理这个组件"
wipFiber.hooks = []           // "准备收集 hooks"
wipFiber.hooks.push(hook)     // "存储到这个组件"
wipFiber.alternate.hooks[i]   // "读取上一次的状态"
```

### 类比

把 `wipFiber` 想象成一个 **临时工作台**：
- 开始加工零件前，把工作台设置好（`wipFiber = fiber`）
- 加工过程中，所有零件都放在这个工作台上（`wipFiber.hooks.push`）
- 加工下一个零件时，更换工作台（`wipFiber = nextFiber`）
- 零件加工完成后，永久存储在仓库里（`fiber.hooks`）

这就是 `wipFiber` 的全部秘密！
