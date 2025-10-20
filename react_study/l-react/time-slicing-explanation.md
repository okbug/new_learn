# 时间切片（Time Slicing）原理详解

## 核心问题：什么是时间切片？

**时间切片**：将一个大任务拆分成多个小任务，每个小任务执行完后检查是否需要暂停，让出主线程给浏览器处理其他任务（如用户交互、动画等）。

---

## 一、为什么需要时间切片？

### 问题：老版 React 的阻塞渲染

```javascript
// React 15 的递归渲染（伪代码）
function renderComponent(component) {
  const children = component.render();

  children.forEach(child => {
    renderComponent(child);  // 递归调用，无法中断！
  });

  // 直到整棵树遍历完才结束
}
```

**问题演示：**

```
组件树有 1000 个节点，每个节点处理需要 1ms

总耗时 = 1000ms = 1 秒

在这 1 秒内：
❌ 用户点击无响应
❌ 输入框打字卡顿
❌ 动画停止
❌ 页面完全卡死
```

### 解决方案：时间切片

```
将 1000 个节点分成多个批次处理：

帧 1 (16.6ms): 处理 15 个节点，让出控制权
    ↓ 浏览器处理用户输入、动画等
帧 2 (16.6ms): 处理 15 个节点，让出控制权
    ↓ 浏览器处理用户输入、动画等
帧 3 (16.6ms): 处理 15 个节点，让出控制权
    ↓ 继续...

总耗时仍是 ~1 秒，但用户感觉流畅！
```

---

## 二、时间切片的实现（三个关键要素）

### 要素 1：浏览器 API - requestIdleCallback

**定义：** 在浏览器空闲时执行回调

```javascript
requestIdleCallback((deadline) => {
  // deadline 是一个对象
  console.log(deadline.timeRemaining());  // 剩余的空闲时间（毫秒）
});
```

#### 浏览器的一帧（60fps = 16.6ms）

```
|←---------------- 16.6ms ---------------→|
|                                         |
| 1. 输入事件处理 (Input Events)           | 必须完成
| 2. 定时器执行 (Timers)                   | 必须完成
| 3. requestAnimationFrame                | 必须完成
| 4. 布局计算 (Layout)                     | 必须完成
| 5. 绘制 (Paint)                         | 必须完成
|                                         |
|-- 如果还有剩余时间 ----------------------|
|                                         |
| 6. requestIdleCallback ← 在这里执行      | 可选的
|                                         |
|←---------------- 下一帧 ---------------→|
```

**真实示例：**

```javascript
function heavyTask() {
  console.log('开始执行');

  requestIdleCallback((deadline) => {
    console.log('剩余时间:', deadline.timeRemaining());
    // 输出可能是：剩余时间: 14.5ms

    while (deadline.timeRemaining() > 0) {
      // 做一些工作
      console.log('处理中...');
    }

    console.log('时间用完，暂停');
  });
}
```

---

### 要素 2：可中断的循环

**对比：不可中断 vs 可中断**

#### ❌ 不可中断（递归）

```javascript
function render(node) {
  // 处理当前节点
  processNode(node);

  // 递归处理子节点 - 无法中断！
  node.children.forEach(child => {
    render(child);  // 一旦进入，必须全部完成
  });
}

// 问题：整个递归栈必须执行完
render(rootNode);  // 可能耗时 1 秒，期间无法暂停
```

#### ✅ 可中断（while 循环 + 指针）

```javascript
let nextWork = rootNode;  // 工作指针

function workLoop(deadline) {
  // 可以随时跳出的 while 循环
  while (nextWork && deadline.timeRemaining() > 1) {
    nextWork = performWork(nextWork);  // 处理一个，返回下一个
  }

  // 时间用完，nextWork 保存了下次的起点
  if (nextWork) {
    requestIdleCallback(workLoop);  // 继续下一帧
  }
}

function performWork(node) {
  processNode(node);
  return getNextNode(node);  // 返回下一个要处理的节点
}
```

**关键差异：**

```
递归：
render(A)
  └─ render(B)  ← 进入递归栈，无法退出
      └─ render(C)
          └─ ...

While 循环：
nextWork = A → 处理 → 检查时间 ✓
nextWork = B → 处理 → 检查时间 ✓
nextWork = C → 处理 → 检查时间 ✗ 时间不够，退出！
                               ↓
                         保存 nextWork = C
                               ↓
                         下一帧从 C 继续
```

---

### 要素 3：工作单元（Unit of Work）

**概念：** 将大任务拆分成多个小任务

```javascript
// 大任务：渲染 1000 个组件
整个组件树 (1000ms)

// 拆分成小任务
组件 1 (1ms)
组件 2 (1ms)
组件 3 (1ms)
...
组件 1000 (1ms)
```

**在 Fiber 中：** 每个 Fiber 节点就是一个工作单元

```javascript
// performUnitOfWork 处理一个工作单元
function performUnitOfWork(fiber) {
  // 1. 处理当前 fiber（创建 DOM、执行组件）
  if (fiber.type instanceof Function) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  // 2. 返回下一个工作单元
  if (fiber.child) return fiber.child;
  if (fiber.sibling) return fiber.sibling;
  // ...
  return null;
}
```

---

## 三、l-react.js 中的时间切片实现

### 完整代码分析

```javascript
// ========== 第 1 步：启动调度 ==========
requestIdleCallback(workLoop);
//                   ↑
//                   传入调度函数

// ========== 第 2 步：调度循环 ==========
function workLoop(deadline) {
  //             ↑
  //             deadline 对象，包含 timeRemaining() 方法

  let shouldYield = false;

  // ========== 第 3 步：可中断循环 ==========
  while (nextUnitOfWork && !shouldYield) {
    //    ↑               ↑
    //    有工作          还有时间

    // 处理一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // ========== 第 4 步：时间检查（时间切片的核心）==========
    shouldYield = deadline.timeRemaining() < 1;
    //            ↑
    //            检查剩余时间
    //            < 1ms 就暂停
  }

  // ========== 第 5 步：继续或提交 ==========
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();  // 工作完成，提交
  }

  requestIdleCallback(workLoop);  // 继续调度循环
}
```

### 时间切片的核心：第 298 行

```javascript
shouldYield = deadline.timeRemaining() < 1;
```

**这一行做了什么？**

```javascript
deadline.timeRemaining()  // 浏览器告诉我们：当前帧还剩多少时间
// 返回值示例：
// 14.5ms  → 还有很多时间，继续工作
// 5.2ms   → 还有一些时间，继续工作
// 0.8ms   → 时间不够了，应该暂停
// 0ms     → 已经超时，立即暂停

< 1  // 判断是否小于 1ms
// 为什么是 1ms？
// - 这是一个安全阈值
// - 给浏览器留出处理其他任务的缓冲时间
// - 避免超时导致掉帧

shouldYield = true/false
// true：时间不够，退出 while 循环
// false：时间充足，继续处理下一个 fiber
```

---

## 四、完整执行示例

### 场景：渲染一个组件树

```javascript
function App() {
  return (
    <div>
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

// Fiber 树结构：
//     App
//      |
//     div
//    / | \
//   H  C  F
```

### 时间切片执行流程

```javascript
// ========== 帧 1：浏览器空闲 14ms ==========

requestIdleCallback((deadline) => {
  console.log('帧 1 开始，剩余:', deadline.timeRemaining());  // 14ms

  workLoop(deadline);
});

function workLoop(deadline) {
  let shouldYield = false;

  // ----- 循环 1 -----
  console.log('处理 App fiber');
  nextUnitOfWork = performUnitOfWork(App);  // 返回 div
  // 假设耗时 2ms

  console.log('检查时间:', deadline.timeRemaining());  // 12ms
  shouldYield = 12 < 1;  // false，继续

  // ----- 循环 2 -----
  console.log('处理 div fiber');
  nextUnitOfWork = performUnitOfWork(div);  // 返回 Header
  // 假设耗时 2ms

  console.log('检查时间:', deadline.timeRemaining());  // 10ms
  shouldYield = 10 < 1;  // false，继续

  // ----- 循环 3 -----
  console.log('处理 Header fiber');
  nextUnitOfWork = performUnitOfWork(Header);  // 返回 Content
  // 假设耗时 2ms

  console.log('检查时间:', deadline.timeRemaining());  // 8ms
  shouldYield = 8 < 1;  // false，继续

  // ----- 循环 4 -----
  console.log('处理 Content fiber');
  nextUnitOfWork = performUnitOfWork(Content);  // 返回 Footer
  // 假设耗时 2ms

  console.log('检查时间:', deadline.timeRemaining());  // 6ms
  shouldYield = 6 < 1;  // false，继续

  // ----- 循环 5 -----
  console.log('处理 Footer fiber');
  nextUnitOfWork = performUnitOfWork(Footer);  // 返回 null
  // 假设耗时 2ms

  console.log('检查时间:', deadline.timeRemaining());  // 4ms
  shouldYield = 4 < 1;  // false，但 nextUnitOfWork 为 null，退出循环

  // 工作完成
  if (!nextUnitOfWork && wipRoot) {
    console.log('所有 fiber 处理完成，提交到 DOM');
    commitRoot();
  }

  requestIdleCallback(workLoop);  // 继续调度，等待下次渲染
}
```

### 如果工作量更大（需要多帧）

```javascript
// 假设有 100 个组件，每个耗时 1ms

// ========== 帧 1：14ms 空闲 ==========
workLoop(deadline) {
  // 处理 13 个组件（留 1ms 缓冲）
  // 第 13 个处理完后，检查时间
  shouldYield = deadline.timeRemaining() < 1;  // 0.8ms < 1，true
  // 退出循环，保存进度：nextUnitOfWork = 第 14 个组件
}

// 用户在这个间隙点击了按钮...

// ========== 帧 2：14ms 空闲 ==========
workLoop(deadline) {
  // 从第 14 个组件继续
  // 处理 13 个组件（14-26）
  shouldYield = deadline.timeRemaining() < 1;  // true
  // 保存进度：nextUnitOfWork = 第 27 个组件
}

// ========== 帧 3-8：继续... ==========

// ========== 帧 8：完成 ==========
workLoop(deadline) {
  // 处理剩余的组件
  nextUnitOfWork = null;  // 全部完成
  commitRoot();  // 提交到 DOM
}
```

---

## 五、时间切片的关键细节

### 1. 为什么阈值是 1ms？

```javascript
shouldYield = deadline.timeRemaining() < 1;
```

**原因：**

1. **安全缓冲**
   ```
   剩余 1ms：如果继续工作，可能超时
   → 提前停止，给浏览器留出时间
   ```

2. **避免掉帧**
   ```
   60fps = 每帧 16.6ms
   如果超时 → 掉帧 → 卡顿
   ```

3. **经验值**
   ```
   真实 React 会动态调整这个值
   简化版使用固定的 1ms
   ```

### 2. 为什么每次都检查时间？

```javascript
while (nextUnitOfWork && !shouldYield) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  shouldYield = deadline.timeRemaining() < 1;  // ← 每次都检查
}
```

**原因：** 每个 fiber 的处理时间不同

```javascript
// 简单组件：0.5ms
function SimpleComponent() {
  return <div>Hello</div>;
}

// 复杂组件：5ms
function ComplexComponent() {
  const [data, setData] = useState([]);
  useEffect(() => { /* ... */ });
  // 大量计算...
  return <div>{/* 复杂 JSX */}</div>;
}
```

如果处理 `ComplexComponent` 耗时 5ms，一次检查可能不够：

```javascript
剩余 6ms → 处理 ComplexComponent (5ms) → 剩余 1ms
→ 如果不检查，继续处理下一个可能超时
→ 检查后，shouldYield = true，暂停
```

### 3. 为什么要循环调用 requestIdleCallback？

```javascript
function workLoop(deadline) {
  // 处理工作...

  requestIdleCallback(workLoop);  // ← 为什么要调用自己？
}
```

**原因：** 形成持续的调度循环

```javascript
// 场景 1：工作未完成
workLoop 第 1 次调用
  → 处理部分工作
  → 时间用完，暂停
  → requestIdleCallback(workLoop)  // 注册下次
     ↓
workLoop 第 2 次调用
  → 继续处理
  → 完成所有工作
  → requestIdleCallback(workLoop)  // 仍然注册
     ↓
workLoop 第 3 次调用
  → 没有工作（nextUnitOfWork 为 null）
  → 什么都不做
  → requestIdleCallback(workLoop)  // 继续注册，等待新任务
     ↓
待机状态...

// 场景 2：用户点击，触发新渲染
setState() 被调用
  → nextUnitOfWork = wipRoot  // 设置新工作
     ↓
workLoop 被调用（已经注册好了）
  → 立即开始处理新工作
```

**如果不循环调用：**

```javascript
function workLoop(deadline) {
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  // ❌ 如果这里不调用 requestIdleCallback
  // 那么下次渲染时，没有任何东西会调用 workLoop
  // 新的渲染任务无法执行！
}
```

---

## 六、时间切片 vs 传统渲染

### 对比表

| 特性 | 传统递归渲染 | 时间切片渲染 |
|------|------------|------------|
| **可中断** | ❌ 不可中断 | ✅ 可中断 |
| **检查时间** | ❌ 不检查 | ✅ 每个单元后检查 |
| **用户体验** | ❌ 大任务阻塞 | ✅ 保持响应 |
| **实现方式** | 递归调用 | while 循环 + 指针 |
| **调度方式** | 同步执行 | requestIdleCallback |
| **任务粒度** | 整棵树 | 单个 fiber |

### 性能对比

```
场景：渲染 1000 个组件

传统方式：
├─ 耗时：1000ms（连续）
├─ 用户点击：1000ms 后才响应
└─ 体验：卡死 1 秒

时间切片：
├─ 耗时：1000ms（分散在多帧）
├─ 用户点击：立即响应（在帧间隙）
└─ 体验：流畅
```

---

## 七、总结

### 时间切片的三要素

1. **requestIdleCallback**
   ```javascript
   requestIdleCallback(workLoop);  // 在空闲时执行
   ```

2. **可中断循环**
   ```javascript
   while (nextUnitOfWork && !shouldYield) {
     // 可以随时退出
   }
   ```

3. **时间检查**
   ```javascript
   shouldYield = deadline.timeRemaining() < 1;
   ```

### 核心流程

```
启动
  ↓
requestIdleCallback(workLoop)
  ↓
浏览器空闲
  ↓
workLoop 被调用
  ↓
while 循环处理 fiber
  ↓
每处理一个，检查时间
  ↓
时间不够 → 退出循环 → 保存进度
  ↓
requestIdleCallback(workLoop)  // 继续下一帧
  ↓
循环...
```

### 时间切片的本质

**将不可中断的递归，变成可中断的迭代**

```javascript
// Before（不可中断）
function render(node) {
  process(node);
  node.children.forEach(child => render(child));  // 递归深入
}

// After（可中断）
while (nextWork && hasTime()) {
  nextWork = process(nextWork);  // 迭代处理
}
```

时间切片让 React 既能完成复杂渲染，又能保持 UI 响应！这就是 Fiber 架构的魔力！
