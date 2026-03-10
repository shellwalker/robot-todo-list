import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('robot-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // 持久化到 localStorage
  useEffect(() => {
    localStorage.setItem('robot-todos', JSON.stringify(todos));
  }, [todos]);

  // 添加任务
  const addTodo = () => {
    if (!inputValue.trim()) return;
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      priority: priority,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString()
    };
    setTodos([...todos, newTodo]);
    setInputValue('');
    setPriority('medium');
    setDueDate('');
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

  // 开始编辑
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  // 保存编辑
  const saveEdit = (id) => {
    if (!editValue.trim()) return;
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editValue.trim() } : todo
    ));
    setEditingId(null);
    setEditValue('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // 切换优先级
  const togglePriority = (id) => {
    const priorities = ['low', 'medium', 'high'];
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const currentIndex = priorities.indexOf(todo.priority || 'medium');
        const nextIndex = (currentIndex + 1) % priorities.length;
        return { ...todo, priority: priorities[nextIndex] };
      }
      return todo;
    }));
  };

  // 优先级显示
  const getPriorityLabel = (p) => {
    const labels = { high: '🔴 高', medium: '🟡 中', low: '🟢 低' };
    return labels[p] || labels.medium;
  };

  // 筛选和搜索
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && !todo.completed;
    if (filter === 'completed') return matchesSearch && todo.completed;
    return matchesSearch;
  }).sort((a, b) => {
    // 按优先级排序：高 > 中 > 低
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
  });

  // 统计
  const totalCount = todos.length;
  const completedCount = todos.filter(todo => todo.completed).length;

  // 检查截止日期
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

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
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
            className="priority-select"
          >
            <option value="low">🟢 低</option>
            <option value="medium">🟡 中</option>
            <option value="high">🔴 高</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="date-input"
          />
          <button onClick={addTodo} className="add-btn">添加</button>
        </div>

        {/* 搜索和筛选 */}
        <div className="filter-section">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 搜索任务..."
            className="search-input"
          />
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              全部
            </button>
            <button 
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              进行中
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              已完成
            </button>
          </div>
        </div>

        {/* 统计 */}
        <div className="stats">
          <span>总计: {totalCount}</span>
          <span>已完成: {completedCount}</span>
        </div>

        {/* 任务列表 */}
        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              {editingId === todo.id ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                    className="edit-input"
                    autoFocus
                  />
                  <button onClick={() => saveEdit(todo.id)} className="save-btn">💾</button>
                  <button onClick={cancelEdit} className="cancel-btn">❌</button>
                </div>
              ) : (
                <>
                  <div className="todo-main" onClick={() => toggleTodo(todo.id)}>
                    <span className="todo-text">
                      {todo.completed ? '✅' : '⬜'} {todo.text}
                    </span>
                    <div className="todo-meta">
                      <span 
                        className="priority-badge"
                        onClick={(e) => { e.stopPropagation(); togglePriority(todo.id); }}
                        title="点击切换优先级"
                      >
                        {getPriorityLabel(todo.priority)}
                      </span>
                      {todo.dueDate && (
                        <span className={`due-date ${isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : ''}`}>
                          📅 {todo.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="todo-actions">
                    <button 
                      onClick={() => startEdit(todo)}
                      className="edit-btn"
                      title="编辑"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => deleteTodo(todo.id)}
                      className="delete-btn"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
          {filteredTodos.length === 0 && (
            <li className="empty-state">
              {searchTerm || filter !== 'all' ? '没有匹配的任务' : '暂无任务，快去添加一个吧！'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
