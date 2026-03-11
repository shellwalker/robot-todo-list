import { useState } from 'react';
import './App.css';
import useSupabase from './hooks/useSupabase';

// 预设主题
const THEMES = [
  { id: 'purple', name: '梦幻紫', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'ocean', name: '海洋蓝', bg: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'sunset', name: '日落橙', bg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
  { id: 'forest', name: '森林绿', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'dark', name: '暗黑模式', bg: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)' },
];

// 优先级配置
const PRIORITIES = [
  { id: 'low', name: '低', color: '#4caf50', icon: '⬇️' },
  { id: 'medium', name: '中', color: '#ff9800', icon: '➡️' },
  { id: 'high', name: '高', color: '#f44336', icon: '⬆️' },
];

function App() {
  // 使用 Supabase Hook
  const {
    lists,
    activeListId,
    setActiveListId,
    activeList,
    activeTasks,
    loading,
    error,
    addList,
    deleteList,
    updateListTheme,
    addTask,
    toggleTask,
    deleteTask,
    addStep,
    toggleStep,
  } = useSupabase();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');

  // 获取当前主题
  const currentTheme = THEMES.find(t => t.id === (activeList?.theme_id || 'purple')) || THEMES[0];

  // 筛选任务
  const filteredTasks = (activeTasks || []).filter(task => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // 计算进度
  const completedCount = (activeTasks || []).filter(t => t.completed).length;
  const progress = (activeTasks || []).length > 0 
    ? (completedCount / (activeTasks || []).length) * 100 
    : 0;

  // 获取优先级信息
  const getPriorityInfo = (priorityId) => PRIORITIES.find(p => p.id === priorityId) || PRIORITIES[1];

  // 格式化日期
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return '今天';
    if (date.toDateString() === tomorrow.toDateString()) return '明天';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  // 检查是否逾期
  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date() && !new Date(dateStr).toDateString().includes(new Date().toDateString());
  };

  // 处理添加清单
  const handleAddList = async () => {
    if (!newListName.trim()) return;
    await addList(newListName.trim());
    setNewListName('');
    setShowAddList(false);
  };

  // 处理删除清单
  const handleDeleteList = async (listId) => {
    if (lists.length <= 1) return;
    await deleteList(listId);
  };

  // 加载状态
  if (loading) {
    return (
      <div className="App" style={{ background: THEMES[0].bg }}>
        <div className="loading-screen">
          <div className="loading-spinner">📋</div>
          <p>正在加载数据...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="App" style={{ background: THEMES[0].bg }}>
        <div className="error-screen">
          <p>⚠️ 加载数据失败</p>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={{ background: currentTheme.bg }}>
      <div className="app-container">
        {/* 侧边栏 - 清单列表 */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>📝 我的清单</h2>
          </div>

          <div className="lists-container">
            {(lists || []).map(list => (
              <div
                key={list.id}
                className={`list-item ${activeListId === list.id ? 'active' : ''}`}
                onClick={() => setActiveListId(list.id)}
              >
                <span className="list-icon">📋</span>
                <span className="list-name">{list.name}</span>
                <span className="list-count">{(list.tasks || []).filter(t => !t.completed).length}</span>
                {lists.length > 1 && (
                  <button
                    className="delete-list-btn"
                    onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {showAddList ? (
            <div className="add-list-form">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="清单名称"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
              />
              <div className="add-list-buttons">
                <button onClick={handleAddList}>添加</button>
                <button onClick={() => setShowAddList(false)}>取消</button>
              </div>
            </div>
          ) : (
            <button className="add-list-btn" onClick={() => setShowAddList(true)}>
              + 新建清单
            </button>
          )}
        </aside>

        {/* 主内容区 */}
        <main className="main-content">
          {/* 头部 */}
          <header className="content-header">
            <div className="header-top">
              <h1>{activeList?.name || '我的任务'}</h1>
              <div className="theme-selector">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    className={`theme-btn ${currentTheme.id === theme.id ? 'active' : ''}`}
                    style={{ background: theme.bg.includes('#2c3e50') ? '#555' : undefined }}
                    onClick={() => activeList && updateListTheme(activeList.id, theme.id)}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            {/* 进度条 */}
            {(activeTasks || []).length > 0 && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-text">{completedCount}/{(activeTasks || []).length} 已完成</span>
              </div>
            )}

            {/* 搜索 */}
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 搜索任务..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          {/* 任务列表 */}
          <div className="tasks-container">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                {searchQuery ? '没有找到匹配的任务' : '暂无任务，点击下方添加任务'}
              </div>
            ) : (
              filteredTasks.map(task => {
                const priorityInfo = getPriorityInfo(task.priority);
                const completedSteps = task.steps?.filter(s => s.completed).length || 0;
                const totalSteps = task.steps?.length || 0;

                return (
                  <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                    <div className="task-header">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={task.completed || false}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span className="checkmark"></span>
                      </label>

                      <div className="task-content">
                        <span className="task-title">{task.title}</span>
                        <div className="task-meta">
                          {task.due_date && (
                            <span className={`due-date ${isOverdue(task.due_date) && !task.completed ? 'overdue' : ''}`}>
                              📅 {formatDate(task.due_date)}
                            </span>
                          )}
                          <span className="priority-badge" style={{ color: priorityInfo.color }}>
                            {priorityInfo.icon} {priorityInfo.name}
                          </span>
                          {totalSteps > 0 && (
                            <span className="steps-count">
                              ✓ {completedSteps}/{totalSteps}
                            </span>
                          )}
                        </div>
                      </div>

                      <button className="delete-btn" onClick={() => deleteTask(task.id)}>🗑️</button>
                    </div>

                    {/* 步骤列表 */}
                    {task.steps && task.steps.length > 0 && (
                      <div className="steps-container">
                        {task.steps.map(step => (
                          <label key={step.id} className="step-item">
                            <input
                              type="checkbox"
                              checked={step.completed || false}
                              onChange={() => toggleStep(task.id, step.id)}
                            />
                            <span className={step.completed ? 'completed' : ''}>{step.title}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* 添加步骤 */}
                    <AddStepForm onAdd={(stepTitle) => addStep(task.id, stepTitle)} />
                  </div>
                );
              })
            )}
          </div>

          {/* 添加任务 */}
          <AddTaskForm onAdd={addTask} />
        </main>
      </div>
    </div>
  );
}

// 添加任务表单组件
function AddTaskForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await onAdd(title, dueDate, priority);
    setTitle('');
    setDueDate('');
    setPriority('medium');
  };

  return (
    <div className="add-task-form">
      <div className="add-task-input">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="添加任务..."
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <div className="add-task-options">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="date-input"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {PRIORITIES.map(p => (
            <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
          ))}
        </select>
        <button onClick={handleSubmit}>添加</button>
      </div>
    </div>
  );
}

// 添加步骤表单组件
function AddStepForm({ onAdd }) {
  const [showInput, setShowInput] = useState(false);
  const [stepTitle, setStepTitle] = useState('');

  const handleAdd = async () => {
    if (!stepTitle.trim()) return;
    await onAdd(stepTitle);
    setStepTitle('');
    setShowInput(false);
  };

  if (!showInput) {
    return (
      <button className="add-step-btn" onClick={() => setShowInput(true)}>
        + 添加步骤
      </button>
    );
  }

  return (
    <div className="add-step-form">
      <input
        type="text"
        value={stepTitle}
        onChange={(e) => setStepTitle(e.target.value)}
        placeholder="步骤标题..."
        autoFocus
        onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
      />
      <div className="add-step-buttons">
        <button onClick={handleAdd}>添加</button>
        <button onClick={() => setShowInput(false)}>取消</button>
      </div>
    </div>
  );
}

export default App;
