// complexStore.ts
type Listener = () => void;

function createStore() {
  let state = { count: 0, text: "hello" };
  const listeners = new Set<Listener>();
  const setState = (patch: Partial<typeof state>) => {
    const next = { ...state, ...patch };
    // 简单浅比较，避免无效通知
    if (JSON.stringify(next) === JSON.stringify(state)) return;
    state = next;
    listeners.forEach((l) => l());
  };
  return {
    getSnapshot: () => state,
    subscribe: (l: Listener) => (listeners.add(l), () => listeners.delete(l)),
    setState,
  };
}

export const store = createStore();
