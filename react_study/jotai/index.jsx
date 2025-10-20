import React from 'react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';

// 1. 基础 atom - 简单的计数器
const countAtom = atom(0);

// 2. 派生 atom - 基于其他 atom 计算得出
const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 3. 对象类型的 atom - 用户信息
const userAtom = atom({
  name: 'Guest',
  email: '',
  isLoggedIn: false
});

// 4. 可写的派生 atom - 带有自定义读写逻辑
const todoListAtom = atom([]);
const todoStatsAtom = atom(
  (get) => {
    const todos = get(todoListAtom);
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      active: todos.filter(t => !t.completed).length
    };
  }
);

// 计数器组件 - 演示基础用法
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const doubleCount = useAtomValue(doubleCountAtom);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
      <h3>计数器示例</h3>
      <p>当前计数: {count}</p>
      <p>双倍计数 (派生值): {doubleCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
      <button onClick={() => setCount(count - 1)} style={{ marginLeft: '10px' }}>减少</button>
      <button onClick={() => setCount(0)} style={{ marginLeft: '10px' }}>重置</button>
    </div>
  );
}

// 用户信息组件 - 演示对象状态管理
function UserProfile() {
  const [user, setUser] = useAtom(userAtom);

  const handleLogin = () => {
    setUser({
      name: 'John Doe',
      email: 'john@example.com',
      isLoggedIn: true
    });
  };

  const handleLogout = () => {
    setUser({
      name: 'Guest',
      email: '',
      isLoggedIn: false
    });
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
      <h3>用户信息示例</h3>
      <p>用户名: {user.name}</p>
      <p>邮箱: {user.email || '未登录'}</p>
      <p>状态: {user.isLoggedIn ? '已登录' : '未登录'}</p>
      {!user.isLoggedIn ? (
        <button onClick={handleLogin}>登录</button>
      ) : (
        <button onClick={handleLogout}>登出</button>
      )}
    </div>
  );
}

// 待办事项组件 - 演示列表管理
function TodoList() {
  const [todos, setTodos] = useAtom(todoListAtom);
  const stats = useAtomValue(todoStatsAtom);
  const [inputValue, setInputValue] = React.useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: inputValue,
          completed: false
        }
      ]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginBottom: '20px' }}>
      <h3>待办事项示例</h3>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="输入待办事项"
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button onClick={addTodo}>添加</button>
      </div>

      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        总计: {stats.total} | 已完成: {stats.completed} | 未完成: {stats.active}
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                marginLeft: '10px',
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#999' : '#000'
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              style={{ marginLeft: '10px', color: 'red' }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// 只读组件 - 演示 useAtomValue 的使用
function CounterDisplay() {
  const count = useAtomValue(countAtom);

  return (
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
      <small>只读显示 (useAtomValue): 当前计数是 {count}</small>
    </div>
  );
}

// 只写组件 - 演示 useSetAtom 的使用
function CounterControls() {
  const setCount = useSetAtom(countAtom);

  return (
    <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
      <small>只写控制 (useSetAtom): </small>
      <button onClick={() => setCount(c => c + 10)}>+10</button>
    </div>
  );
}

// 主应用组件
function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Jotai 状态管理示例</h1>

      <CounterDisplay />
      <CounterControls />
      <Counter />
      <UserProfile />
      <TodoList />

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e8f5e9' }}>
        <h4>Jotai 核心概念:</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>atom</strong>: 创建状态单元，可以是原始值、对象或派生值</li>
          <li><strong>useAtom</strong>: 读取和更新 atom (类似 useState)</li>
          <li><strong>useAtomValue</strong>: 只读取 atom 的值</li>
          <li><strong>useSetAtom</strong>: 只获取更新函数，不订阅值变化</li>
          <li><strong>派生 atom</strong>: 基于其他 atom 计算得出的值</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
