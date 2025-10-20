# Jotai 原理与教学实现（jotai2）

Jotai 是一个“原子化”的 React 状态管理库：将应用状态拆分成一个个最小单位（atom），通过依赖追踪与订阅机制精确更新用到这些状态的组件。这里的 `jotai2/jotai.js` 是一个最小可用的教学实现，帮助你理解其核心思想。

## 核心概念
- Atom：最小状态单元，可以是原始值，也可以是派生（读/写）函数。
- 读（read）：派生 atom 如何从其他 atom 中计算当前值。
- 写（write）：可写 atom 如何更新自身或其他 atom 的值。
- 依赖追踪：派生 atom 在读取时自动记录依赖关系形成依赖图。
- 订阅与通知：当某个 atom 的值变化时，通知其订阅者和依赖它的派生 atom 的订阅者。

## 数据流与更新流程
1. 创建 atom：
   - 原始 atom：`atom(0)`，内部有 `init` 初始值，默认支持写入。
   - 派生 atom：`atom((get) => get(countAtom) * 2)`，读取时计算。
   - 可写派生 atom：`atom(read, write)`，在 `write(get, set, update)` 中自定义写入逻辑。
2. 读取值：
   - `useAtomValue(atom)` 或 `useAtom(atom)[0]` 调用 `readAtom`。
   - 对派生 atom：在 `read` 中调用 `get(otherAtom)` 进行读取并收集依赖。
3. 更新值：
   - `useAtom(atom)[1](update)` 或 `useSetAtom(atom)(update)` 调用 `writeAtom`。
   - 执行 `write(get, set, update)` 并使用 `set(targetAtom, next)` 写入目标 atom。
   - 通知目标 atom 的订阅者和依赖于它的派生 atom 的订阅者重新渲染。

## 教学实现中的关键结构
- `atomStateMap: WeakMap<atom, { value, listeners, dependencies }>`
  - 保存每个 atom 的当前值、订阅者集合、依赖集合。
- `atomDependentsMap: WeakMap<atom, Set<atom>>`
  - 保存依赖于某个 atom 的派生 atom 列表，用于变更时通知。
- `readAtom(atom)`：派生时重算并收集依赖；原子时直接返回当前值。
- `writeAtom(atom, update)`：执行写入并通知所有订阅者与依赖者。
- `subscribeAtom(atom, callback)`：订阅变更，返回取消订阅函数。

## 基础 API
- `atom(readOrInitial, write?)`：创建原始或派生 atom。
- `useAtom(atom)`：读取并写入 atom 值，返回 `[value, setValue]`。
- `useAtomValue(atom)`：只读当前值。
- `useSetAtom(atom)`：只写当前值。

## 辅助工具
- `atomFamily(initializeAtom)`：基于参数懒创建并复用 atom。
- `atomWithStorage(key, initialValue)`：将 atom 与 `localStorage` 同步。
- `atomWithReset(initialValue)`：支持通过 `RESET` 重置初始值。
- `debugAtom(atom, label)`：打印内部调试信息（教学用途）。

## 使用示例
```jsx
import React from 'react';
import { atom, useAtom, useAtomValue, useSetAtom } from './jotai';

const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div>
      <span>Count: {count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
    </div>
  );
}

function DoubleDisplay() {
  const double = useAtomValue(doubleAtom);
  return <div>Double: {double}</div>;
}

function Controls() {
  const setCount = useSetAtom(countAtom);
  return <button onClick={() => setCount((c) => c + 10)}>+10</button>;
}
```

## 设计权衡（教学版）
- 为了易读，派生 atom 在每次读取时重算，并在读取时进行依赖收集；真实 Jotai 在缓存、失效处理和细粒度通知上更复杂与高效。
- 订阅策略在此实现中较为直接：更新后通知自身监听者与依赖者监听者；实际实现考虑更多边界和批量处理。
- 这里用 `WeakMap` 存放内部状态，避免内存泄漏；真实实现还包含挂起、异步等高级特性支持。

## 与其他方案的对比
- 相比 Redux：Jotai 更细粒度，无需全局 reducer 与 action；按需更新组件。
- 相比 Zustand：Jotai 强调依赖图与派生；Zustand 强调外部 store 与 selector。
- 相比 Recoil：理念接近，Jotai 更轻量，API 简洁。

## 适用场景
- 组件间共享的局部状态、跨页面轻量共享。
- 需要派生逻辑的状态（例如计算值、组合值）。
- 希望避免“全局单一 store”的复杂度，按需拆分状态。

## 结语
本教学实现旨在帮助你掌握 Jotai 的核心思想和数据流。生产环境请使用官方库 `jotai`，这里的实现可作为理解和实验的基础。