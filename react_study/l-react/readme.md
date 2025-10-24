实现的功能
1. Fiber 架构
完整的 Fiber 节点数据结构
链表结构的树遍历（child、sibling、parent）
双缓冲机制（current 和 workInProgress 树）
2. 调度系统（Scheduler）
requestIdleCallback 实现时间切片
可中断的渲染流程
工作单元（Unit of Work）概念
3. 协调算法（Reconciliation）
Diff 算法实现
复用 DOM 节点策略
Effect 标记（PLACEMENT、UPDATE、DELETION）
4. 两阶段提交
Render 阶段：构建 Fiber 树，可中断
Commit 阶段：应用 DOM 变更，不可中断
5. Hooks 系统
useState 完整实现
Hooks 队列机制
批量更新原理
6. 核心 API
createElement - JSX 转换
render - 旧版渲染 API
createRoot - React 18 风格 API
useState - 状态管理 Hook
关键概念详解
Fiber 遍历示例
树结构：
     A
    / \
   B   C
  /
 D

遍历顺序：A → B → D → C
为什么需要 Fiber？
解决阻塞问题：老版 React 递归渲染无法中断
时间切片：将工作拆分成小单元，每个单元后检查是否需要让出控制权
优先级调度：高优先级任务（用户输入）可以打断低优先级任务（渲染）
双缓冲机制
维护两棵树：current（当前显示）和 workInProgress（正在构建）
通过 alternate 指针互相引用
提交后切换指针
使用示例
文件末尾包含了完整的使用示例，包括：
简单计数器组件
React 18 风格的使用方式
函数式更新演示

核心内容
Fiber 架构 - 完整的链表结构和遍历机制
调度系统 - requestIdleCallback 时间切片
Diff 算法 - reconcileChildren 协调子元素
两阶段提交 - Render 阶段（可中断）+ Commit 阶段（不可中断）
Hooks 系统 - useState 的完整实现和原理
虚拟 DOM - createElement 和 JSX 转换
文件结构
第一部分：基础常量
第二部分：Fiber 相关核心函数
第三部分：调度系统
第四部分：提交阶段
第五部分：渲染入口
第六部分：createElement（JSX 转换）
第七部分：Hooks 系统
第八部分：createRoot API


# wipFiber 是什么？
wipFiber 全称是 "work in progress fiber"（正在处理的 fiber），它是一个全局变量，专门用于 Hooks 系统。 让我用注释和示例来详细说明：
wpiFiber-expanation.md
简单总结
wipFiber 是什么？
全称：work in progress fiber（正在处理的 fiber）
作用：让 useState 知道自己属于哪个组件
为什么需要它？ 因为 useState 是一个普通函数，它需要知道：
状态存储在哪个组件上？→ wipFiber 指向当前组件
如何区分多个 useState？→ 配合 hookIndex 索引
如何找回上次的状态？→ 通过 wipFiber.alternate.hooks[index]
工作流程：
// 步骤 1: 处理组件前设置上下文
wipFiber = fiber;           // "现在处理这个组件"
hookIndex = 0;              // "从第 0 个 hook 开始"
wipFiber.hooks = [];        // "准备收集 hooks"

// 步骤 2: 执行组件，useState 会被调用
ComponentA(props);
  └─ useState(0)            // 通过 wipFiber 知道是 ComponentA 的状态
     └─ wipFiber.hooks.push(hook)  // 存储到 ComponentA 的 fiber

// 步骤 3: hooks 已保存，wipFiber 可以复用处理下一个组件
关键点：
wipFiber 是临时变量，每次处理新组件都会被覆盖
它就像一个"当前组件指针"，建立 hooks 和组件的连接
这就是为什么 hooks 必须按顺序调用（依赖索引匹配）

# nextUnitOfWork 和wipRoot又是什么作用
nextUnitOfWork-wipRoot-explanation.md

快速总结
nextUnitOfWork（工作指针）
作用： 指向下一个要处理的 fiber 节点
// 它像一个移动的指针，告诉 React "下一步处理哪里"
nextUnitOfWork = wipRoot;     // 开始：指向根节点
nextUnitOfWork = fiberA;      // 移动：处理 A
nextUnitOfWork = fiberB;      // 移动：处理 B
nextUnitOfWork = null;        // 完成：没有更多工作
关键特性： 支持可中断渲染
处理到一半时间用完？没关系，nextUnitOfWork 记住了位置
下次继续从这里开始！
wipRoot（工作树根节点）
作用： 正在构建的 Fiber 树的根节点
// 它像项目蓝图，记录整个渲染任务
wipRoot = {
  dom: container,
  props: { children: [<App />] },
  alternate: currentRoot,  // 指向旧树，用于对比
};
关键作用：
判断是否有渲染任务：wipRoot !== null
提供 diff 起点：wipRoot.alternate
提交时遍历整棵树：commitWork(wipRoot.child)
两者的关系
// 1. 开始渲染
wipRoot = { /* 根节点 */ };        // 创建工作树
nextUnitOfWork = wipRoot;          // 从根开始

// 2. 构建过程
while (nextUnitOfWork) {           // 有工作就继续
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);  // 移动指针
}

// 3. 提交
if (!nextUnitOfWork && wipRoot) {  // 工作完成 且 有工作树
  commitRoot();                     // 从 wipRoot 提交整棵树
  currentRoot = wipRoot;            // 保存
  wipRoot = null;                   // 清空
}
为什么需要两个？
场景	nextUnitOfWork	wipRoot
记录进度	✅ 记录当前位置	❌ 只是根节点
可中断渲染	✅ 记住中断位置	❌ 无法记录
判断完成	✅ 为 null 表示完成	❌ 始终是根
提交起点	❌ 已经是 null	✅ 从根遍历树
diff 对比	❌ 只是指针	✅ 通过 alternate
结论： 必须两者配合！
nextUnitOfWork：动态指针，记录进度
wipRoot：静态根节点，记录全局

# workLoop and fiber
scheduler-workLoop-explanation.md

1. workLoop 和 Fiber 的关系？
是的，密切相关！
Fiber 是数据结构：树形的节点（存储组件信息）
workLoop 是调度器：决定何时处理这些 Fiber 节点
// workLoop 遍历 Fiber 树
while (nextUnitOfWork && !shouldYield) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);  // 处理一个 Fiber
  shouldYield = deadline.timeRemaining() < 1;          // 检查时间
}
2. workLoop 如何做到调度？
核心：时间切片 + 可中断
function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    // 处理一个 fiber
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    
    // 关键：每处理完一个 fiber，检查时间！
    shouldYield = deadline.timeRemaining() < 1;
    //            ↑
    //            浏览器告诉我们还剩多少时间
    //            小于 1ms 就暂停，让出控制权
  }

  // 下一帧继续
  requestIdleCallback(workLoop);
}
示例时间线：
帧 1（16.6ms）：
  处理 fiber A (3ms) ✓ 剩余 11ms，继续
  处理 fiber B (3ms) ✓ 剩余 8ms，继续
  处理 fiber C (3ms) ✓ 剩余 5ms，继续
  处理 fiber D (3ms) ✓ 剩余 2ms，继续
  处理 fiber E (3ms) ✓ 剩余 -1ms，暂停！
  
帧 2（16.6ms）：
  继续处理 fiber F...
3. Scheduler 在哪里？
在这个文件中的位置：
// ========================================
// 第三部分：调度系统（第 226-370 行）
// ========================================

// 核心调度函数
function workLoop(deadline) {  // ← 第 288 行
  // ...
}

// 启动调度
requestIdleCallback(workLoop);  // ← 第 319 行

// 工作单元执行
function performUnitOfWork(fiber) {  // ← 第 338 行
  // ...
}
调度系统的组成部分：
调度入口（第 319 行）
requestIdleCallback(workLoop);  // 浏览器空闲时调用
调度循环（第 288-308 行）
function workLoop(deadline) {
  // 时间切片 + 可中断
}
工作执行（第 338-370 行）
function performUnitOfWork(fiber) {
  // 处理单个 fiber
}
提交阶段（第 549-608 行）
function commitRoot() {
  // 将变更应用到 DOM
}
关键对比
特性	简化版（l-react.js）	真实 React
调度 API	requestIdleCallback	自己的 Scheduler 包
优先级	无	5 个优先级等级
时间切片	固定 1ms	动态调整
饥饿处理	无	低优先级任务超时会提升
但核心思想完全一致：时间切片 + 可中断渲染！ 有其他问题吗？

# 时间切片是怎么做到的
time-slicing-explanation.md

快速总结：时间切片是怎么做到的？
核心原理：三个关键步骤
1. 拆分任务（工作单元）
// 大任务：渲染整棵树 (1000ms)
整棵组件树

// 拆分成小任务
每个 Fiber 节点 = 1 个工作单元 (~1ms)
2. 循环处理 + 时间检查
while (nextUnitOfWork && !shouldYield) {
  // 处理一个 fiber
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  
  // 关键：每处理完一个，就检查时间！
  shouldYield = deadline.timeRemaining() < 1;
  //            ↑
  //            浏览器告诉我们还剩多少空闲时间
  //            < 1ms 就暂停
}
3. 保存进度 + 下次继续
// 时间用完时
nextUnitOfWork = 当前处理到的 fiber  // ← 保存位置

// 下一帧
requestIdleCallback(workLoop);  // 从保存的位置继续
实际执行示例
// 假设渲染 100 个组件，每个 1ms

帧 1（16.6ms 空闲）：
  处理组件 1-15 (15ms)
  检查时间：剩余 1.6ms
  继续处理组件 16 (1ms)
  检查时间：剩余 0.6ms < 1ms ← 暂停！
  保存进度：nextUnitOfWork = 组件 17

用户输入事件被处理...

帧 2（16.6ms 空闲）：
  从组件 17 继续
  处理组件 17-32 (16ms)
  检查时间：剩余 0.6ms < 1ms ← 暂停！
  保存进度：nextUnitOfWork = 组件 33

继续...直到完成
关键代码位置（l-react.js）
第 298 行：时间切片的核心
shouldYield = deadline.timeRemaining() < 1;
第 293-299 行：可中断循环
while (nextUnitOfWork && !shouldYield) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  shouldYield = deadline.timeRemaining() < 1;  // 每次检查
}
第 307 行：继续调度
requestIdleCallback(workLoop);  // 下一帧继续
为什么能做到？
关键：用 while 循环替代递归
// ❌ 递归（不可中断）
function render(node) {
  process(node);
  node.children.forEach(child => render(child));  // 进入调用栈
}

// ✅ 循环（可中断）
while (nextNode && hasTime()) {
  nextNode = process(nextNode);  // 可以随时跳出
}
浏览器的一帧
|←-------- 16.6ms (60fps) --------→|
|                                   |
| 输入事件、定时器、动画、布局、绘制  | ← 必须完成
|                                   |
|---- 剩余空闲时间（如果有）--------|
|                                   |
| requestIdleCallback ← 在这里执行   | ← React 工作
|     ↓                             |
|  workLoop 检查时间                |
|  处理几个 fiber                    |
|  时间不够就暂停                    |
|                                   |
|←-------- 下一帧 --------→|
这就是时间切片的完整实现原理！通过拆分任务 + 时间检查 + 保存进度，React 能够在不阻塞主线程的情况下完成复杂渲染！

# all
react-complete-principles.md

文档包含的所有内容（共 12 个核心主题）：
1. Diff 算法（Reconciliation） ✅
三大策略：同层比较、类型比较、列表 Diff
reconcileChildren 详细解析
完整 Diff 实例演示
性能对比分析
2. 双缓冲机制 ✅
current 树 vs workInProgress 树
alternate 指针的作用
完整工作流程（首次渲染 + 更新渲染）
原子性更新的优势
3. Effect 标记系统 ✅
PLACEMENT / UPDATE / DELETION
标记的生命周期
删除队列的原理
4. Commit 阶段详解 ✅
commitRoot 和 commitWork 完整解析
为什么 Commit 不可中断
函数组件的特殊处理
5. 事件系统 ✅
事件绑定和更新
与真实 React 合成事件的区别
6. 属性更新机制 ✅
updateDom 四步详解
style 属性的特殊处理
属性更新示例
7. 函数组件 vs 原生组件 ✅
两种组件的区别对比
处理流程对比
Commit 阶段的特殊处理
8. 完整渲染流程 ✅
首次渲染完整流程（8 个阶段）
更新渲染完整流程（4 个阶段）
每一步的详细代码执行
9. 深度优先遍历 ✅
遍历规则（child → sibling → parent）
遍历示例和顺序
为什么用深度优先
10. Hooks 深入原理 ✅
useState 完整实现（6 个步骤）
为什么必须按顺序调用
批量更新机制
11. 性能优化原理 ✅
DOM 复用
最小化 DOM 操作
时间切片避免阻塞
12. 真实 React 的区别 ✅
简化对比表
真实 React 的高级优化
Lane 模型、优先级调度等
文档特点：
✅ 全中文 - 所有解释都用中文
✅ 超详细 - 每个概念都有完整示例
✅ 代码实例 - 大量代码演示
✅ 图示说明 - 用树形图、流程图解释
✅ 对比分析 - 新旧方案、不同实现的对比
✅ 完整流程 - 从用户操作到 DOM 更新的全过程 现在你有了一套完整的 React Fiber 架构学习资料！可以随时查阅任何概念！