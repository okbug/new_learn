# React Fiber 架构完整原理解析

> 本文档详细解释 l-react.js 中所有核心概念和实现原理
> 包含：Diff算法、双缓冲、Reconciliation、Commit阶段、事件系统、完整渲染流程等

---

## 目录

1. [Diff 算法（Reconciliation）](#1-diff-算法reconciliation)
2. [双缓冲机制（Double Buffering）](#2-双缓冲机制double-buffering)
3. [Effect 标记系统](#3-effect-标记系统)
4. [Commit 阶段详解](#4-commit-阶段详解)
5. [事件系统](#5-事件系统)
6. [属性更新机制](#6-属性更新机制)
7. [函数组件 vs 原生组件](#7-函数组件-vs-原生组件)
8. [完整渲染流程](#8-完整渲染流程)
9. [深度优先遍历](#9-深度优先遍历)
10. [Hooks 深入原理](#10-hooks-深入原理)
11. [性能优化原理](#11-性能优化原理)
12. [真实 React 的区别](#12-真实-react-的区别)

---

## 1. Diff 算法（Reconciliation）

### 1.1 什么是 Diff 算法？

**目标：** 找出新旧两棵树的差异，用最少的操作更新 DOM

**位置：** `reconcileChildren` 函数（第 460-525 行）

### 1.2 为什么需要 Diff？

```javascript
// 场景：用户点击按钮，count 从 0 变为 1

// 旧的虚拟 DOM 树
<div>
  <h1>Count: 0</h1>
  <button>Click</button>
</div>

// 新的虚拟 DOM 树
<div>
  <h1>Count: 1</h1>
  <button>Click</button>
</div>

// 问题：如何高效更新？
// ❌ 方案 1：删除整个 div，重新创建
//    - 太慢，会丢失 DOM 状态（焦点、滚动位置等）
// ✅ 方案 2：只更新变化的部分（文本节点 "0" → "1"）
//    - Diff 算法找出差异，精准更新
```

### 1.3 Diff 算法的三大策略

#### 策略 1：同层比较（Tree Diff）

**原则：** 只比较同一层级的节点，不跨层级比较

```javascript
// 旧树                  新树
    A                     A
   / \                   / \
  B   C                 D   E
 /                     /
F                     F

// ❌ 不会检测：F 从 B 下移动到 D 下
// ✅ 只会检测：
//    - A 层：A 相同（复用）
//    - 第二层：B、C 变成 D、E（删除 B、C，创建 D、E）
//    - 第三层：F 会被删除并重新创建

// 为什么？
// - 跨层级比较复杂度：O(n³)
// - 同层比较复杂度：O(n)
// - 实践中跨层级移动很少见
```

#### 策略 2：类型比较（Component Diff）

**原则：** 类型不同直接替换，不再深入比较

```javascript
// 旧节点
<div>
  <span>Hello</span>
</div>

// 新节点
<div>
  <p>Hello</p>  // span → p，类型变化
</div>

// Diff 过程
sameType = 'span' === 'p'  // false
→ 删除 <span>Hello</span>
→ 创建 <p>Hello</p>

// 即使内容相同（都是 "Hello"），也会完全替换
// 原因：类型不同意味着结构变化，重建更安全
```

#### 策略 3：列表 Diff（Element Diff）

**原则：** 使用 key 优化列表更新

```javascript
// 旧列表（没有 key）
<ul>
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>

// 新列表（在开头插入 D）
<ul>
  <li>D</li>
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>

// ❌ 没有 key 的 diff：
// 位置 0: A → D（更新）
// 位置 1: B → A（更新）
// 位置 2: C → B（更新）
// 位置 3: 无 → C（创建）
// 总共：3 次更新 + 1 次创建

// ✅ 有 key 的 diff：
<li key="a">A</li>
<li key="b">B</li>
<li key="c">C</li>

// 新列表
<li key="d">D</li>  // key 不存在，创建
<li key="a">A</li>  // key 存在，移动
<li key="b">B</li>  // key 存在，移动
<li key="c">C</li>  // key 存在，移动

// 总共：1 次创建 + 3 次移动（比更新快）
```

**注意：** 简化版 mini-react 没有实现 key 优化，只做了位置对比

### 1.4 reconcileChildren 详细解析

```javascript
function reconcileChildren(wipFiber, elements) {
  let index = 0;

  // 获取旧 fiber（通过 alternate 指针）
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  let prevSibling = null;

  // 遍历新旧子元素
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];  // 新元素
    let newFiber = null;

    // ========== 核心对比逻辑 ==========

    // 比较类型
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 场景 1：类型相同 → 复用 DOM，更新属性
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,           // ← 复用旧 DOM！
        parent: wipFiber,
        alternate: oldFiber,         // ← 保存旧 fiber，用于对比 props
        effectTag: UPDATE,           // ← 标记为更新
      };
    }

    // 场景 2：有新元素且类型不同 → 创建新 DOM
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,                   // ← 新节点，还没有 DOM
        parent: wipFiber,
        alternate: null,
        effectTag: PLACEMENT,        // ← 标记为新增
      };
    }

    // 场景 3：有旧元素且类型不同 → 删除旧 DOM
    if (oldFiber && !sameType) {
      oldFiber.effectTag = DELETION;  // ← 标记为删除
      deletions.push(oldFiber);       // ← 加入删除队列
    }

    // 移动旧 fiber 指针
    if (oldFiber) {
      oldFiber = oldFiber.sibling;  // ← 下一个兄弟节点
    }

    // ========== 构建 fiber 链表 ==========

    if (index === 0) {
      wipFiber.child = newFiber;      // 第一个子节点
    } else if (element) {
      prevSibling.sibling = newFiber; // 其他子节点用 sibling 连接
    }

    prevSibling = newFiber;
    index++;
  }
}
```

### 1.5 Diff 实例详解

```javascript
// 初始渲染
function App() {
  const [show, setShow] = useState(true);
  return (
    <div>
      {show && <p>Hello</p>}
      <button onClick={() => setShow(!show)}>Toggle</button>
    </div>
  );
}

// ========== 第一次渲染 ==========

// 虚拟 DOM
<div>
  <p>Hello</p>
  <button>Toggle</button>
</div>

// reconcileChildren(div fiber, [p, button])
// oldFiber = null（首次渲染）

// 处理 p：
//   element = <p>Hello</p>
//   oldFiber = null
//   sameType = false（没有旧节点）
//   → 创建新 fiber，effectTag = PLACEMENT

// 处理 button：
//   element = <button>Toggle</button>
//   oldFiber = null
//   sameType = false
//   → 创建新 fiber，effectTag = PLACEMENT

// ========== 点击后重新渲染（show = false）==========

// 新虚拟 DOM
<div>
  <button>Toggle</button>
</div>

// reconcileChildren(div fiber, [button])
// oldFiber = p fiber（上次的第一个子节点）

// 处理 button：
//   index = 0
//   element = <button>Toggle</button>
//   oldFiber = p fiber
//   sameType = 'button' === 'p'  // false
//
//   → 删除 p fiber（effectTag = DELETION）
//   → 创建 button fiber（effectTag = PLACEMENT）

// 继续循环：
//   index = 1
//   element = undefined（没有更多新元素）
//   oldFiber = button fiber（上次的第二个子节点）
//
//   → 删除 button fiber（effectTag = DELETION）

// 问题：为什么删除了旧 button？
// 因为简化版没有 key，只能按位置对比
// 位置 0：p → button（类型不同，删除 p，创建新 button）
// 位置 1：button → 无（删除 button）

// 如果有 key：
<p key="p">Hello</p>
<button key="btn">Toggle</button>

// Diff 时可以通过 key 识别：
// - key="p" 的节点消失了 → 删除
// - key="btn" 的节点还在 → 复用（移动到位置 0）
```

### 1.6 为什么 Diff 很重要？

**性能对比：**

```javascript
// 场景：更新一个深层嵌套的文本

<div>                    // 1000 个属性
  <section>              // 500 个属性
    <article>            // 300 个属性
      <p>                // 100 个属性
        <span>Hello</span>  // 要改的文本
      </p>
    </article>
  </section>
</div>

// ❌ 没有 Diff（全部重建）：
// - 删除整个 div 树
// - 创建新的 div 树
// - 操作：1900+ 个 DOM 节点
// - 耗时：100ms+

// ✅ 有 Diff：
// - 复用 div、section、article、p
// - 只更新 span 的文本节点
// - 操作：1 个文本节点
// - 耗时：1ms
```

---

## 2. 双缓冲机制（Double Buffering）

### 2.1 什么是双缓冲？

**定义：** 同时维护两棵 Fiber 树，一棵用于显示（current），一棵用于构建（workInProgress）

**位置：** 全局变量（第 246-254 行）

```javascript
let currentRoot = null;   // 当前屏幕显示的树
let wipRoot = null;       // 正在构建的新树
```

### 2.2 为什么需要双缓冲？

```javascript
// ❌ 没有双缓冲的问题

function updateComponent() {
  // 直接修改当前树
  fiber.dom.textContent = newValue;  // DOM 立即变化

  // 如果后续出错...
  throw new Error('Oops!');

  // 用户看到了不完整的更新 → 界面错乱
}

// ✅ 有双缓冲

function updateComponent() {
  // 在 workInProgress 树上工作
  wipFiber.props = newProps;  // 不影响屏幕

  // 构建完成后，一次性切换
  currentRoot = wipRoot;  // 原子操作，要么全成功，要么全失败
}
```

### 2.3 双缓冲的工作流程

```javascript
// ========== 初始状态 ==========

currentRoot = null
wipRoot = null

屏幕：空白

// ========== 首次渲染开始 ==========

function render(element, container) {
  wipRoot = {
    dom: container,
    props: { children: [element] },
    alternate: null,  // ← 首次渲染，没有旧树
  };

  nextUnitOfWork = wipRoot;
}

currentRoot = null
wipRoot = { ... }  ← 正在构建

屏幕：仍然空白（还没提交）

// ========== Render 阶段：构建新树 ==========

workLoop 执行，构建完整的 fiber 树：

wipRoot
  ↓
div fiber (effectTag: PLACEMENT)
  ↓
h1 fiber (effectTag: PLACEMENT)
  ↓
text fiber (effectTag: PLACEMENT)

currentRoot = null
wipRoot = { 完整的新树 }

屏幕：仍然空白（还在构建中）

// ========== Commit 阶段：切换指针 ==========

function commitRoot() {
  commitWork(wipRoot.child);  // 将变更应用到 DOM

  // 关键：切换指针
  currentRoot = wipRoot;  // ← 新树变成当前树
  wipRoot = null;         // ← 清空工作树
}

currentRoot = { 刚才构建的树 }
wipRoot = null

屏幕：显示新内容！

// ========== 更新渲染开始 ==========

用户点击，触发 setState

function setState(action) {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,  // ← 指向旧树（用于 diff）
  };

  nextUnitOfWork = wipRoot;
}

currentRoot = { 旧树 }
wipRoot = { 新树，通过 alternate 连接到旧树 }

屏幕：仍显示旧内容

// ========== Render 阶段：Diff 对比 ==========

reconcileChildren 执行：
  - 通过 wipFiber.alternate 获取旧 fiber
  - 对比 type，决定复用或创建
  - 标记 effectTag

wipRoot (新树)
  ↓
div fiber (effectTag: UPDATE, alternate → 旧 div fiber)
  ↓
h1 fiber (effectTag: UPDATE, alternate → 旧 h1 fiber)
  ↓
text fiber (effectTag: UPDATE, alternate → 旧 text fiber)

currentRoot = { 旧树 }
wipRoot = { 新树，已标记好 effectTag }

屏幕：仍显示旧内容

// ========== Commit 阶段：切换 ==========

commitRoot()
  commitWork(wipRoot.child)  // 应用 DOM 更新
  currentRoot = wipRoot      // ← 切换
  wipRoot = null             // ← 清空

currentRoot = { 新树 }
wipRoot = null

屏幕：显示新内容！
```

### 2.4 alternate 指针的作用

```javascript
// alternate 是双缓冲的桥梁

// 首次渲染
wipRoot.alternate = null  // 没有旧树

// 更新渲染
wipRoot.alternate = currentRoot  // 指向旧树

// 在 reconcileChildren 中使用
const oldFiber = wipFiber.alternate && wipFiber.alternate.child;
//                ↑
//                通过 alternate 获取旧树的对应节点

// 示例
wipFiber = {
  type: 'div',
  props: { className: 'new' },
  alternate: {  // ← 旧 fiber
    type: 'div',
    props: { className: 'old' },
    dom: <div class="old">...</div>  // ← 可以复用这个 DOM！
  }
}

// Diff 时
if (wipFiber.type === wipFiber.alternate.type) {
  // 类型相同，复用 DOM
  wipFiber.dom = wipFiber.alternate.dom;
  // 只需要更新属性：className: 'old' → 'new'
}
```

### 2.5 双缓冲的优势

**1. 原子性更新**

```javascript
// 没有双缓冲
更新节点 A → 用户看到 A 变化
更新节点 B → 出错！
结果：用户看到不一致的界面（A 更新了，B 没更新）

// 有双缓冲
构建新树（A、B 都更新） → 完成
切换指针 → 用户同时看到 A 和 B 的变化
出错 → 丢弃新树，保持旧界面
结果：要么全成功，要么全不变
```

**2. 性能优化**

```javascript
// 复用 DOM 节点
wipFiber.dom = wipFiber.alternate.dom;  // 直接复用，不重新创建

// 对比 props
const prevProps = wipFiber.alternate.props;
const nextProps = wipFiber.props;
updateDom(dom, prevProps, nextProps);  // 只更新变化的属性
```

**3. 时间旅行（Time Travel）**

```javascript
// 可以保存多个历史版本
const history = [currentRoot1, currentRoot2, currentRoot3];

// 回退到某个版本
currentRoot = history[1];
commitRoot();  // 恢复到历史状态
```

---

## 3. Effect 标记系统

### 3.1 什么是 Effect 标记？

**定义：** 标记 fiber 节点需要执行的 DOM 操作类型

**位置：** 常量定义（第 104-106 行）

```javascript
const PLACEMENT = 'PLACEMENT';  // 新增
const UPDATE = 'UPDATE';        // 更新
const DELETION = 'DELETION';    // 删除
```

### 3.2 为什么需要 Effect 标记？

```javascript
// 问题：如何知道每个 fiber 需要什么操作？

// Render 阶段（构建树）
reconcileChildren() {
  // 发现：这个节点是新的
  newFiber.effectTag = PLACEMENT;  // ← 标记
}

// Commit 阶段（操作 DOM）
commitWork(fiber) {
  if (fiber.effectTag === PLACEMENT) {
    domParent.appendChild(fiber.dom);  // ← 根据标记执行操作
  }
}

// 好处：
// - Render 阶段只标记，不操作 DOM（可中断）
// - Commit 阶段根据标记操作 DOM（不可中断）
```

### 3.3 三种 Effect 标记详解

#### PLACEMENT（新增）

```javascript
// 触发条件：新元素出现

// 示例
const [show, setShow] = useState(false);
setShow(true);  // false → true

// Diff
oldFiber = null（之前不存在）
element = <p>Hello</p>（新元素）
sameType = false

// 标记
newFiber.effectTag = PLACEMENT;

// Commit 时执行
if (fiber.effectTag === PLACEMENT) {
  domParent.appendChild(fiber.dom);  // 添加到 DOM
}
```

#### UPDATE（更新）

```javascript
// 触发条件：类型相同，props 变化

// 示例
const [count, setCount] = useState(0);
setCount(1);  // 0 → 1

// Diff
oldFiber.type = 'span'
element.type = 'span'
sameType = true  // ← 类型相同

oldFiber.props = { children: ['0'] }
element.props = { children: ['1'] }  // ← props 不同

// 标记
newFiber.effectTag = UPDATE;
newFiber.alternate = oldFiber;  // 保存旧 fiber

// Commit 时执行
if (fiber.effectTag === UPDATE) {
  updateDom(
    fiber.dom,
    fiber.alternate.props,  // 旧 props
    fiber.props             // 新 props
  );
  // 只更新变化的属性，不重新创建 DOM
}
```

#### DELETION（删除）

```javascript
// 触发条件：旧元素消失

// 示例
const [show, setShow] = useState(true);
setShow(false);  // true → false

// Diff
oldFiber = <p>Hello</p>（之前存在）
element = undefined（新树中没有）
sameType = false

// 标记
oldFiber.effectTag = DELETION;
deletions.push(oldFiber);  // ← 加入删除队列

// Commit 时执行
deletions.forEach(commitWork);

function commitWork(fiber) {
  if (fiber.effectTag === DELETION) {
    domParent.removeChild(fiber.dom);  // 从 DOM 移除
  }
}
```

### 3.4 Effect 标记的生命周期

```javascript
// ========== Render 阶段：标记 ==========

reconcileChildren(wipFiber, elements) {
  // 场景 1：新增
  if (element && !oldFiber) {
    newFiber.effectTag = PLACEMENT;
  }

  // 场景 2：更新
  if (element && oldFiber && sameType) {
    newFiber.effectTag = UPDATE;
  }

  // 场景 3：删除
  if (!element && oldFiber) {
    oldFiber.effectTag = DELETION;
    deletions.push(oldFiber);
  }
}

// ========== Commit 阶段：执行 ==========

function commitWork(fiber) {
  // 根据标记执行不同操作
  if (fiber.effectTag === PLACEMENT) {
    // 新增：appendChild
  } else if (fiber.effectTag === UPDATE) {
    // 更新：updateDom
  } else if (fiber.effectTag === DELETION) {
    // 删除：removeChild
  }
}
```

### 3.5 删除队列（deletions）

**为什么需要单独的删除队列？**

```javascript
// 问题：删除的节点不在新树中

// 旧树
<div>
  <p>要删除</p>
  <span>保留</span>
</div>

// 新树
<div>
  <span>保留</span>
</div>

// Diff 过程
// p 节点在新树中不存在，但我们需要记录它要被删除

// 解决方案：全局删除队列
let deletions = [];

reconcileChildren() {
  if (oldFiber && !sameType) {
    oldFiber.effectTag = DELETION;
    deletions.push(oldFiber);  // ← 单独跟踪
  }
}

// Commit 时优先处理删除
commitRoot() {
  deletions.forEach(commitWork);  // ← 先删除
  commitWork(wipRoot.child);       // 再添加/更新

  deletions = [];  // 清空队列
}
```

---

## 4. Commit 阶段详解

### 4.1 什么是 Commit 阶段？

**定义：** 将 Render 阶段构建的 Fiber 树的变更应用到真实 DOM

**位置：** `commitRoot` 和 `commitWork` 函数（第 549-628 行）

### 4.2 为什么要分 Render 和 Commit？

```javascript
// Render 阶段
// - 可以被打断
// - 可以丢弃（出错时）
// - 不操作 DOM（用户看不到）

workLoop() {
  while (nextUnitOfWork && hasTime()) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    // ← 可以在这里暂停，不影响用户界面
  }
}

// Commit 阶段
// - 不能被打断（必须同步完成）
// - 不能丢弃（一旦开始就要完成）
// - 操作真实 DOM（用户会看到）

commitRoot() {
  commitWork(wipRoot.child);  // ← 必须一次性完成
  currentRoot = wipRoot;
}
```

**如果不分离：**

```javascript
// ❌ 在 Render 阶段直接操作 DOM

performUnitOfWork(fiber) {
  createDom(fiber);
  fiber.parent.dom.appendChild(fiber.dom);  // 直接添加

  // 如果这时被打断...
  // 用户看到不完整的界面！
}
```

### 4.3 commitRoot 详解

```javascript
function commitRoot() {
  // 第 1 步：处理所有删除操作
  deletions.forEach(commitWork);

  // 为什么先删除？
  // - 删除后释放内存
  // - 避免新旧节点冲突（如相同的 id）

  // 第 2 步：递归处理新增和更新
  commitWork(wipRoot.child);

  // 从根节点的第一个子节点开始
  // 为什么不是 wipRoot？
  // - wipRoot.dom 是 container（已经存在的 DOM）
  // - 只需要处理它的子节点

  // 第 3 步：完成双缓冲切换
  currentRoot = wipRoot;  // 新树变成当前树
  wipRoot = null;         // 清空工作树，等待下次渲染
}
```

### 4.4 commitWork 详解

```javascript
function commitWork(fiber) {
  if (!fiber) {
    return;  // 递归终止条件
  }

  // ========== 第 1 步：找到有 DOM 的父节点 ==========

  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  // 为什么要循环查找？
  // 函数组件没有自己的 DOM

  // 示例：
  // <div>              ← 有 DOM
  //   <App />          ← 函数组件，没有 DOM
  //     <p>Hello</p>   ← 有 DOM
  // </div>

  // 处理 p 时：
  // fiber.parent = App fiber（没有 DOM）
  // → 向上查找 → App.parent = div fiber（有 DOM）
  // → domParent = div 的 DOM

  // ========== 第 2 步：根据 effectTag 执行操作 ==========

  if (fiber.effectTag === PLACEMENT && fiber.dom != null) {
    // 新增：添加到父节点
    domParent.appendChild(fiber.dom);

  } else if (fiber.effectTag === DELETION) {
    // 删除：特殊处理（见下方）
    commitDeletion(fiber, domParent);

  } else if (fiber.effectTag === UPDATE && fiber.dom != null) {
    // 更新：更新属性
    updateDom(
      fiber.dom,
      fiber.alternate.props,  // 旧 props
      fiber.props             // 新 props
    );
  }

  // ========== 第 3 步：递归处理子节点和兄弟节点 ==========

  commitWork(fiber.child);    // 深度优先：先处理子节点
  commitWork(fiber.sibling);  // 然后处理兄弟节点
}
```

### 4.5 commitDeletion 详解

```javascript
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    // 如果有 DOM，直接删除
    domParent.removeChild(fiber.dom);
  } else {
    // 如果没有 DOM（函数组件），递归删除子节点
    commitDeletion(fiber.child, domParent);
  }
}

// 为什么需要特殊处理？

// 示例 1：删除普通元素
<div>
  <p>Delete me</p>  ← 直接删除
</div>

commitDeletion(p fiber, div DOM)
→ p fiber 有 DOM
→ div.removeChild(p 的 DOM)

// 示例 2：删除函数组件
<div>
  <App />          ← 没有 DOM
    <p>Child</p>   ← 有 DOM
</div>

commitDeletion(App fiber, div DOM)
→ App fiber 没有 DOM
→ 递归：commitDeletion(p fiber, div DOM)
→ p fiber 有 DOM
→ div.removeChild(p 的 DOM)
```

### 4.6 Commit 阶段的执行顺序

```javascript
// Fiber 树
      div
     /   \
    p     span
   /
  text

// commitRoot()
deletions.forEach(commitWork);  // 先处理删除
commitWork(div fiber);           // 从根开始

// commitWork(div fiber)
// 1. 处理 div 自己（如果有 effectTag）
// 2. commitWork(p fiber)        ← 递归子节点
// 3. commitWork(span fiber)     ← 递归兄弟

// commitWork(p fiber)
// 1. 处理 p 自己
// 2. commitWork(text fiber)     ← 递归子节点
// 3. commitWork(null)           ← 没有兄弟

// commitWork(text fiber)
// 1. 处理 text 自己
// 2. commitWork(null)           ← 没有子节点
// 3. commitWork(null)           ← 没有兄弟

// commitWork(span fiber)
// ...

// 顺序：div → p → text → span
// 这是深度优先遍历！
```

### 4.7 为什么 Commit 不可中断？

```javascript
// 场景：更新列表

// ❌ 如果 Commit 可中断

commitWork(fiber1);  // 添加第 1 个元素
// 暂停...
// 用户看到不完整的列表

commitWork(fiber2);  // 添加第 2 个元素
// 暂停...
// 界面闪烁

commitWork(fiber3);  // 添加第 3 个元素
// 完成

// 问题：用户看到 3 次不同的界面状态

// ✅ Commit 同步执行

commitWork(fiber1);
commitWork(fiber2);
commitWork(fiber3);
// 一次性完成，用户只看到最终结果
```

---

## 5. 事件系统

### 5.1 事件处理原理

**位置：** `updateDom` 函数（第 185-224 行）

### 5.2 事件绑定

```javascript
// JSX
<button onClick={() => console.log('Clicked')}>
  Click me
</button>

// 转换为
createElement('button', {
  onClick: () => console.log('Clicked')
}, 'Click me')

// 生成虚拟 DOM
{
  type: 'button',
  props: {
    onClick: () => console.log('Clicked'),
    children: ['Click me']
  }
}

// updateDom 处理
function updateDom(dom, prevProps, nextProps) {
  // 添加事件监听
  Object.keys(nextProps)
    .filter(isEvent)  // 'onClick' → true
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      // 'onClick' → 'click'

      dom.addEventListener(eventType, nextProps[name]);
      // button.addEventListener('click', () => console.log('Clicked'))
    });
}
```

### 5.3 事件更新

```javascript
// 旧 props
const oldProps = {
  onClick: () => console.log('Old')
};

// 新 props
const newProps = {
  onClick: () => console.log('New')
};

// updateDom 处理
function updateDom(dom, prevProps, nextProps) {
  // 第 1 步：移除旧事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    // onClick 在新 props 中存在，但值不同
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
      // 移除旧的监听器
    });

  // 第 2 步：添加新事件
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    // onClick 的值改变了
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
      // 添加新的监听器
    });
}
```

### 5.4 支持的事件类型

```javascript
// 所有以 'on' 开头的属性都被视为事件

const isEvent = key => key.startsWith('on');

// 示例
onClick    → addEventListener('click', ...)
onChange   → addEventListener('change', ...)
onInput    → addEventListener('input', ...)
onSubmit   → addEventListener('submit', ...)
onMouseOver → addEventListener('mouseover', ...)
// 等等...
```

### 5.5 与真实 React 的区别

```javascript
// 真实 React：合成事件（SyntheticEvent）

<button onClick={(e) => {
  console.log(e);  // SyntheticEvent，不是原生 Event
  e.stopPropagation();  // React 的方法
}}>

// React 的优化：
// 1. 事件委托：所有事件绑定在 root 节点
// 2. 事件池：复用事件对象
// 3. 跨浏览器兼容：统一 API

// Mini React：原生事件

<button onClick={(e) => {
  console.log(e);  // 原生 Event 对象
  e.stopPropagation();  // 原生方法
}}>

// 直接绑定在元素上，简单但效率较低
```

---

## 6. 属性更新机制

### 6.1 updateDom 详解

**位置：** 第 185-224 行

```javascript
function updateDom(dom, prevProps, nextProps) {
  // ========== 第 1 步：移除旧事件监听器 ==========

  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // ========== 第 2 步：移除已删除的属性 ==========

  Object.keys(prevProps)
    .filter(isProperty)  // 排除 children 和事件
    .filter(isGone(nextProps))  // 在新 props 中不存在
    .forEach(name => {
      dom[name] = '';  // 清空属性
    });

  // ========== 第 3 步：设置新的或已更改的属性 ==========

  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))  // 新属性或值改变
    .forEach(name => {
      if (name === 'style' && typeof nextProps[name] === 'object') {
        // 特殊处理 style 对象
        Object.assign(dom.style, nextProps[name]);
      } else {
        dom[name] = nextProps[name];
      }
    });

  // ========== 第 4 步：添加新的事件监听器 ==========

  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}
```

### 6.2 属性分类

```javascript
// children：子元素
props.children = [child1, child2, ...]

// 事件：以 'on' 开头
onClick, onChange, onInput, ...

// 普通属性：其他所有属性
className, id, value, style, ...
```

### 6.3 属性更新示例

```javascript
// 场景：输入框的 value 改变

// 旧 props
const prevProps = {
  type: 'text',
  value: 'old',
  className: 'input',
  onClick: () => console.log('old')
};

// 新 props
const nextProps = {
  type: 'text',
  value: 'new',
  className: 'input',
  onClick: () => console.log('new')
};

// updateDom 执行

// 第 1 步：移除旧事件
// onClick 改变了
dom.removeEventListener('click', prevProps.onClick);

// 第 2 步：移除已删除的属性
// 没有删除的属性，跳过

// 第 3 步：设置新属性
// value 改变了
dom.value = 'new';  // 'old' → 'new'
// type 没变，跳过
// className 没变，跳过

// 第 4 步：添加新事件
dom.addEventListener('click', nextProps.onClick);

// 最终效果
<input type="text" value="new" class="input" />
```

### 6.4 style 属性的特殊处理

```javascript
// style 是对象，需要特殊处理

// 旧 props
prevProps.style = {
  color: 'red',
  fontSize: '14px'
};

// 新 props
nextProps.style = {
  color: 'blue',
  fontSize: '16px',
  fontWeight: 'bold'
};

// 处理
if (name === 'style' && typeof nextProps[name] === 'object') {
  Object.assign(dom.style, nextProps[name]);
}

// 等价于
dom.style.color = 'blue';
dom.style.fontSize = '16px';
dom.style.fontWeight = 'bold';

// 注意：旧的 style 属性不会自动清除
// 这是简化版的限制
// 真实 React 会逐个对比 style 属性
```

---

## 7. 函数组件 vs 原生组件

### 7.1 两种组件类型

```javascript
// 原生组件（Host Component）
<div>Hello</div>
<button>Click</button>

// 函数组件（Function Component）
function App() {
  return <div>Hello</div>;
}
<App />
```

### 7.2 区别对比

| 特性 | 原生组件 | 函数组件 |
|------|---------|---------|
| **type** | 字符串 ('div') | 函数 (App) |
| **DOM** | 有自己的 DOM | 没有 DOM |
| **children** | 直接从 props 获取 | 执行函数获取 |
| **更新函数** | `updateHostComponent` | `updateFunctionComponent` |
| **Hooks** | 不支持 | 支持 |

### 7.3 处理流程对比

#### 原生组件

```javascript
function updateHostComponent(fiber) {
  // 1. 创建 DOM（如果还没有）
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 2. 获取 children（直接从 props）
  const elements = fiber.props.children;

  // 3. 协调 children
  reconcileChildren(fiber, elements);
}

// 示例
const fiber = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      { type: 'p', props: { children: ['Hello'] } }
    ]
  }
};

// 执行
createDom(fiber);
// → 创建 <div class="container"></div>

elements = fiber.props.children;
// → [{ type: 'p', ... }]

reconcileChildren(fiber, elements);
// → 为 p 创建 fiber
```

#### 函数组件

```javascript
function updateFunctionComponent(fiber) {
  // 1. 初始化 hooks 环境
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];

  // 2. 执行函数，获取 children
  const children = [fiber.type(fiber.props)];

  // 3. 协调 children
  reconcileChildren(fiber, children);
}

// 示例
function App(props) {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}

const fiber = {
  type: App,  // 函数
  props: {}
};

// 执行
wipFiber = fiber;
hookIndex = 0;
wipFiber.hooks = [];

const children = [App({})];
// 函数执行：
// - useState(0) 被调用 → 创建 hook
// - 返回 <div>0</div>

// children = [{ type: 'div', props: { children: ['0'] } }]

reconcileChildren(fiber, children);
// → 为 div 创建 fiber
```

### 7.4 函数组件的特殊处理

#### Commit 阶段

```javascript
// 函数组件没有 DOM，需要特殊处理

// 查找有 DOM 的父节点
let domParentFiber = fiber.parent;
while (!domParentFiber.dom) {
  domParentFiber = domParentFiber.parent;
}

// 示例
<div>              ← div fiber，有 DOM
  <App />          ← App fiber，没有 DOM
    <p>Hello</p>   ← p fiber，有 DOM
</div>

// 提交 p fiber 时
fiber.parent = App fiber（没有 DOM）
→ while 循环
→ domParentFiber = App.parent = div fiber（有 DOM）
→ domParent = div 的 DOM
→ domParent.appendChild(p 的 DOM)
```

#### 删除阶段

```javascript
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    // 函数组件没有 DOM，递归查找子节点
    commitDeletion(fiber.child, domParent);
  }
}

// 示例
<div>
  <App />        ← 要删除，但没有 DOM
    <p>Child</p> ← 有 DOM
</div>

// 删除 App
commitDeletion(App fiber, div DOM)
→ App.dom = null
→ 递归：commitDeletion(p fiber, div DOM)
→ p.dom 存在
→ div.removeChild(p 的 DOM)
```

---

## 8. 完整渲染流程

### 8.1 首次渲染完整流程

```javascript
// ========== 阶段 0：用户代码 ==========

function App() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

const container = document.getElementById('root');
const root = MiniReact.createRoot(container);
root.render(MiniReact.createElement(App));

// ========== 阶段 1：创建根 fiber ==========

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element]  // [App 虚拟 DOM]
    },
    alternate: null  // 首次渲染，没有旧树
  };

  deletions = [];
  nextUnitOfWork = wipRoot;
}

// 全局状态
currentRoot = null
wipRoot = { 根 fiber }
nextUnitOfWork = wipRoot

// ========== 阶段 2：调度开始 ==========

requestIdleCallback(workLoop);

// 浏览器空闲时
workLoop(deadline) {
  // deadline.timeRemaining() = 14ms

  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
}

// ========== 阶段 3：构建 Fiber 树 ==========

// 循环 1：处理根 fiber
nextUnitOfWork = wipRoot
performUnitOfWork(wipRoot)
  → updateHostComponent(wipRoot)
    → 已有 DOM（container）
    → elements = [App 虚拟 DOM]
    → reconcileChildren(wipRoot, elements)
      → 创建 App fiber
      → wipRoot.child = App fiber
  → 返回 wipRoot.child = App fiber

// 循环 2：处理 App fiber
nextUnitOfWork = App fiber
performUnitOfWork(App fiber)
  → updateFunctionComponent(App fiber)
    → wipFiber = App fiber
    → hookIndex = 0
    → wipFiber.hooks = []
    → children = [App(props)]  // 执行函数
      → useState(0) 被调用
        → 创建 hook: { state: 0, queue: [] }
        → wipFiber.hooks.push(hook)
        → hookIndex++
        → 返回 [0, setState]
      → 返回 <div><h1>Count: 0</h1><button>+</button></div>
    → reconcileChildren(App fiber, [div 虚拟 DOM])
      → 创建 div fiber
      → App fiber.child = div fiber
  → 返回 div fiber

// 循环 3：处理 div fiber
nextUnitOfWork = div fiber
performUnitOfWork(div fiber)
  → updateHostComponent(div fiber)
    → createDom(div fiber)
      → 创建 <div> 元素
      → div fiber.dom = <div>
    → elements = [h1 虚拟 DOM, button 虚拟 DOM]
    → reconcileChildren(div fiber, elements)
      → 创建 h1 fiber
      → 创建 button fiber
      → div fiber.child = h1 fiber
      → h1 fiber.sibling = button fiber
  → 返回 h1 fiber

// 循环 4-N：处理剩余 fiber...
// h1 → text fiber → button → text fiber → null

// ========== 阶段 4：进入 Commit ==========

nextUnitOfWork = null  // 所有 fiber 处理完成

if (!nextUnitOfWork && wipRoot) {
  commitRoot();
}

// ========== 阶段 5：Commit 阶段 ==========

function commitRoot() {
  // 1. 处理删除（首次渲染无删除）
  deletions.forEach(commitWork);  // deletions = []

  // 2. 递归提交
  commitWork(wipRoot.child);
}

commitWork(App fiber)
  → 没有 DOM，不执行操作
  → commitWork(div fiber)
    → effectTag = PLACEMENT
    → domParent = container
    → container.appendChild(<div>)
    → commitWork(h1 fiber)
      → effectTag = PLACEMENT
      → domParent = <div>
      → div.appendChild(<h1>)
      → commitWork(text fiber)
        → effectTag = PLACEMENT
        → text.appendChild(textNode)
        → commitWork(null)
      → commitWork(null)
    → commitWork(button fiber)
      → ...
  → commitWork(null)

// ========== 阶段 6：完成 ==========

currentRoot = wipRoot
wipRoot = null

// 屏幕显示：
<div>
  <h1>Count: 0</h1>
  <button>+</button>
</div>
```

### 8.2 更新渲染完整流程

```javascript
// ========== 阶段 0：用户点击按钮 ==========

button.click()
  → onClick 触发
  → setCount(count + 1)
  → setCount(1)

// ========== 阶段 1：setState 内部 ==========

function setState(action) {
  // 1. 加入队列
  hook.queue.push(action);  // [1]

  // 2. 创建新的工作树
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot  // ← 指向旧树
  };

  // 3. 启动调度
  nextUnitOfWork = wipRoot;
  deletions = [];
}

// 全局状态
currentRoot = { 旧树 }
wipRoot = { 新树 }
nextUnitOfWork = wipRoot

// ========== 阶段 2：Render 阶段（Diff）==========

// 循环 1：处理根 fiber
performUnitOfWork(wipRoot)
  → reconcileChildren(wipRoot, [App 虚拟 DOM])
    → oldFiber = currentRoot.child = 旧 App fiber
    → sameType = true（都是 App）
    → 创建新 App fiber：
      {
        type: App,
        dom: null,
        alternate: 旧 App fiber,
        effectTag: UPDATE
      }

// 循环 2：处理 App fiber
performUnitOfWork(App fiber)
  → updateFunctionComponent(App fiber)
    → wipFiber = App fiber
    → hookIndex = 0
    → wipFiber.hooks = []
    → children = [App(props)]
      → useState(0) 被调用
        → oldHook = App fiber.alternate.hooks[0]
          = { state: 0, queue: [1] }
        → 执行 queue：state = 1
        → 新 hook = { state: 1, queue: [] }
        → 返回 [1, setState]
      → 返回 <div><h1>Count: 1</h1>...</div>
    → reconcileChildren(App fiber, [新 div 虚拟 DOM])
      → oldFiber = 旧 div fiber
      → sameType = true
      → 新 div fiber.effectTag = UPDATE

// 循环 3-N：继续 diff...
// div → UPDATE
// h1 → UPDATE
// text → UPDATE（"Count: 0" → "Count: 1"）
// button → UPDATE
// ...

// ========== 阶段 3：Commit 阶段 ==========

commitRoot()
  → commitWork(App fiber)
    → effectTag = UPDATE，但没有 DOM，跳过
    → commitWork(div fiber)
      → effectTag = UPDATE
      → updateDom(div.dom, 旧 props, 新 props)
        // 没有变化
      → commitWork(h1 fiber)
        → effectTag = UPDATE
        → updateDom(h1.dom, 旧 props, 新 props)
          // 没有变化
        → commitWork(text fiber)
          → effectTag = UPDATE
          → updateDom(text.dom, { nodeValue: '0' }, { nodeValue: '1' })
            // textNode.nodeValue = '1'
            // DOM 更新！

// ========== 阶段 4：完成 ==========

currentRoot = wipRoot
wipRoot = null

// 屏幕显示：
<div>
  <h1>Count: 1</h1>  ← 变化了！
  <button>+</button>
</div>
```

---

## 9. 深度优先遍历

### 9.1 什么是深度优先遍历？

**定义：** 优先访问子节点，再访问兄弟节点

### 9.2 Fiber 树的遍历规则

```javascript
function performUnitOfWork(fiber) {
  // 1. 处理当前 fiber
  updateComponent(fiber);

  // 2. 选择下一个 fiber（深度优先）

  // 规则 1：如果有子节点，返回子节点
  if (fiber.child) {
    return fiber.child;
  }

  // 规则 2：如果没有子节点，查找兄弟节点
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 规则 3：没有兄弟节点，回到父节点
    nextFiber = nextFiber.parent;
  }

  // 规则 4：遍历完成
  return null;
}
```

### 9.3 遍历示例

```javascript
// Fiber 树
        A
       / \
      B   C
     /     \
    D       E

// 遍历顺序
nextUnitOfWork = A
  → 有 child → 返回 B

nextUnitOfWork = B
  → 有 child → 返回 D

nextUnitOfWork = D
  → 无 child
  → 无 sibling
  → 回到 parent (B)
  → B 无 sibling
  → 回到 parent (A)
  → A 有 sibling → 返回 C

nextUnitOfWork = C
  → 有 child → 返回 E

nextUnitOfWork = E
  → 无 child
  → 无 sibling
  → 回到 parent (C)
  → C 无 sibling
  → 回到 parent (A)
  → A 无 parent
  → 返回 null

// 完整顺序：A → B → D → C → E
```

### 9.4 为什么用深度优先？

**优势：**

1. **内存效率**：只需要保存当前路径
2. **增量更新**：可以随时暂停和恢复
3. **自然的父子关系**：先处理父节点，再处理子节点

**对比广度优先：**

```javascript
// 广度优先（层序遍历）
// A → B → C → D → E
// 问题：需要队列存储所有同层节点，内存开销大

// 深度优先
// A → B → D → C → E
// 优势：只需要存储当前节点，内存开销小
```

---

## 10. Hooks 深入原理

### 10.1 useState 完整实现

```javascript
function useState(initial) {
  // ========== 第 1 步：获取旧 hook ==========

  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  // 首次渲染：oldHook = undefined
  // 更新渲染：oldHook = { state: 旧值, queue: [...] }

  // ========== 第 2 步：创建新 hook ==========

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: []
  };

  // ========== 第 3 步：执行队列中的 action ==========

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = typeof action === 'function'
      ? action(hook.state)  // 函数式更新
      : action;             // 直接更新
  });

  // ========== 第 4 步：创建 setState 函数 ==========

  const setState = action => {
    hook.queue.push(action);

    // 触发重新渲染
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot
    };

    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  // ========== 第 5 步：保存 hook ==========

  wipFiber.hooks.push(hook);
  hookIndex++;

  // ========== 第 6 步：返回 ==========

  return [hook.state, setState];
}
```

### 10.2 为什么 Hooks 必须按顺序调用？

```javascript
// ✅ 正确用法
function Component() {
  const [count, setCount] = useState(0);     // hooks[0]
  const [name, setName] = useState('Tom');   // hooks[1]
  const [age, setAge] = useState(18);        // hooks[2]

  return ...
}

// 首次渲染
fiber.hooks = [
  { state: 0 },    // count
  { state: 'Tom' }, // name
  { state: 18 }    // age
]

// 更新渲染
hookIndex = 0 → hooks[0] → count
hookIndex = 1 → hooks[1] → name
hookIndex = 2 → hooks[2] → age
// 完美匹配！

// ❌ 错误用法（条件调用）
function Component() {
  const [count, setCount] = useState(0);     // hooks[0]

  if (count > 0) {
    const [name, setName] = useState('Tom'); // hooks[1]（有时有，有时没有）
  }

  const [age, setAge] = useState(18);        // hooks[1] 或 hooks[2]

  return ...
}

// 首次渲染（count = 0）
fiber.hooks = [
  { state: 0 },    // count
  { state: 18 }    // age（错位了！）
]

// 更新渲染（count = 1）
hookIndex = 0 → hooks[0] → count ✓
hookIndex = 1 → hooks[1] → name（期望是 age 的值！）错乱！
hookIndex = 2 → hooks[2] → age
```

### 10.3 批量更新

```javascript
// 用户连续点击 3 次
button.onClick = () => {
  setCount(count + 1);  // action 1
  setCount(count + 1);  // action 2
  setCount(count + 1);  // action 3
};

// setState 执行
hook.queue = [
  count => count + 1,
  count => count + 1,
  count => count + 1
];

// 只触发一次重新渲染
wipRoot = { ... };
nextUnitOfWork = wipRoot;

// 下次渲染时
useState(0) {
  const actions = hook.queue;  // [fn, fn, fn]

  actions.forEach(action => {
    hook.state = action(hook.state);
  });

  // 执行过程：
  // 0 → 1 → 2 → 3

  return [3, setState];
}
```

---

## 11. 性能优化原理

### 11.1 DOM 复用

```javascript
// 没有复用：每次都创建新 DOM
function render() {
  const oldDiv = document.querySelector('div');
  oldDiv.remove();

  const newDiv = document.createElement('div');
  document.body.appendChild(newDiv);
  // 慢！丢失状态（焦点、滚动位置等）
}

// 有复用：只更新变化的部分
if (sameType) {
  newFiber.dom = oldFiber.dom;  // 复用
  newFiber.effectTag = UPDATE;  // 只更新属性
}
```

### 11.2 最小化 DOM 操作

```javascript
// Diff 算法只更新变化的部分

// 旧树
<div className="old">
  <p>Hello</p>
  <span>World</span>
</div>

// 新树
<div className="new">
  <p>Hello</p>
  <span>World</span>
</div>

// Diff 结果
// div: UPDATE（只改 className）
// p: 复用（无变化）
// span: 复用（无变化）

// 只执行 1 次 DOM 操作
div.className = 'new';
```

### 11.3 时间切片避免阻塞

```javascript
// 大型组件树（1000 个节点）

// 传统方式：阻塞 1 秒
for (let i = 0; i < 1000; i++) {
  processNode(nodes[i]);  // 无法中断
}

// Fiber 方式：分散到多帧
帧 1: 处理 15 个节点 → 让出控制权
帧 2: 处理 15 个节点 → 让出控制权
...
帧 67: 处理完成

// 用户体验：流畅
```

---

## 12. 真实 React 的区别

### 12.1 简化的部分

| 功能 | Mini React | 真实 React |
|------|-----------|-----------|
| **调度器** | requestIdleCallback | Scheduler 包（优先级队列） |
| **Diff** | 位置对比 | key 优化 + 多节点 diff |
| **Hooks** | useState | 15+ hooks |
| **事件** | 原生事件 | 合成事件 + 事件委托 |
| **错误处理** | 无 | Error Boundaries |
| **Context** | 无 | Context API |
| **Ref** | 无 | useRef + forwardRef |
| **Suspense** | 无 | 异步组件 |
| **Concurrent** | 无 | 并发渲染 |

### 12.2 真实 React 的优化

**1. 优先级调度**

```javascript
// 真实 React
高优先级：用户输入、动画
中优先级：数据获取
低优先级：后台任务

// 高优先级任务可以打断低优先级任务
```

**2. Lane 模型**

```javascript
// 用位运算管理优先级
const SyncLane = 0b0001;
const InputContinuousLane = 0b0010;
const DefaultLane = 0b0100;
```

**3. 饥饿问题处理**

```javascript
// 低优先级任务等待太久，提升优先级
if (task.waitTime > threshold) {
  task.priority = HIGH;
}
```

**4. 多节点 Diff**

```javascript
// 处理节点移动
// 旧：A B C D
// 新：B D A C
// 识别移动，而不是删除+创建
```

---

## 总结

### 核心流程

```
用户操作
  ↓
setState
  ↓
创建 wipRoot（双缓冲）
  ↓
workLoop 调度（时间切片）
  ↓
performUnitOfWork（深度优先遍历）
  ↓
reconcileChildren（Diff 算法）
  ↓
标记 effectTag
  ↓
commitRoot（Commit 阶段）
  ↓
更新 DOM
  ↓
切换 currentRoot
```

### 关键概念

1. **Fiber**: 数据结构，链表树
2. **双缓冲**: current + workInProgress
3. **时间切片**: requestIdleCallback + shouldYield
4. **Diff 算法**: 同层对比 + 类型匹配
5. **Effect 标记**: PLACEMENT/UPDATE/DELETION
6. **两阶段**: Render（可中断）+ Commit（不可中断）
7. **Hooks**: 通过索引匹配状态
8. **深度优先**: child → sibling → parent

这就是 React Fiber 架构的完整原理！
