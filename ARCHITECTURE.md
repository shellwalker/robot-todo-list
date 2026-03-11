# 组件架构文档

## 📁 目录结构

```
src/
├── components/
│   ├── common/           # 通用组件
│   │   ├── Modal.js    # 模态框组件
│   │   ├── Button.js   # 按钮组件
│   │   └── Select.js   # 选择器组件
│   │
│   ├── layout/          # 布局组件
│   │   ├── Sidebar.js # 侧边栏（清单列表）
│   │   ├── Header.js  # 头部组件
│   │   └── Settings.js # 设置面板
│   │
│   └── tasks/          # 任务组件
│       ├── TaskCard.js     # 任务卡片
│       ├── TaskList.js     # 任务列表
│       ├── TaskForm.js     # 任务表单
│       ├── TaskEditForm.js # 任务编辑表单
│       ├── StepForm.js     # 步骤表单
│       └── TagForm.js      # 标签表单
│
├── hooks/               # 自定义 Hooks
│   └── useSupabase.js # Supabase 数据管理
│
├── lib/                # 工具库
│   ├── supabase.js    # Supabase 客户端配置
│   └── database.js    # 数据访问层（DAL）
│
└── App.js            # 主应用组件
```

## 🔄 数据流

```
用户操作
    ↓
App.js (状态管理)
    ↓
useSupabase Hook
    ↓
database.js (DAL)
    ↓
supabase.js (客户端)
    ↓
Supabase (后端)
```

## 📦 组件层次

```
App
├── ErrorBoundary
│
├── Sidebar
│   ├── ListItem
│   ├── AddListForm
│   └── Settings
│       ├── TagForm
│       ├── ExportButtons
│       └── ImportButton
│
├── Header
│   ├── ThemeSelector
│   ├── SearchBox
│   ├── ProgressBar
│   └── BatchActions
│
└── TaskList
    └── TaskCard[]
        ├── Checkbox
        ├── TaskContent
        │   ├── TaskTitle
        │   ├── TaskMeta
        │   │   ├── DueDate
        │   │   ├── Priority
        │   │   ├── Recurrence
        │   │   └── Tags
        │   └── TaskSteps[]
        ├── StepForm
        ├── EditButton
        └── DeleteButton
```

## 🎯 状态管理

使用 React Hooks 进行状态管理：

- `useState` - 本地状态
- `useEffect` - 副作用处理
- `useCallback` - 回调优化

## 🔌 API 接口

### database.js

```javascript
// 清单操作
getLists()
createList(name, themeId)
updateList(id, updates)
deleteList(id)

// 任务操作
getTasks(listId)
createTask(task)
updateTask(id, updates)
toggleTaskComplete(id, completed)
deleteTask(id)

// 步骤操作
getSteps(taskId)
createStep(taskId, title)
updateStep(id, updates)
toggleStepComplete(id, completed)
deleteStep(id)
```

## 🎨 主题系统

主题定义在 `App.js` 中：

```javascript
const THEMES = [
  { id: 'purple', name: '梦幻紫', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'ocean', name: '海洋蓝', bg: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)' },
  { id: 'sunset', name: '日落橙', bg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' },
  { id: 'forest', name: '森林绿', bg: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'dark', name: '暗黑模式', bg: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)' },
];
```

## 🔐 安全

- Supabase RLS (行级安全策略)
- 环境变量管理敏感信息
- 输入验证和清理
- 错误边界处理

## 📱 响应式断点

- `max-width: 768px` - 平板
- `max-width: 480px` - 手机
