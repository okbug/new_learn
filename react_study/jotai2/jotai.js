import { useEffect, useReducer, useRef } from 'react';

/**
 * 最小可用的 Jotai 核心实现（教学版）
 *
 * 核心概念：
 * - Atom: 最小状态单元，支持原始值和派生（read/write）形式
 * - 依赖追踪: 派生 atom 读取时自动记录依赖图
 * - 订阅机制: 状态变化后通知订阅者，驱动 React 重新渲染
 */

// 全局存储：保存每个 atom 的状态和订阅者
const atomStateMap = new WeakMap();
const atomDependentsMap = new WeakMap();

/**
 * 创建一个 Atom
 * - 如果传入的是初始值，生成可写的原始 atom
 * - 如果传入的是 read 函数，可选传入 write 以支持写入
 */
export function atom(readOrInitial, write) {
  if (typeof readOrInitial !== 'function') {
    const initialValue = readOrInitial;
    const config = {
      init: initialValue,
      read: (get) => get(config),
      write: (get, set, update) => {
        const next = typeof update === 'function' ? update(get(config)) : update;
        set(config, next);
      },
    };
    return config;
  }
  // 派生或自定义读写 atom
  const config = {
    init: null,
    read: readOrInitial,
    write: write || ((get, set) => {
      throw new Error('Cannot write to read-only atom');
    }),
  };
  return config;
}

// 获取（或初始化） atom 的内部状态对象
function getAtomState(a) {
  let state = atomStateMap.get(a);
  if (!state) {
    state = { value: a.init, listeners: new Set(), dependencies: new Set() };
    atomStateMap.set(a, state);
  }
  return state;
}

// 读取 atom 的值（派生 atom 会在读取时重算并收集依赖）
function readAtom(a) {
  const st = getAtomState(a);

  if (a.read) {
    st.dependencies.clear();
    const get = (target) => {
      // 记录依赖关系：当前 atom 依赖 target
      st.dependencies.add(target);
      let deps = atomDependentsMap.get(target);
      if (!deps) {
        deps = new Set();
        atomDependentsMap.set(target, deps);
      }
      deps.add(a);
      return readAtom(target);
    };
    st.value = a.read(get);
  }

  return st.value;
}

// 写入 atom 的值（执行 write 并通知所有订阅者与依赖者）
function writeAtom(a, update) {
  const get = (target) => readAtom(target);
  const set = (target, next) => {
    const ts = getAtomState(target);
    const value = typeof next === 'function' ? next(ts.value) : next;
    if (!Object.is(ts.value, value)) {
      ts.value = value;
      // 通知自身订阅者
      ts.listeners.forEach((l) => l());
      // 通知所有依赖于该 atom 的派生 atom 的订阅者
      const dependents = atomDependentsMap.get(target);
      if (dependents) {
        dependents.forEach((dep) => {
          const ds = getAtomState(dep);
          ds.listeners.forEach((l) => l());
        });
      }
    }
  };
  a.write(get, set, update);
}

// 订阅 atom 的变化
function subscribeAtom(a, cb) {
  const st = getAtomState(a);
  st.listeners.add(cb);
  return () => st.listeners.delete(cb);
}

/**
 * useAtom
 * - 读取并更新 atom，返回 [value, setValue]
 */
export function useAtom(a) {
  const [, force] = useReducer((c) => c + 1, 0);
  const ref = useRef();

  const value = readAtom(a);
  ref.current = value;

  useEffect(() => {
    const unsub = subscribeAtom(a, () => {
      const next = readAtom(a);
      if (!Object.is(ref.current, next)) {
        ref.current = next;
        force();
      }
    });
    return unsub;
  }, [a]);

  const setValue = (update) => writeAtom(a, update);
  return [value, setValue];
}

/**
 * useAtomValue
 * - 只读当前 atom 的值
 */
export function useAtomValue(a) {
  const [value] = useAtom(a);
  return value;
}

/**
 * useSetAtom
 * - 只写当前 atom 的值
 */
export function useSetAtom(a) {
  const [, set] = useAtom(a);
  return set;
}

/**
 * 工具：atomFamily
 * - 基于参数动态生成/复用 atom
 */
export function atomFamily(initializeAtom) {
  const cache = new Map();
  return (param) => {
    if (!cache.has(param)) cache.set(param, initializeAtom(param));
    return cache.get(param);
  };
}

/**
 * 工具：atomWithStorage
 * - 将 atom 与 localStorage 同步（教学示例）
 */
export function atomWithStorage(key, initialValue) {
  const base = atom(
    // read
    () => {
      try {
        const raw = localStorage.getItem(key);
        return raw !== null ? JSON.parse(raw) : initialValue;
      } catch {
        return initialValue;
      }
    },
    // write
    (get, set, update) => {
      const next = typeof update === 'function' ? update(get(base)) : update;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      set(base, next);
    }
  );
  return base;
}

// 工具：支持重置的 atom
export const RESET = Symbol('RESET');
export function atomWithReset(initialValue) {
  const base = atom(initialValue);
  return atom(
    (get) => get(base),
    (get, set, update) => {
      if (update === RESET) set(base, initialValue);
      else set(base, update);
    }
  );
}

// Debug 辅助：打印 atom 内部状态（教学用途）
export function debugAtom(a, label = 'Atom') {
  const st = getAtomState(a);
  console.log(`[${label}]`, {
    value: st.value,
    listeners: st.listeners.size,
    deps: st.dependencies.size,
  });
}

// 暴露内部对象（仅教学/调试用途）
export const __internal = {
  atomStateMap,
  atomDependentsMap,
  // 以下非稳定 API，请勿在生产使用
  readAtom,
  writeAtom,
  subscribeAtom,
  getAtomState,
};