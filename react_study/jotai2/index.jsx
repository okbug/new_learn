import React from 'react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span>Count: {count}</span>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      <button onClick={() => setCount((c) => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

function DoubleDisplay() {
  const double = useAtomValue(doubleAtom);
  return <div>Double: {double}</div>;
}

function Controls() {
  const setCount = useSetAtom(countAtom);
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={() => setCount((c) => c + 10)}>+10</button>
      <button onClick={() => setCount((c) => c - 10)}>-10</button>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Jotai 示例（计数器）</h2>
      <DoubleDisplay />
      <Counter />
      <Controls />
    </div>
  );
}