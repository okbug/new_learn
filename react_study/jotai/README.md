# Jotai 原理解析

## 目录

- [简介](#简介)
- [核心概念](#核心概念)
- [实现原理](#实现原理)
- [核心 API](#核心-api)
- [高级特性](#高级特性)
- [与其他状态管理库的对比](#与其他状态管理库的对比)
- [最佳实践](#最佳实践)

## 简介

Jotai 是一个极简的 React 状态管理库，受 Recoil 启发。它采用原子化（Atomic）的设计理念，将状态拆分成最小的独立单元（atom），通过组合这些原子来构建复杂的状态逻辑。

**核心特点：**
- 🪶 **轻量级**：核心代码非常小，无需复杂的配置
- ⚛️ **原子化**：状态以最小单元存在，按需组合
- 🔄 **自动依赖追踪**：派生状态自动追踪依赖关系
- 📦 **TypeScript 友好**：完整的类型推导
- 🎯 **React Suspense 支持**：原生支持异步状态
- 🧪 **易于测试**：状态独立，测试简单

## 核心概念

### 1. Atom（原子）

Atom 是 Jotai 的最小状态单元，可以理解为：

```javascript
// 原始 atom - 存储基本值
const countAtom = atom(0);

// 派生 atom - 基于其他 atom 计算得出
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 可写的派生 atom - 自定义读写逻辑
const readWriteAtom = atom(
  (get) => get(countAtom),           // 读取逻辑
  (get, set, newValue) => {          // 写入逻辑
    set(countAtom, newValue * 2);
  }
);
```

### 2. 状态存储

Jotai 使用 `WeakMap` 来存储所有 atom 的状态：

```javascript
const atomStateMap = new WeakMap();

// 每个 atom 的状态包含：
{
  value: any,           // 当前值
  listeners: Set,       // 订阅者列表
  dependencies: Set     // 依赖的其他 atom
}
```

**为什么使用 WeakMap？**
- 自动垃圾回收：当 atom 不再被引用时，相关状态会被自动清理
- 私有性：外部无法直接访问，保证状态封装
- 性能：O(1) 的读写时间复杂度

### 3. 依赖追踪

Jotai 实现了自动依赖追踪机制：

```javascript
// 当读取派生 atom 时
const doubleCountAtom = atom((get) => {
  const count = get(countAtom);  // 1. 记录依赖关系
  return count * 2;               // 2. 计算并返回值
});

// 依赖关系图
atomDependentsMap: {
  countAtom -> Set([doubleCountAtom])  // countAtom 的依赖者
}
```

**依赖追踪流程：**
1. 派生 atom 读取时，清空旧依赖
2. 通过 `get()` 读取其他 atom，记录依赖
3. 被依赖的 atom 变化时，通知所有依赖者

## 实现原理

### 1. 读取流程（readAtom）

```javascript
function readAtom(atom) {
  const atomState = getAtomState(atom);

  if (atom.read) {
    // 派生 atom：重新计算
    atomState.dependencies.clear();

    const get = (targetAtom) => {
      // 记录依赖关系
      atomState.dependencies.add(targetAtom);

      // 添加到依赖者列表
      let dependents = atomDependentsMap.get(targetAtom);
      if (!dependents) {
        dependents = new Set();
        atomDependentsMap.set(targetAtom, dependents);
      }
      dependents.add(atom);

      return readAtom(targetAtom);  // 递归读取
    };

    atomState.value = atom.read(get);
  }

  return atomState.value;
}
```

**关键点：**
- 派生 atom 每次读取都重新计算（确保最新）
- 依赖关系是双向的：A 依赖 B，B 记录 A 为依赖者
- 支持递归读取多层依赖

### 2. 写入流程（writeAtom）

```javascript
function writeAtom(atom, value) {
  const atomState = getAtomState(atom);

  const set = (targetAtom, nextValue) => {
    const targetState = getAtomState(targetAtom);
    targetState.value = nextValue;

    // 1. 通知直接订阅者
    targetState.listeners.forEach(listener => listener());

    // 2. 通知所有依赖者（派生 atom）
    const dependents = atomDependentsMap.get(targetAtom);
    if (dependents) {
      dependents.forEach(dependent => {
        const dependentState = getAtomState(dependent);
        dependentState.listeners.forEach(listener => listener());
      });
    }
  };

  atom.write(get, set, value);
}
```

**更新传播机制：**
1. 更新原子的值
2. 通知直接订阅者（使用 useAtom 的组件）
3. 通知所有派生 atom 的订阅者
4. 形成更新链：A → B → C（依赖链）

### 3. 订阅机制（subscribeAtom）

```javascript
function subscribeAtom(atom, callback) {
  const atomState = getAtomState(atom);
  atomState.listeners.add(callback);

  return () => {
    atomState.listeners.delete(callback);  // 取消订阅
  };
}
```

**订阅-发布模式：**
- 组件通过 `useAtom` 订阅 atom
- atom 变化时，触发所有订阅者的回调
- 组件卸载时自动取消订阅（通过 useEffect 清理）

### 4. useAtom Hook 实现

```javascript
export function useAtom(atom) {
  const [, forceUpdate] = useReducer(c => c + 1, 0);
  const valueRef = useRef();

  // 1. 读取当前值
  const value = readAtom(atom);
  valueRef.current = value;

  // 2. 订阅变化
  useEffect(() => {
    const unsubscribe = subscribeAtom(atom, () => {
      const newValue = readAtom(atom);
      if (!Object.is(valueRef.current, newValue)) {
        valueRef.current = newValue;
        forceUpdate();  // 触发重新渲染
      }
    });

    return unsubscribe;  // 清理订阅
  }, [atom]);

  // 3. 返回值和更新函数
  const setValue = (update) => {
    writeAtom(atom, update);
  };

  return [value, setValue];
}
```

**实现细节：**
- 使用 `useReducer` 强制组件更新
- 使用 `useRef` 缓存当前值，避免闭包陷阱
- `Object.is()` 进行值比较，避免不必要的更新
- `useEffect` 确保订阅在组件挂载后建立

## 核心 API

### atom(read, write?)

创建一个 atom。

**参数：**
- `read`: 初始值或读取函数 `(get) => value`
- `write`: 可选的写入函数 `(get, set, update) => void`

**示例：**

```javascript
// 原始 atom
const nameAtom = atom('John');

// 只读派生 atom
const greetingAtom = atom((get) => `Hello, ${get(nameAtom)}!`);

// 可写派生 atom
const uppercaseNameAtom = atom(
  (get) => get(nameAtom).toUpperCase(),
  (get, set, newName) => set(nameAtom, newName.toLowerCase())
);
```

### useAtom(atom)

读取和更新 atom，类似 `useState`。

**返回值：** `[value, setValue]`

```javascript
const [count, setCount] = useAtom(countAtom);
setCount(1);
setCount(c => c + 1);  // 支持函数式更新
```

### useAtomValue(atom)

只读取 atom 的值，不订阅更新函数。

**性能优化：** 当组件只需要读取时使用。

```javascript
const count = useAtomValue(countAtom);
```

### useSetAtom(atom)

只获取更新函数，不订阅值变化。

**性能优化：** 当组件只需要更新时使用，避免不必要的重新渲染。

```javascript
const setCount = useSetAtom(countAtom);
setCount(10);
```

## 高级特性

### 1. atomFamily - 参数化 atom

创建一组相关的 atom 实例。

```javascript
const todoAtomFamily = atomFamily((id) =>
  atom({
    id,
    text: '',
    completed: false
  })
);

// 使用
const todo1Atom = todoAtomFamily(1);
const todo2Atom = todoAtomFamily(2);

const [todo1] = useAtom(todo1Atom);
const [todo2] = useAtom(todo2Atom);
```

**实现原理：**
- 使用 Map 缓存已创建的 atom
- 相同参数返回同一个 atom 实例
- 参数通过 JSON.stringify 序列化为 key

### 2. atomWithStorage - 持久化 atom

与 localStorage 同步的 atom。

```javascript
const themeAtom = atomWithStorage('theme', 'light');

const [theme, setTheme] = useAtom(themeAtom);
setTheme('dark');  // 自动保存到 localStorage
```

**实现原理：**
1. 初始化时从 localStorage 读取
2. 更新时同步写入 localStorage
3. 使用 try-catch 处理存储失败

### 3. atomWithReset - 可重置 atom

支持重置到初始值的 atom。

```javascript
const countAtom = atomWithReset(0);

const [count, setCount] = useAtom(countAtom);
setCount(10);
setCount(RESET);  // 重置为 0
```

**实现原理：**
- 使用 Symbol 作为重置标识
- 在 write 函数中检测重置信号

## 与其他状态管理库的对比

### Jotai vs Redux

| 特性 | Jotai | Redux |
|------|-------|-------|
| 学习曲线 | 低 | 高 |
| 代码量 | 少 | 多（需要 actions, reducers） |
| 性能 | 高（细粒度更新） | 中（需要手动优化） |
| 类型安全 | 自动推导 | 需要额外配置 |
| 适用场景 | 中小型项目 | 大型复杂项目 |

### Jotai vs Recoil

| 特性 | Jotai | Recoil |
|------|-------|-------|
| 包大小 | 更小 | 较大 |
| API 数量 | 少 | 多 |
| 稳定性 | 稳定 | 实验性 |
| 社区 | 成长中 | Meta 支持 |

### Jotai vs Zustand

| 特性 | Jotai | Zustand |
|------|-------|-------|
| 设计理念 | 原子化 | 单一 store |
| 依赖追踪 | 自动 | 手动 selector |
| React 依赖 | 强 | 弱（可脱离 React） |
| 使用复杂度 | 简单 | 更简单 |

## 最佳实践

### 1. Atom 粒度

**推荐：** 保持 atom 细粒度，一个 atom 只负责一个关注点。

```javascript
// ✅ 好的做法
const userNameAtom = atom('');
const userEmailAtom = atom('');
const userAgeAtom = atom(0);

// ❌ 避免
const userAtom = atom({
  name: '',
  email: '',
  age: 0
});
```

**原因：** 细粒度更新更高效，避免不必要的重新渲染。

### 2. 派生状态

**推荐：** 使用派生 atom 而不是在组件中计算。

```javascript
// ✅ 好的做法
const filteredTodosAtom = atom((get) => {
  const todos = get(todosAtom);
  const filter = get(filterAtom);
  return todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });
});

// ❌ 避免
function TodoList() {
  const [todos] = useAtom(todosAtom);
  const [filter] = useAtom(filterAtom);
  const filtered = todos.filter(...);  // 每次渲染都计算
}
```

### 3. 性能优化

**使用 useAtomValue 和 useSetAtom 分离读写：**

```javascript
// 只读组件
function Display() {
  const count = useAtomValue(countAtom);  // 不会获取 setter
  return <div>{count}</div>;
}

// 只写组件
function Controls() {
  const setCount = useSetAtom(countAtom);  // 不会订阅值变化
  return <button onClick={() => setCount(c => c + 1)}>+</button>;
}
```

### 4. 组织 Atoms

**推荐文件结构：**

```
src/
  atoms/
    userAtoms.js       # 用户相关 atoms
    todoAtoms.js       # 待办事项 atoms
    settingsAtoms.js   # 设置相关 atoms
  hooks/
    useUserData.js     # 组合多个 atoms 的自定义 hook
```

### 5. 测试

Atoms 非常容易测试：

```javascript
import { atom } from 'jotai';

test('counter atom', () => {
  const countAtom = atom(0);
  const doubleAtom = atom((get) => get(countAtom) * 2);

  // 测试读取
  expect(readAtom(countAtom)).toBe(0);
  expect(readAtom(doubleAtom)).toBe(0);

  // 测试写入
  writeAtom(countAtom, 5);
  expect(readAtom(countAtom)).toBe(5);
  expect(readAtom(doubleAtom)).toBe(10);
});
```

## 工作原理总结

1. **状态存储**：使用 WeakMap 存储所有 atom 状态
2. **依赖追踪**：读取时自动收集依赖，建立依赖图
3. **订阅机制**：组件订阅 atom，变化时触发更新
4. **更新传播**：沿依赖链传播更新，确保一致性
5. **性能优化**：细粒度更新，只重新渲染必要的组件

## 参考资源

- [Jotai 官方文档](https://jotai.org/)
- [源码仓库](https://github.com/pmndrs/jotai)
- [原理深度解析](https://blog.axlight.com/posts/how-jotai-was-born/)
