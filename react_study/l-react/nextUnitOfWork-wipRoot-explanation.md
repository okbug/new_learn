# nextUnitOfWork 和 wipRoot 详解

## 核心问题：React 如何管理渲染工作？

在 React 的 Fiber 架构中，渲染工作被拆分成小单元。那么：
1. **如何知道下一步要处理哪个单元？** → `nextUnitOfWork`
2. **如何跟踪整个渲染任务？** → `wipRoot`

---

## 一、nextUnitOfWork：工作队列的指针

### 定义

```javascript
let nextUnitOfWork = null;
```

**作用：** 指向下一个需要处理的 fiber 节点

### 它解决什么问题？

React 的渲染是 **可中断的**，需要记住：
- "当前处理到哪里了？"
- "下一步该处理哪个节点？"
- "工作是否已经完成？"

### 工作原理

```javascript
function workLoop(deadline) {
  let shouldYield = false;

  // 只要有工作要做，并且还有时间，就继续处理
  while (nextUnitOfWork && !shouldYield) {
    // 处理当前工作单元，返回下一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 检查是否需要让出控制权
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果工作全部完成（nextUnitOfWork 为 null）
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();  // 提交更改到 DOM
  }

  requestIdleCallback(workLoop);
}
```

### 生命周期示例

假设组件树结构：
```
     App
    /   \
   A     B
  /
 C
```

**执行流程：**

```javascript
// 1. 开始渲染
nextUnitOfWork = wipRoot;     // 指向根节点

// 2. workLoop 第一次执行
nextUnitOfWork = performUnitOfWork(App)  // 处理 App，返回 A
nextUnitOfWork = performUnitOfWork(A)    // 处理 A，返回 C
nextUnitOfWork = performUnitOfWork(C)    // 处理 C，返回 B
nextUnitOfWork = performUnitOfWork(B)    // 处理 B，返回 null

// 3. nextUnitOfWork 为 null，工作完成
commitRoot();  // 提交到 DOM
```

### 关键特性：可中断

```javascript
// 场景：处理大型组件树

// 第 1 帧（有 10ms 空闲时间）
nextUnitOfWork = App
nextUnitOfWork = A
nextUnitOfWork = C
// 时间用完，暂停

// 用户输入事件被处理...

// 第 2 帧（继续从 C 开始）
nextUnitOfWork = C  // ← 从上次停下的地方继续
nextUnitOfWork = B
nextUnitOfWork = null  // 完成

commitRoot();
```

**关键：** `nextUnitOfWork` 记住了暂停位置，下次可以继续！

---

## 二、wipRoot：工作中的 Fiber 树根节点

### 定义

```javascript
let wipRoot = null;  // work in progress root
```

**作用：** 指向正在构建的新 Fiber 树的根节点

### 它解决什么问题？

React 需要知道：
1. "现在是否有正在进行的渲染任务？"
2. "新的 Fiber 树从哪里开始？"
3. "渲染完成后，从哪里开始提交到 DOM？"

### 双缓冲机制

React 维护 **两棵 Fiber 树**：

```javascript
let currentRoot = null;   // 当前屏幕上显示的树（已提交）
let wipRoot = null;       // 正在构建的新树（工作中）
```

**关系图：**

```
首次渲染：
currentRoot = null
wipRoot = { dom: container, props: {...}, alternate: null }
           ↓
        提交后
           ↓
currentRoot = wipRoot  ← 切换指针
wipRoot = null         ← 清空


更新渲染：
currentRoot = 上次提交的树
wipRoot = { dom: container, props: {...}, alternate: currentRoot }
                                              ↑
                                              └─ 指向旧树，用于 diff
```

### 完整渲染流程

```javascript
// ========== 阶段 1：启动渲染 ==========
function render(element, container) {
  // 创建新的工作树根节点
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,  // ← 指向旧树，用于 diff
  };

  deletions = [];
  nextUnitOfWork = wipRoot;  // ← 设置起点
}

// ========== 阶段 2：构建 Fiber 树（Render 阶段）==========
function workLoop(deadline) {
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  // 检查：工作完成 且 有待提交的树
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();  // ← 进入提交阶段
  }

  requestIdleCallback(workLoop);
}

// ========== 阶段 3：提交到 DOM（Commit 阶段）==========
function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);  // ← 从 wipRoot 开始提交

  // 完成双缓冲切换
  currentRoot = wipRoot;  // ← 新树变成当前树
  wipRoot = null;         // ← 清空工作树
}
```

---

## 三、两者的协同工作

### 初始化阶段

```javascript
// 用户调用
const root = MiniReact.createRoot(container);
root.render(<App />);

// 内部执行
function render(element, container) {
  wipRoot = {                    // ← 创建工作树根节点
    dom: container,
    props: { children: [element] },
    alternate: currentRoot,
  };

  nextUnitOfWork = wipRoot;      // ← 设置工作起点
  deletions = [];
}
```

**此时状态：**
```
wipRoot → { 根 Fiber 节点 }
nextUnitOfWork → wipRoot  （指向同一个对象）
currentRoot → null （首次渲染）
```

### 构建阶段

```javascript
// workLoop 被调度执行
function workLoop(deadline) {
  while (nextUnitOfWork && !shouldYield) {
    // nextUnitOfWork 沿着 Fiber 树移动
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  // ...
}

function performUnitOfWork(fiber) {
  // 1. 处理当前 fiber
  updateHostComponent(fiber);

  // 2. 返回下一个 fiber（深度优先遍历）
  if (fiber.child) return fiber.child;
  if (fiber.sibling) return fiber.sibling;
  // ... 向上查找
}
```

**遍历过程：**
```
nextUnitOfWork 的变化：

wipRoot (App)
    ↓ child
  fiber A
    ↓ child
  fiber C
    ↓ sibling (回到 A.sibling)
  fiber B
    ↓ sibling
  null  ← 遍历完成
```

### 提交阶段

```javascript
// nextUnitOfWork 为 null 时触发
if (!nextUnitOfWork && wipRoot) {
  commitRoot();
}

function commitRoot() {
  // 从 wipRoot 开始提交整棵树
  commitWork(wipRoot.child);

  // 切换指针
  currentRoot = wipRoot;  // 工作树变成当前树
  wipRoot = null;         // 清空工作树
}
```

---

## 四、完整示例：从点击到渲染

```javascript
// 用户点击按钮，触发 setState
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

// ========== 步骤 1：setState 触发渲染 ==========
const setState = action => {
  hook.queue.push(action);

  // 创建新的工作树
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,      // ← 指向旧树
  };

  nextUnitOfWork = wipRoot;      // ← 设置起点
  deletions = [];
};

// ========== 步骤 2：调度器开始工作 ==========
function workLoop(deadline) {
  // nextUnitOfWork: wipRoot → Counter fiber → button fiber → text fiber → null

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  // nextUnitOfWork 为 null，工作完成
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
}

// ========== 步骤 3：提交到 DOM ==========
function commitRoot() {
  commitWork(wipRoot.child);  // 递归更新 DOM

  currentRoot = wipRoot;      // 切换
  wipRoot = null;             // 清空
}
```

---

## 五、关键对比

### nextUnitOfWork vs wipRoot

| 特性 | nextUnitOfWork | wipRoot |
|------|---------------|---------|
| **类型** | 工作单元指针 | Fiber 树根节点 |
| **作用** | 指向下一个要处理的 fiber | 指向整个工作树的根 |
| **生命周期** | 不断变化（遍历过程中） | 渲染开始创建，提交后清空 |
| **为 null 的含义** | 工作完成 | 没有进行中的渲染 |
| **可中断性** | 记录中断位置 | 保存整个工作树 |

### 生命周期对比

```
渲染周期：

创建阶段：
wipRoot = { ... }           ← 创建工作树根
nextUnitOfWork = wipRoot    ← 设置起点

工作阶段：
nextUnitOfWork: A → B → C → null  ← 不断变化
wipRoot: 保持不变                  ← 始终指向根

提交阶段：
nextUnitOfWork: null        ← 已完成
wipRoot: 被用于提交         ← 遍历整棵树

清理阶段：
currentRoot = wipRoot       ← 保存
wipRoot = null              ← 清空
nextUnitOfWork: 保持 null    ← 等待下次渲染
```

---

## 六、为什么需要两个变量？

### 如果只有 nextUnitOfWork？

```javascript
// ❌ 问题：提交时无法找到根节点
if (!nextUnitOfWork) {
  // nextUnitOfWork 已经是 null，怎么知道从哪里开始提交？
  commitRoot();  // ← 无法执行！
}
```

### 如果只有 wipRoot？

```javascript
// ❌ 问题：无法记住中断位置
function workLoop(deadline) {
  // 只能每次从 wipRoot 开始，无法继续上次的工作
  let current = wipRoot;
  while (/* 如何判断是否完成？ */) {
    current = performUnitOfWork(current);
  }
}
```

### 两者配合才完美！

```javascript
// ✅ nextUnitOfWork：记录进度（指针）
// ✅ wipRoot：记录起点（根节点）

nextUnitOfWork = wipRoot;      // 开始工作
while (nextUnitOfWork) {       // 判断是否完成
  nextUnitOfWork = ...         // 更新进度
}
commitRoot(wipRoot);           // 从根节点提交
```

---

## 七、总结

### nextUnitOfWork（工作指针）

- **本质：** 指向下一个要处理的 fiber 节点
- **作用：**
  1. 记录渲染进度
  2. 支持可中断渲染
  3. 判断工作是否完成
- **生命周期：** `wipRoot → fiber1 → fiber2 → ... → null`

### wipRoot（工作树根）

- **本质：** 正在构建的 Fiber 树的根节点
- **作用：**
  1. 标记是否有进行中的渲染
  2. 保存整棵工作树
  3. 提供 diff 的起点（通过 alternate）
- **生命周期：** `创建 → 保持 → 提交 → 清空`

### 协同工作

```javascript
// 启动
wipRoot = createRoot()        // 创建根
nextUnitOfWork = wipRoot      // 设置起点

// 工作
nextUnitOfWork = traverse()   // 遍历树

// 完成
if (!nextUnitOfWork && wipRoot) {
  commitRoot()                // 提交
}
```

### 类比

- **wipRoot**：就像一个建筑项目的蓝图（总规划）
- **nextUnitOfWork**：就像建筑队当前施工的位置（当前进度）

项目开始：拿到蓝图（wipRoot），从第一个房间开始施工（nextUnitOfWork = wipRoot）
施工过程：逐个房间施工（nextUnitOfWork 移动）
中途休息：记住当前位置（nextUnitOfWork），蓝图不变（wipRoot）
继续施工：从记住的位置继续（nextUnitOfWork）
完工验收：根据蓝图验收（commitRoot 从 wipRoot 开始）

这就是 `nextUnitOfWork` 和 `wipRoot` 的全部秘密！
