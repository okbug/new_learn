# React 原理深度面试题详解

## 目录
- [一、React 基础原理](#一react-基础原理)
- [二、Virtual DOM 与 Diff 算法](#二virtual-dom-与-diff-算法)
- [三、Fiber 架构](#三fiber-架构)
- [四、Hooks 原理](#四hooks-原理)
- [五、状态管理](#五状态管理)
- [六、性能优化](#六性能优化)
- [七、事件系统](#七事件系统)
- [八、Reconciliation 调和过程](#八reconciliation-调和过程)

---

## 一、React 基础原理

### 1.1 React 的核心思想是什么？

**答案：**

React 的核心思想可以总结为以下几点：

#### 1. 声明式编程（Declarative）
- **命令式 vs 声明式**：
  ```javascript
  // 命令式：告诉程序"如何做"
  const container = document.getElementById('container');
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.onclick = function() { console.log('clicked'); };
  container.appendChild(btn);

  // 声明式：告诉程序"要什么"
  function Button() {
    return (
      <button className="btn" onClick={() => console.log('clicked')}>
        Click me
      </button>
    );
  }
  ```

- **优势**：
  - 代码更易读、易维护
  - 关注"是什么"而非"怎么做"
  - 减少直接 DOM 操作的复杂性

#### 2. 组件化（Component-Based）
```javascript
// 组件是独立、可复用的代码单元
function UserCard({ user }) {
  return (
    <div className="user-card">
      <Avatar src={user.avatar} />
      <UserInfo name={user.name} email={user.email} />
      <ActionButtons userId={user.id} />
    </div>
  );
}

// 组件的优势：
// 1. 封装性：内部逻辑对外部隐藏
// 2. 复用性：可在多处使用
// 3. 组合性：小组件组合成大组件
```

#### 3. 单向数据流（Unidirectional Data Flow）
```javascript
// 数据从父组件流向子组件
function Parent() {
  const [data, setData] = useState('initial');

  return (
    <Child
      data={data}  // 数据向下传递
      onUpdate={setData}  // 通过回调向上通信
    />
  );
}

function Child({ data, onUpdate }) {
  // 子组件不能直接修改 props
  // 只能通过回调函数通知父组件
  return (
    <button onClick={() => onUpdate('new data')}>
      {data}
    </button>
  );
}
```

#### 4. Virtual DOM
- React 在内存中维护一个虚拟 DOM 树
- 状态改变时，先更新虚拟 DOM
- 通过 diff 算法计算最小变更
- 批量更新真实 DOM

**深入理解：**

React 的设计哲学是 `UI = f(state)`，即界面是状态的函数。这意味着：
- 相同的状态总是产生相同的 UI
- UI 的变化完全由状态变化驱动
- 开发者只需关注状态管理，UI 自动更新

---

### 1.2 JSX 的本质是什么？它是如何转换为真实 DOM 的？

**答案：**

#### JSX 的本质

JSX 是 JavaScript 的语法扩展，它最终会被编译为普通的 JavaScript 函数调用。

```javascript
// JSX 代码
const element = (
  <div className="container">
    <h1>Hello, {name}</h1>
    <p>Welcome to React</p>
  </div>
);

// Babel 编译后（React 17 之前）
const element = React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, 'Hello, ', name),
  React.createElement('p', null, 'Welcome to React')
);

// React 17+ 新的 JSX 转换
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx('div', {
  className: 'container',
  children: [
    _jsx('h1', { children: ['Hello, ', name] }),
    _jsx('p', { children: 'Welcome to React' })
  ]
});
```

#### React.createElement 的实现原理

```javascript
// 简化版 createElement 实现
function createElement(type, props, ...children) {
  return {
    type,  // 元素类型：'div'、'span' 或组件函数
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

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 使用示例
createElement('div', { id: 'container' },
  createElement('h1', null, 'Title'),
  'Some text'
);

// 返回的对象结构（React Element）
{
  type: 'div',
  props: {
    id: 'container',
    children: [
      {
        type: 'h1',
        props: {
          children: [
            { type: 'TEXT_ELEMENT', props: { nodeValue: 'Title', children: [] } }
          ]
        }
      },
      {
        type: 'TEXT_ELEMENT',
        props: { nodeValue: 'Some text', children: [] }
      }
    ]
  }
}
```

#### 转换为真实 DOM 的过程

```javascript
// 1. 创建 React Element（虚拟 DOM 节点）
const vdom = {
  type: 'div',
  props: {
    className: 'container',
    children: [/*...*/]
  }
};

// 2. Render 阶段：构建 Fiber 树
// React 会遍历虚拟 DOM，创建对应的 Fiber 节点
function createFiber(element) {
  return {
    type: element.type,
    props: element.props,
    stateNode: null,  // 对应的真实 DOM 节点
    parent: null,
    child: null,
    sibling: null,
    effectTag: 'PLACEMENT',  // 标记操作类型
  };
}

// 3. Commit 阶段：创建真实 DOM 并插入
function commitWork(fiber) {
  if (!fiber) return;

  // 创建真实 DOM 节点
  if (fiber.effectTag === 'PLACEMENT') {
    const domNode = createDOMNode(fiber);
    fiber.stateNode = domNode;

    // 插入到父节点
    const parentFiber = fiber.parent;
    const parentDom = parentFiber.stateNode;
    parentDom.appendChild(domNode);
  }

  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function createDOMNode(fiber) {
  const dom = fiber.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(fiber.type);

  // 设置属性
  Object.keys(fiber.props)
    .filter(key => key !== 'children')
    .forEach(name => {
      dom[name] = fiber.props[name];
    });

  return dom;
}
```

#### 完整流程示例

```javascript
// 源代码
function App() {
  const [count, setCount] = useState(0);
  return (
    <div className="app">
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

// 步骤 1：JSX 编译
// App 函数被调用时返回 React Element
const element = {
  type: 'div',
  props: {
    className: 'app',
    children: [{
      type: 'button',
      props: {
        onClick: () => setCount(count + 1),
        children: ['Count: ', 0]
      }
    }]
  }
};

// 步骤 2：创建 Fiber 树（虚拟 DOM 树的增强版）
const fiberTree = {
  type: 'div',
  stateNode: null,  // 将关联到真实 DOM
  props: { className: 'app', ... },
  child: {
    type: 'button',
    stateNode: null,
    props: { onClick: [Function], ... },
    child: { type: 'TEXT_ELEMENT', ... }
  }
};

// 步骤 3：Commit 阶段创建真实 DOM
const div = document.createElement('div');
div.className = 'app';

const button = document.createElement('button');
button.onclick = () => setCount(count + 1);
button.textContent = 'Count: 0';

div.appendChild(button);
document.getElementById('root').appendChild(div);
```

#### 关键要点总结

1. **JSX 不是必需的**：可以直接使用 `React.createElement`
2. **JSX 只是语法糖**：最终会编译为函数调用
3. **React Element 是普通对象**：描述 UI 结构的轻量级对象
4. **转换分为两个阶段**：
   - Render 阶段：构建 Fiber 树（可中断）
   - Commit 阶段：操作真实 DOM（不可中断）
5. **为什么需要编译**：浏览器不认识 JSX，必须转换为标准 JavaScript

---

### 1.3 React 组件的生命周期有哪些？各个阶段分别做什么？

**答案：**

#### 类组件生命周期（完整版）

React 生命周期分为三个主要阶段：**挂载**、**更新**、**卸载**

```javascript
class LifecycleDemo extends React.Component {
  // 1. 挂载阶段（Mounting）- 组件被创建并插入 DOM

  constructor(props) {
    super(props);
    // 用途：
    // - 初始化 state
    // - 绑定事件处理函数
    this.state = { count: 0 };
    console.log('1. constructor');
  }

  static getDerivedStateFromProps(props, state) {
    // 用途：
    // - 根据 props 更新 state
    // - 返回对象更新 state，返回 null 不更新
    // 注意：这是静态方法，无法访问 this
    console.log('2. getDerivedStateFromProps');

    // 示例：根据 props.count 初始化 state
    if (props.initialCount !== state.prevPropsCount) {
      return {
        count: props.initialCount,
        prevPropsCount: props.initialCount
      };
    }
    return null;
  }

  render() {
    // 用途：
    // - 返回 JSX 描述 UI
    // - 必须是纯函数，不能有副作用
    console.log('3. render');
    return <div>{this.state.count}</div>;
  }

  componentDidMount() {
    // 用途：
    // - DOM 已经挂载，可以进行 DOM 操作
    // - 发起网络请求
    // - 添加订阅、事件监听
    // - 启动定时器
    console.log('4. componentDidMount');

    // 示例
    this.timer = setInterval(() => {
      this.setState(s => ({ count: s.count + 1 }));
    }, 1000);

    fetch('/api/data')
      .then(res => res.json())
      .then(data => this.setState({ data }));
  }

  // 2. 更新阶段（Updating）- props 或 state 改变

  shouldComponentUpdate(nextProps, nextState) {
    // 用途：
    // - 性能优化，决定是否重新渲染
    // - 返回 false 阻止更新，返回 true 继续更新
    console.log('5. shouldComponentUpdate');

    // 示例：只在 count 改变时更新
    return nextState.count !== this.state.count;
  }

  // render() - 再次调用

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // 用途：
    // - 在 DOM 更新前获取信息
    // - 返回值会传递给 componentDidUpdate
    // 典型场景：保存滚动位置
    console.log('6. getSnapshotBeforeUpdate');

    // 示例：记录滚动位置
    if (prevState.list.length < this.state.list.length) {
      const list = this.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // 用途：
    // - DOM 已更新，可以进行 DOM 操作
    // - 根据 props 变化发起新的网络请求
    // - 使用 snapshot 恢复状态
    console.log('7. componentDidUpdate');

    // 示例：props 变化时重新请求数据
    if (this.props.userId !== prevProps.userId) {
      this.fetchData(this.props.userId);
    }

    // 使用 snapshot 恢复滚动位置
    if (snapshot !== null) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }

  // 3. 卸载阶段（Unmounting）

  componentWillUnmount() {
    // 用途：
    // - 清理工作
    // - 移除事件监听
    // - 取消网络请求
    // - 清除定时器
    // - 取消订阅
    console.log('8. componentWillUnmount');

    clearInterval(this.timer);
    this.abortController.abort();
  }

  // 4. 错误处理（Error Handling）

  static getDerivedStateFromError(error) {
    // 用途：
    // - 渲染备用 UI
    // - 返回新的 state
    console.log('9. getDerivedStateFromError');

    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 用途：
    // - 记录错误日志
    // - 上报错误信息
    console.log('10. componentDidCatch');

    logErrorToService(error, errorInfo);
  }
}
```

#### 生命周期执行顺序图示

```
挂载阶段：
constructor
  ↓
getDerivedStateFromProps
  ↓
render
  ↓
React 更新 DOM 和 refs
  ↓
componentDidMount

更新阶段（props 或 state 变化）：
getDerivedStateFromProps
  ↓
shouldComponentUpdate ──→ false (停止更新)
  ↓ true
render
  ↓
getSnapshotBeforeUpdate
  ↓
React 更新 DOM 和 refs
  ↓
componentDidUpdate

卸载阶段：
componentWillUnmount
```

#### 函数组件的生命周期（Hooks 实现）

```javascript
function LifecycleWithHooks() {
  // 相当于 constructor（只在初始化时执行一次）
  const [count, setCount] = useState(() => {
    console.log('初始化 state');
    return 0;
  });

  // 相当于 getDerivedStateFromProps
  const [derivedState, setDerivedState] = useState(props.value);
  useEffect(() => {
    setDerivedState(props.value);
  }, [props.value]);

  // 相当于 componentDidMount
  useEffect(() => {
    console.log('组件已挂载');

    // 返回的函数相当于 componentWillUnmount
    return () => {
      console.log('组件将卸载');
    };
  }, []); // 空依赖数组，只在挂载和卸载时执行

  // 相当于 componentDidUpdate
  useEffect(() => {
    console.log('count 已更新:', count);
  }, [count]); // 依赖 count，count 变化时执行

  // 相当于 shouldComponentUpdate
  const MemoizedChild = React.memo(ChildComponent, (prevProps, nextProps) => {
    return prevProps.value === nextProps.value;
  });

  // 相当于 getSnapshotBeforeUpdate + componentDidUpdate
  const prevCountRef = useRef();
  useEffect(() => {
    const prevCount = prevCountRef.current;
    prevCountRef.current = count;

    if (prevCount !== undefined) {
      console.log(`count 从 ${prevCount} 变为 ${count}`);
    }
  });

  // 错误边界（需要使用类组件或 react-error-boundary 库）

  return <div>{count}</div>;
}
```

#### 实际应用场景

```javascript
class DataFetchingComponent extends React.Component {
  state = {
    data: null,
    loading: true,
    error: null
  };

  abortController = new AbortController();

  componentDidMount() {
    // ✅ 正确：在这里发起请求
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    // ✅ 正确：props 变化时重新请求
    if (this.props.id !== prevProps.id) {
      this.fetchData();
    }
  }

  componentWillUnmount() {
    // ✅ 正确：取消未完成的请求
    this.abortController.abort();
  }

  async fetchData() {
    this.setState({ loading: true, error: null });

    try {
      const response = await fetch(`/api/data/${this.props.id}`, {
        signal: this.abortController.signal
      });
      const data = await response.json();
      this.setState({ data, loading: false });
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.setState({ error, loading: false });
      }
    }
  }

  render() {
    const { data, loading, error } = this.state;

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    return <div>{JSON.stringify(data)}</div>;
  }
}
```

#### 常见陷阱

```javascript
class BadPractices extends React.Component {
  componentDidMount() {
    // ❌ 错误：直接修改 state
    this.state.count = 1;

    // ✅ 正确：使用 setState
    this.setState({ count: 1 });
  }

  componentDidUpdate() {
    // ❌ 错误：无条件 setState 导致死循环
    this.setState({ count: this.state.count + 1 });

    // ✅ 正确：添加条件判断
    if (this.state.count < 10) {
      this.setState({ count: this.state.count + 1 });
    }
  }

  render() {
    // ❌ 错误：在 render 中调用 setState
    this.setState({ count: 1 });

    // ❌ 错误：在 render 中发起请求
    fetch('/api/data');

    // ✅ 正确：render 必须是纯函数
    return <div>{this.state.count}</div>;
  }
}
```

#### 已废弃的生命周期

这些方法在 React 17+ 中已被标记为不安全（UNSAFE_），不建议使用：

- `UNSAFE_componentWillMount`
- `UNSAFE_componentWillReceiveProps`
- `UNSAFE_componentWillUpdate`

原因：在 Concurrent Mode 下，render 阶段可能被多次调用或中断，这些方法可能导致副作用。

---

## 二、Virtual DOM 与 Diff 算法

### 2.1 什么是 Virtual DOM？为什么需要它？

**答案：**

#### Virtual DOM 的定义

Virtual DOM（虚拟 DOM）是真实 DOM 的 JavaScript 对象表示。它是一个轻量级的、纯 JavaScript 对象树，用于描述真实 DOM 的结构。

```javascript
// 真实 DOM
<div id="container" class="main">
  <h1>Title</h1>
  <p>Content</p>
</div>

// Virtual DOM（简化表示）
{
  type: 'div',
  props: {
    id: 'container',
    className: 'main',
    children: [
      {
        type: 'h1',
        props: {
          children: 'Title'
        }
      },
      {
        type: 'p',
        props: {
          children: 'Content'
        }
      }
    ]
  }
}
```

#### 为什么需要 Virtual DOM？

**1. 性能优化**

```javascript
// 直接操作 DOM（性能差）
function updateUI(items) {
  const list = document.getElementById('list');
  list.innerHTML = ''; // 清空所有内容

  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.className = item.active ? 'active' : '';
    list.appendChild(li); // 每次都触发重排重绘
  });
}

// 使用 Virtual DOM（性能好）
function List({ items }) {
  return (
    <ul id="list">
      {items.map(item => (
        <li key={item.id} className={item.active ? 'active' : ''}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}
// React 会通过 diff 算法只更新变化的部分
```

**性能对比：**

| 操作 | 直接 DOM | Virtual DOM |
|------|----------|-------------|
| 创建节点 | 慢（浏览器对象） | 快（JS 对象） |
| 比较差异 | 无 | 快（纯 JS 计算） |
| 更新 DOM | 全量更新 | 增量更新 |
| 重排重绘 | 频繁 | 批量、最小化 |

**2. 跨平台能力**

```javascript
// Virtual DOM 是平台无关的抽象
const vdom = {
  type: 'view',
  props: {
    children: 'Hello'
  }
};

// Web 平台：渲染为 <div>
ReactDOM.render(vdom, container);

// Native 平台：渲染为 <View>
ReactNative.render(vdom, nativeContainer);

// Canvas/WebGL：渲染为图形
ReactCanvas.render(vdom, canvasContext);
```

**3. 声明式编程**

```javascript
// 命令式：手动管理 DOM 状态
class CounterImperative {
  constructor() {
    this.count = 0;
    this.button = document.getElementById('btn');
    this.display = document.getElementById('count');

    this.button.onclick = () => {
      this.count++;
      this.display.textContent = this.count; // 手动更新

      if (this.count > 10) {
        this.display.style.color = 'red'; // 手动更新样式
      }
    };
  }
}

// 声明式：描述 UI 应该是什么样子
function CounterDeclarative() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+</button>
      <span style={{ color: count > 10 ? 'red' : 'black' }}>
        {count}
      </span>
    </div>
  );
  // React 自动处理 DOM 更新
}
```

**4. 批量更新优化**

```javascript
// 没有 Virtual DOM：每次 setState 都更新 DOM
function BadExample() {
  const handleClick = () => {
    setCount(1);      // 触发 DOM 更新
    setName('John');  // 触发 DOM 更新
    setAge(25);       // 触发 DOM 更新
    // 3 次独立的 DOM 操作
  };
}

// 有 Virtual DOM：批量更新
function GoodExample() {
  const handleClick = () => {
    setCount(1);      // 标记更新
    setName('John');  // 标记更新
    setAge(25);       // 标记更新

    // React 会：
    // 1. 收集所有更新
    // 2. 计算新的 Virtual DOM
    // 3. 通过 diff 找出最小变更
    // 4. 一次性更新真实 DOM
  };
}
```

#### Virtual DOM 的工作流程

```javascript
// 步骤 1：初始渲染
const initialVDOM = {
  type: 'ul',
  props: {
    children: [
      { type: 'li', props: { children: 'Item 1' } },
      { type: 'li', props: { children: 'Item 2' } }
    ]
  }
};

const dom = render(initialVDOM);
// 创建真实 DOM：
// <ul>
//   <li>Item 1</li>
//   <li>Item 2</li>
// </ul>

// 步骤 2：状态更新
const newVDOM = {
  type: 'ul',
  props: {
    children: [
      { type: 'li', props: { children: 'Item 1' } },
      { type: 'li', props: { children: 'Item 2 - Updated' } }, // 变化
      { type: 'li', props: { children: 'Item 3' } } // 新增
    ]
  }
};

// 步骤 3：Diff 比较
const patches = diff(initialVDOM, newVDOM);
// 结果：
// [
//   { type: 'UPDATE_TEXT', path: [0, 1], value: 'Item 2 - Updated' },
//   { type: 'INSERT', path: [0], node: { type: 'li', ... } }
// ]

// 步骤 4：应用补丁，只更新变化部分
patch(dom, patches);
// 只操作：
// 1. 更新第二个 li 的文本
// 2. 插入第三个 li
// 不会重新创建整个列表
```

#### 简化的 Virtual DOM 实现

```javascript
// 创建虚拟节点
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

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 渲染虚拟 DOM 为真实 DOM
function render(vdom, container) {
  const dom = vdom.type === 'TEXT_ELEMENT'
    ? document.createTextNode('')
    : document.createElement(vdom.type);

  // 设置属性
  Object.keys(vdom.props)
    .filter(key => key !== 'children')
    .forEach(name => {
      dom[name] = vdom.props[name];
    });

  // 递归渲染子节点
  vdom.props.children.forEach(child =>
    render(child, dom)
  );

  container.appendChild(dom);
  return dom;
}

// 使用示例
const vdom = createElement('div', { id: 'app' },
  createElement('h1', null, 'Hello'),
  createElement('p', null, 'World')
);

render(vdom, document.getElementById('root'));
```

#### Virtual DOM 的优势总结

1. **性能优化**：
   - 减少直接 DOM 操作
   - 批量更新
   - 最小化重排重绘

2. **开发体验**：
   - 声明式编程
   - 无需手动操作 DOM
   - 代码更易维护

3. **跨平台**：
   - React DOM（Web）
   - React Native（移动端）
   - React VR、React Canvas 等

4. **功能增强**：
   - 支持时间旅行调试
   - 服务端渲染
   - 并发渲染

#### Virtual DOM 的局限性

```javascript
// 1. 内存开销：需要维护两棵树
const vdom = { /* 虚拟 DOM 树 */ };
const realDOM = { /* 真实 DOM 树 */ };

// 2. 初始渲染性能：不如直接 innerHTML
// 直接 DOM（快）
container.innerHTML = '<div>...</div>';

// Virtual DOM（慢）
// 需要：创建虚拟 DOM → diff → 创建真实 DOM

// 3. 简单场景下可能过度设计
// 如果只是简单的静态页面，Virtual DOM 是多余的
```

**结论**：Virtual DOM 不是银弹，但在复杂的、交互频繁的应用中，它带来的好处远大于开销。

---

### 2.2 React 的 Diff 算法原理是什么？时间复杂度如何？

**答案：**

#### Diff 算法的基本概念

传统的树 diff 算法时间复杂度为 **O(n³)**，而 React 通过三个策略将复杂度降低到 **O(n)**：

1. **跨层级比较**：只比较同层级节点
2. **类型比较**：不同类型的元素产生不同的树
3. **key 优化**：通过 key 标识元素

#### 策略 1：同层比较（Tree Diff）

```javascript
// 传统 diff：对比整棵树的所有节点（O(n³)）
旧树：        A
           /   \
          B     C
         /
        D

新树：        A
           /   \
          C     E
               /
              D

// 传统算法会遍历所有可能性：
// D 从 B 下移动到 E 下？ B 删除了？C 移动了？

// React diff：只比较同层级（O(n)）
第一层：A === A  ✓ 不变
第二层：B vs C, C vs E  ✗ 不同，直接替换
第三层：D 被删除，新 D 被创建

// React 的策略：不会检测到 D 的移动，而是删除旧 D，创建新 D
// 这看起来不够智能，但简化了算法，性能更好
```

**实现代码：**

```javascript
function diffChildren(oldChildren, newChildren, parent) {
  const patches = [];
  const maxLength = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < maxLength; i++) {
    patches.push(diff(oldChildren[i], newChildren[i], i));
  }

  return patches;
}

function diff(oldNode, newNode, index) {
  // 1. 新节点不存在 → 删除
  if (!newNode) {
    return { type: 'REMOVE', index };
  }

  // 2. 旧节点不存在 → 新增
  if (!oldNode) {
    return { type: 'ADD', index, node: newNode };
  }

  // 3. 节点类型不同 → 替换
  if (oldNode.type !== newNode.type) {
    return { type: 'REPLACE', index, node: newNode };
  }

  // 4. 文本节点内容不同 → 更新文本
  if (typeof newNode === 'string' && oldNode !== newNode) {
    return { type: 'TEXT', index, text: newNode };
  }

  // 5. 相同类型元素 → 比较属性和子节点
  return {
    type: 'UPDATE',
    index,
    props: diffProps(oldNode.props, newNode.props),
    children: diffChildren(
      oldNode.props.children,
      newNode.props.children,
      index
    )
  };
}
```

#### 策略 2：组件 Diff

```javascript
// 1. 同类型组件：按照原策略继续比较虚拟 DOM
function diff(oldComponent, newComponent) {
  if (oldComponent.type === newComponent.type) {
    // 继续比较子树
    return diffVDOM(
      oldComponent.render(),
      newComponent.render()
    );
  }
}

// 2. 不同类型组件：直接替换整个组件及其子树
function App() {
  const [showA, setShowA] = useState(true);

  return (
    <div>
      {showA ? <ComponentA /> : <ComponentB />}
    </div>
  );
}

// 当 showA 从 true 变为 false：
// React 会：
// 1. 卸载 ComponentA 及其所有子组件
// 2. 调用 ComponentA 的 componentWillUnmount
// 3. 挂载 ComponentB
// 4. 调用 ComponentB 的 componentDidMount

// 不会尝试复用 ComponentA 的任何部分
```

**shouldComponentUpdate 优化：**

```javascript
class OptimizedComponent extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // 如果返回 false，跳过整个子树的 diff
    return (
      this.props.value !== nextProps.value ||
      this.state.count !== nextState.count
    );
  }

  render() {
    // 这个复杂的子树可能被完全跳过
    return (
      <div>
        <ExpensiveChild1 />
        <ExpensiveChild2 />
        <ExpensiveChild3 />
      </div>
    );
  }
}

// 函数组件版本
const OptimizedFC = React.memo(
  function Component({ value }) {
    return <div>{value}</div>;
  },
  (prevProps, nextProps) => {
    // 返回 true 表示相等，跳过渲染
    return prevProps.value === nextProps.value;
  }
);
```

#### 策略 3：元素 Diff（Key 的作用）

**没有 key 的情况：**

```javascript
// 旧列表
<ul>
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>

// 新列表：在开头插入 D
<ul>
  <li>D</li>
  <li>A</li>
  <li>B</li>
  <li>C</li>
</ul>

// React 的 diff 过程（没有 key）：
位置 0: A → D  (更新文本)
位置 1: B → A  (更新文本)
位置 2: C → B  (更新文本)
位置 3: 无 → C  (插入新节点)

// 结果：4 次 DOM 操作（3次更新 + 1次插入）
```

**有 key 的情况：**

```javascript
// 旧列表
<ul>
  <li key="a">A</li>
  <li key="b">B</li>
  <li key="c">C</li>
</ul>

// 新列表
<ul>
  <li key="d">D</li>
  <li key="a">A</li>
  <li key="b">B</li>
  <li key="c">C</li>
</ul>

// React 的 diff 过程（有 key）：
key=d: 新节点 (插入)
key=a: 相同   (不变)
key=b: 相同   (不变)
key=c: 相同   (不变)

// 结果：1 次 DOM 操作（1次插入）
```

**Key 的 Diff 算法实现：**

```javascript
function diffWithKeys(oldChildren, newChildren) {
  const oldMap = new Map();
  const patches = [];

  // 1. 建立旧节点的 key -> index 映射
  oldChildren.forEach((child, index) => {
    if (child.key) {
      oldMap.set(child.key, { node: child, index });
    }
  });

  // 2. 遍历新节点
  newChildren.forEach((newChild, newIndex) => {
    const old = oldMap.get(newChild.key);

    if (old) {
      // 2.1 找到相同 key 的节点
      if (old.index !== newIndex) {
        // 位置变化 → 移动
        patches.push({
          type: 'MOVE',
          from: old.index,
          to: newIndex,
          node: newChild
        });
      } else {
        // 位置相同 → 更新
        patches.push({
          type: 'UPDATE',
          index: newIndex,
          changes: diffProps(old.node, newChild)
        });
      }
      oldMap.delete(newChild.key);
    } else {
      // 2.2 新节点 → 插入
      patches.push({
        type: 'INSERT',
        index: newIndex,
        node: newChild
      });
    }
  });

  // 3. 剩余的旧节点 → 删除
  oldMap.forEach((old) => {
    patches.push({
      type: 'REMOVE',
      index: old.index
    });
  });

  return patches;
}
```

#### Key 的最佳实践

```javascript
// ❌ 错误示例

// 1. 使用索引作为 key（会导致性能问题和 bug）
{items.map((item, index) => (
  <Item key={index} data={item} />
))}
// 问题：插入/删除元素时，所有后续元素的 key 都会变化

// 2. 使用随机数作为 key
{items.map(item => (
  <Item key={Math.random()} data={item} />
))}
// 问题：每次渲染都会重新创建组件，丢失状态

// 3. 使用不稳定的值
{items.map(item => (
  <Item key={item.name + Date.now()} data={item} />
))}
// 问题：同上

// ✅ 正确示例

// 1. 使用稳定的唯一 ID
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// 2. 如果没有 ID，组合多个字段
{items.map(item => (
  <Item key={`${item.name}-${item.type}`} data={item} />
))}

// 3. 静态列表可以使用索引
const STATIC_MENU = ['Home', 'About', 'Contact'];
{STATIC_MENU.map((item, index) => (
  <MenuItem key={index} text={item} />
))}
// 但要确保列表永远不会改变顺序
```

#### 完整的 Diff 流程示例

```javascript
// 旧虚拟 DOM
const oldVDOM = {
  type: 'div',
  props: {
    className: 'container',
    children: [
      { type: 'h1', key: '1', props: { children: 'Title' } },
      { type: 'p', key: '2', props: { children: 'Paragraph 1' } },
      { type: 'p', key: '3', props: { children: 'Paragraph 2' } }
    ]
  }
};

// 新虚拟 DOM
const newVDOM = {
  type: 'div',
  props: {
    className: 'container main',  // 属性变化
    children: [
      { type: 'h1', key: '1', props: { children: 'New Title' } },  // 内容变化
      { type: 'p', key: '3', props: { children: 'Paragraph 2' } },  // 顺序变化
      { type: 'span', key: '4', props: { children: 'New' } }  // 新增
      // key='2' 的元素被删除
    ]
  }
};

// Diff 结果
const patches = [
  {
    type: 'UPDATE_PROPS',
    path: [],
    props: { className: 'container main' }
  },
  {
    type: 'UPDATE_TEXT',
    path: [0],
    text: 'New Title'
  },
  {
    type: 'MOVE',
    path: [1],
    from: 2,
    to: 1
  },
  {
    type: 'INSERT',
    path: [2],
    node: { type: 'span', key: '4', props: { children: 'New' } }
  },
  {
    type: 'REMOVE',
    path: [1]  // 删除旧的 key='2' 节点
  }
];

// 应用 patches 到真实 DOM
function applyPatches(dom, patches) {
  patches.forEach(patch => {
    switch (patch.type) {
      case 'UPDATE_PROPS':
        updateProps(dom, patch.props);
        break;
      case 'UPDATE_TEXT':
        updateText(dom, patch.path, patch.text);
        break;
      case 'MOVE':
        moveNode(dom, patch.path, patch.from, patch.to);
        break;
      case 'INSERT':
        insertNode(dom, patch.path, patch.node);
        break;
      case 'REMOVE':
        removeNode(dom, patch.path);
        break;
    }
  });
}
```

#### 时间复杂度分析

| 算法 | 时间复杂度 | 说明 |
|------|------------|------|
| 传统树 diff | O(n³) | 需要遍历两棵树的所有节点进行比较 |
| React diff | O(n) | 只比较同层级节点 |
| 有 key 的列表 | O(n) | 通过 Map 快速查找 |
| 无 key 的列表 | O(n²) | 最坏情况需要逐个比较 |

**React Diff 为 O(n) 的原因：**

```javascript
// 假设树有 n 个节点

// 第一层：遍历根节点 (1 次)
// 第二层：遍历所有第二层节点 (k₁ 次)
// 第三层：遍历所有第三层节点 (k₂ 次)
// ...

// 总次数 = 1 + k₁ + k₂ + ... = n
// 每个节点只被访问一次
// 时间复杂度 = O(n)
```

#### 总结

React 的 Diff 算法通过三个关键策略实现了 O(n) 的时间复杂度：

1. **分层比较**：放弃跨层级优化，简化算法
2. **组件类型比较**：不同类型直接替换，不深入比较
3. **Key 机制**：快速识别节点的增删移动

这些策略在绝大多数场景下表现优秀，只有在特殊情况下（如大量跨层级移动）才会不够优化。

---

## 三、Fiber 架构

### 3.1 什么是 Fiber？为什么要引入 Fiber 架构？

**答案：**

#### Fiber 的定义

Fiber 是 React 16 引入的新协调引擎（Reconciliation Engine）。在实现层面，Fiber 是一种数据结构，代表一个工作单元（unit of work）。

```javascript
// Fiber 节点的数据结构（简化版）
type Fiber = {
  // 节点类型信息
  type: any,                 // 函数组件/类组件/DOM 标签
  key: null | string,

  // Fiber 树结构（链表）
  return: Fiber | null,      // 父节点
  child: Fiber | null,       // 第一个子节点
  sibling: Fiber | null,     // 下一个兄弟节点

  // 工作相关
  alternate: Fiber | null,   // 双缓冲，指向另一棵树的对应节点
  effectTag: number,         // 副作用标记（插入/更新/删除）
  nextEffect: Fiber | null,  // 下一个有副作用的 Fiber

  // 组件状态
  stateNode: any,            // 对应的真实 DOM 或组件实例
  props: any,                // 新的 props
  memoizedState: any,        // 旧的 state
  memoizedProps: any,        // 旧的 props
  updateQueue: any,          // 状态更新队列

  // 调度优先级
  lanes: Lanes,              // 优先级（React 18+）
  childLanes: Lanes,
};
```

#### 为什么需要 Fiber？

**React 15 及之前的问题：**

```javascript
// React 15 的 Stack Reconciler（栈调和器）

function reconcile(element) {
  // 递归处理子节点
  element.children.forEach(child => {
    reconcile(child);  // 递归调用
  });

  // 更新当前节点
  updateDOM(element);
}

// 问题：
// 1. 递归不可中断
// 2. 大组件树会长时间占用主线程
// 3. 导致页面卡顿、动画掉帧
```

**实际场景演示：**

```javascript
// 假设有一个庞大的组件树
function App() {
  return (
    <div>
      {/* 1000 个组件 */}
      {Array.from({ length: 1000 }, (_, i) => (
        <ExpensiveComponent key={i} />
      ))}
    </div>
  );
}

function ExpensiveComponent() {
  // 每个组件渲染需要 0.016ms（假设）
  return <div>...</div>;
}

// React 15 的行为：
// 1. 开始 reconcile(App)
// 2. 递归处理 1000 个子组件 (1000 × 0.016ms = 16ms)
// 3. 这 16ms 内：
//    - 无法响应用户输入
//    - 无法执行动画
//    - 页面完全卡住
// 4. 16ms 后才完成渲染

// 浏览器的渲染机制：
// 60fps → 每帧 16.6ms
// 如果 JavaScript 执行超过 16.6ms，就会掉帧
```

**Fiber 解决的核心问题：**

1. **任务可中断**：可以暂停渲染工作，优先处理高优先级任务
2. **时间切片**：将长任务拆分成多个小任务
3. **优先级调度**：不同更新有不同优先级
4. **并发渲染**：为 React 18 的 Concurrent Mode 打基础

#### Fiber 的工作原理

**1. Fiber 树结构**

```javascript
// JSX
<div>
  <h1>Title</h1>
  <p>Content</p>
</div>

// Fiber 树（链表结构）
const divFiber = {
  type: 'div',
  child: h1Fiber,        // 指向第一个子节点
  sibling: null,
  return: null,          // 指向父节点
};

const h1Fiber = {
  type: 'h1',
  child: textFiber1,
  sibling: pFiber,       // 指向兄弟节点
  return: divFiber,
};

const pFiber = {
  type: 'p',
  child: textFiber2,
  sibling: null,
  return: divFiber,
};

// 树形结构 → 链表结构的好处：
// - 可以随时中断和恢复
// - 可以标记当前进度（当前处理的 Fiber 节点）
```

**2. 双缓冲机制（Double Buffering）**

```javascript
// React 维护两棵 Fiber 树

// current 树：当前屏幕上显示的内容
const currentTree = {
  type: 'div',
  stateNode: realDOMNode,
  props: { children: 'Old' },
  alternate: workInProgressTree,  // 指向 WIP 树
};

// workInProgress 树：正在构建的新树
const workInProgressTree = {
  type: 'div',
  stateNode: null,  // 还未创建真实 DOM
  props: { children: 'New' },
  alternate: currentTree,  // 指向 current 树
};

// 渲染流程：
// 1. 基于 current 树创建 workInProgress 树
// 2. 在 workInProgress 树上进行 diff 和更新
// 3. 完成后，workInProgress 变成新的 current
// 4. 原来的 current 被复用为下一次的 workInProgress

// 优点：
// - 可以在后台构建新树，不影响当前显示
// - 如果中断，直接丢弃 WIP 树，不影响用户界面
// - 内存复用，性能更好
```

**3. 时间切片（Time Slicing）**

```javascript
// Fiber 的工作循环（简化版）
function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    // 执行一个工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    // 检查是否用完了当前时间片
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (nextUnitOfWork) {
    // 还有工作未完成，注册下一个时间片
    requestIdleCallback(workLoop);
  } else {
    // 所有工作完成，提交更新
    commitRoot();
  }
}

// 启动调度
requestIdleCallback(workLoop);

// 执行一个工作单元
function performUnitOfWork(fiber) {
  // 1. 处理当前 Fiber（diff、创建 DOM 等）
  if (fiber.child) {
    return fiber.child;  // 返回子节点，下次处理
  }

  // 2. 没有子节点，处理兄弟节点
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.return;  // 回到父节点
  }

  // 3. 所有节点处理完毕
  return null;
}
```

**4. 优先级调度**

```javascript
// React 18 的 Lane 模型
const SyncLane = 0b0001;              // 同步（最高优先级）
const InputContinuousLane = 0b0010;   // 连续输入（如拖拽）
const DefaultLane = 0b0100;           // 默认优先级
const TransitionLane = 0b1000;        // 过渡动画
const IdleLane = 0b10000;             // 空闲时间

// 示例：不同更新的优先级
function App() {
  const [inputValue, setInputValue] = useState('');
  const [list, setList] = useState([]);

  const handleInput = (e) => {
    // 高优先级：用户输入，需要立即响应
    setInputValue(e.target.value);

    // 低优先级：列表过滤，可以延迟
    startTransition(() => {
      const filtered = heavyFilter(data, e.target.value);
      setList(filtered);
    });
  };

  return (
    <>
      <input value={inputValue} onChange={handleInput} />
      <List items={list} />
    </>
  );
}

// React 的调度策略：
// 1. 用户输入时，setInputValue 立即执行
// 2. startTransition 中的更新被标记为低优先级
// 3. 如果有新的高优先级更新，中断低优先级任务
// 4. 高优先级完成后，恢复低优先级任务
```

#### Fiber 架构的两个阶段

```javascript
// Render 阶段（可中断）
function renderPhase() {
  // 1. beginWork：向下遍历，处理 Fiber 节点
  function beginWork(fiber) {
    // - 调用组件函数/render 方法
    // - diff 新旧 props 和 state
    // - 标记 effectTag
    // - 创建/复用子 Fiber
  }

  // 2. completeWork：向上回溯，创建 DOM
  function completeWork(fiber) {
    // - 创建真实 DOM 节点
    // - 设置属性
    // - 收集 effect 链表
  }

  // 这个阶段可以被中断、暂停、恢复
}

// Commit 阶段（不可中断）
function commitPhase() {
  // 1. Before Mutation：读取 DOM 状态
  commitBeforeMutationEffects();

  // 2. Mutation：修改 DOM
  commitMutationEffects();  // 插入/更新/删除 DOM

  // 3. Layout：读取 DOM 布局
  commitLayoutEffects();    // 执行 useLayoutEffect

  // 这个阶段必须同步执行，保证 UI 一致性
}

// 完整流程
function performSyncWorkOnRoot(root) {
  // Render 阶段
  renderRootSync(root);

  // Commit 阶段
  commitRoot(root);
}
```

#### 实际效果对比

```javascript
// 场景：渲染 10000 个组件

// React 15（Stack Reconciler）
function render10000Components() {
  const start = performance.now();

  // 同步递归，不可中断
  for (let i = 0; i < 10000; i++) {
    processComponent(i);
  }

  const end = performance.now();
  console.log(`耗时: ${end - start}ms`);  // 假设 160ms

  // 问题：
  // - 160ms 内主线程被完全阻塞
  // - 用户点击无响应
  // - 动画卡顿
  // - 掉帧严重（160ms / 16.6ms ≈ 10 帧）
}

// React 16+（Fiber）
function render10000ComponentsWithFiber() {
  let processed = 0;

  function workLoop(deadline) {
    while (processed < 10000 && deadline.timeRemaining() > 1) {
      processComponent(processed);
      processed++;
    }

    if (processed < 10000) {
      // 还有工作未完成，让出主线程
      requestIdleCallback(workLoop);
    } else {
      // 完成，提交更新
      commitWork();
    }
  }

  requestIdleCallback(workLoop);

  // 优势：
  // - 每个时间片只执行 5ms
  // - 用户操作可以插队
  // - 动画流畅
  // - 总耗时可能更长（如 200ms），但体感更流畅
}
```

#### Fiber 带来的新能力

```javascript
// 1. Suspense：暂停渲染，等待异步数据
function ProfilePage() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProfile />  {/* 可能会抛出 Promise */}
    </Suspense>
  );
}

// 2. Concurrent Mode：并发渲染
function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    setQuery(e.target.value);  // 高优先级

    startTransition(() => {
      setResults(search(e.target.value));  // 低优先级
    });
  };

  // 用户输入时，results 的更新可以被中断
}

// 3. useTransition：标记低优先级更新
const [isPending, startTransition] = useTransition();

// 4. useDeferredValue：延迟值的更新
const deferredValue = useDeferredValue(value);
```

#### 总结

Fiber 架构的核心优势：

1. **可中断渲染**：长任务不再阻塞主线程
2. **增量渲染**：将渲染工作拆分为多个步骤
3. **优先级调度**：重要更新优先处理
4. **并发能力**：为 Concurrent Mode 铺路
5. **更好的用户体验**：页面更流畅，响应更及时

Fiber 不是为了提高渲染速度（甚至可能更慢），而是为了提高**感知性能**和**响应性**。

---

### 3.2 Fiber 的工作流程是怎样的？Render 和 Commit 阶段分别做什么？

**答案：**

#### Fiber 工作流程总览

```
触发更新 (setState/props change)
    ↓
调度更新 (Scheduler)
    ↓
┌─────── Render 阶段 (可中断) ────────┐
│                                     │
│  beginWork (向下)                   │
│    ↓                                │
│  构建 Fiber 树                       │
│    ↓                                │
│  completeWork (向上)                │
│    ↓                                │
│  生成 Effect 链表                    │
│                                     │
└─────────────────────────────────────┘
    ↓
┌─────── Commit 阶段 (同步执行) ──────┐
│                                     │
│  Before Mutation                    │
│    ↓                                │
│  Mutation (操作 DOM)                │
│    ↓                                │
│  Layout                             │
│                                     │
└─────────────────────────────────────┘
    ↓
浏览器绘制
```

#### Render 阶段详解

**1. beginWork - 向下遍历**

```javascript
function beginWork(current, workInProgress, renderLanes) {
  // current: 当前屏幕上对应的 Fiber 节点
  // workInProgress: 正在构建的新 Fiber 节点

  // 根据 Fiber 类型做不同处理
  switch (workInProgress.tag) {
    case FunctionComponent: {
      // 函数组件
      const Component = workInProgress.type;
      const props = workInProgress.pendingProps;

      // 调用函数组件，获取新的子元素
      const nextChildren = Component(props);

      // 协调子节点
      reconcileChildren(current, workInProgress, nextChildren);

      return workInProgress.child;
    }

    case ClassComponent: {
      // 类组件
      const instance = workInProgress.stateNode;

      // 如果实例不存在，创建实例
      if (instance === null) {
        constructClassInstance(workInProgress);
        mountClassInstance(workInProgress);
      } else {
        // 更新实例
        updateClassInstance(current, workInProgress);
      }

      // 调用 render 方法
      const nextChildren = instance.render();
      reconcileChildren(current, workInProgress, nextChildren);

      return workInProgress.child;
    }

    case HostComponent: {
      // 原生 DOM 元素（div、span 等）
      const type = workInProgress.type;  // 'div'
      const nextProps = workInProgress.pendingProps;
      const nextChildren = nextProps.children;

      reconcileChildren(current, workInProgress, nextChildren);

      return workInProgress.child;
    }
  }
}

// 协调子节点（Diff 算法核心）
function reconcileChildren(current, workInProgress, nextChildren) {
  if (current === null) {
    // 首次挂载
    workInProgress.child = mountChildFibers(workInProgress, nextChildren);
  } else {
    // 更新
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
}
```

**2. Diff 算法的实现**

```javascript
function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
  // 情况 1：新子节点是文本或数字
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return placeSingleChild(
      reconcileSingleTextNode(returnFiber, currentFirstChild, newChild)
    );
  }

  // 情况 2：新子节点是单个 React 元素
  if (typeof newChild === 'object' && newChild !== null) {
    if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
      return placeSingleChild(
        reconcileSingleElement(returnFiber, currentFirstChild, newChild)
      );
    }
  }

  // 情况 3：新子节点是数组
  if (Array.isArray(newChild)) {
    return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
  }

  // 情况 4：新子节点为空，删除所有旧子节点
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}

// 处理单个元素
function reconcileSingleElement(returnFiber, currentFirstChild, element) {
  const key = element.key;
  let child = currentFirstChild;

  // 遍历旧子节点，查找可复用的节点
  while (child !== null) {
    if (child.key === key) {
      // key 相同，检查 type
      if (child.elementType === element.type) {
        // type 也相同，可以复用
        deleteRemainingChildren(returnFiber, child.sibling);

        const existing = useFiber(child, element.props);
        existing.return = returnFiber;
        return existing;
      } else {
        // type 不同，删除所有旧子节点
        deleteRemainingChildren(returnFiber, child);
        break;
      }
    } else {
      // key 不同，删除这个节点
      deleteChild(returnFiber, child);
    }

    child = child.sibling;
  }

  // 没有可复用的节点，创建新的
  const created = createFiberFromElement(element);
  created.return = returnFiber;
  return created;
}

// 处理数组子节点（最复杂）
function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
  let resultingFirstChild = null;
  let previousNewFiber = null;
  let oldFiber = currentFirstChild;
  let newIdx = 0;
  let lastPlacedIndex = 0;

  // 第一轮遍历：处理更新的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    const newChild = newChildren[newIdx];

    if (oldFiber.key === newChild.key) {
      // key 相同，复用节点
      const newFiber = updateSlot(returnFiber, oldFiber, newChild);

      if (newFiber === null) {
        break;  // type 不同，退出第一轮
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
      oldFiber = oldFiber.sibling;
    } else {
      break;  // key 不同，退出第一轮
    }
  }

  // 如果新节点遍历完了，删除剩余的旧节点
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }

  // 如果旧节点遍历完了，插入剩余的新节点
  if (oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx]);
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
    }
    return resultingFirstChild;
  }

  // 第二轮遍历：处理移动的节点
  // 将剩余旧节点放入 Map
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);

  for (; newIdx < newChildren.length; newIdx++) {
    const newChild = newChildren[newIdx];
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChild
    );

    if (newFiber !== null) {
      if (newFiber.alternate !== null) {
        // 复用了旧节点，从 Map 中删除
        existingChildren.delete(
          newFiber.key === null ? newIdx : newFiber.key
        );
      }

      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);

      if (previousNewFiber === null) {
        resultingFirstChild = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
    }
  }

  // 删除 Map 中剩余的旧节点
  existingChildren.forEach(child => deleteChild(returnFiber, child));

  return resultingFirstChild;
}
```

**3. completeWork - 向上回溯**

```javascript
function completeWork(current, workInProgress, renderLanes) {
  const newProps = workInProgress.pendingProps;

  switch (workInProgress.tag) {
    case FunctionComponent:
    case ClassComponent:
      // 组件类型不需要创建 DOM
      return null;

    case HostComponent: {
      // 原生 DOM 元素
      const type = workInProgress.type;  // 'div'

      if (current !== null && workInProgress.stateNode != null) {
        // 更新
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps
        );
      } else {
        // 挂载：创建 DOM 节点
        const instance = createInstance(type, newProps, workInProgress);

        // 将子 DOM 节点插入到当前 DOM 节点
        appendAllChildren(instance, workInProgress);

        // 保存 DOM 节点引用
        workInProgress.stateNode = instance;

        // 设置属性
        finalizeInitialChildren(instance, type, newProps);
      }

      // 收集 effect（有副作用的操作）
      if (workInProgress.flags !== NoFlags) {
        // 将当前 Fiber 加入 effect 链表
        if (returnFiber.lastEffect !== null) {
          returnFiber.lastEffect.nextEffect = workInProgress;
          returnFiber.lastEffect = workInProgress;
        } else {
          returnFiber.firstEffect = workInProgress;
          returnFiber.lastEffect = workInProgress;
        }
      }

      return null;
    }
  }
}

// 创建 DOM 节点
function createInstance(type, props, fiber) {
  const domElement = document.createElement(type);

  // 设置属性
  setInitialProperties(domElement, type, props);

  return domElement;
}

// 将所有子 DOM 节点插入到父节点
function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;

  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      // 找到 DOM 节点，直接插入
      appendInitialChild(parent, node.stateNode);
    } else if (node.child !== null) {
      // 组件节点，继续向下查找
      node.child.return = node;
      node = node.child;
      continue;
    }

    if (node === workInProgress) {
      return;
    }

    // 遍历兄弟节点
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }

    node.sibling.return = node.return;
    node = node.sibling;
  }
}
```

**4. 生成 Effect 链表**

```javascript
// Render 阶段结束时，会生成一个 effect 链表
// 链表中只包含有副作用的 Fiber 节点

/*
Effect 链表示例：

Root
  ↓ firstEffect
Fiber A (Placement - 插入)
  ↓ nextEffect
Fiber B (Update - 更新)
  ↓ nextEffect
Fiber C (Deletion - 删除)
  ↓ nextEffect
null
*/

// 在 Commit 阶段会遍历这个链表，执行副作用
```

#### Commit 阶段详解

Commit 阶段分为三个子阶段，都是同步执行的：

**1. Before Mutation 阶段**

```javascript
function commitBeforeMutationEffects(root, firstEffect) {
  let fiber = firstEffect;

  while (fiber !== null) {
    if (fiber.flags & Snapshot) {
      // 调用 getSnapshotBeforeUpdate
      const current = fiber.alternate;
      commitBeforeMutationEffectOnFiber(current, fiber);
    }

    if (fiber.flags & Passive) {
      // 调度 useEffect
      schedulePassiveEffects(fiber);
    }

    fiber = fiber.nextEffect;
  }
}

// 对于类组件，调用 getSnapshotBeforeUpdate
function commitBeforeMutationEffectOnFiber(current, finishedWork) {
  switch (finishedWork.tag) {
    case ClassComponent: {
      if (finishedWork.flags & Snapshot) {
        if (current !== null) {
          const prevProps = current.memoizedProps;
          const prevState = current.memoizedState;
          const instance = finishedWork.stateNode;

          // 调用生命周期
          const snapshot = instance.getSnapshotBeforeUpdate(
            prevProps,
            prevState
          );

          // 保存 snapshot，传给 componentDidUpdate
          instance.__reactInternalSnapshotBeforeUpdate = snapshot;
        }
      }
      break;
    }
  }
}
```

**2. Mutation 阶段**

```javascript
function commitMutationEffects(root, firstEffect) {
  let fiber = firstEffect;

  while (fiber !== null) {
    const flags = fiber.flags;

    // 重置文本内容
    if (flags & ContentReset) {
      commitResetTextContent(fiber);
    }

    // 处理 ref
    if (flags & Ref) {
      const current = fiber.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }

    // 根据 effectTag 执行 DOM 操作
    const primaryFlags = flags & (Placement | Update | Deletion);

    switch (primaryFlags) {
      case Placement: {
        // 插入 DOM
        commitPlacement(fiber);
        fiber.flags &= ~Placement;
        break;
      }

      case Update: {
        // 更新 DOM
        const current = fiber.alternate;
        commitWork(current, fiber);
        break;
      }

      case Deletion: {
        // 删除 DOM
        commitDeletion(root, fiber);
        break;
      }

      case PlacementAndUpdate: {
        // 插入并更新
        commitPlacement(fiber);
        fiber.flags &= ~Placement;
        const current = fiber.alternate;
        commitWork(current, fiber);
        break;
      }
    }

    fiber = fiber.nextEffect;
  }
}

// 插入 DOM
function commitPlacement(finishedWork) {
  // 1. 找到父 DOM 节点
  const parentFiber = getHostParentFiber(finishedWork);
  const parentDOM = parentFiber.stateNode;

  // 2. 找到插入位置
  const before = getHostSibling(finishedWork);

  // 3. 执行插入
  if (before) {
    insertBefore(parentDOM, finishedWork.stateNode, before);
  } else {
    appendChild(parentDOM, finishedWork.stateNode);
  }
}

// 更新 DOM
function commitWork(current, finishedWork) {
  switch (finishedWork.tag) {
    case HostComponent: {
      const instance = finishedWork.stateNode;

      if (instance != null) {
        const newProps = finishedWork.memoizedProps;
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type;

        // 计算需要更新的属性
        const updatePayload = prepareUpdate(
          instance,
          type,
          oldProps,
          newProps
        );

        // 更新 DOM 属性
        commitUpdate(
          instance,
          updatePayload,
          type,
          oldProps,
          newProps,
          finishedWork
        );
      }
      break;
    }
  }
}

// 删除 DOM
function commitDeletion(root, current) {
  // 1. 卸载 ref
  detachFiberMutation(current);

  // 2. 递归调用组件的 componentWillUnmount
  unmountHostComponents(root, current);

  // 3. 删除 DOM 节点
  removeChild(parent, current.stateNode);
}
```

**3. Layout 阶段**

```javascript
function commitLayoutEffects(root, firstEffect) {
  let fiber = firstEffect;

  while (fiber !== null) {
    const flags = fiber.flags;

    // 调用生命周期和 hook
    if (flags & (Update | Callback)) {
      commitLayoutEffectOnFiber(root, current, fiber);
    }

    // 赋值 ref
    if (flags & Ref) {
      commitAttachRef(fiber);
    }

    fiber = fiber.nextEffect;
  }
}

function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 调用 useLayoutEffect 的 create 函数
      commitHookEffectListMount(HookLayout | HookHasEffect, finishedWork);
      break;
    }

    case ClassComponent: {
      const instance = finishedWork.stateNode;

      if (finishedWork.flags & Update) {
        if (current === null) {
          // 首次挂载：调用 componentDidMount
          instance.componentDidMount();
        } else {
          // 更新：调用 componentDidUpdate
          const prevProps = current.memoizedProps;
          const prevState = current.memoizedState;
          const snapshot = instance.__reactInternalSnapshotBeforeUpdate;

          instance.componentDidUpdate(prevProps, prevState, snapshot);
        }
      }

      // 处理 setState 的回调
      if (finishedWork.flags & Callback) {
        const updateQueue = finishedWork.updateQueue;
        if (updateQueue !== null) {
          commitUpdateQueue(finishedWork, updateQueue, instance);
        }
      }
      break;
    }

    case HostComponent: {
      // 原生 DOM 元素，赋值 ref
      if (finishedWork.flags & Ref) {
        commitAttachRef(finishedWork);
      }
      break;
    }
  }
}

// 赋值 ref
function commitAttachRef(finishedWork) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;

    if (typeof ref === 'function') {
      // 函数形式的 ref
      ref(instance);
    } else {
      // 对象形式的 ref
      ref.current = instance;
    }
  }
}
```

#### 完整流程示例

```javascript
// 示例代码
function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

// 点击按钮后的完整流程：

// 1. 触发更新
onClick → setCount(1)

// 2. Render 阶段开始
beginWork(App Fiber)
  → 调用 App()
  → 返回 <div> 元素
  → reconcileChildren: 创建 div Fiber

beginWork(div Fiber)
  → reconcileChildren: 创建 button Fiber

beginWork(button Fiber)
  → reconcileChildren: 创建 "Count: 1" 文本 Fiber

beginWork(text Fiber)
  → 没有子节点

completeWork(text Fiber)
  → 创建文本节点 "Count: 1"

completeWork(button Fiber)
  → 创建 button 元素
  → appendChild(button, textNode)
  → 更新 onClick 属性

completeWork(div Fiber)
  → 创建 div 元素
  → appendChild(div, button)

completeWork(App Fiber)
  → 收集所有 effects

// 生成 Effect 链表
button Fiber (Update) → text Fiber (Update)

// 3. Commit 阶段开始

// Before Mutation
// (这个例子中没有 getSnapshotBeforeUpdate)

// Mutation
commitMutationEffects(button Fiber)
  → commitWork: 更新 button 的 onClick
  → commitWork(text Fiber): 更新文本内容为 "Count: 1"

// Layout
commitLayoutEffects(button Fiber)
  → 没有 layoutEffect

// 4. 浏览器重新绘制，用户看到新的 UI
```

#### Render 和 Commit 的区别总结

| 特性 | Render 阶段 | Commit 阶段 |
|------|-------------|-------------|
| 可中断性 | 可中断、可暂停、可取消 | 不可中断，必须同步执行 |
| 主要工作 | 构建 Fiber 树、Diff、标记副作用 | 操作 DOM、调用生命周期 |
| 副作用 | 无副作用 | 有副作用 |
| 执行时机 | 可以在后台执行 | 必须在一次事件循环中完成 |
| 用户可见 | 用户看不到中间状态 | 用户立即看到变化 |

这种设计保证了：
- Render 阶段可以利用浏览器空闲时间，不阻塞用户交互
- Commit 阶段快速同步执行，保证 UI 的一致性

---

## 四、Hooks 原理

### 4.1 useState 的实现原理是什么？为什么不能在条件语句中使用 Hooks？

**答案：**

#### useState 的实现原理

**1. 数据结构**

```javascript
// Fiber 节点中保存 hooks 链表
type Fiber = {
  memoizedState: Hook | null,  // 指向第一个 Hook
  // ...
};

// Hook 对象结构
type Hook = {
  memoizedState: any,       // 保存当前状态值
  baseState: any,           // 基础状态
  baseQueue: Update | null, // 基础更新队列
  queue: UpdateQueue | null,// 更新队列
  next: Hook | null,        // 指向下一个 Hook
};

// 更新队列
type UpdateQueue = {
  pending: Update | null,   // 待处理的更新
  dispatch: Dispatch | null,// setState 函数
  lastRenderedReducer: Function,
  lastRenderedState: any,
};

// 更新对象
type Update = {
  action: any,              // 新的状态值或更新函数
  next: Update | null,      // 下一个更新
  priority: number,         // 优先级
};
```

**2. 挂载阶段（mountState）**

```javascript
// 首次渲染时调用
function mountState(initialState) {
  // 1. 创建 Hook 对象
  const hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };

  // 2. 处理初始状态
  if (typeof initialState === 'function') {
    // 如果是函数，调用函数获取初始值
    initialState = initialState();
  }

  hook.memoizedState = hook.baseState = initialState;

  // 3. 创建更新队列
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  };
  hook.queue = queue;

  // 4. 创建 dispatch 函数（setState）
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,  // 当前 Fiber 节点
    queue
  ));

  // 5. 将 Hook 添加到链表末尾
  if (workInProgressHook === null) {
    // 第一个 Hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 后续 Hook
    workInProgressHook = workInProgressHook.next = hook;
  }

  // 6. 返回状态和更新函数
  return [hook.memoizedState, dispatch];
}

// 基础状态 reducer
function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action;
}
```

**3. 更新阶段（updateState）**

```javascript
function updateState(initialState) {
  // 复用 useReducer 的逻辑
  return updateReducer(basicStateReducer, initialState);
}

function updateReducer(reducer, initialArg) {
  // 1. 获取当前 Hook
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;

  // 2. 处理更新队列
  const pending = queue.pending;

  if (pending !== null) {
    // 2.1 获取基础状态
    let baseState = hook.baseState;

    // 2.2 遍历更新队列，计算新状态
    let first = pending.next;
    let update = first;

    do {
      // 根据优先级决定是否应用这个更新
      if (update.priority <= currentPriority) {
        // 计算新状态
        const action = update.action;
        baseState = reducer(baseState, action);
      }

      update = update.next;
    } while (update !== first);

    // 2.3 清空更新队列
    queue.pending = null;

    // 2.4 保存新状态
    hook.memoizedState = baseState;
    hook.baseState = baseState;
  }

  // 3. 返回状态和 dispatch
  const dispatch = queue.dispatch;
  return [hook.memoizedState, dispatch];
}

// 获取当前 Hook
function updateWorkInProgressHook() {
  // 从链表中按顺序取出 Hook
  if (currentHook === null) {
    // 第一个 Hook
    const current = currentlyRenderingFiber.alternate;
    currentHook = current.memoizedState;
  } else {
    // 后续 Hook
    currentHook = currentHook.next;
  }

  // 创建新的 workInProgress Hook
  const newHook = {
    memoizedState: currentHook.memoizedState,
    baseState: currentHook.baseState,
    baseQueue: currentHook.baseQueue,
    queue: currentHook.queue,
    next: null,
  };

  // 添加到新的链表
  if (workInProgressHook === null) {
    workInProgressHook = currentlyRenderingFiber.memoizedState = newHook;
  } else {
    workInProgressHook = workInProgressHook.next = newHook;
  }

  return workInProgressHook;
}
```

**4. setState 的实现（dispatchSetState）**

```javascript
function dispatchSetState(fiber, queue, action) {
  // 1. 创建更新对象
  const update = {
    action,                    // 新状态或更新函数
    next: null,
    priority: getCurrentPriority(),
  };

  // 2. 将更新加入队列（环形链表）
  const pending = queue.pending;
  if (pending === null) {
    // 队列为空，创建环形链表
    update.next = update;
  } else {
    // 插入到链表末尾
    update.next = pending.next;
    pending.next = update;
  }
  queue.pending = update;

  // 3. 优化：如果新状态和旧状态相同，跳过更新
  const lastRenderedReducer = queue.lastRenderedReducer;
  if (lastRenderedReducer !== null) {
    const currentState = queue.lastRenderedState;
    const eagerState = lastRenderedReducer(currentState, action);

    if (Object.is(eagerState, currentState)) {
      // 状态没有变化，退出
      return;
    }
  }

  // 4. 调度更新
  scheduleUpdateOnFiber(fiber);
}
```

**5. 完整示例**

```javascript
function Counter() {
  // 首次渲染时：
  // mountState(0)
  //   → 创建 Hook: { memoizedState: 0, queue: {...}, next: null }
  //   → 创建 dispatch 函数
  //   → 返回 [0, dispatch]

  // 更新时：
  // updateState(0)
  //   → 取出 Hook
  //   → 处理更新队列
  //   → 返回 [newState, dispatch]

  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');

  // Fiber.memoizedState 指向的链表：
  // Hook1 (count)  →  Hook2 (name)  →  null
  //   |                 |
  //   memoizedState: 0  memoizedState: 'John'

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>

      <p>{name}</p>
      <button onClick={() => setName('Jane')}>Change</button>
    </div>
  );
}

// 点击按钮后的流程：

// 1. 调用 setCount(1)
dispatchSetState(CounterFiber, queue, 1)
  → 创建 update: { action: 1, next: update }
  → 将 update 加入队列
  → scheduleUpdateOnFiber(CounterFiber)

// 2. Render 阶段
Counter()
  → updateState(0)
  → 从 Hook 链表中取出第一个 Hook
  → 处理更新队列：baseState = reducer(0, 1) = 1
  → 返回 [1, setCount]

  → updateState('John')
  → 从 Hook 链表中取出第二个 Hook
  → 没有更新，返回 ['John', setName]

// 3. Commit 阶段
// 更新 DOM，显示 count = 1
```

#### 为什么不能在条件语句中使用 Hooks？

**核心原因：Hook 依赖调用顺序**

```javascript
// ❌ 错误示例
function BadComponent({ condition }) {
  if (condition) {
    const [state1, setState1] = useState(1);  // Hook 1
  }
  const [state2, setState2] = useState(2);    // Hook 2 或 Hook 1 ？

  // 首次渲染 condition = true：
  // Hook 链表: Hook1 (state1) → Hook2 (state2)

  // 第二次渲染 condition = false：
  // Hook 链表: Hook1 (state2) ← 错位！
  //           ↑
  //           updateWorkInProgressHook 期望这是 state1 的 Hook
}
```

**详细解释：**

```javascript
// 正确示例
function GoodComponent() {
  const [state1, setState1] = useState(1);  // 总是 Hook 1
  const [state2, setState2] = useState(2);  // 总是 Hook 2
  const [state3, setState3] = useState(3);  // 总是 Hook 3

  // 首次渲染时建立的链表：
  // Hook1 (state1) → Hook2 (state2) → Hook3 (state3)
  //   memoizedState: 1  memoizedState: 2  memoizedState: 3

  // 更新时：
  let currentHook = fiber.memoizedState;  // 指向 Hook1

  const [s1, _] = useState(1);
  // currentHook = Hook1
  // 返回 Hook1.memoizedState = 1 ✓

  currentHook = currentHook.next;  // 移到 Hook2

  const [s2, _] = useState(2);
  // currentHook = Hook2
  // 返回 Hook2.memoizedState = 2 ✓

  currentHook = currentHook.next;  // 移到 Hook3

  const [s3, _] = useState(3);
  // currentHook = Hook3
  // 返回 Hook3.memoizedState = 3 ✓
}

// 错误示例
function BadComponent({ showExtra }) {
  const [state1, setState1] = useState(1);

  if (showExtra) {  // ❌ 条件调用
    const [state2, setState2] = useState(2);
  }

  const [state3, setState3] = useState(3);

  // 首次渲染 showExtra = true：
  // Hook1 (state1) → Hook2 (state2) → Hook3 (state3)

  // 第二次渲染 showExtra = false：
  let currentHook = fiber.memoizedState;  // Hook1

  const [s1, _] = useState(1);
  // currentHook = Hook1 ✓
  // 返回 1 ✓

  currentHook = currentHook.next;  // 移到 Hook2

  // 跳过 if 块

  const [s3, _] = useState(3);
  // currentHook = Hook2 ✗ (期望是 Hook3)
  // 返回 Hook2.memoizedState = 2 ✗ (期望返回 3)
  // 错误：state3 的值变成了 2！
}
```

**React 的检测机制：**

```javascript
// React 在开发模式下会检测 Hook 调用顺序
let renderPhaseUpdates = new Map();
let numberOfReRenders = 0;

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;

  if (dispatcher === null) {
    throw new Error(
      'Hooks can only be called inside the body of a function component.'
    );
  }

  return dispatcher;
}

// 渲染时计数 Hook 调用次数
let hookTypesCount = 0;

function checkHookOrder() {
  if (__DEV__) {
    const expectedHookType = hookTypesDev[hookTypesCount];
    const actualHookType = currentHook.type;

    if (expectedHookType !== actualHookType) {
      console.error(
        'React has detected a change in the order of Hooks called by %s. ' +
        'This will lead to bugs and errors if not fixed.',
        componentName
      );
    }

    hookTypesCount++;
  }
}
```

**正确的条件渲染方式：**

```javascript
// ✅ 方案 1：提前声明所有 Hook
function Component({ condition }) {
  const [state1, setState1] = useState(1);
  const [state2, setState2] = useState(2);  // 总是调用

  if (condition) {
    // 使用 state2
    console.log(state2);
  }

  return <div>{state1}</div>;
}

// ✅ 方案 2：使用 null 作为初始值
function Component({ condition }) {
  const [state, setState] = useState(condition ? 1 : null);

  return state !== null ? <div>{state}</div> : null;
}

// ✅ 方案 3：拆分组件
function Parent({ condition }) {
  return condition ? <ChildWithHook /> : <ChildWithoutHook />;
}

function ChildWithHook() {
  const [state, setState] = useState(1);
  return <div>{state}</div>;
}
```

**其他 Hook 规则：**

```javascript
// ❌ 不能在循环中使用
function Bad() {
  for (let i = 0; i < 3; i++) {
    const [state, setState] = useState(i);  // 错误！
  }
}

// ✅ 正确做法
function Good() {
  const [states, setStates] = useState([0, 1, 2]);
}

// ❌ 不能在普通函数中使用
function notAComponent() {
  const [state, setState] = useState(0);  // 错误！
}

// ✅ 只能在函数组件或自定义 Hook 中使用
function Component() {
  const [state, setState] = useState(0);  // 正确
}

function useCustomHook() {
  const [state, setState] = useState(0);  // 正确
  return state;
}
```

#### 总结

1. **useState 原理**：
   - Hook 保存在 Fiber 节点的链表中
   - 通过调用顺序确定每个 Hook 的位置
   - setState 创建更新对象，加入队列，触发调度

2. **为什么不能在条件语句中使用**：
   - Hook 依赖固定的调用顺序
   - 条件语句会改变顺序，导致 Hook 错位
   - React 无法正确匹配 Hook 和状态

3. **Hook 规则**：
   - 只在最顶层调用 Hook
   - 只在函数组件或自定义 Hook 中调用
   - Hook 名称必须以 "use" 开头（约定）

---

(继续文档的其余部分...)

### 4.2 useEffect 和 useLayoutEffect 的区别是什么？执行时机分别是什么时候？

**答案：**

#### 核心区别

| 特性 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | 浏览器绘制**之后**（异步） | 浏览器绘制**之前**（同步） |
| 是否阻塞渲染 | 不阻塞 | 阻塞 |
| 用途 | 大部分副作用（请求、订阅等） | DOM 测量、同步更新样式 |
| 服务端渲染 | 不会警告 | 会警告（服务端无 DOM） |

#### 详细执行时机

```javascript
// 完整的渲染流程
function Component() {
  const [count, setCount] = useState(0);

  console.log('1. 函数组件执行');

  useLayoutEffect(() => {
    console.log('3. useLayoutEffect');
    return () => console.log('cleanup useLayoutEffect');
  });

  useEffect(() => {
    console.log('5. useEffect');
    return () => console.log('cleanup useEffect');
  });

  return <div>{count}</div>;
}

// 首次渲染输出顺序：
// 1. 函数组件执行
// 2. React 更新 DOM
// 3. useLayoutEffect      ← 浏览器绘制前
// 4. 浏览器绘制屏幕
// 5. useEffect            ← 浏览器绘制后

// 更新时输出顺序：
// 1. 函数组件执行
// cleanup useLayoutEffect  ← 先清理旧的 layout effect
// 2. React 更新 DOM
// 3. useLayoutEffect       ← 执行新的 layout effect
// 4. 浏览器绘制屏幕
// cleanup useEffect        ← 清理旧的 effect
// 5. useEffect             ← 执行新的 effect
```

#### useEffect 的实现原理

```javascript
// 挂载阶段
function mountEffect(create, deps) {
  return mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,  // 标记为异步 effect
    HookPassive,
    create,
    deps
  );
}

function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  // 1. 创建 Hook 对象
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;

  // 2. 标记 Fiber 有副作用
  currentlyRenderingFiber.flags |= fiberFlags;

  // 3. 创建 effect 对象并保存
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,  // effect 标记
    create,                      // effect 函数
    undefined,                   // destroy 函数（初始为空）
    nextDeps                     // 依赖数组
  );
}

// 创建 effect 对象
function pushEffect(tag, create, destroy, deps) {
  const effect = {
    tag,                    // effect 类型标记
    create,                 // effect 函数
    destroy,                // cleanup 函数
    deps,                   // 依赖数组
    next: null,             // 指向下一个 effect
  };

  // 将 effect 添加到 Fiber 的 effect 链表
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue;

  if (componentUpdateQueue === null) {
    // 创建环形链表
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue;
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    // 添加到链表末尾
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }

  return effect;
}

// 更新阶段
function updateEffect(create, deps) {
  return updateEffectImpl(
    PassiveEffect,
    HookPassive,
    create,
    deps
  );
}

function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  // 1. 获取当前 Hook
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;

  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;

    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;

      // 2. 比较依赖数组
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖没变，创建不带 HookHasEffect 标记的 effect
        // 这样 commit 阶段就不会执行
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps);
        return;
      }
    }
  }

  // 3. 依赖变化，标记需要执行 effect
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps
  );
}

// 比较依赖数组
function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    return false;
  }

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

#### Commit 阶段执行 Effect

```javascript
// Commit 阶段的三个子阶段都会处理 effect

// 1. Before Mutation 阶段：调度 useEffect
function commitBeforeMutationEffects(root, firstEffect) {
  let fiber = firstEffect;

  while (fiber !== null) {
    if (fiber.flags & Passive) {
      // 异步调度 useEffect
      if (!rootDoesHavePassiveEffects) {
        rootDoesHavePassiveEffects = true;

        // 使用 Scheduler 调度
        scheduleCallback(NormalPriority, () => {
          flushPassiveEffects();
          return null;
        });
      }
    }

    fiber = fiber.nextEffect;
  }
}

// 2. Mutation 阶段：执行 useLayoutEffect 的 cleanup
function commitMutationEffects(root, firstEffect) {
  let fiber = firstEffect;

  while (fiber !== null) {
    const flags = fiber.flags;

    if (flags & Update) {
      // 执行 useLayoutEffect 的 cleanup
      commitHookEffectListUnmount(
        HookLayout | HookHasEffect,
        fiber
      );
    }

    fiber = fiber.nextEffect;
  }
}

function commitHookEffectListUnmount(tag, fiber) {
  const updateQueue = fiber.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;

    do {
      if ((effect.tag & tag) === tag) {
        // 调用 cleanup 函数
        const destroy = effect.destroy;
        effect.destroy = undefined;

        if (destroy !== undefined) {
          destroy();
        }
      }

      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

// 3. Layout 阶段：执行 useLayoutEffect
function commitLayoutEffects(root, firstEffect) {
  let fiber = firstEffect;

  while (fiber !== null) {
    const flags = fiber.flags;

    if (flags & Update) {
      // 执行 useLayoutEffect 的 create
      commitHookEffectListMount(
        HookLayout | HookHasEffect,
        fiber
      );
    }

    fiber = fiber.nextEffect;
  }
}

function commitHookEffectListMount(tag, fiber) {
  const updateQueue = fiber.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;

    do {
      if ((effect.tag & tag) === tag) {
        // 调用 create 函数，保存 cleanup
        const create = effect.create;
        effect.destroy = create();
      }

      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

// 4. 异步执行 useEffect
function flushPassiveEffects() {
  // 先执行所有 cleanup
  commitPassiveUnmountEffects(root.current);

  // 再执行所有 create
  commitPassiveMountEffects(root, root.current);
}
```

#### 使用场景对比

```javascript
// useEffect 适合的场景

function DataFetching() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // ✅ 数据请求：不需要阻塞渲染
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  useEffect(() => {
    // ✅ 订阅：异步操作
    const subscription = dataSource.subscribe(setData);
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // ✅ 定时器：不影响初始渲染
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <div>{data}</div>;
}

// useLayoutEffect 适合的场景

function TooltipWithPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);

  useLayoutEffect(() => {
    // ✅ DOM 测量：需要在绘制前完成
    const tooltip = tooltipRef.current;
    const { width, height } = tooltip.getBoundingClientRect();

    // 根据尺寸调整位置，避免溢出
    const x = Math.min(position.x, window.innerWidth - width);
    const y = Math.min(position.y, window.innerHeight - height);

    if (x !== position.x || y !== position.y) {
      setPosition({ x, y });
    }
  }, [position]);

  return (
    <div
      ref={tooltipRef}
      style={{ position: 'absolute', left: position.x, top: position.y }}
    >
      Tooltip
    </div>
  );
  // 如果用 useEffect，用户会看到 tooltip 先出现在错误位置，再跳到正确位置（闪烁）
  // 用 useLayoutEffect，在绘制前就调整好位置，用户看不到闪烁
}

function AnimationExample() {
  const ref = useRef(null);

  useLayoutEffect(() => {
    // ✅ 同步DOM更新：避免闪烁
    const element = ref.current;
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';

    // 强制重排，然后开始动画
    element.offsetHeight;

    element.style.transition = 'all 0.3s';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, []);

  return <div ref={ref}>Fade in</div>;
}

function ScrollToTop() {
  useLayoutEffect(() => {
    // ✅ 滚动操作：在绘制前完成
    window.scrollTo(0, 0);
  }, []);

  return <div>Content</div>;
  // useEffect 会导致用户先看到旧的滚动位置，然后跳到顶部
}
```

#### 性能影响

```javascript
// 性能测试

function PerformanceComparison() {
  const [count, setCount] = useState(0);

  // useLayoutEffect 会阻塞渲染
  useLayoutEffect(() => {
    // 模拟耗时操作（50ms）
    const start = Date.now();
    while (Date.now() - start < 50) {}
    console.log('useLayoutEffect done');
  });

  // useEffect 不会阻塞
  useEffect(() => {
    const start = Date.now();
    while (Date.now() - start < 50) {}
    console.log('useEffect done');
  });

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}

// 点击按钮后的时间线：

// useLayoutEffect:
// 0ms: 点击
// 5ms: React 完成 render
// 5ms: React 更新 DOM
// 5-55ms: useLayoutEffect 执行（阻塞！）
// 55ms: 浏览器绘制（用户看到新的 count）
// 55-105ms: useEffect 执行（不阻塞）
//
// 用户感知延迟：55ms

// 如果都用 useEffect:
// 0ms: 点击
// 5ms: React 完成 render
// 5ms: React 更新 DOM
// 5ms: 浏览器绘制（用户看到新的 count）
// 5-55ms: 第一个 useEffect
// 5-55ms: 第二个 useEffect（并行）
//
// 用户感知延迟：5ms（提升10倍！）
```

#### 最佳实践

```javascript
// ❌ 错误：滥用 useLayoutEffect
function Bad() {
  const [data, setData] = useState(null);

  useLayoutEffect(() => {
    // 错误：数据请求不需要阻塞渲染
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{data}</div>;
}

// ✅ 正确：使用 useEffect
function Good() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{data}</div>;
}

// ✅ 何时使用 useLayoutEffect 的判断标准：
// 1. 需要读取 DOM 布局信息
// 2. 需要同步修改 DOM 以避免视觉闪烁
// 3. 必须在浏览器绘制前完成

// ❌ 不要用 useLayoutEffect 的情况：
// 1. 数据请求
// 2. 订阅/事件监听
// 3. 定时器
// 4. 日志记录
// 5. 任何可以异步执行的操作
```

#### 总结

1. **useEffect**：
   - 异步执行，不阻塞浏览器绘制
   - 99% 的场景应该使用这个
   - 执行时机：浏览器绘制后

2. **useLayoutEffect**：
   - 同步执行，阻塞浏览器绘制
   - 只在需要同步读写 DOM 时使用
   - 执行时机：DOM 更新后、浏览器绘制前

3. **选择原则**：
   - 默认使用 useEffect
   - 只有在出现视觉闪烁等问题时才考虑 useLayoutEffect
   - 如果不确定，用 useEffect，有问题再改

---

## 七、事件系统

### 7.1 React 的事件委托机制是如何实现的？

**答案：**

#### 事件委托的基本概念

React 并不会把事件处理函数直接绑定到真实的 DOM 节点上，而是使用事件委托（Event Delegation）的方式，将所有事件统一绑定到容器节点（React 16 是 document，React 17+ 是 root 节点）。

```javascript
// 原生 DOM 事件绑定
<button onclick="handleClick()">Click me</button>

// React 事件绑定（JSX）
<button onClick={handleClick}>Click me</button>

// 实际上 React 不会这样做：
button.addEventListener('click', handleClick);

// 而是这样做（React 17+）：
rootContainer.addEventListener('click', dispatchEvent);
```

**为什么这样做？**

1. **减少内存消耗**：只在根节点绑定一个事件监听器，而不是每个元素都绑定
2. **统一事件处理**：可以在事件到达组件前进行统一的处理和优化
3. **跨浏览器兼容**：React 合成事件抹平浏览器差异
4. **便于管理**：组件卸载时无需手动移除事件监听器

#### React 16 vs React 17 的事件委托差异

```javascript
// React 16：事件委托到 document
ReactDOM.render(<App />, document.getElementById('root'));

// 内部实现：
document.addEventListener('click', dispatchEvent, false);
document.addEventListener('change', dispatchEvent, false);
// ... 所有事件类型

// React 17+：事件委托到 root 容器
const root = document.getElementById('root');
ReactDOM.render(<App />, root);

// 内部实现：
root.addEventListener('click', dispatchEvent, false);
root.addEventListener('change', dispatchEvent, false);
// ... 所有事件类型

// 为什么改变？
// 1. 支持微前端：多个 React 版本共存不会冲突
// 2. 更好的性能：减少事件冒泡的层级
// 3. 与原生事件更好地协作
```

**实际案例对比：**

```javascript
// React 16 的问题
function App() {
  useEffect(() => {
    // 原生事件监听
    document.addEventListener('click', (e) => {
      console.log('原生 document click');
      e.stopPropagation(); // 阻止冒泡
    });
  }, []);

  const handleClick = () => {
    console.log('React click');
  };

  return <button onClick={handleClick}>Click</button>;
}

// React 16 执行顺序：
// 1. 原生 document click（先执行）
// 2. React click（永远不会执行！因为被 stopPropagation 阻止了）

// React 17+ 执行顺序：
// 1. React click（先执行，因为绑定在 root 上）
// 2. 原生 document click
```

#### 事件委托的完整实现流程

**1. 事件注册阶段（组件挂载时）**

```javascript
// 简化的事件注册流程

// 1. JSX 编译
<button onClick={handleClick}>Click</button>
// ↓
React.createElement('button', { onClick: handleClick }, 'Click')

// 2. Fiber 创建时
function createFiber(element) {
  const fiber = {
    type: 'button',
    props: {
      onClick: handleClick, // 事件处理函数存储在 props 中
      children: 'Click'
    },
    stateNode: null, // 真实 DOM 节点
  };
  return fiber;
}

// 3. completeWork 阶段：创建 DOM 并设置属性
function completeWork(fiber) {
  const domElement = document.createElement('button');

  // 设置属性（不包括事件）
  setInitialProperties(domElement, 'button', fiber.props);

  fiber.stateNode = domElement;
}

function setInitialProperties(domElement, tag, props) {
  for (const propKey in props) {
    const propValue = props[propKey];

    if (propKey === 'onClick') {
      // 不直接绑定事件！
      // 而是将事件信息存储到 DOM 节点的内部属性中
      ensureListeningTo(rootContainer, 'click');

      // 将事件处理函数存储到 DOM 节点上
      // 供后续事件分发时使用
      updateFiberProps(domElement, props);
    } else if (propKey === 'children') {
      // 处理子节点
    } else {
      // 设置其他 DOM 属性
      domElement[propKey] = propValue;
    }
  }
}

// 4. 确保根容器监听该事件类型
const listeningSet = new Set(); // 已注册的事件类型

function ensureListeningTo(rootContainer, eventType) {
  const listenerKey = `__reactEvents$${eventType}`;

  // 如果该事件类型还未注册
  if (!listeningSet.has(listenerKey)) {
    // 在根容器上注册监听器
    addTrappedEventListener(
      rootContainer,
      eventType,
      false // useCapture
    );

    listeningSet.add(listenerKey);
  }
}

// 5. 添加事件监听器到根容器
function addTrappedEventListener(
  targetContainer,
  domEventName,
  isCapturePhaseListener
) {
  // 创建优先级相关的监听器
  const listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    isCapturePhaseListener
  );

  // 实际添加监听器
  if (isCapturePhaseListener) {
    targetContainer.addEventListener(domEventName, listener, true);
  } else {
    targetContainer.addEventListener(domEventName, listener, false);
  }
}

// 6. 创建包装的监听器（处理优先级）
function createEventListenerWrapperWithPriority(
  targetContainer,
  domEventName,
  isCapturePhaseListener
) {
  // 根据事件类型确定优先级
  let eventPriority;

  switch (domEventName) {
    case 'click':
    case 'keydown':
    case 'keyup':
      // 离散事件：高优先级
      eventPriority = DiscreteEventPriority;
      break;

    case 'scroll':
    case 'mousemove':
      // 连续事件：普通优先级
      eventPriority = ContinuousEventPriority;
      break;

    default:
      // 默认优先级
      eventPriority = DefaultEventPriority;
      break;
  }

  // 返回包装后的监听器
  return dispatchEvent.bind(
    null,
    domEventName,
    eventPriority,
    targetContainer
  );
}
```

**2. 事件触发阶段（用户点击按钮）**

```javascript
// 用户点击按钮后的完整流程

// 1. 原生事件触发
button.click();
// ↓ 事件冒泡
// ↓
rootContainer (这里触发 React 的监听器)

// 2. dispatchEvent 被调用
function dispatchEvent(
  domEventName,      // 'click'
  eventPriority,     // DiscreteEventPriority
  targetContainer,   // root 容器
  nativeEvent        // 原生事件对象
) {
  // 2.1 获取事件的真实目标元素（被点击的按钮）
  const nativeEventTarget = getEventTarget(nativeEvent);

  // 2.2 找到对应的 Fiber 节点
  const targetFiber = getClosestInstanceFromNode(nativeEventTarget);

  // 2.3 根据优先级调度事件处理
  if (eventPriority === DiscreteEventPriority) {
    // 高优先级事件，同步处理
    dispatchDiscreteEvent(
      domEventName,
      targetContainer,
      nativeEvent,
      targetFiber
    );
  } else {
    // 低优先级事件，可能延迟处理
    dispatchContinuousEvent(
      domEventName,
      targetContainer,
      nativeEvent,
      targetFiber
    );
  }
}

// 3. 分发离散事件（同步）
function dispatchDiscreteEvent(
  domEventName,
  targetContainer,
  nativeEvent,
  targetFiber
) {
  // 3.1 设置当前事件优先级
  const previousPriority = getCurrentUpdatePriority();
  setCurrentUpdatePriority(DiscreteEventPriority);

  try {
    // 3.2 分发事件到组件树
    dispatchEventForPluginEventSystem(
      domEventName,
      targetContainer,
      nativeEvent,
      targetFiber
    );
  } finally {
    // 3.3 恢复之前的优先级
    setCurrentUpdatePriority(previousPriority);
  }
}

// 4. 插件事件系统分发
function dispatchEventForPluginEventSystem(
  domEventName,
  targetContainer,
  nativeEvent,
  targetFiber
) {
  // 4.1 提取事件处理函数（模拟捕获和冒泡）
  const dispatchQueue = [];
  extractEvents(
    dispatchQueue,
    domEventName,
    targetFiber,
    nativeEvent,
    targetContainer
  );

  // 4.2 执行事件处理函数
  processDispatchQueue(dispatchQueue, nativeEvent);
}

// 5. 提取事件处理函数（构建事件队列）
function extractEvents(
  dispatchQueue,
  domEventName,
  targetFiber,
  nativeEvent,
  targetContainer
) {
  // 5.1 创建合成事件对象
  const syntheticEvent = createSyntheticEvent(
    domEventName,
    nativeEvent,
    targetFiber
  );

  // 5.2 收集从目标节点到根节点路径上的所有事件处理函数
  const listeners = [];

  let fiber = targetFiber;
  while (fiber !== null) {
    const { stateNode, tag } = fiber;

    if (tag === HostComponent && stateNode !== null) {
      // 获取该节点的 props
      const props = getFiberCurrentPropsFromNode(stateNode);

      if (props) {
        // 捕获阶段的事件处理函数
        const captureListener = props.onClickCapture;
        if (captureListener) {
          listeners.unshift({ // 捕获阶段：从外到内
            instance: stateNode,
            listener: captureListener,
            currentTarget: stateNode
          });
        }

        // 冒泡阶段的事件处理函数
        const bubbleListener = props.onClick;
        if (bubbleListener) {
          listeners.push({ // 冒泡阶段：从内到外
            instance: stateNode,
            listener: bubbleListener,
            currentTarget: stateNode
          });
        }
      }
    }

    fiber = fiber.return; // 向上遍历
  }

  // 5.3 添加到分发队列
  if (listeners.length > 0) {
    dispatchQueue.push({
      event: syntheticEvent,
      listeners: listeners
    });
  }
}

// 6. 处理分发队列（执行事件处理函数）
function processDispatchQueue(dispatchQueue, nativeEvent) {
  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i];

    // 6.1 执行所有监听器
    processDispatchQueueItemsInOrder(event, listeners);

    // 6.2 如果事件已被阻止传播，停止处理
    if (event.isPropagationStopped()) {
      break;
    }
  }
}

function processDispatchQueueItemsInOrder(event, listeners) {
  // 按顺序执行监听器（捕获阶段 → 冒泡阶段）
  for (let i = 0; i < listeners.length; i++) {
    const { listener, currentTarget } = listeners[i];

    // 设置 currentTarget
    event.currentTarget = currentTarget;

    // 调用事件处理函数
    listener.call(currentTarget, event);

    // 如果调用了 stopPropagation，停止传播
    if (event.isPropagationStopped()) {
      break;
    }
  }
}
```

**3. 合成事件对象（SyntheticEvent）**

```javascript
// React 创建的合成事件对象

function createSyntheticEvent(domEventName, nativeEvent, targetFiber) {
  const EventInterface = {
    type: nativeEvent.type,
    target: nativeEvent.target,
    currentTarget: null, // 动态设置

    // 常用属性
    bubbles: nativeEvent.bubbles,
    cancelable: nativeEvent.cancelable,
    defaultPrevented: nativeEvent.defaultPrevented,
    eventPhase: nativeEvent.eventPhase,
    isTrusted: nativeEvent.isTrusted,
    timeStamp: nativeEvent.timeStamp,

    // 鼠标事件专属
    clientX: nativeEvent.clientX,
    clientY: nativeEvent.clientY,
    pageX: nativeEvent.pageX,
    pageY: nativeEvent.pageY,
    screenX: nativeEvent.screenX,
    screenY: nativeEvent.screenY,

    // 键盘事件专属
    altKey: nativeEvent.altKey,
    ctrlKey: nativeEvent.ctrlKey,
    shiftKey: nativeEvent.shiftKey,
    metaKey: nativeEvent.metaKey,
    key: nativeEvent.key,
    keyCode: nativeEvent.keyCode,
  };

  // 创建合成事件对象
  const syntheticEvent = Object.create(EventInterface);

  // 保存原生事件引用
  syntheticEvent.nativeEvent = nativeEvent;

  // 阻止传播的标志
  let isPropagationStopped = false;

  // 实现 stopPropagation
  syntheticEvent.stopPropagation = function() {
    isPropagationStopped = true;

    if (nativeEvent.stopPropagation) {
      nativeEvent.stopPropagation();
    }
  };

  syntheticEvent.isPropagationStopped = function() {
    return isPropagationStopped;
  };

  // 实现 preventDefault
  syntheticEvent.preventDefault = function() {
    this.defaultPrevented = true;

    if (nativeEvent.preventDefault) {
      nativeEvent.preventDefault();
    } else {
      nativeEvent.returnValue = false;
    }
  };

  syntheticEvent.isDefaultPrevented = function() {
    return this.defaultPrevented;
  };

  return syntheticEvent;
}
```

#### 完整示例演示

```javascript
// 示例代码
function App() {
  const handleOuterClick = (e) => {
    console.log('1. Outer div click');
  };

  const handleOuterClickCapture = (e) => {
    console.log('0. Outer div click (capture)');
  };

  const handleButtonClick = (e) => {
    console.log('3. Button click');
    // e.stopPropagation(); // 如果取消注释，会阻止事件继续传播
  };

  const handleButtonClickCapture = (e) => {
    console.log('2. Button click (capture)');
  };

  return (
    <div
      onClick={handleOuterClick}
      onClickCapture={handleOuterClickCapture}
    >
      <button
        onClick={handleButtonClick}
        onClickCapture={handleButtonClickCapture}
      >
        Click me
      </button>
    </div>
  );
}

// 点击按钮后的执行流程：

// 1. 用户点击按钮
// ↓
// 2. 原生事件冒泡到 root 容器
// ↓
// 3. React 的 dispatchEvent 被触发
// ↓
// 4. 收集事件路径上的所有监听器：
//    - 捕获阶段：[handleOuterClickCapture, handleButtonClickCapture]
//    - 冒泡阶段：[handleButtonClick, handleOuterClick]
// ↓
// 5. 创建合成事件对象
// ↓
// 6. 按顺序执行监听器：
//    输出：0. Outer div click (capture)
//    输出：2. Button click (capture)
//    输出：3. Button click
//    输出：1. Outer div click
```

#### 事件委托的优势和特点

```javascript
// 1. 内存优化
// 1000 个按钮，原生 DOM：
for (let i = 0; i < 1000; i++) {
  document.getElementById(`btn-${i}`).addEventListener('click', handler);
}
// 需要 1000 个事件监听器！

// React 事件委托：
function ButtonList() {
  return (
    <div>
      {Array.from({ length: 1000 }, (_, i) => (
        <button key={i} onClick={handler}>Button {i}</button>
      ))}
    </div>
  );
}
// 只需要 1 个事件监听器（在 root 上）

// 2. 跨浏览器兼容
function handleChange(e) {
  // 不需要考虑浏览器差异
  console.log(e.target.value);

  // React 已经处理了兼容性：
  // - IE: e.srcElement → e.target
  // - 事件对象的标准化
  // - stopPropagation/preventDefault 的统一
}

// 3. 事件池（React 16，React 17 已移除）
// React 16 中，合成事件对象会被重用
function handleClick(e) {
  console.log(e.type); // 'click'

  setTimeout(() => {
    console.log(e.type); // null（事件对象被重置）
  }, 0);

  // 如果需要异步访问事件属性：
  e.persist(); // 告诉 React 不要重用这个事件对象

  setTimeout(() => {
    console.log(e.type); // 'click'（保留了）
  }, 0);
}

// React 17+ 不再使用事件池，可以直接异步访问
function handleClick(e) {
  setTimeout(() => {
    console.log(e.type); // 'click'（正常工作）
  }, 0);
}
```

#### 注意事项和最佳实践

```javascript
// 1. 阻止默认行为
function handleSubmit(e) {
  e.preventDefault(); // ✅ 正确

  // 不能这样做：
  return false; // ❌ 在 React 中无效（在原生 DOM 中有效）
}

// 2. 事件处理函数的 this 绑定
class Component extends React.Component {
  handleClick1() {
    console.log(this); // undefined（严格模式下）
  }

  handleClick2 = () => {
    console.log(this); // Component 实例 ✅
  }

  render() {
    return (
      <div>
        <button onClick={this.handleClick1}>Bad</button>
        <button onClick={this.handleClick2}>Good</button>
        <button onClick={this.handleClick1.bind(this)}>Also Good</button>
      </div>
    );
  }
}

// 3. 原生事件 vs React 事件混用
function MixedEvents() {
  const ref = useRef(null);

  useEffect(() => {
    const button = ref.current;

    // 原生事件监听器
    button.addEventListener('click', (e) => {
      console.log('原生事件');
      // e.stopPropagation(); // 会阻止 React 事件！
    });
  }, []);

  const handleClick = (e) => {
    console.log('React 事件');
  };

  return <button ref={ref} onClick={handleClick}>Click</button>;

  // React 17+:
  // 点击输出：原生事件 → React 事件

  // React 16:
  // 点击输出：React 事件 → 原生事件
}

// 4. 性能优化：避免在 render 中创建函数
// ❌ 不好：每次渲染都创建新函数
function Bad() {
  return (
    <button onClick={() => console.log('clicked')}>
      Click
    </button>
  );
}

// ✅ 好：使用 useCallback 缓存
function Good() {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);

  return <button onClick={handleClick}>Click</button>;
}

// ✅ 更好：提取到组件外部（如果不依赖 props/state）
const handleClick = () => console.log('clicked');

function Better() {
  return <button onClick={handleClick}>Click</button>;
}
```

#### 事件优先级

```javascript
// React 根据事件类型设置不同的优先级

// 离散事件（Discrete Events）- 高优先级
// - click, keydown, keyup, input, change
// - 需要立即响应的用户交互

function DiscreteExample() {
  const [value, setValue] = useState('');

  // 用户输入时立即更新，高优先级
  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return <input value={value} onChange={handleChange} />;
}

// 连续事件（Continuous Events）- 普通优先级
// - scroll, mousemove, touchmove
// - 可能频繁触发，不一定每次都需要立即处理

function ContinuousExample() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 鼠标移动时更新位置，可能会被节流
  const handleMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      Position: {position.x}, {position.y}
    </div>
  );
}

// 使用 startTransition 降低优先级
function TransitionExample() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;

    // 高优先级：立即更新输入框
    setQuery(value);

    // 低优先级：搜索可以延迟
    startTransition(() => {
      setResults(searchLargeDataset(value));
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      <SearchResults items={results} />
    </>
  );
}
```

#### 总结

React 的事件委托机制：

1. **统一管理**：所有事件绑定到根容器（React 17+ 是 root，React 16 是 document）
2. **模拟冒泡和捕获**：通过遍历 Fiber 树收集事件处理函数
3. **合成事件**：创建跨浏览器兼容的事件对象
4. **优先级调度**：根据事件类型设置不同的优先级
5. **性能优化**：减少内存消耗，便于管理

这种设计使得 React 能够更好地控制事件处理流程，实现优先级调度，并为未来的并发特性打下基础。

---

(由于内容太长，我将把文档分成多个部分。文件已创建，包含了前四个主要部分以及事件系统的详细内容。)
