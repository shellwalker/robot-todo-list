import { useState, useEffect } from 'react';
import './App.css';

// 预设主题
const THEMES = [
  {
    id: 'purple',
    name: '梦幻紫',
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 'ocean',
    name: '海洋蓝',
    bg: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
  },
  {
    id: 'sunset',
    name: '日落橙',
    bg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
  },
  {
    id: 'forest',
    name: '森林绿',
    bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
  },
  {
    id: 'dark',
    name: '暗黑模式',
    bg: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
  },
];

// 优先级配置
const PRIORITIES = [
  { id: 'low', name: '低', color: '#4caf50', icon: '⬇️' },
  { id: 'medium', name: '中', color: '#ff9800', icon: '➡️' },
  { id: 'high', name: '高', color: '#f44336', icon: '⬆️' },
];

function App() {
  // 数据结构：多个清单
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem('robot-todo-lists');
    if (saved) return JSON.parse(saved);
    // 默认创建一个"我的任务"清单
    return [
      {
        id: 'default',
        name: '我的任务',
        tasks: [],
        themeId: 'purple',
      },
    ];
  });

  const [activeListId, setActiveListId] = useState(
    () => lists[0]?.id || 'default'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');

  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  // 持久化
  useEffect(() => {
    localStorage.setItem('robot-todo-lists', JSON.stringify(lists));
  }, [lists]);

  // 筛选任务
  const filteredTasks = activeList.tasks.filter(task => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // 计算进度
  const completedCount = activeList.tasks.filter(t => t.completed).length;
  const progress =
    activeList.tasks.length > 0
      ? (completedCount / activeList.tasks.length) * 100
      : 0;

  // 添加清单
  const addList = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      tasks: [],
      themeId: 'purple',
    };
    setLists([...lists, newList]);
    setActiveListId(newList.id);
    setNewListName('');
    setShowAddList(false);
  };

  // 删除清单
  const deleteList = listId => {
    if (lists.length <= 1) return; // 至少保留一个清单
    const newLists = lists.filter(l => l.id !== listId);
    setLists(newLists);
    if (activeListId === listId) {
      setActiveListId(newLists[0].id);
    }
  };

  // 添加任务
  const addTask = (title, dueDate, priority) => {
    if (!title.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      steps: [],
      createdAt: new Date().toISOString(),
    };
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? { ...list, tasks: [...list.tasks, newTask] }
          : list
      )
    );
  };

  // 切换任务完成状态
  const toggleTask = taskId => {
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks.map(task =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : list
      )
    );
  };

  // 删除任务
  const deleteTask = taskId => {
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
          : list
      )
    );
  };

  // 切换步骤完成状态
  const toggleStep = (taskId, stepId) => {
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      steps: task.steps.map(step =>
                        step.id === stepId
                          ? { ...step, completed: !step.completed }
                          : step
                      ),
                    }
                  : task
              ),
            }
          : list
      )
    );
  };

  // 添加步骤
  const addStep = (taskId, stepTitle) => {
    if (!stepTitle.trim()) return;
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      steps: [
                        ...task.steps,
                        {
                          id: Date.now().toString(),
                          title: stepTitle.trim(),
                          completed: false,
                        },
                      ],
                    }
                  : task
              ),
            }
          : list
      )
    );
  };

  // 获取当前主题
  const currentTheme =
    THEMES.find(t => t.id === activeList.themeId) || THEMES[0];

  // 获取优先级信息
  const getPriorityInfo = priorityId =>
    PRIORITIES.find(p => p.id === priorityId) || PRIORITIES[1];

  // 格式化日期
  const formatDate = dateStr => {
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
  const isOverdue = dateStr => {
    if (!dateStr) return false;
    return (
      new Date(dateStr) < new Date() &&
      !new Date(dateStr).toDateString().includes(new Date().toDateString())
    );
  };

  return (
    <div className="App" style={{ background: currentTheme.bg }}>
      <div className="app-container">
        {/* 侧边栏 - 清单列表 */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>📝 我的清单</h2>
          </div>

          <div className="lists-container">
            {lists.map(list => (
              <div
                key={list.id}
                className={`list-item ${activeListId === list.id ? 'active' : ''}`}
                onClick={() => setActiveListId(list.id)}
              >
                <span className="list-icon">📋</span>
                <span className="list-name">{list.name}</span>
                <span className="list-count">
                  {list.tasks.filter(t => !t.completed).length}
                </span>
                {lists.length > 1 && (
                  <button
                    className="delete-list-btn"
                    onClick={e => {
                      e.stopPropagation();
                      deleteList(list.id);
                    }}
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
                onChange={e => setNewListName(e.target.value)}
                placeholder="清单名称"
                autoFocus
                onKeyPress={e => e.key === 'Enter' && addList()}
              />
              <div className="add-list-buttons">
                <button onClick={addList}>添加</button>
                <button onClick={() => setShowAddList(false)}>取消</button>
              </div>
            </div>
          ) : (
            <button
              className="add-list-btn"
              onClick={() => setShowAddList(true)}
            >
              + 新建清单
            </button>
          )}
        </aside>

        {/* 主内容区 */}
        <main className="main-content">
          {/* 头部 */}
          <header className="content-header">
            <div className="header-top">
              <h1>{activeList.name}</h1>
              <div className="theme-selector">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    className={`theme-btn ${currentTheme.id === theme.id ? 'active' : ''}`}
                    style={{
                      background: theme.bg.includes('#2c3e50')
                        ? '#555'
                        : undefined,
                    }}
                    onClick={() => {
                      setLists(
                        lists.map(l =>
                          l.id === activeListId
                            ? { ...l, themeId: theme.id }
                            : l
                        )
                      );
                    }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            {/* 进度条 */}
            {activeList.tasks.length > 0 && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="progress-text">
                  {completedCount}/{activeList.tasks.length} 已完成
                </span>
              </div>
            )}

            {/* 搜索 */}
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 搜索任务..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          {/* 任务列表 */}
          <div className="tasks-container">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                {searchQuery
                  ? '没有找到匹配的任务'
                  : '暂无任务，点击下方添加任务'}
              </div>
            ) : (
              filteredTasks.map(task => {
                const priorityInfo = getPriorityInfo(task.priority);
                const completedSteps =
                  task.steps?.filter(s => s.completed).length || 0;
                const totalSteps = task.steps?.length || 0;

                return (
                  <div
                    key={task.id}
                    className={`task-card ${task.completed ? 'completed' : ''}`}
                  >
                    <div className="task-header">
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span className="checkmark"></span>
                      </label>

                      <div className="task-content">
                        <span className="task-title">{task.title}</span>
                        <div className="task-meta">
                          {task.dueDate && (
                            <span
                              className={`due-date ${isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}`}
                            >
                              📅 {formatDate(task.dueDate)}
                            </span>
                          )}
                          <span
                            className="priority-badge"
                            style={{ color: priorityInfo.color }}
                          >
                            {priorityInfo.icon} {priorityInfo.name}
                          </span>
                          {totalSteps > 0 && (
                            <span className="steps-count">
                              ✓ {completedSteps}/{totalSteps}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                      >
                        🗑️
                      </button>
                    </div>

                    {/* 步骤列表 */}
                    {task.steps && task.steps.length > 0 && (
                      <div className="steps-container">
                        {task.steps.map(step => (
                          <label key={step.id} className="step-item">
                            <input
                              type="checkbox"
                              checked={step.completed}
                              onChange={() => toggleStep(task.id, step.id)}
                            />
                            <span className={step.completed ? 'completed' : ''}>
                              {step.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* 添加步骤 */}
                    <AddStepForm
                      onAdd={stepTitle => addStep(task.id, stepTitle)}
                    />
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

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title, dueDate, priority);
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
          onChange={e => setTitle(e.target.value)}
          placeholder="添加任务..."
          onKeyPress={e => e.key === 'Enter' && handleSubmit()}
        />
      </div>
      <div className="add-task-options">
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="date-input"
        />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          {PRIORITIES.map(p => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.name}
            </option>
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

  const handleAdd = () => {
    if (!stepTitle.trim()) return;
    onAdd(stepTitle);
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
        onChange={e => setStepTitle(e.target.value)}
        placeholder="步骤标题..."
        autoFocus
        onKeyPress={e => e.key === 'Enter' && handleAdd()}
      />
      <div className="add-step-buttons">
        <button onClick={handleAdd}>添加</button>
        <button onClick={() => setShowInput(false)}>取消</button>
      </div>
    </div>
  );
}

export default App;
