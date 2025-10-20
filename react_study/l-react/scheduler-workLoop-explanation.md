# workLoop 和调度系统详解

## 核心问题：React 如何做到不阻塞主线程？

在 React 15 之前，渲染是递归的、不可中断的，大型组件树会导致页面卡顿。
Fiber 架构通过 **调度系统** 解决了这个问题。

---

## 一、调度系统的位置

### 在 l-react.js 中的位置

```javascript
// ========================================
// 第三部分：调度系统（第 226-370 行）
// ========================================

// 1. 全局状态变量（第 238-262 行）
let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

// 2. 核心调度函数 workLoop（第 288-308 行）
function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

// 3. 启动调度（第 319 行）
requestIdleCallback(workLoop);

// 4. 工作单元处理函数（第 338-370 行）
function performUnitOfWork(fiber) {
  // ...
}
```

---

## 二、workLoop 与 Fiber 的关系

### workLoop 如何与 Fiber 配合

```
Fiber 树结构：                workLoop 处理流程：

    App                       nextUnitOfWork = App
   /   \                      ↓ performUnitOfWork
  A     B          ====>      nextUnitOfWork = A
 /                            ↓ performUnitOfWork
C                             nextUnitOfWork = C
                              ↓ performUnitOfWork
                              nextUnitOfWork = B
                              ↓ performUnitOfWork
                              nextUnitOfWork = null
                              ↓ commitRoot
```

**关键点：**
1. **Fiber 是数据结构**：树形结构（用链表实现）
2. **workLoop 是调度器**：控制何时处理、何时暂停
3. **performUnitOfWork 是执行器**：处理单个 Fiber 节点

---

## 三、调度的核心：requestIdleCallback

### 什么是 requestIdleCallback？

```javascript
// 浏览器 API
requestIdleCallback(callback, options);
```

**作用：** 在浏览器空闲时执行回调函数

### 浏览器的一帧（16.6ms @ 60fps）

```
一帧的时间分配：
|←------------- 16.6ms -------------→|
|                                    |
| 输入事件 | 定时器 | requestAnimationFrame | 布局 | 绘制 | ← 必须完成
|                                    |
|          空闲时间（如果有）          | ← requestIdleCallback 在这里执行
|                                    |
```

**示例：**

```javascript
requestIdleCallback((deadline) => {
  console.log('空闲时间:', deadline.timeRemaining());
  // 输出可能是：空闲时间: 14.5ms（16.6ms - 已用时间）

  while (deadline.timeRemaining() > 1) {
    // 做一些工作...
  }
  // 时间用完，让出控制权，等待下一帧
});
```

---

## 四、workLoop 的工作原理（逐行解析）

### 完整代码

```javascript
function workLoop(deadline) {
  // 第 1 步：初始化让出标志
  let shouldYield = false;

  // 第 2 步：时间切片循环
  while (nextUnitOfWork && !shouldYield) {
    // 处理一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 检查是否应该让出控制权
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 第 3 步：检查是否完成，进入提交阶段
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // 第 4 步：继续调度，形成循环
  requestIdleCallback(workLoop);
}

// 启动调度（文件加载时执行）
requestIdleCallback(workLoop);
```

### 第 1 步：初始化让出标志

```javascript
let shouldYield = false;
```

**作用：** 标记是否应该让出主线程

**为什么需要？**
- 浏览器每帧只有 16.6ms
- 如果 React 占用太久，用户交互会卡顿
- 需要在适当时机"暂停"，让浏览器处理其他任务

---

### 第 2 步：时间切片循环（核心）

```javascript
while (nextUnitOfWork && !shouldYield) {
  // 2.1 处理当前工作单元
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

  // 2.2 检查剩余时间
  shouldYield = deadline.timeRemaining() < 1;
}
```

#### 2.1 处理工作单元

```javascript
nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
```

**做了什么？**

```javascript
// performUnitOfWork 内部流程
function performUnitOfWork(fiber) {
  // 1. 处理当前 fiber（创建 DOM、执行组件等）
  if (fiber.type instanceof Function) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 2. 返回下一个 fiber（深度优先遍历）
  if (fiber.child) return fiber.child;        // 优先子节点
  if (fiber.sibling) return fiber.sibling;    // 然后兄弟节点
  // ... 向上查找
  return null;  // 没有更多工作
}
```

**示例：**

```javascript
// 假设 Fiber 树：
//     App
//    /   \
//   A     B

// 第 1 次循环
nextUnitOfWork = App
nextUnitOfWork = performUnitOfWork(App)  // 返回 A

// 第 2 次循环
nextUnitOfWork = A
nextUnitOfWork = performUnitOfWork(A)    // 返回 B

// 第 3 次循环
nextUnitOfWork = B
nextUnitOfWork = performUnitOfWork(B)    // 返回 null

// 循环结束
```

#### 2.2 检查剩余时间（时间切片的关键）

```javascript
shouldYield = deadline.timeRemaining() < 1;
```

**deadline.timeRemaining()** 返回当前帧的剩余时间（毫秒）

**示例时间线：**

```
第 1 帧（16.6ms）：
  0ms  - 浏览器处理必要任务，剩余 14ms
  ↓
  workLoop 开始
  ├─ 处理 fiber A（耗时 3ms），剩余 11ms
  ├─ 处理 fiber B（耗时 3ms），剩余 8ms
  ├─ 处理 fiber C（耗时 3ms），剩余 5ms
  ├─ 处理 fiber D（耗时 3ms），剩余 2ms
  ├─ 处理 fiber E（耗时 3ms），剩余 -1ms  ← 超时！
  └─ shouldYield = true，退出循环

用户输入事件被处理...

第 2 帧（16.6ms）：
  workLoop 继续从 fiber F 开始
  ├─ 处理 fiber F（耗时 3ms），剩余 11ms
  ├─ 处理 fiber G（耗时 3ms），剩余 8ms
  └─ nextUnitOfWork = null，完成！
```

**关键：** 每处理完一个 fiber，都检查时间！

---

### 第 3 步：提交阶段

```javascript
if (!nextUnitOfWork && wipRoot) {
  commitRoot();
}
```

**条件分析：**

```javascript
// 条件 1：nextUnitOfWork === null
// 含义：所有工作单元已处理完成

// 条件 2：wipRoot !== null
// 含义：有待提交的工作树

// 两个条件同时满足 → 进入 Commit 阶段
```

**为什么分开 Render 和 Commit？**

```
Render 阶段（可中断）：
  ├─ 构建 Fiber 树
  ├─ diff 对比
  ├─ 标记副作用
  └─ 可以被高优先级任务打断

Commit 阶段（不可中断）：
  ├─ 操作真实 DOM
  ├─ 执行生命周期
  └─ 必须一次性完成，保证 UI 一致性
```

**示例：**

```javascript
// Render 阶段（分 3 帧完成，可中断）
帧 1: 处理 fiber A, B, C
帧 2: 用户点击，优先处理点击事件
帧 3: 继续处理 fiber D, E, F

// Commit 阶段（一次性完成，不可中断）
帧 4: 一次性将所有变更应用到 DOM
```

---

### 第 4 步：循环调度

```javascript
requestIdleCallback(workLoop);
```

**为什么在函数内部调用自己？**

```javascript
function workLoop(deadline) {
  // 处理工作...

  // 无论工作是否完成，都继续注册
  requestIdleCallback(workLoop);
}
```

**形成事件循环：**

```
初始化：
requestIdleCallback(workLoop)
  ↓
帧 1: workLoop 被调用
  ├─ 处理部分工作
  └─ requestIdleCallback(workLoop)  ← 注册下次
      ↓
帧 2: workLoop 被调用
  ├─ 继续处理工作
  └─ requestIdleCallback(workLoop)  ← 注册下次
      ↓
帧 3: workLoop 被调用
  ├─ 完成所有工作
  └─ requestIdleCallback(workLoop)  ← 仍然注册（等待下次渲染）
      ↓
闲置状态，等待新的渲染任务...
```

**关键：** 形成持续运行的调度循环，随时准备处理新任务！

---

## 五、完整调度流程示例

### 场景：用户点击按钮，count 从 0 变为 1

```javascript
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(1)}>{count}</button>;
}
```

### 时间线分析

```javascript
// ========== T0: 用户点击 ==========
onClick 触发
  ↓
setState(1)
  ↓
// setState 内部
wipRoot = {
  dom: currentRoot.dom,
  props: currentRoot.props,
  alternate: currentRoot,
};
nextUnitOfWork = wipRoot;  // ← 设置工作起点
deletions = [];

// ========== T1: 浏览器空闲，workLoop 被调用 ==========
function workLoop(deadline) {
  // deadline.timeRemaining() = 14ms

  let shouldYield = false;

  // 循环 1
  nextUnitOfWork = wipRoot
  nextUnitOfWork = performUnitOfWork(wipRoot)  // → Counter fiber
  shouldYield = 14 - 2 < 1  // false，继续

  // 循环 2
  nextUnitOfWork = Counter fiber
  nextUnitOfWork = performUnitOfWork(Counter fiber)  // → button fiber
  shouldYield = 12 - 2 < 1  // false，继续

  // 循环 3
  nextUnitOfWork = button fiber
  nextUnitOfWork = performUnitOfWork(button fiber)  // → text fiber
  shouldYield = 10 - 2 < 1  // false，继续

  // 循环 4
  nextUnitOfWork = text fiber
  nextUnitOfWork = performUnitOfWork(text fiber)  // → null
  shouldYield = 8 - 2 < 1  // false，继续

  // 循环结束（nextUnitOfWork 为 null）

  // 检查提交条件
  if (!nextUnitOfWork && wipRoot) {  // true
    commitRoot();  // ← 进入 Commit 阶段
  }

  requestIdleCallback(workLoop);  // ← 注册下次
}

// ========== T2: Commit 阶段 ==========
function commitRoot() {
  commitWork(wipRoot.child);  // 递归更新 DOM

  currentRoot = wipRoot;  // 保存
  wipRoot = null;         // 清空
}

// DOM 更新完成，用户看到 count 变为 1
```

---

## 六、调度系统的关键实现

### 1. requestIdleCallback（浏览器 API）

**位置：** 第 319 行

```javascript
requestIdleCallback(workLoop);
```

**作用：**
- 在浏览器空闲时调用 `workLoop`
- 传入 `deadline` 对象，包含 `timeRemaining()` 方法

**真实 React 的实现：**
- 使用自己的调度器（`Scheduler` 包）
- 支持优先级队列（高优先级任务插队）
- 处理饥饿问题（低优先级任务不会永远等待）

---

### 2. 时间切片（Time Slicing）

**位置：** 第 298 行

```javascript
shouldYield = deadline.timeRemaining() < 1;
```

**原理：**
- 每处理完一个 fiber，检查剩余时间
- 小于 1ms 时，让出控制权
- 下一帧继续处理

**为什么是 1ms？**
- 经验值，给浏览器留出缓冲
- 避免超时导致掉帧

---

### 3. 可中断渲染（Interruptible Rendering）

**位置：** 第 293-299 行

```javascript
while (nextUnitOfWork && !shouldYield) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  shouldYield = deadline.timeRemaining() < 1;
}
```

**实现：**
- 通过 `while` 循环 + `shouldYield` 标志
- 随时可以跳出循环，保存进度（`nextUnitOfWork`）
- 下次从保存的位置继续

---

### 4. 双阶段提交（Two-Phase Commit）

**位置：** 第 302-304 行

```javascript
if (!nextUnitOfWork && wipRoot) {
  commitRoot();  // 不可中断的提交阶段
}
```

**分离原因：**
```
Render 阶段：
  - 可以被打断
  - 可以重复执行
  - 不操作 DOM

Commit 阶段：
  - 不能被打断
  - 只执行一次
  - 操作真实 DOM
```

---

## 七、调度系统的核心变量

### 全局状态（第 238-262 行）

```javascript
let nextUnitOfWork = null;   // 下一个工作单元（指针）
let wipRoot = null;          // 工作中的根 fiber
let currentRoot = null;      // 已提交的根 fiber
let deletions = null;        // 待删除的 fiber 列表
```

### 调度相关函数

| 函数 | 位置 | 作用 |
|------|------|------|
| `workLoop` | 288-308 行 | 核心调度循环 |
| `performUnitOfWork` | 338-370 行 | 处理单个工作单元 |
| `commitRoot` | 549-561 行 | 提交阶段入口 |
| `commitWork` | 580-608 行 | 递归提交单个 fiber |

---

## 八、总结

### workLoop 与 Fiber 的关系

```
Fiber：数据结构
  ├─ 树形结构（链表实现）
  ├─ 每个节点是一个工作单元
  └─ 通过 child/sibling/parent 连接

workLoop：调度器
  ├─ 决定何时处理 fiber
  ├─ 决定何时暂停
  └─ 通过 performUnitOfWork 遍历 fiber 树
```

### 调度实现的核心

1. **requestIdleCallback**（第 319 行）
   - 在浏览器空闲时执行

2. **时间切片**（第 298 行）
   - `deadline.timeRemaining() < 1`

3. **可中断**（第 293-299 行）
   - `while` 循环 + `shouldYield`

4. **双阶段**（第 302-304 行）
   - Render（可中断）+ Commit（不可中断）

### 完整流程

```
初始化 → workLoop 循环 → Render 阶段 → Commit 阶段
   ↓                         ↓              ↓
启动调度    时间切片 + 可中断    一次性完成
```

这就是 React 调度系统的完整实现！虽然简化，但核心思想和真实 React 完全一致！
