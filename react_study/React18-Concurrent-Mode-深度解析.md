# React 18 Concurrent Mode 与 Reconciler 深度解析

## 目录
- [核心概念](#核心概念)
- [本质区别](#本质区别)
- [React 架构演进史](#react-架构演进史)
- [Fiber 架构深入](#fiber-架构深入)
- [Concurrent Mode 原理](#concurrent-mode-原理)
- [实战应用](#实战应用)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

---

## 核心概念

### Reconciler（协调器）
- **定义**：React 的核心算法引擎，负责计算哪些部分需要更新
- **职责**：对比新旧虚拟 DOM，找出差异（diff 算法）
- **存在时间**：从 React 早期版本就存在
- **位置**：算法层

### Concurrent Mode（并发模式）
- **定义**：一种新的渲染策略/架构模式
- **职责**：控制渲染的执行方式（可中断、优先级调度）
- **存在时间**：React 18 正式引入
- **位置**：调度层

### 关系图解

```
┌─────────────────────────────────────────────┐
│      Concurrent Mode (并发模式)              │
│         (渲染执行策略 - 调度层)               │
│   - 决定何时渲染                              │
│   - 决定渲染的优先级                          │
│   - 决定是否中断/恢复                         │
└──────────────┬──────────────────────────────┘
               │ 使用并控制
               ▼
┌─────────────────────────────────────────────┐
│   Fiber Reconciler (Fiber 协调器)           │
│      (计算更新的算法引擎 - 算法层)            │
│   - 计算需要更新什么                          │
│   - 构建 Fiber 树                            │
│   - 标记副作用                                │
└──────────────┬──────────────────────────────┘
               │ 产生副作用列表
               ▼
┌─────────────────────────────────────────────┐
│         Renderer (渲染器 - 平台层)           │
│    - ReactDOM (浏览器)                       │
│    - React Native (移动端)                   │
│    - React Three Fiber (3D)                 │
└─────────────────────────────────────────────┘
```

---

## 本质区别

| 维度 | Reconciler | Concurrent Mode |
|------|-----------|-----------------|
| **本质** | 算法引擎 | 执行策略 |
| **核心问题** | What to update（更新什么） | When & How to update（何时、如何更新） |
| **输出** | Fiber 树、副作用列表 | 调度任务、优先级队列 |
| **开发者感知** | 不直接感知 | 通过 API 使用（useTransition 等） |
| **性能瓶颈** | Diff 算法复杂度 | 调度策略和时间切片 |
| **可配置性** | 开发者无法控制 | 可通过 API 控制优先级 |

### 形象比喻

```
🏗️ Reconciler：建筑师
   - 设计图纸（计算 diff）
   - 标注哪里需要改造
   - 列出材料清单（副作用列表）

📋 Concurrent Mode：项目经理
   - 决定先做哪个项目
   - 遇到紧急情况可以暂停当前工作
   - 协调多个项目的进度
   - 确保重要的事情先完成
```

---

## React 架构演进史

### 第一代：Stack Reconciler（React 15 及之前）

#### 架构特点
```javascript
// 同步递归渲染
function mountComponent(element) {
  const instance = new element.type(element.props);
  const renderedElement = instance.render();

  // 递归渲染子组件 - 无法中断！
  const renderedComponent = instantiateReactComponent(renderedElement);
  renderedComponent.mountComponent();

  return instance;
}
```

#### 问题分析
```javascript
// 假设组件树很深
<App>                          // 层级 1
  <Dashboard>                  // 层级 2
    <UserList>                 // 层级 3
      <UserCard /> × 1000      // 层级 4 - 大量组件
    </UserList>
  </Dashboard>
</App>

// Stack Reconciler 会：
// 1. 同步递归处理所有 1000 个 UserCard
// 2. 主线程被完全占用，无法响应用户输入
// 3. 页面卡顿，用户体验差
```

#### 时间线示意
```
渲染开始 ──────────────────────────────────────► 渲染结束
        [═══════════ 阻塞主线程 ════════════]
         ↑
         用户点击被忽略，输入无响应
```

---

### 第二代：Fiber Reconciler（React 16）

#### Fiber 数据结构
```javascript
// Fiber 节点的完整结构
const fiber = {
  // ===== 节点信息 =====
  type: 'div',              // 组件类型
  key: 'unique-key',        // 唯一标识
  elementType: 'div',       // 元素类型

  // ===== 树结构（链表实现）=====
  child: childFiber,        // 第一个子节点
  sibling: siblingFiber,    // 下一个兄弟节点
  return: parentFiber,      // 父节点
  index: 0,                 // 在父节点中的索引

  // ===== 状态与属性 =====
  memoizedProps: {},        // 上次渲染的 props
  pendingProps: {},         // 新的 props
  memoizedState: {},        // 上次渲染的 state

  // ===== 副作用 =====
  flags: 0b0000,            // 副作用标记（Placement, Update, Deletion）
  subtreeFlags: 0b0000,     // 子树的副作用标记
  deletions: [],            // 需要删除的子节点

  // ===== 双缓冲 =====
  alternate: oldFiber,      // 指向另一棵树中的对应节点

  // ===== 优先级（Concurrent Mode 需要）=====
  lanes: 0b0001,            // 当前优先级
  childLanes: 0b0011,       // 子树的优先级

  // ===== 其他 =====
  stateNode: domNode,       // 真实 DOM 节点或组件实例
  updateQueue: null,        // 更新队列
};
```

#### 为什么用链表而不是数组？

```javascript
// ❌ 数组实现（无法暂停）
function reconcileArray(children) {
  for (let i = 0; i < children.length; i++) {
    reconcile(children[i]); // 必须一次性处理完
  }
}

// ✅ 链表实现（可以暂停）
function reconcileLinkedList(fiber) {
  let currentFiber = fiber;

  while (currentFiber) {
    // 处理当前节点
    performUnitOfWork(currentFiber);

    // 检查是否需要暂停
    if (shouldYield()) {
      // 保存当前进度（currentFiber），下次继续
      return currentFiber;
    }

    // 深度优先遍历
    if (currentFiber.child) {
      currentFiber = currentFiber.child;
    } else if (currentFiber.sibling) {
      currentFiber = currentFiber.sibling;
    } else {
      currentFiber = currentFiber.return;
    }
  }
}
```

#### Fiber 树遍历过程

```javascript
// 示例组件树
<App>
  <Header />
  <Content>
    <Sidebar />
    <Main />
  </Content>
  <Footer />
</App>

// Fiber 树结构（链表）
/*
     App
      ↓ child
   Header ──sibling→ Content ──sibling→ Footer
                       ↓ child
                    Sidebar ──sibling→ Main

所有节点都有 return 指针指向父节点
*/

// 深度优先遍历顺序
function workLoop() {
  let fiber = rootFiber;
  const visitOrder = [];

  // 1. 向下（child）
  visitOrder.push('App');
  fiber = fiber.child; // Header

  visitOrder.push('Header');
  // Header 无 child，查找 sibling
  fiber = fiber.sibling; // Content

  visitOrder.push('Content');
  fiber = fiber.child; // Sidebar

  visitOrder.push('Sidebar');
  fiber = fiber.sibling; // Main

  visitOrder.push('Main');
  // Main 无 child 无 sibling，向上返回
  fiber = fiber.return; // Content
  fiber = fiber.sibling; // Footer

  visitOrder.push('Footer');

  // 结果: ['App', 'Header', 'Content', 'Sidebar', 'Main', 'Footer']
}
```

#### 双缓冲机制（Double Buffering）

```javascript
// 类比游戏渲染的双缓冲
/*
显示屏幕           后台缓冲区
┌────────┐        ┌────────┐
│ 画面 A │        │ 画面 B │
│        │        │(准备中) │
└────────┘        └────────┘
    ↑                 ↓
    └── 渲染完成后交换 ──┘
*/

// React 的双缓冲树
let currentTree = {
  type: 'div',
  props: { className: 'old' },
  alternate: null, // 指向 workInProgressTree
};

let workInProgressTree = {
  type: 'div',
  props: { className: 'new' },
  alternate: currentTree, // 指向 currentTree
};

// 渲染流程
function performWork() {
  // 1. 在 workInProgressTree 上进行所有计算
  reconcile(workInProgressTree);

  // 2. 计算完成后，交换指针
  const finishedTree = workInProgressTree;
  currentTree = finishedTree;

  // 3. 提交到 DOM
  commitRoot(currentTree);
}

// 优点：
// - 用户始终看到完整的 UI（current tree）
// - 所有计算在后台完成（work-in-progress tree）
// - 可以随时丢弃未完成的工作
```

#### Fiber 的工作循环

```javascript
// 简化的 Fiber 工作循环
let nextUnitOfWork = null;
let currentRoot = null;

function workLoop(deadline) {
  // 是否需要让出控制权
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    // 执行一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 检查剩余时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && currentRoot) {
    // 所有工作完成，提交更新
    commitRoot(currentRoot);
  }

  // 继续调度
  requestIdleCallback(workLoop);
}

function performUnitOfWork(fiber) {
  // 1. 处理当前 fiber（beginWork）
  if (fiber.child) {
    return fiber.child;
  }

  // 2. 完成当前 fiber（completeWork）
  let nextFiber = fiber;
  while (nextFiber) {
    completeUnitOfWork(nextFiber);

    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.return;
  }

  return null;
}

// 启动渲染
requestIdleCallback(workLoop);
```

#### React 16 的局限

```javascript
// 虽然有 Fiber 架构，但 React 16 默认仍是同步模式
function legacyRenderSubtreeIntoContainer() {
  // 即使可以分片，但仍然同步完成所有工作
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
  // 一次性提交
  commitRoot();
}

// 无法做到：
// ❌ 根据优先级中断低优先级任务
// ❌ 让紧急更新插队
// ❌ 并发渲染多个版本
```

---

### 第三代：Concurrent Mode + Fiber（React 18）

#### Lane 优先级模型

```javascript
// React 18 使用 Lane 模型表示优先级（31 位二进制）
const SyncLane = 0b0000000000000000000000000000001;              // 1
const InputContinuousLane = 0b0000000000000000000000000000100;   // 4
const DefaultLane = 0b0000000000000000000000000010000;           // 16
const TransitionLane1 = 0b0000000000000000000000001000000;       // 64
const IdleLane = 0b0100000000000000000000000000000;              // 最低优先级

// 为什么用位运算？
// 1. 高效合并多个优先级
const lanes = SyncLane | DefaultLane; // 0b10001 = 17

// 2. 快速检查是否包含某个优先级
const hasSyncLane = (lanes & SyncLane) !== 0;

// 3. 获取最高优先级
function getHighestPriorityLane(lanes) {
  return lanes & -lanes; // 位运算技巧，获取最右边的 1
}

// 示例
const lanes = 0b10100; // 包含多个优先级
getHighestPriorityLane(lanes); // 0b00100 (优先处理最右边的)
```

#### 优先级调度示例

```javascript
// 模拟 React 18 的调度器
class Scheduler {
  constructor() {
    this.taskQueue = []; // 按优先级排序的任务队列
  }

  scheduleUpdateOnFiber(fiber, lane) {
    // 1. 标记 fiber 的优先级
    fiber.lanes = mergeLanes(fiber.lanes, lane);

    // 2. 向上标记祖先节点
    let parent = fiber.return;
    while (parent) {
      parent.childLanes = mergeLanes(parent.childLanes, lane);
      parent = parent.return;
    }

    // 3. 调度根节点更新
    this.ensureRootIsScheduled(fiber.stateNode);
  }

  ensureRootIsScheduled(root) {
    // 获取最高优先级
    const nextLanes = getNextLanes(root);

    if (nextLanes === NoLanes) return;

    // 根据优先级选择调度方式
    if (includesSyncLane(nextLanes)) {
      // 同步优先级 - 立即执行
      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    } else {
      // 并发优先级 - 可中断
      const priority = lanesToPriority(nextLanes);
      scheduleCallback(priority, performConcurrentWorkOnRoot.bind(null, root));
    }
  }
}

// 使用示例
function MyComponent() {
  const [urgentState, setUrgentState] = useState(0);
  const [normalState, setNormalState] = useState(0);

  const handleClick = () => {
    // 紧急更新 - SyncLane
    flushSync(() => {
      setUrgentState(1);
    });

    // 正常更新 - DefaultLane
    setNormalState(1);
  };
}
```

#### 时间切片（Time Slicing）

```javascript
// React 18 的并发工作循环
function workLoopConcurrent() {
  // 持续工作，直到需要让出控制权
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

function shouldYield() {
  // 获取当前时间
  const currentTime = getCurrentTime();

  // 检查是否超过时间片（默认 5ms）
  if (currentTime >= deadline) {
    // 检查是否有更高优先级任务
    if (needsPaint || hasHigherPriorityWork()) {
      return true; // 让出控制权
    }
  }

  return false;
}

// 时间线示意
/*
0ms        5ms       10ms      15ms      20ms
│─────────│─────────│─────────│─────────│
│ React   │ Browser │ React   │ Browser │
│ 工作    │ 绘制    │ 工作    │ 事件    │
│         │         │         │ 处理    │

每 5ms 让出控制权，浏览器可以：
- 处理用户输入
- 执行动画
- 进行页面绘制
*/
```

#### 可中断渲染示例

```javascript
// 模拟完整的可中断渲染过程
function renderWithInterruption() {
  const root = {
    current: currentTree,
    workInProgress: null,
  };

  // 创建 work-in-progress 树
  root.workInProgress = createWorkInProgress(root.current);

  let workInProgress = root.workInProgress;
  let startTime = performance.now();

  console.log('开始渲染...');

  while (workInProgress !== null) {
    // 执行工作单元
    console.log(`处理节点: ${workInProgress.type}`);
    workInProgress = performUnitOfWork(workInProgress);

    // 检查是否需要中断
    const elapsedTime = performance.now() - startTime;
    if (elapsedTime > 5 && hasHigherPriorityWork()) {
      console.log('⚠️  检测到高优先级任务，暂停渲染');

      // 保存当前进度
      saveWorkInProgress(workInProgress);

      // 处理高优先级任务
      processHighPriorityWork();

      console.log('✅ 高优先级任务完成，恢复渲染');

      // 恢复渲染
      workInProgress = restoreWorkInProgress();
      startTime = performance.now();
    }
  }

  console.log('渲染完成，提交更新');
  commitRoot(root);
}
```

---

## Fiber 架构深入

### Fiber 的核心能力

#### 1. 可中断性（Interruptibility）

```javascript
// Stack Reconciler - 不可中断
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  // 必须一次性处理完所有子节点
  for (let i = 0; i < newChildren.length; i++) {
    const newFiber = createFiber(newChildren[i]);
    // 递归处理，无法中途停止
    reconcileChildren(newFiber, newChildren[i].props.children);
  }
}

// Fiber Reconciler - 可中断
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  let resultingFirstChild = null;
  let previousNewFiber = null;

  // 转换为链表，可以随时暂停
  for (let i = 0; i < newChildren.length; i++) {
    const newFiber = createFiber(newChildren[i]);

    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;

    // 每个节点都是独立的工作单元
    // 可以在任意节点处暂停，保存 previousNewFiber
  }

  return resultingFirstChild;
}
```

#### 2. 增量渲染（Incremental Rendering）

```javascript
// 将大任务拆分为小任务
function renderRootConcurrent(root) {
  // 准备工作
  prepareFreshStack(root);

  // 增量执行
  do {
    try {
      workLoopConcurrent();
    } catch (error) {
      handleError(error);
    }
  } while (true);

  // 检查渲染状态
  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;

  commitRoot(root);
}

function workLoopConcurrent() {
  // 每次只处理一个 fiber
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }

  // shouldYield() 返回 true 时暂停
  // 浏览器可以处理其他任务
  // 下次继续从 workInProgress 开始
}
```

#### 3. 优先级调度（Priority Scheduling）

```javascript
// Fiber 节点携带优先级信息
function updateContainer(element, container, lane) {
  const current = container.current;

  // 创建更新对象
  const update = {
    lane: lane,           // 优先级
    payload: { element }, // 新的 React 元素
  };

  // 加入更新队列
  enqueueUpdate(current, update);

  // 调度更新
  scheduleUpdateOnFiber(current, lane);
}

// 处理不同优先级的更新
function processUpdateQueue(fiber) {
  const queue = fiber.updateQueue;

  // 只处理当前优先级的更新
  let update = queue.firstBaseUpdate;
  let newState = fiber.memoizedState;

  while (update !== null) {
    // 检查优先级是否足够
    if (isSubsetOfLanes(renderLanes, update.lane)) {
      // 处理更新
      newState = getStateFromUpdate(update, newState);
    } else {
      // 跳过低优先级更新，稍后处理
    }

    update = update.next;
  }

  fiber.memoizedState = newState;
}
```

### Fiber 的工作阶段

#### Render 阶段（可中断）

```javascript
// beginWork - 向下遍历
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case FunctionComponent: {
      // 执行函数组件
      const Component = workInProgress.type;
      const props = workInProgress.pendingProps;
      const children = Component(props);

      // 协调子节点
      reconcileChildren(current, workInProgress, children);
      return workInProgress.child;
    }

    case HostComponent: {
      // 原生 DOM 组件
      const type = workInProgress.type; // 'div', 'span' 等
      const props = workInProgress.pendingProps;

      reconcileChildren(current, workInProgress, props.children);
      return workInProgress.child;
    }
  }
}

// completeWork - 向上回溯
function completeWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case HostComponent: {
      const type = workInProgress.type;
      const props = workInProgress.pendingProps;

      if (current !== null && workInProgress.stateNode !== null) {
        // 更新节点
        updateHostComponent(current, workInProgress, type, props);
      } else {
        // 创建 DOM 节点
        const instance = createInstance(type, props);
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;
      }

      // 冒泡副作用
      bubbleProperties(workInProgress);
      return null;
    }
  }
}
```

#### Commit 阶段（不可中断）

```javascript
// commit 阶段必须同步执行，确保 UI 一致性
function commitRoot(root) {
  const finishedWork = root.finishedWork;

  // 阶段 1: before mutation（DOM 变更前）
  commitBeforeMutationEffects(finishedWork);

  // 阶段 2: mutation（DOM 变更）
  commitMutationEffects(finishedWork);

  // 切换 current 树
  root.current = finishedWork;

  // 阶段 3: layout（DOM 变更后）
  commitLayoutEffects(finishedWork);
}

function commitMutationEffects(fiber) {
  // 深度优先处理所有副作用
  if (fiber.child !== null) {
    commitMutationEffects(fiber.child);
  }

  // 处理当前节点的副作用
  const flags = fiber.flags;

  if (flags & Placement) {
    // 插入节点
    commitPlacement(fiber);
  }

  if (flags & Update) {
    // 更新节点
    commitWork(fiber);
  }

  if (flags & Deletion) {
    // 删除节点
    commitDeletion(fiber);
  }

  // 处理兄弟节点
  if (fiber.sibling !== null) {
    commitMutationEffects(fiber.sibling);
  }
}
```

### 完整的 Fiber 执行流程

```javascript
// 模拟完整流程
function fullFiberWorkflow() {
  // 1. 触发更新
  function handleClick() {
    setState(newValue);
    // ↓ 创建 update 对象
    const update = {
      lane: DefaultLane,
      payload: newValue,
    };
    // ↓ 调度更新
    scheduleUpdateOnFiber(fiber, DefaultLane);
  }

  // 2. 开始渲染
  function performConcurrentWorkOnRoot(root) {
    // 准备新的 work-in-progress 树
    prepareFreshStack(root);

    // 工作循环
    workLoopConcurrent();

    // 完成渲染
    finishConcurrentRender(root);
  }

  // 3. 工作循环（可中断）
  function workLoopConcurrent() {
    while (workInProgress !== null && !shouldYield()) {
      performUnitOfWork(workInProgress);
    }
  }

  // 4. 处理单个工作单元
  function performUnitOfWork(unitOfWork) {
    const current = unitOfWork.alternate;

    // 向下：处理当前节点
    let next = beginWork(current, unitOfWork, renderLanes);

    if (next === null) {
      // 没有子节点，向上完成工作
      completeUnitOfWork(unitOfWork);
    } else {
      // 有子节点，继续向下
      workInProgress = next;
    }
  }

  // 5. 完成工作单元
  function completeUnitOfWork(unitOfWork) {
    let completedWork = unitOfWork;

    do {
      const current = completedWork.alternate;
      const returnFiber = completedWork.return;

      // 完成当前节点
      completeWork(current, completedWork);

      // 收集副作用
      if (returnFiber !== null) {
        collectEffects(returnFiber, completedWork);
      }

      const siblingFiber = completedWork.sibling;
      if (siblingFiber !== null) {
        // 处理兄弟节点
        workInProgress = siblingFiber;
        return;
      }

      // 回到父节点
      completedWork = returnFiber;
      workInProgress = completedWork;
    } while (completedWork !== null);
  }

  // 6. 提交更新（不可中断）
  function commitRoot(root) {
    const finishedWork = root.finishedWork;

    // before mutation
    commitBeforeMutationEffects(finishedWork);

    // mutation
    commitMutationEffects(finishedWork);

    // 切换树
    root.current = finishedWork;

    // layout
    commitLayoutEffects(finishedWork);
  }
}
```

---

## Concurrent Mode 原理

### 核心 API

#### 1. useTransition

```javascript
function SearchPage() {
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // 高优先级：立即更新输入框（用户可见）
    setInput(value);

    // 低优先级：延迟更新搜索结果（可被中断）
    startTransition(() => {
      // 模拟耗时的过滤操作
      const filtered = hugeDataList.filter(item =>
        item.name.includes(value)
      );
      setSearchResults(filtered);
    });
  };

  return (
    <>
      <input value={input} onChange={handleChange} />
      {isPending && <Spinner />}
      <ResultList data={searchResults} />
    </>
  );
}

// 内部实现原理
function startTransition(callback) {
  // 1. 记录当前优先级
  const previousPriority = getCurrentUpdatePriority();

  try {
    // 2. 设置为低优先级
    setCurrentUpdatePriority(TransitionLane);

    // 3. 执行回调（内部的 setState 都是低优先级）
    callback();
  } finally {
    // 4. 恢复优先级
    setCurrentUpdatePriority(previousPriority);
  }
}
```

#### 2. useDeferredValue

```javascript
function AutocompletePage() {
  const [query, setQuery] = useState('');

  // deferredQuery 会"滞后"于 query
  const deferredQuery = useDeferredValue(query);

  // 基于延迟值进行耗时操作
  const suggestions = useMemo(() => {
    return getSuggestions(deferredQuery);
  }, [deferredQuery]);

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)} // 立即更新
      />
      <SuggestionList items={suggestions} />
    </>
  );
}

// 内部实现原理
function useDeferredValue(value) {
  const [deferredValue, setDeferredValue] = useState(value);

  useEffect(() => {
    // 以低优先级更新延迟值
    startTransition(() => {
      setDeferredValue(value);
    });
  }, [value]);

  return deferredValue;
}

// 执行时间线
/*
用户输入 "abc"

时间 →
0ms    10ms   20ms   30ms   40ms
│      │      │      │      │
a      b      c
↓      ↓      ↓
query: "a" → "ab" → "abc"   (立即更新)
deferredQuery: "" → "a" → "ab" → "abc"   (延迟更新)
                └────┘  └────┘  └────┘
                 低优先级任务
*/
```

#### 3. Suspense with Concurrent

```javascript
// 传统方式：数据加载完才渲染
function TraditionalWay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner />;
  return <Content data={data} />;
}

// Concurrent + Suspense：边加载边渲染
function ConcurrentWay() {
  // resource 抛出 Promise，Suspense 捕获
  const data = resource.read();
  return <Content data={data} />;
}

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <ConcurrentWay />
    </Suspense>
  );
}

// resource 实现原理
function wrapPromise(promise) {
  let status = 'pending';
  let result;

  const suspender = promise.then(
    data => {
      status = 'success';
      result = data;
    },
    error => {
      status = 'error';
      result = error;
    }
  );

  return {
    read() {
      if (status === 'pending') {
        throw suspender; // 抛出 Promise，Suspense 捕获
      } else if (status === 'error') {
        throw result;
      } else {
        return result;
      }
    }
  };
}
```

### 优先级饥饿问题（Starvation）

```javascript
// 问题：低优先级任务一直被打断
function StarvationExample() {
  const [count, setCount] = useState(0);

  // 持续触发高优先级更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1); // 高优先级
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // 低优先级任务永远无法完成
  startTransition(() => {
    // 这个更新可能永远不会完成
    setExpensiveState(computeExpensiveValue());
  });
}

// React 的解决方案：过期时间（Expiration Time）
function scheduleUpdateOnFiber(fiber, lane) {
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);

  // 标记过期时间
  markStarvedLanesAsExpired(root, currentTime);

  ensureRootIsScheduled(root);
}

function markStarvedLanesAsExpired(root, currentTime) {
  const pendingLanes = root.pendingLanes;
  const expirationTimes = root.expirationTimes;

  let lanes = pendingLanes;
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index;

    const expirationTime = expirationTimes[index];
    if (expirationTime === NoTimestamp) {
      // 设置过期时间
      expirationTimes[index] = computeExpirationTime(lane, currentTime);
    } else if (expirationTime <= currentTime) {
      // 已过期，提升为同步优先级
      root.expiredLanes |= lane;
    }

    lanes &= ~lane;
  }
}

// 过期时间配置
const EXPIRATION_MS = {
  [IdleLane]: 30000,        // 30 秒
  [TransitionLane]: 5000,   // 5 秒
  [DefaultLane]: 500,       // 500 毫秒
};
```

### 批量更新（Automatic Batching）

```javascript
// React 17：只在事件处理器中批量更新
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重新渲染 ✅
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 触发两次重新渲染 ❌
}, 1000);

// React 18：所有地方都自动批量更新
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重新渲染 ✅
}

setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重新渲染 ✅
}, 1000);

fetch('/api').then(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只触发一次重新渲染 ✅
});

// 如果需要强制同步更新
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1);
  }); // 立即重新渲染

  flushSync(() => {
    setFlag(f => !f);
  }); // 再次立即重新渲染
}
```

---

## 实战应用

### 场景 1：大列表渲染优化

```javascript
// ❌ 问题：一次性渲染 10000 个项目，阻塞 UI
function BadList() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');

  const filteredItems = items.filter(item =>
    item.name.includes(filter)
  );

  return (
    <>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <ul>
        {filteredItems.map(item => (
          <ExpensiveItem key={item.id} data={item} />
        ))}
      </ul>
    </>
  );
}

// ✅ 方案 1：使用 useTransition
function GoodList1() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    const value = e.target.value;

    // 高优先级：立即更新输入框
    setFilter(value);

    // 低优先级：延迟过滤
    startTransition(() => {
      const filtered = items.filter(item =>
        item.name.includes(value)
      );
      setFilteredItems(filtered);
    });
  };

  return (
    <>
      <input value={filter} onChange={handleChange} />
      {isPending && <div>搜索中...</div>}
      <ul>
        {filteredItems.map(item => (
          <ExpensiveItem key={item.id} data={item} />
        ))}
      </ul>
    </>
  );
}

// ✅ 方案 2：使用 useDeferredValue
function GoodList2() {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);

  // 基于延迟值计算
  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.includes(deferredFilter)
    );
  }, [deferredFilter]);

  return (
    <>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <ul style={{
        opacity: filter !== deferredFilter ? 0.5 : 1
      }}>
        {filteredItems.map(item => (
          <ExpensiveItem key={item.id} data={item} />
        ))}
      </ul>
    </>
  );
}

// ✅ 方案 3：虚拟滚动 + Concurrent
function GoodList3() {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.includes(deferredFilter)
    );
  }, [deferredFilter]);

  return (
    <>
      <input
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      <VirtualList
        items={filteredItems}
        height={600}
        itemHeight={50}
        renderItem={(item) => <ExpensiveItem data={item} />}
      />
    </>
  );
}
```

### 场景 2：Tab 切换优化

```javascript
// ❌ 问题：切换 Tab 时卡顿
function BadTabs() {
  const [activeTab, setActiveTab] = useState('posts');

  return (
    <>
      <button onClick={() => setActiveTab('posts')}>Posts</button>
      <button onClick={() => setActiveTab('contact')}>Contact</button>
      <button onClick={() => setActiveTab('about')}>About</button>

      {activeTab === 'posts' && <PostsTab />}      {/* 数据量大 */}
      {activeTab === 'contact' && <ContactTab />}
      {activeTab === 'about' && <AboutTab />}
    </>
  );
}

// ✅ 方案 1：使用 useTransition
function GoodTabs1() {
  const [activeTab, setActiveTab] = useState('posts');
  const [isPending, startTransition] = useTransition();

  const selectTab = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <>
      <button
        onClick={() => selectTab('posts')}
        disabled={isPending}
      >
        Posts
      </button>
      <button
        onClick={() => selectTab('contact')}
        disabled={isPending}
      >
        Contact {isPending && '⏳'}
      </button>

      {/* 旧 Tab 保持可见，直到新 Tab 准备好 */}
      {activeTab === 'posts' && <PostsTab />}
      {activeTab === 'contact' && <ContactTab />}
      {activeTab === 'about' && <AboutTab />}
    </>
  );
}

// ✅ 方案 2：Suspense + 预加载
function GoodTabs2() {
  const [activeTab, setActiveTab] = useState('posts');
  const [isPending, startTransition] = useTransition();

  const selectTab = (tab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <>
      <button onClick={() => selectTab('posts')}>Posts</button>
      <button onClick={() => selectTab('contact')}>Contact</button>

      <Suspense fallback={<Spinner />}>
        {activeTab === 'posts' && <PostsTab />}
        {activeTab === 'contact' && <ContactTab />}
      </Suspense>
    </>
  );
}
```

### 场景 3：数据流式加载

```javascript
// 传统方式：等待所有数据加载
function TraditionalDataFlow() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [comments, setComments] = useState(null);

  useEffect(() => {
    Promise.all([
      fetchUser(),
      fetchPosts(),
      fetchComments(),
    ]).then(([userData, postsData, commentsData]) => {
      setUser(userData);
      setPosts(postsData);
      setComments(commentsData);
    });
  }, []);

  if (!user || !posts || !comments) {
    return <FullPageSpinner />;
  }

  return (
    <>
      <UserProfile user={user} />
      <PostsList posts={posts} />
      <CommentsList comments={comments} />
    </>
  );
}

// Concurrent 方式：流式渲染
function ConcurrentDataFlow() {
  return (
    <Suspense fallback={<UserSkeleton />}>
      <UserProfile />

      <Suspense fallback={<PostsSkeleton />}>
        <PostsList />

        <Suspense fallback={<CommentsSkeleton />}>
          <CommentsList />
        </Suspense>
      </Suspense>
    </Suspense>
  );
}

// 组件内部使用 Suspense
function UserProfile() {
  const user = resource.user.read(); // 抛出 Promise
  return <div>{user.name}</div>;
}

// 创建 resource
const resource = {
  user: wrapPromise(fetchUser()),
  posts: wrapPromise(fetchPosts()),
  comments: wrapPromise(fetchComments()),
};

// 渲染时间线对比
/*
传统方式：
0ms ────────────────► 1000ms
[   等待所有数据    ] [渲染完整 UI]
用户看到：空白 → 完整页面

Concurrent 方式：
0ms ───► 200ms ───► 500ms ───► 1000ms
[User] [Posts  ] [Comments ]
用户看到：骨架屏 → 用户信息 → 帖子列表 → 评论列表
*/
```

### 场景 4：复杂表单优化

```javascript
// ❌ 问题：表单输入卡顿
function BadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  // 实时验证和预览（耗时）
  const validationErrors = validateForm(formData);
  const preview = renderPreview(formData);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // 每次输入都触发验证和预览，阻塞 UI
  };

  return (
    <>
      <input
        value={formData.name}
        onChange={e => handleChange('name', e.target.value)}
      />
      <ErrorMessages errors={validationErrors} />
      <Preview content={preview} />
    </>
  );
}

// ✅ 优化：分离输入和验证的优先级
function GoodForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  const [deferredFormData, setDeferredFormData] = useState(formData);
  const [isPending, startTransition] = useTransition();

  const handleChange = (field, value) => {
    // 高优先级：立即更新输入框
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // 低优先级：延迟验证和预览
    startTransition(() => {
      setDeferredFormData(newData);
    });
  };

  // 基于延迟数据进行耗时操作
  const validationErrors = useMemo(() =>
    validateForm(deferredFormData),
    [deferredFormData]
  );

  const preview = useMemo(() =>
    renderPreview(deferredFormData),
    [deferredFormData]
  );

  return (
    <>
      <input
        value={formData.name}
        onChange={e => handleChange('name', e.target.value)}
      />
      {isPending && <span>验证中...</span>}
      <ErrorMessages errors={validationErrors} />
      <Preview content={preview} />
    </>
  );
}
```

---

## 性能优化

### 1. 合理使用 useTransition

```javascript
// ❌ 不必要的 useTransition
function BadExample1() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    // 简单的状态更新不需要 transition
    startTransition(() => {
      setCount(c => c + 1);
    });
  };
}

// ✅ 只在真正耗时的操作中使用
function GoodExample1() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value) => {
    setQuery(value); // 立即更新

    // 只在耗时操作中使用 transition
    startTransition(() => {
      const filtered = heavyComputation(value);
      setResults(filtered);
    });
  };
}
```

### 2. 避免过度使用 useDeferredValue

```javascript
// ❌ 每个状态都延迟
function BadExample2() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);

  const deferredA = useDeferredValue(a);
  const deferredB = useDeferredValue(b);
  const deferredC = useDeferredValue(c);

  // 过度延迟会导致 UI 不同步
}

// ✅ 只延迟真正需要的值
function GoodExample2() {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // 其他状态保持正常更新
  const [sortOrder, setSortOrder] = useState('asc');

  const results = useMemo(() => {
    return searchAndSort(deferredSearchTerm, sortOrder);
  }, [deferredSearchTerm, sortOrder]);
}
```

### 3. Suspense 边界的粒度

```javascript
// ❌ 粒度太粗：一个组件加载慢会阻塞所有组件
function BadExample3() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <FastComponent />
      <SlowComponent />
      <AnotherFastComponent />
    </Suspense>
  );
}

// ❌ 粒度太细：太多加载状态，用户体验差
function BadExample4() {
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Component1 />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <Component2 />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <Component3 />
      </Suspense>
    </>
  );
}

// ✅ 适中的粒度：按功能模块分组
function GoodExample3() {
  return (
    <>
      <FastComponent />

      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>

      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
    </>
  );
}
```

### 4. 性能监控

```javascript
// 使用 React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(
  id,                  // 组件 ID
  phase,              // "mount" 或 "update"
  actualDuration,     // 本次更新耗时
  baseDuration,       // 不使用 memo 的预估耗时
  startTime,          // 开始渲染的时间
  commitTime,         // 提交更新的时间
) {
  console.log(`${id} (${phase}) took ${actualDuration}ms`);

  // 发送到分析服务
  analytics.track('render', {
    component: id,
    phase,
    duration: actualDuration,
  });
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <MyComponent />
    </Profiler>
  );
}
```

---

## 常见问题

### Q1: Concurrent Mode 是默认启用的吗？

```javascript
// React 18 使用 createRoot 自动启用 Concurrent 特性
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// 如果使用旧的 render 方法，则不启用
import { render } from 'react-dom';
render(<App />, document.getElementById('root')); // Legacy Mode
```

### Q2: 为什么我的应用升级到 React 18 后没感觉到变化？

Concurrent Mode 是选择性启用的，需要使用新的 API：
- `useTransition` - 手动标记低优先级更新
- `useDeferredValue` - 延迟更新值
- `<Suspense>` - 声明加载边界

如果不使用这些 API，应用会以传统方式运行。

### Q3: useTransition vs useDeferredValue 如何选择？

```javascript
// useTransition：控制状态更新的优先级
function Example1() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      // 这里的状态更新是低优先级
      setState(newValue);
    });
  };
}

// useDeferredValue：得到一个"滞后"的值
function Example2() {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value);

  // value 立即更新，deferredValue 延迟更新
}

// 选择标准：
// - 能控制更新代码 → 用 useTransition
// - 不能控制更新代码（如第三方组件）→ 用 useDeferredValue
```

### Q4: Concurrent Mode 会破坏现有代码吗？

不会。React 18 保持向后兼容，但有一些注意事项：

```javascript
// ⚠️ 副作用可能执行多次（开发模式）
function MyComponent() {
  useEffect(() => {
    // Concurrent Mode 下，这个 effect 可能执行多次
    // 确保它是幂等的
    const subscription = createSubscription();
    return () => subscription.unsubscribe();
  }, []);
}

// ⚠️ render 可能被多次调用
function MyComponent() {
  console.log('rendering'); // 可能打印多次

  // 不要在 render 中执行副作用
  // ❌ doSomethingWithSideEffect();
}
```

### Q5: 如何调试 Concurrent Mode？

```javascript
// 1. 使用 React DevTools Profiler
// 查看组件渲染时间和优先级

// 2. 添加日志
function MyComponent() {
  console.log('Rendering at', performance.now());

  useEffect(() => {
    console.log('Committed at', performance.now());
  });
}

// 3. 使用 concurrent features flag
if (typeof window !== 'undefined') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE = () => {};
}
```

### Q6: Concurrent Mode 对 SEO 有影响吗？

```javascript
// 服务端渲染（SSR）不使用 Concurrent Mode
// 但可以使用 Streaming SSR

// server.js
import { renderToPipeableStream } from 'react-dom/server';

app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    // 流式传输 HTML
    onShellReady() {
      res.setHeader('Content-Type', 'text/html');
      pipe(res);
    },
  });
});

// 优点：
// - 更快的首字节时间（TTFB）
// - 逐步加载内容
// - SEO 友好
```

---

## 总结

### Reconciler vs Concurrent Mode

| 方面 | Reconciler | Concurrent Mode |
|------|-----------|-----------------|
| **层级** | 算法层 | 调度层 |
| **职责** | 计算需要更新什么 | 决定何时、如何更新 |
| **历史** | React 16 引入 Fiber Reconciler | React 18 正式启用 |
| **核心能力** | 可中断的树遍历 | 优先级调度、时间切片 |
| **开发者交互** | 无感知 | 通过 API 使用 |

### 关键要点

1. **Fiber 是基础**：提供了可中断、可恢复的渲染能力
2. **Concurrent 是策略**：利用 Fiber 的能力实现优先级调度
3. **用户体验优先**：保持 UI 响应性是核心目标
4. **渐进式采用**：可以逐步使用新 API，不破坏现有代码

### 最佳实践

```javascript
// 1. 使用 useTransition 处理非紧急更新
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setExpensiveState(newValue);
});

// 2. 使用 useDeferredValue 延迟派生值
const deferredValue = useDeferredValue(expensiveValue);

// 3. 使用 Suspense 优雅处理异步
<Suspense fallback={<Spinner />}>
  <AsyncComponent />
</Suspense>

// 4. 使用 memo 避免不必要的重渲染
const MemoizedComponent = memo(MyComponent);

// 5. 监控性能
<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

---

## 参考资源

- [React 18 官方文档](https://react.dev/blog/2022/03/29/react-v18)
- [React Fiber 架构](https://github.com/acdlite/react-fiber-architecture)
- [Concurrent Rendering in React](https://17.reactjs.org/docs/concurrent-mode-intro.html)
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools)

---

**文档版本**：1.0
**最后更新**：2025-11-07
**作者**：React 学习笔记