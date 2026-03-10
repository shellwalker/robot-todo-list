import { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');

  // 添加任务
  const addTodo = () => {
    if (!inputValue.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false
    };
    setTodos([...todos, newTodo]);
    setInputValue('');
  };

  // 回车添加任务
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  // 切换完成状态
  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 删除任务
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 统计
  const totalCount = todos.length;
  const completedCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="App">
      <div className="todo-container">
        <h1>🤖 Robot Todo List</h1>
        
        {/* 输入区域 */}
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="添加新任务..."
            className="todo-input"
          />
          <button onClick={addTodo} className="add-btn">添加</button>
        </div>

        {/* 统计 */}
        <div className="stats">
          <span>总计: {totalCount}</span>
          <span>已完成: {completedCount}</span>
        </div>

        {/* 任务列表 */}
        <ul className="todo-list">
          {todos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <span 
                className="todo-text"
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed ? '✅' : '⬜'} {todo.text}
              </span>
              <button 
                onClick={() => deleteTodo(todo.id)}
                className="delete-btn"
              >
                🗑️
              </button>
            </li>
          ))}
          {todos.length === 0 && (
            <li className="empty-state">暂无任务，快去添加一个吧！</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
