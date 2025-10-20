import { useEffect, useReducer, useRef } from 'react';

/**
 * Jotai 核心实现
 *
 * Jotai 是一个原子化的状态管理库，基于以下核心概念：
 * 1. Atom: 最小的状态单元
 * 2. 依赖追踪: 自动追踪 atom 之间的依赖关系
 * 3. 订阅机制: 当 atom 变化时通知所有订阅者
 */

// 全局存储：保存所有 atom 的状态和订阅者
const atomStateMap = new WeakMap();
const atomDependentsMap = new WeakMap();

/**
 * 创建一个 Atom
 *
 * @param {any} initialValue - 初始值或读取函数
 * @param {Function} writeFunction - 可选的写入函数
 * @returns {Object} atom 对象
 *
 * 用法:
 * const countAtom = atom(0)
 * const doubleAtom = atom((get) => get(countAtom) * 2)
 * const readWriteAtom = atom(
 *   (get) => get(countAtom),
 *   (get, set, newValue) => set(countAtom, newValue * 2)
 * )
 */
export function atom(read, write) {
  // 如果 read 不是函数，创建一个简单的原始 atom
  if (typeof read !== 'function') {
    const initialValue = read;
    const config = {
      init: initialValue,
      read: (get) => get(config),
      write: (get, set, update) => {
        const nextValue = typeof update === 'function'
          ? update(get(config))
          : update;
        set(config, nextValue);
      }
    };
    return config;
  }

  // 派生 atom 或自定义读写 atom
  const config = {
    init: null,
    read,
    write: write || ((get, set, update) => {
      throw new Error('Cannot write to read-only atom');
    })
  };

  return config;
}

/**
 * 获取 atom 的状态
 */
function getAtomState(atom) {
  let atomState = atomStateMap.get(atom);
  if (!atomState) {
    atomState = {
      value: atom.init,
      listeners: new Set(),
      dependencies: new Set()
    };
    atomStateMap.set(atom, atomState);
  }
  return atomState;
}

/**
 * 获取 atom 的值
 *
 * @param {Object} atom - atom 对象
 * @returns {any} atom 的当前值
 */
function readAtom(atom) {
  const atomState = getAtomState(atom);

  // 如果是派生 atom，需要重新计算
  if (atom.read) {
    // 清除旧的依赖
    atomState.dependencies.clear();

    // 读取时收集依赖
    const get = (targetAtom) => {
      // 记录依赖关系
      atomState.dependencies.add(targetAtom);

      // 将当前 atom 添加到目标 atom 的依赖者列表中
      let dependents = atomDependentsMap.get(targetAtom);
      if (!dependents) {
        dependents = new Set();
        atomDependentsMap.set(targetAtom, dependents);
      }
      dependents.add(atom);

      return readAtom(targetAtom);
    };

    atomState.value = atom.read(get);
  }

  return atomState.value;
}

/**
 * 设置 atom 的值
 *
 * @param {Object} atom - atom 对象
 * @param {any} value - 新值
 */
function writeAtom(atom, value) {
  const atomState = getAtomState(atom);

  const get = (targetAtom) => readAtom(targetAtom);
  const set = (targetAtom, nextValue) => {
    const targetState = getAtomState(targetAtom);
    targetState.value = nextValue;

    // 通知所有监听器
    targetState.listeners.forEach(listener => listener());

    // 通知所有依赖于此 atom 的派生 atom
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

/**
 * 订阅 atom 的变化
 *
 * @param {Object} atom - atom 对象
 * @param {Function} callback - 变化时的回调函数
 * @returns {Function} 取消订阅的函数
 */
function subscribeAtom(atom, callback) {
  const atomState = getAtomState(atom);
  atomState.listeners.add(callback);

  return () => {
    atomState.listeners.delete(callback);
  };
}

/**
 * useAtom Hook
 *
 * 读取和更新 atom 的值，类似于 useState
 *
 * @param {Object} atom - atom 对象
 * @returns {Array} [value, setValue]
 *
 * 用法:
 * const [count, setCount] = useAtom(countAtom)
 */
export function useAtom(atom) {
  const [, forceUpdate] = useReducer(c => c + 1, 0);
  const valueRef = useRef();

  // 读取 atom 的值
  const value = readAtom(atom);
  valueRef.current = value;

  // 订阅 atom 的变化
  useEffect(() => {
    const unsubscribe = subscribeAtom(atom, () => {
      const newValue = readAtom(atom);
      // 只有值真正改变时才触发重新渲染
      if (!Object.is(valueRef.current, newValue)) {
        valueRef.current = newValue;
        forceUpdate();
      }
    });

    return unsubscribe;
  }, [atom]);

  // 设置 atom 的值
  const setValue = (update) => {
    writeAtom(atom, update);
  };

  return [value, setValue];
}

/**
 * useAtomValue Hook
 *
 * 只读取 atom 的值，不提供更新函数
 * 性能优化：当组件只需要读取值时使用
 *
 * @param {Object} atom - atom 对象
 * @returns {any} atom 的当前值
 *
 * 用法:
 * const count = useAtomValue(countAtom)
 */
export function useAtomValue(atom) {
  const [value] = useAtom(atom);
  return value;
}

/**
 * useSetAtom Hook
 *
 * 只获取更新函数，不订阅值的变化
 * 性能优化：当组件只需要更新值时使用，避免不必要的重新渲染
 *
 * @param {Object} atom - atom 对象
 * @returns {Function} 更新函数
 *
 * 用法:
 * const setCount = useSetAtom(countAtom)
 */
export function useSetAtom(atom) {
  const setValueRef = useRef();

  if (!setValueRef.current) {
    setValueRef.current = (update) => {
      writeAtom(atom, update);
    };
  }

  return setValueRef.current;
}

/**
 * atomFamily - 创建参数化的 atom
 *
 * 用于创建一组相关的 atom，每个参数对应一个 atom 实例
 *
 * @param {Function} initializeAtom - 初始化函数
 * @returns {Function} 参数化的 atom 创建函数
 *
 * 用法:
 * const todoAtomFamily = atomFamily((id) => atom({ id, text: '', done: false }))
 * const todo1Atom = todoAtomFamily(1)
 * const todo2Atom = todoAtomFamily(2)
 */
export function atomFamily(initializeAtom) {
  const cache = new Map();

  return (param) => {
    const key = JSON.stringify(param);
    if (!cache.has(key)) {
      cache.set(key, initializeAtom(param));
    }
    return cache.get(key);
  };
}

/**
 * atomWithStorage - 带持久化的 atom
 *
 * 创建一个与 localStorage 同步的 atom
 *
 * @param {string} key - localStorage 的 key
 * @param {any} initialValue - 初始值
 * @returns {Object} atom 对象
 *
 * 用法:
 * const themeAtom = atomWithStorage('theme', 'light')
 */
export function atomWithStorage(key, initialValue) {
  // 从 localStorage 读取初始值
  const getInitialValue = () => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const baseAtom = atom(getInitialValue());

  return atom(
    (get) => get(baseAtom),
    (get, set, update) => {
      const nextValue = typeof update === 'function'
        ? update(get(baseAtom))
        : update;

      set(baseAtom, nextValue);

      // 保存到 localStorage
      try {
        localStorage.setItem(key, JSON.stringify(nextValue));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }
  );
}

/**
 * atomWithReset - 可重置的 atom
 *
 * 创建一个可以重置到初始值的 atom
 *
 * @param {any} initialValue - 初始值
 * @returns {Object} atom 对象
 *
 * 用法:
 * const countAtom = atomWithReset(0)
 * const [count, setCount] = useAtom(countAtom)
 * setCount(RESET) // 重置到初始值
 */
export const RESET = Symbol('RESET');

export function atomWithReset(initialValue) {
  return atom(
    initialValue,
    (get, set, update) => {
      if (update === RESET) {
        set(RESET, initialValue);
      } else {
        set(RESET, typeof update === 'function'
          ? update(get(RESET))
          : update
        );
      }
    }
  );
}

/**
 * 调试工具：打印 atom 的状态
 */
export function debugAtom(atom, label = 'Atom') {
  const state = atomStateMap.get(atom);
  console.log(`[${label}]`, {
    value: state?.value,
    listeners: state?.listeners.size,
    dependencies: state?.dependencies.size
  });
}

// 导出工具函数（用于测试和调试）
export const __internal = {
  atomStateMap,
  atomDependentsMap,
  readAtom,
  writeAtom,
  subscribeAtom,
  getAtomState
};
