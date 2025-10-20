/**
 * Mini React 实现
 *
 * 本文件实现了 React 的核心功能，包括：
 * 1. Fiber 架构
 * 2. 调度系统 (Scheduler)
 * 3. 协调算法（Reconciliation/Diff 算法）
 * 4. Hooks 系统（useState）
 * 5. 渲染流程
 *
 * ============================================================
 * 核心概念详解
 * ============================================================
 *
 * 【什么是 Fiber？】
 *
 * Fiber 是 React 16 引入的新架构，它解决了以下问题：
 *
 * 1. 老架构的问题（React 15）：
 *    - 递归渲染，一旦开始无法中断
 *    - 大组件树会导致主线程长时间被占用
 *    - 用户交互（如输入）会出现卡顿
 *
 * 2. Fiber 的解决方案：
 *    - 将渲染工作拆分成小的工作单元（fiber 节点）
 *    - 每完成一个单元，检查是否需要让出控制权
 *    - 浏览器空闲时继续执行，保证流畅性
 *
 * 3. Fiber 节点的数据结构：
 *    {
 *      type: 元素类型（如 'div', 或函数组件）
 *      props: 属性对象
 *      dom: 对应的真实 DOM 节点
 *      parent: 父 fiber
 *      child: 第一个子 fiber
 *      sibling: 下一个兄弟 fiber
 *      alternate: 上一次渲染的 fiber（用于对比）
 *      effectTag: 标记操作类型（PLACEMENT/UPDATE/DELETION）
 *      hooks: 当前 fiber 的 hooks 列表
 *    }
 *
 * 【Fiber 树的遍历】
 *
 * Fiber 使用链表结构，通过三个指针遍历：
 * - child: 指向第一个子节点
 * - sibling: 指向下一个兄弟节点
 * - parent: 指向父节点（用于回溯）
 *
 * 遍历规则（深度优先）：
 * 1. 如果有 child，处理 child
 * 2. 如果没有 child 但有 sibling，处理 sibling
 * 3. 如果都没有，返回 parent 的 sibling
 *
 * 例子：
 *        A
 *       / \
 *      B   C
 *     /
 *    D
 *
 * 遍历顺序：A -> B -> D -> C
 *
 * 【调度机制】
 *
 * React 使用 requestIdleCallback（或 polyfill）实现调度：
 * - 浏览器每一帧（16.6ms）中，执行完必要任务后有空闲时间
 * - requestIdleCallback 在空闲时执行低优先级任务
 * - 如果任务没完成，下一帧继续执行
 * - 保证高优先级任务（如用户输入）不被阻塞
 *
 * 【双缓冲机制】
 *
 * React 维护两棵 Fiber 树：
 * - current 树：当前屏幕显示的内容
 * - workInProgress 树：正在构建的新树
 *
 * 通过 alternate 指针互相指向：
 * current.alternate = workInProgress
 * workInProgress.alternate = current
 *
 * 提交阶段完成后，切换指针，workInProgress 变成新的 current
 *
 * 【两个阶段】
 *
 * 1. Render 阶段（可中断）：
 *    - 构建 Fiber 树
 *    - 执行 diff 算法
 *    - 标记副作用（effectTag）
 *    - 可以被高优先级任务打断
 *
 * 2. Commit 阶段（不可中断）：
 *    - 将变更应用到真实 DOM
 *    - 执行生命周期和副作用
 *    - 必须同步执行，保证一致性
 */

/**
 * ============================================================
 * 第一部分：基础工具和常量
 * ============================================================
 */

// Effect 标记：用于标识 fiber 需要执行的操作
const PLACEMENT = 'PLACEMENT';  // 新增节点
const UPDATE = 'UPDATE';        // 更新节点
const DELETION = 'DELETION';    // 删除节点

/**
 * ============================================================
 * 第二部分：Fiber 相关核心函数
 * ============================================================
 */

/**
 * 创建 DOM 元素
 *
 * @param {Object} fiber - fiber 节点
 * @returns {HTMLElement} 创建的 DOM 节点
 *
 * 这个函数根据 fiber 的 type 创建对应的 DOM 节点
 * 如果是文本节点（TEXT_ELEMENT），创建文本节点
 * 否则创建普通元素节点
 */
function createDom(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);

  // 更新 DOM 属性
  updateDom(dom, {}, fiber.props);

  return dom;
}

/**
 * 判断属性是否为事件监听器
 *
 * @param {string} key - 属性名
 * @returns {boolean}
 *
 * 事件属性以 'on' 开头，如 onClick, onInput
 */
const isEvent = key => key.startsWith('on');

/**
 * 判断属性是否为普通属性（非 children 和事件）
 *
 * @param {string} key - 属性名
 * @returns {boolean}
 */
const isProperty = key => key !== 'children' && !isEvent(key);

/**
 * 判断属性是否为新属性或已更改
 *
 * @param {Object} prev - 旧属性对象
 * @param {Object} next - 新属性对象
 * @returns {Function} 判断函数
 */
const isNew = (prev, next) => key => prev[key] !== next[key];

/**
 * 判断属性是否已被删除
 *
 * @param {Object} next - 新属性对象
 * @returns {Function} 判断函数
 */
const isGone = next => key => !(key in next);

/**
 * 更新 DOM 节点的属性
 *
 * @param {HTMLElement} dom - DOM 节点
 * @param {Object} prevProps - 旧属性
 * @param {Object} nextProps - 新属性
 *
 * 这个函数处理属性的增删改，包括：
 * 1. 移除旧的事件监听器
 * 2. 移除已删除的属性
 * 3. 设置新的或已更改的属性
 * 4. 添加新的事件监听器
 *
 * 注意：style 属性需要特殊处理（这里简化了）
 */
function updateDom(dom, prevProps, nextProps) {
  // 1. 移除旧的或已更改的事件监听器
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2); // onClick -> click
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 2. 移除旧属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(nextProps))
    .forEach(name => {
      dom[name] = '';
    });

  // 3. 设置新属性或已更改的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      // 特殊处理 style 对象
      if (name === 'style' && typeof nextProps[name] === 'object') {
        Object.assign(dom.style, nextProps[name]);
      } else {
        dom[name] = nextProps[name];
      }
    });

  // 4. 添加新的事件监听器
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

/**
 * ============================================================
 * 第三部分：调度系统
 * ============================================================
 */

/**
 * 下一个工作单元
 *
 * 这是调度系统的核心变量，指向当前需要处理的 fiber 节点
 * 当 nextUnitOfWork 为 null 时，说明没有待处理的工作
 */
let nextUnitOfWork = null;

/**
 * 当前正在构建的根 fiber
 *
 * wipRoot (work in progress root) 是正在构建的新 fiber 树的根节点
 * 这是"双缓冲"机制中的工作树
 */
let wipRoot = null;

/**
 * 当前已提交到屏幕的根 fiber
 *
 * currentRoot 指向上一次提交的 fiber 树
 * 用于下次 render 时进行对比（diff）
 */
let currentRoot = null;

/**
 * 待删除的 fiber 节点数组
 *
 * 因为删除的节点不在新的 fiber 树中，所以需要单独跟踪
 * 在 commit 阶段统一处理删除操作
 */
let deletions = null;

/**
 * 工作循环（核心调度函数）
 *
 * @param {IdleDeadline} deadline - 浏览器空闲时间对象
 *
 * 这是 React 调度系统的核心：
 *
 * 1. 时间切片（Time Slicing）：
 *    - 检查 deadline.timeRemaining()，如果还有空闲时间，继续执行
 *    - 如果时间用完，让出控制权，等待下一帧
 *
 * 2. 可中断渲染（Interruptible Rendering）：
 *    - 每处理完一个 fiber，都会检查是否需要中断
 *    - 这样高优先级任务（如用户输入）可以插队执行
 *
 * 3. 工作单元（Unit of Work）：
 *    - 每个 fiber 节点就是一个工作单元
 *    - performUnitOfWork 处理一个单元，返回下一个单元
 *
 * 4. 提交阶段：
 *    - 当所有工作单元完成（nextUnitOfWork 为 null）
 *    - 且有完整的工作树（wipRoot 不为 null）
 *    - 调用 commitRoot 将变更应用到 DOM
 */
function workLoop(deadline) {
  // 是否应该让出控制权
  let shouldYield = false;

  // 循环处理工作单元，直到没有工作或需要让出控制权
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 检查剩余时间，小于 1ms 时让出控制权
    // 1ms 是一个经验值，给浏览器留出执行其他任务的时间
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果所有工作完成，且有待提交的根节点，执行提交
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  // 继续请求空闲时间回调，形成循环调度
  requestIdleCallback(workLoop);
}

/**
 * 启动调度循环
 *
 * requestIdleCallback 是浏览器 API，在主线程空闲时执行回调
 *
 * 注意：
 * - 这个 API 在某些浏览器不支持，实际 React 使用了自己的 polyfill
 * - React 的调度器（Scheduler）更复杂，支持优先级队列
 */
requestIdleCallback(workLoop);

/**
 * 执行一个工作单元
 *
 * @param {Object} fiber - 当前要处理的 fiber 节点
 * @returns {Object|null} 下一个要处理的 fiber 节点
 *
 * 这个函数是 Render 阶段的核心，它做三件事：
 *
 * 1. 为 fiber 创建 DOM（如果需要）
 * 2. 为子元素创建 fiber
 * 3. 选择下一个工作单元
 *
 * 遍历策略（深度优先）：
 * - 优先处理 child（向下）
 * - 没有 child 就处理 sibling（横向）
 * - 都没有就返回 parent 的 sibling（向上再横向）
 */
function performUnitOfWork(fiber) {
  // 1. 判断是否为函数组件
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    // 函数组件的处理逻辑
    updateFunctionComponent(fiber);
  } else {
    // 原生 DOM 元素的处理逻辑
    updateHostComponent(fiber);
  }

  // 2. 返回下一个工作单元（深度优先遍历）

  // 优先返回子节点
  if (fiber.child) {
    return fiber.child;
  }

  // 没有子节点，查找兄弟节点或叔叔节点
  let nextFiber = fiber;
  while (nextFiber) {
    // 如果有兄弟节点，返回兄弟节点
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 否则回到父节点继续查找
    nextFiber = nextFiber.parent;
  }

  // 遍历完成，返回 null
  return null;
}

/**
 * 当前正在处理的函数组件 fiber
 *
 * 用于 hooks 系统，让 useState 知道当前操作的是哪个组件
 */
let wipFiber = null;

/**
 * 当前 hook 的索引
 *
 * 因为一个组件可能调用多个 useState，需要用索引区分
 * 这也是为什么 hooks 必须在顶层调用的原因
 */
let hookIndex = null;

/**
 * 更新函数组件
 *
 * @param {Object} fiber - 函数组件的 fiber 节点
 *
 * 函数组件的特点：
 * 1. type 是一个函数，不是字符串
 * 2. 没有自己的 DOM，children 通过执行函数得到
 * 3. 可以使用 hooks
 *
 * 处理流程：
 * 1. 设置全局变量，为 hooks 准备环境
 * 2. 执行函数组件，得到 children
 * 3. 为 children 创建 fiber（reconcile）
 */
function updateFunctionComponent(fiber) {
  // 初始化 hooks 环境
  wipFiber = fiber;           // 记录当前 fiber
  hookIndex = 0;              // 重置 hook 索引
  wipFiber.hooks = [];        // 初始化 hooks 数组

  // 执行函数组件，获取 children
  // fiber.type 是函数，fiber.props 是传入的 props
  const children = [fiber.type(fiber.props)];

  // 为 children 创建 fiber
  reconcileChildren(fiber, children);
}

/**
 * 更新原生 DOM 组件
 *
 * @param {Object} fiber - DOM 元素的 fiber 节点
 *
 * 原生组件（如 div、span）的处理逻辑：
 * 1. 如果还没有 DOM，创建 DOM
 * 2. 为子元素创建 fiber
 */
function updateHostComponent(fiber) {
  // 1. 创建 DOM（如果还没有）
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  // 2. 为 children 创建 fiber
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
}

/**
 * 协调子元素（Reconciliation / Diff 算法）
 *
 * @param {Object} wipFiber - 当前工作中的 fiber
 * @param {Array} elements - 新的子元素数组
 *
 * 这是 React 最核心的算法之一：Diff 算法
 *
 * 目标：
 * - 复用尽可能多的 DOM 节点
 * - 最小化 DOM 操作
 *
 * 策略（简化版，真实 React 更复杂）：
 * 1. 同位置对比：比较新旧节点的 type
 * 2. type 相同：复用 DOM，标记为 UPDATE
 * 3. type 不同：创建新 DOM，标记为 PLACEMENT；删除旧 DOM
 * 4. 新节点比旧节点多：新增节点
 * 5. 旧节点比新节点多：删除多余节点
 *
 * 真实 React 的优化：
 * - key 属性：优化列表的 diff
 * - 多节点 diff：处理节点移动、插入、删除
 * - 启发式算法：同层对比，不跨层对比
 */
function reconcileChildren(wipFiber, elements) {
  let index = 0;

  // oldFiber: 上一次渲染的子 fiber（通过 alternate 获取）
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;

  let prevSibling = null;

  // 遍历新旧子元素，进行对比
  // 注意：这里简化了，实际 React 会处理 key、多节点移动等复杂情况
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];  // 新元素
    let newFiber = null;

    // 比较 type 是否相同
    // type 是元素的类型，如 'div'、'span' 或函数组件
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 场景 1: type 相同，复用 DOM，更新 props
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,           // 复用旧的 DOM
        parent: wipFiber,
        alternate: oldFiber,         // 指向旧 fiber，用于后续对比
        effectTag: UPDATE,           // 标记为更新
      };
    }

    // 场景 2: type 不同且有新元素，创建新节点
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,                   // 新节点，还没有 DOM
        parent: wipFiber,
        alternate: null,
        effectTag: PLACEMENT,        // 标记为新增
      };
    }

    // 场景 3: type 不同且有旧元素，删除旧节点
    if (oldFiber && !sameType) {
      oldFiber.effectTag = DELETION;  // 标记为删除
      deletions.push(oldFiber);       // 加入删除列表
    }

    // 移动到下一个旧 fiber（兄弟节点）
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    // 构建 fiber 树的链表结构
    if (index === 0) {
      // 第一个子节点作为 child
      wipFiber.child = newFiber;
    } else if (element) {
      // 其他子节点作为 sibling 链接
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

/**
 * ============================================================
 * 第四部分：提交阶段（Commit Phase）
 * ============================================================
 */

/**
 * 提交根节点
 *
 * Commit 阶段的入口函数
 *
 * 为什么需要单独的 Commit 阶段？
 *
 * 1. Render 阶段可中断，可能多次执行
 * 2. DOM 操作必须原子化，不能中途暂停
 * 3. 用户看到的界面必须是一致的状态
 *
 * 执行顺序：
 * 1. 先处理删除（从旧树中删除）
 * 2. 再处理新增和更新（递归处理新树）
 * 3. 更新 currentRoot 指针（完成双缓冲切换）
 */
function commitRoot() {
  // 1. 处理所有删除操作
  deletions.forEach(commitWork);

  // 2. 从根节点开始，递归处理所有变更
  commitWork(wipRoot.child);

  // 3. 保存当前树，用于下次 diff
  currentRoot = wipRoot;

  // 4. 清空工作中的根节点
  wipRoot = null;
}

/**
 * 提交单个 fiber 的变更
 *
 * @param {Object} fiber - 要提交的 fiber 节点
 *
 * 这个函数递归处理 fiber 树，将变更应用到真实 DOM
 *
 * 处理三种情况：
 * 1. PLACEMENT: 新增节点 - appendChild
 * 2. DELETION: 删除节点 - removeChild
 * 3. UPDATE: 更新节点 - updateDom
 *
 * 函数组件的特殊处理：
 * - 函数组件没有自己的 DOM
 * - 需要向上找到有 DOM 的父节点
 * - 需要向下找到有 DOM 的子节点
 */
function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  // 向上查找有 DOM 的父 fiber
  // 因为函数组件没有 DOM，需要跳过
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  // 根据 effectTag 执行不同的 DOM 操作
  if (fiber.effectTag === PLACEMENT && fiber.dom != null) {
    // 新增节点：直接 appendChild
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === DELETION) {
    // 删除节点：需要找到有 DOM 的子节点
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === UPDATE && fiber.dom != null) {
    // 更新节点：更新属性
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }

  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * 提交删除操作
 *
 * @param {Object} fiber - 要删除的 fiber
 * @param {HTMLElement} domParent - 父 DOM 节点
 *
 * 删除的特殊处理：
 * - 函数组件没有 DOM，需要递归找到子孙中有 DOM 的节点
 * - 找到后从父节点移除
 */
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    // 如果有 DOM，直接删除
    domParent.removeChild(fiber.dom);
  } else {
    // 如果没有 DOM（函数组件），递归删除子节点
    commitDeletion(fiber.child, domParent);
  }
}

/**
 * ============================================================
 * 第五部分：渲染入口
 * ============================================================
 */

/**
 * 渲染函数
 *
 * @param {Object} element - 虚拟 DOM 元素
 * @param {HTMLElement} container - 真实 DOM 容器
 *
 * 这个函数启动渲染流程：
 * 1. 创建根 fiber
 * 2. 设置为下一个工作单元
 * 3. 初始化删除列表
 * 4. 等待调度器执行
 */
function render(element, container) {
  // 创建根 fiber（workInProgress root）
  wipRoot = {
    dom: container,              // 根 DOM 容器
    props: {
      children: [element],       // 根元素作为唯一子元素
    },
    alternate: currentRoot,      // 指向上一次的根 fiber（用于 diff）
  };

  // 清空删除列表
  deletions = [];

  // 设置下一个工作单元为根 fiber
  // 调度器会在空闲时开始处理
  nextUnitOfWork = wipRoot;
}

/**
 * ============================================================
 * 第六部分：createElement（JSX 转换）
 * ============================================================
 */

/**
 * 创建元素（虚拟 DOM）
 *
 * @param {string|Function} type - 元素类型
 * @param {Object} props - 属性对象
 * @param  {...any} children - 子元素
 * @returns {Object} 虚拟 DOM 对象
 *
 * 这个函数是 JSX 转换的目标函数
 *
 * JSX:
 * <div className="box">Hello</div>
 *
 * 转换为:
 * createElement('div', { className: 'box' }, 'Hello')
 *
 * 返回:
 * {
 *   type: 'div',
 *   props: {
 *     className: 'box',
 *     children: [{ type: 'TEXT_ELEMENT', props: { nodeValue: 'Hello', children: [] } }]
 *   }
 * }
 */
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object'
          ? child
          : createTextElement(child)
      ),
    },
  };
}

/**
 * 创建文本元素
 *
 * @param {string} text - 文本内容
 * @returns {Object} 文本虚拟 DOM
 *
 * 文本节点的特殊处理：
 * - type 为特殊标记 'TEXT_ELEMENT'
 * - 内容存储在 nodeValue 属性中
 */
function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/**
 * ============================================================
 * 第七部分：Hooks 系统
 * ============================================================
 */

/**
 * useState Hook
 *
 * @param {any} initial - 初始值
 * @returns {Array} [state, setState]
 *
 * useState 的工作原理：
 *
 * 1. 状态存储位置：
 *    - 状态存储在 fiber.hooks 数组中
 *    - 每个 hook 是一个对象：{ state, queue }
 *    - 多个 useState 通过索引（hookIndex）区分
 *
 * 2. 为什么 hooks 要按顺序调用？
 *    - hooks 依赖调用顺序来匹配状态
 *    - 如果顺序变化，状态会错乱
 *    - 这就是 "Rules of Hooks" 的原因
 *
 * 3. 状态更新流程：
 *    a. 调用 setState(newValue)
 *    b. 将 action 加入 hook.queue
 *    c. 创建新的 wipRoot，触发重新渲染
 *    d. 重新执行函数组件
 *    e. 执行 queue 中的所有 action，计算新状态
 *
 * 4. 批量更新：
 *    - 多次 setState 会放入队列
 *    - 在下次渲染时一起执行
 *    - 避免多次渲染，提升性能
 */
function useState(initial) {
  // 从 alternate 获取旧 hook（如果存在）
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  // 创建新 hook 或复用旧 hook
  const hook = {
    state: oldHook ? oldHook.state : initial,  // 状态值
    queue: [],                                  // 待执行的 action 队列
  };

  // 执行上次渲染后加入队列的所有 action
  // 这样可以实现批量更新
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    // action 可以是值或函数
    hook.state = typeof action === 'function'
      ? action(hook.state)   // 函数式更新：setState(prev => prev + 1)
      : action;              // 直接更新：setState(1)
  });

  // setState 函数
  const setState = action => {
    // 将 action 加入队列
    hook.queue.push(action);

    // 触发重新渲染（创建新的 workInProgress root）
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,    // 指向当前树，用于 diff
    };

    // 设置下一个工作单元，启动调度
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  // 将 hook 加入当前 fiber 的 hooks 数组
  wipFiber.hooks.push(hook);

  // 递增 hook 索引，为下一个 useState 做准备
  hookIndex++;

  // 返回状态和更新函数
  return [hook.state, setState];
}

/**
 * ============================================================
 * 第八部分：createRoot API (React 18 风格)
 * ============================================================
 */

/**
 * 创建根节点
 *
 * @param {HTMLElement} container - DOM 容器
 * @returns {Object} 包含 render 方法的对象
 *
 * React 18 引入的新 API，替代 ReactDOM.render
 *
 * 区别：
 * - 旧版：ReactDOM.render(<App />, container)
 * - 新版：ReactDOM.createRoot(container).render(<App />)
 *
 * 优势：
 * 1. 支持并发特性（Concurrent Features）
 * 2. 更好的类型提示
 * 3. 自动启用并发渲染
 */
function createRoot(container) {
  return {
    render(element) {
      render(element, container);
    },
  };
}

/**
 * ============================================================
 * 导出 API
 * ============================================================
 */

// 导出的 MiniReact 对象
const MiniReact = {
  createElement,   // JSX 转换函数
  render,         // 渲染函数（旧版 API）
  createRoot,     // 创建根节点（新版 API）
  useState,       // useState Hook
};

/**
 * ============================================================
 * 使用示例
 * ============================================================
 */

// 示例 1: 简单计数器
function Counter() {
  const [count, setCount] = MiniReact.useState(0);

  return MiniReact.createElement(
    'div',
    null,
    MiniReact.createElement('h1', null, 'Count: ' + count),
    MiniReact.createElement(
      'button',
      { onClick: () => setCount(count + 1) },
      'Increment'
    ),
    MiniReact.createElement(
      'button',
      { onClick: () => setCount(count - 1) },
      'Decrement'
    )
  );
}

// 示例 2: 使用 JSX（需要配置 Babel）
/** @jsx MiniReact.createElement */
/*
function CounterWithJSX() {
  const [count, setCount] = MiniReact.useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)}>Decrement</button>
    </div>
  );
}
*/

// 示例 3: React 18 风格的使用方式
/*
const container = document.getElementById('root');
const root = MiniReact.createRoot(container);
root.render(MiniReact.createElement(Counter));
*/

// 示例 4: 旧版风格的使用方式
/*
MiniReact.render(
  MiniReact.createElement(Counter),
  document.getElementById('root')
);
*/

/**
 * ============================================================
 * 总结：核心流程
 * ============================================================
 *
 * 1. 创建虚拟 DOM（createElement）
 *    JSX -> createElement -> 虚拟 DOM 树
 *
 * 2. 调度渲染（render + workLoop）
 *    创建 fiber 树 -> 设置 nextUnitOfWork -> 等待空闲时间
 *
 * 3. 构建 Fiber 树（performUnitOfWork + reconcileChildren）
 *    遍历虚拟 DOM -> 创建 fiber -> diff -> 标记 effectTag
 *
 * 4. 提交变更（commitRoot + commitWork）
 *    遍历 fiber 树 -> 应用 DOM 操作 -> 更新完成
 *
 * 5. 状态更新（useState）
 *    setState -> 加入队列 -> 触发新的渲染 -> 执行队列 -> 更新状态
 *
 * ============================================================
 * 与真实 React 的差异
 * ============================================================
 *
 * 简化的部分：
 * 1. 调度器：真实 React 有优先级队列、饥饿问题处理
 * 2. Diff 算法：真实 React 支持 key、多节点移动优化
 * 3. Hooks：真实 React 有更多 hooks（useEffect、useCallback 等）
 * 4. 事件系统：真实 React 有合成事件、事件委托
 * 5. 错误边界：真实 React 有错误捕获和降级
 * 6. Context：真实 React 有 Context API
 * 7. Ref：真实 React 有 useRef、forwardRef
 * 8. Suspense：真实 React 支持异步组件
 *
 * 但核心思想是一致的！
 */

// 导出供外部使用
export default MiniReact;

// 如果在浏览器环境，挂载到 window
if (typeof window !== 'undefined') {
  window.MiniReact = MiniReact;
}
