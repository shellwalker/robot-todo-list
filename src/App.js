import { useState, useEffect } from 'react';
import './App.css';

const TAGS = [
  { id: 'work', name: '工作', color: '#e3f2fd', textColor: '#1976d2' },
  { id: 'life', name: '生活', color: '#e8f5e9', textColor: '#388e3c' },
  { id: 'study', name: '学习', color: '#fff3e0', textColor: '#f57c00' },
];

function App() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('robot-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [selectedTag, setSelectedTag] = useState('work');
  const [filter, setFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  
  // 编辑状态
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
      tag: selectedTag
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
    if (editingId === id) return; // 编辑时不触发
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 删除任务
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 批量删除已完成任务
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // 开始编辑
  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  // 保存编辑
  const saveEdit = () => {
    if (!editValue.trim()) return;
    setTodos(todos.map(todo =>
      todo.id === editingId ? { ...todo, text: editValue.trim() } : todo
    ));
    setEditingId(null);
    setEditValue('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  // 编辑框回车保存
  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // 筛选任务
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active' && todo.completed) return false;
    if (filter === 'completed' && !todo.completed) return false;
    if (tagFilter !== 'all' && todo.tag !== tagFilter) return false;
    return true;
  });

  // 获取标签信息
  const getTagInfo = (tagId) => TAGS.find(t => t.id === tagId) || TAGS[0];

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
          <select 
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="tag-select"
          >
            {TAGS.map(tag => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
          <button onClick={addTodo} className="add-btn">添加</button>
        </div>

        {/* 状态筛选 */}
        <div className="filter-section">
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
            未完成
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            已完成
          </button>
        </div>

        {/* 标签筛选 */}
        <div className="tag-filter-section">
          <span className="tag-filter-label">标签筛选:</span>
          <button 
            className={`tag-filter-btn ${tagFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTagFilter('all')}
          >
            全部
          </button>
          {TAGS.map(tag => (
            <button 
              key={tag.id}
              className={`tag-filter-btn ${tagFilter === tag.id ? 'active' : ''}`}
              style={tagFilter === tag.id ? { background: tag.color, color: tag.textColor } : {}}
              onClick={() => setTagFilter(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>

        {/* 统计 */}
        <div className="stats">
          <span>总计: {totalCount}</span>
          <span>已完成: {completedCount}</span>
          {completedCount > 0 && (
            <button onClick={clearCompleted} className="clear-btn">
              清空已完成
            </button>
          )}
        </div>

        {/* 任务列表 */}
        <ul className="todo-list">
          {filteredTodos.map(todo => {
            const tagInfo = getTagInfo(todo.tag);
            const isEditing = editingId === todo.id;
            
            return (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {isEditing ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={handleEditKeyPress}
                      className="edit-input"
                      autoFocus
                    />
                    <button onClick={saveEdit} className="save-btn">保存</button>
                    <button onClick={cancelEdit} className="cancel-btn">取消</button>
                  </div>
                ) : (
                  <>
                    <span 
                      className="todo-text"
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.completed ? '✅' : '⬜'} {todo.text}
                      <span 
                        className="todo-tag"
                        style={{ background: tagInfo.color, color: tagInfo.textColor }}
                      >
                        {tagInfo.name}
                      </span>
                    </span>
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
            );
          })}
          {filteredTodos.length === 0 && (
            <li className="empty-state">
              {filter === 'all' && tagFilter === 'all' ? '暂无任务，快去添加一个吧！' : '没有匹配的任务'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
