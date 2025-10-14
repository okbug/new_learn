const createStore = (createState) => {
  let state;
  const listeners = new Set();

  const setState = (newState, replace = false) => {
    const nextState =
      typeof newState === "function" ? newState(state) : newState;
    if (Object.is(nextState, state)) {
      return;
    }
    const prevState = state;

    // 是否为替换，不是替换并且为对象就Object.assign合并
    // 其实这里如果state是数组的话也有问题，但是store的state一般也不会都是数组，所以问题应该也不大？
    if (!replace) {
      state =
        typeof nextState !== "object" || nextState === null
          ? nextState
          : Object.assign({}, state, nextState);
    } else {
      state = nextState;
    }
    // 修改完数据应该触发监听器了
    listeners.forEach((l) => l(state, prevState));
  };

  const getState = () => state;

  const subscribe = (l) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };

  const destory = () => {
    listeners.clear();
  };
  const api = {
    setState,
    getState,
    subscribe,
    destory,
  };

  // 初始化state
  state = createState(setState, getState, api);

  return api;
};

/** 这个hooks在React中使用 */
function useStore(api, selector) {
  const [_, forceUpdate] = useState(0);
  useEffect(() => {
    // 这里return了 可以unsubscribe了
    return api.subscribe((state, prevState) => {
      // 其实selector一般也会返回一个新对象
      //   (state) => ({ count: state.count });
      // 如果是这种用法，都会触发更新了
      const newObj = selector(state);
      const oldObj = selector(prevState);

      if (newObj !== oldObj) {
        forceUpdate(Math.random());
      }
    });
  }, []);
  return selector(api.getState());
}
/** useSyncExternalStore version */
function useStore(api, selector) {
  function getState() {
    return selector(api.getState());
  }

  return useSyncExternalStore(api.subscribe, getState);
}

function create(createState) {
  const api = createStore(createState);
  const useBoundStore = (selector) => useStore(api, selector);

  Object.assign(useBoundStore, api);
  return useBoundStore;
}

// =======================================
// useSyncExternalStore Example:
// =======================================
let nextId = 0;
let todos = [{ id: nextId++, text: "Todo #1" }];
let listeners = [];

const todosStore = {
  addTodo() {
    todos = [...todos, { id: nextId++, text: "Todo #" + nextId }];
    emitChange();
  },
  subscribe(listener) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return todos;
  },
};

/** 这里将会触发React的更新 */
function emitChange() {
  for (let listener of listeners) {
    listener();
  }
}

export function App() {
  // todos = getSnapshot()
  // addTodo的时候会触发listeners执行 会触发渲染
  const todos = useSyncExternalStore(
    todosStore.subscribe,
    todosStore.getSnapshot
  );
  return (
    <div>
      {todos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      <button onClick={todosStore.addTodo}>add</button>
    </div>
  );
}
