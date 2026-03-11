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
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('robot-todo-tags');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'work', name: '工作', color: '#e74c3c' },
      { id: 'personal', name: '个人', color: '#3498db' },
      { id: 'important', name: '重要', color: '#f39c12' },
    ];
  });
  const [selectedTag, setSelectedTag] = useState(null);

  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  // 持久化
  useEffect(() => {
    localStorage.setItem('robot-todo-lists', JSON.stringify(lists));
  }, [lists]);

  // 持久化标签
  useEffect(() => {
    localStorage.setItem('robot-todo-tags', JSON.stringify(tags));
  }, [tags]);

  // 添加标签
  const addTag = (name, color) => {
    const newTag = {
      id: Date.now().toString(),
      name,
      color,
    };
    setTags([...tags, newTag]);
  };

  // 删除标签
  const deleteTag = tagId => {
    setTags(tags.filter(t => t.id !== tagId));
    // 从所有任务中移除该标签
    setLists(
      lists.map(list => ({
        ...list,
        tasks: list.tasks.map(task => ({
          ...task,
          tags: task.tags?.filter(t => t !== tagId) || [],
        })),
      }))
    );
    if (selectedTag === tagId) {
      setSelectedTag(null);
    }
  };

  // 为任务添加/移除标签
  const toggleTaskTag = (taskId, tagId) => {
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks.map(task =>
                task.id === taskId
                  ? {
                      ...task,
                      tags: task.tags?.includes(tagId)
                        ? task.tags.filter(t => t !== tagId)
                        : [...(task.tags || []), tagId],
                    }
                  : task
              ),
            }
          : list
      )
    );
  };

  // 筛选任务
  const filteredTasks = activeList.tasks.filter(task => {
    if (searchQuery) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // 按标签筛选
    if (selectedTag) {
      return task.tags?.includes(selectedTag);
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
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  };

  // 批量删除任务
  const batchDeleteTasks = () => {
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks.filter(
                task => !selectedTasks.includes(task.id)
              ),
            }
          : list
      )
    );
    setSelectedTasks([]);
    setShowBatchActions(false);
  };

  // 批量完成任务
  const batchCompleteTasks = completed => {
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks.map(task =>
                selectedTasks.includes(task.id) ? { ...task, completed } : task
              ),
            }
          : list
      )
    );
    setSelectedTasks([]);
    setShowBatchActions(false);
  };

  // 切换任务选择
  const toggleTaskSelect = taskId => {
    setSelectedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  // 更新任务
  const updateTask = (taskId, updates) => {
    setLists(
      lists.map(list =>
        list.id === activeListId
          ? {
              ...list,
              tasks: list.tasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
            }
          : list
      )
    );
    setEditingTask(null);
  };

  // 开始编辑任务
  const startEditTask = task => {
    setEditingTask(task);
  };

  // 取消编辑
  const cancelEditTask = () => {
    setEditingTask(null);
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

  // 导出为 JSON
  const exportToJSON = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      lists: lists,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robot-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入 JSON
  const importFromJSON = file => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.lists && Array.isArray(data.lists)) {
          setLists(data.lists);
          if (data.lists.length > 0) {
            setActiveListId(data.lists[0].id);
          }
          alert('导入成功！');
        } else {
          alert('无效的备份文件格式');
        }
      } catch (error) {
        alert('导入失败：请确保选择的是正确的 JSON 文件');
      }
    };
    reader.readAsText(file);
  };

  // 导出为 CSV
  const exportToCSV = () => {
    let csv = '清单,任务,完成状态,优先级,截止日期\n';
    lists.forEach(list => {
      list.tasks.forEach(task => {
        csv += `"${list.name}","${task.title}",${task.completed ? '是' : '否'},${task.priority},${task.dueDate || ''}\n`;
      });
    });
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `robot-todo-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 请求通知权限
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert('当前浏览器不支持通知功能');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      alert('通知权限已开启！');
    } else if (permission === 'denied') {
      alert('通知权限被拒绝，请在浏览器设置中手动开启');
    }
  };

  // 发送通知
  const sendNotification = (title, body) => {
    if (notificationPermission === 'granted') {
      new Notification(title, { body, icon: '/logo192.png' });
    }
  };

  // 检查并发送截止日期提醒
  const checkDueDateReminders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    lists.forEach(list => {
      list.tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);

          // 今天到期的任务
          if (dueDate.getTime() === today.getTime()) {
            sendNotification(
              '📅 任务今天到期',
              `"${task.title}" 需要在今天完成`
            );
          }
          // 明天到期的任务
          else if (dueDate.getTime() === tomorrow.getTime()) {
            sendNotification(
              '📅 任务明天到期',
              `"${task.title}" 明天到期，请提前准备`
            );
          }
        }
      });
    });
  };

  // 检查逾期任务
  const checkOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let overdueCount = 0;
    lists.forEach(list => {
      list.tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() < today.getTime()) {
            overdueCount++;
          }
        }
      });
    });

    if (overdueCount > 0) {
      sendNotification(
        '⚠️ 有逾期任务',
        `你有 ${overdueCount} 个任务已逾期，请尽快处理`
      );
    }
  };

  // 初始化通知检查
  useEffect(() => {
    if (notificationPermission === 'granted') {
      // 页面加载时检查一次
      checkDueDateReminders();
      checkOverdueTasks();

      // 每小时检查一次
      const interval = setInterval(
        () => {
          checkDueDateReminders();
          checkOverdueTasks();
        },
        60 * 60 * 1000
      );

      return () => clearInterval(interval);
    }
  }, [notificationPermission, lists]);

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

          {/* 设置按钮 */}
          <button
            className="settings-btn"
            onClick={() => setShowSettings(true)}
          >
            ⚙️ 设置
          </button>

          {/* 设置面板 */}
          {showSettings && (
            <div className="settings-panel">
              <h3>⚙️ 设置</h3>
              <div className="settings-section">
                <h4>🔔 通知设置</h4>
                <p className="notification-status">
                  当前状态:{' '}
                  {notificationPermission === 'granted'
                    ? '✅ 已开启'
                    : notificationPermission === 'denied'
                      ? '❌ 已拒绝'
                      : '⚪ 未开启'}
                </p>
                {notificationPermission !== 'granted' && (
                  <button onClick={requestNotificationPermission}>
                    开启通知权限
                  </button>
                )}
                {notificationPermission === 'granted' && (
                  <button onClick={checkDueDateReminders}>测试通知</button>
                )}
              </div>
              <div className="settings-section">
                <h4>🏷️ 标签管理</h4>
                <div className="tags-list">
                  {tags.map(tag => (
                    <span
                      key={tag.id}
                      className="tag-item"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                      <button onClick={() => deleteTag(tag.id)}>×</button>
                    </span>
                  ))}
                </div>
                <TagForm onAdd={addTag} />
              </div>
              <div className="settings-section">
                <h4>📤 数据导出</h4>
                <button onClick={exportToJSON}>导出为 JSON</button>
                <button onClick={exportToCSV}>导出为 CSV</button>
              </div>
              <div className="settings-section">
                <h4>📥 数据导入</h4>
                <label className="import-btn">
                  从 JSON 导入
                  <input
                    type="file"
                    accept=".json"
                    onChange={e => {
                      if (e.target.files[0]) {
                        importFromJSON(e.target.files[0]);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <button
                className="close-settings"
                onClick={() => setShowSettings(false)}
              >
                关闭
              </button>
            </div>
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
            <div className="toolbar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 搜索任务..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              {filteredTasks.length > 0 && (
                <div className="batch-actions">
                  <button
                    className="batch-btn"
                    onClick={() => setShowBatchActions(!showBatchActions)}
                  >
                    ☑️ 批量操作{' '}
                    {selectedTasks.length > 0 && `(${selectedTasks.length})`}
                  </button>
                </div>
              )}
            </div>

            {/* 批量操作面板 */}
            {showBatchActions && selectedTasks.length > 0 && (
              <div className="batch-panel">
                <span>已选择 {selectedTasks.length} 个任务</span>
                <button onClick={() => batchCompleteTasks(true)}>
                  ✅ 标记完成
                </button>
                <button onClick={() => batchCompleteTasks(false)}>
                  ⭕ 取消完成
                </button>
                <button onClick={batchDeleteTasks} className="delete-batch">
                  🗑️ 批量删除
                </button>
                <button onClick={toggleSelectAll}>
                  {selectedTasks.length === filteredTasks.length
                    ? '☑️ 取消全选'
                    : '✅ 全选'}
                </button>
              </div>
            )}
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
                    className={`task-card ${task.completed ? 'completed' : ''} ${selectedTasks.includes(task.id) ? 'selected' : ''}`}
                  >
                    <div className="task-header">
                      <label className="checkbox-container batch-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => toggleTaskSelect(task.id)}
                        />
                        <span className="checkmark"></span>
                      </label>
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
                          {task.tags && task.tags.length > 0 && (
                            <div className="task-tags">
                              {task.tags.map(tagId => {
                                const tag = tags.find(t => t.id === tagId);
                                return tag ? (
                                  <span
                                    key={tagId}
                                    className="task-tag"
                                    style={{ backgroundColor: tag.color }}
                                  >
                                    {tag.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
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

// 任务编辑表单组件
function TaskEditForm({ task, onSave, onCancel, tags, toggleTaskTag }) {
  const [title, setTitle] = useState(task.title || '');
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split('T')[0] : ''
  );
  const [priority, setPriority] = useState(task.priority || 'medium');
  const [taskTags, setTaskTags] = useState(task.tags || []);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      dueDate: dueDate || null,
      priority,
      tags: taskTags,
    });
  };

  const handleTagToggle = tagId => {
    setTaskTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="task-edit-form">
      <div className="task-edit-input">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="任务标题"
          autoFocus
          onKeyPress={e => e.key === 'Enter' && handleSave()}
        />
      </div>
      <div className="task-edit-options">
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
      </div>
      {tags.length > 0 && (
        <div className="task-edit-tags">
          <span className="tags-label">标签:</span>
          {tags.map(tag => (
            <button
              key={tag.id}
              className={`tag-option ${taskTags.includes(tag.id) ? 'active' : ''}`}
              style={{
                backgroundColor: taskTags.includes(tag.id)
                  ? tag.color
                  : '#e0e0e0',
              }}
              onClick={() => handleTagToggle(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}
      <div className="task-edit-buttons">
        <button className="save-btn" onClick={handleSave}>
          保存
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}

// 标签表单组件
function TagForm({ onAdd }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#667eea');
  const [showForm, setShowForm] = useState(false);

  const colors = [
    '#e74c3c',
    '#3498db',
    '#2ecc71',
    '#f39c12',
    '#9b59b6',
    '#1abc9c',
    '#e67e22',
    '#34495e',
  ];

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), color);
    setName('');
    setColor('#667eea');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button className="add-tag-btn" onClick={() => setShowForm(true)}>
        + 添加标签
      </button>
    );
  }

  return (
    <div className="tag-form">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="标签名称"
      />
      <div className="color-picker">
        {colors.map(c => (
          <button
            key={c}
            className={`color-option ${color === c ? 'active' : ''}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="tag-form-buttons">
        <button onClick={handleSubmit}>添加</button>
        <button onClick={() => setShowForm(false)}>取消</button>
      </div>
    </div>
  );
}
