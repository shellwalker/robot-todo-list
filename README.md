# Robot Todo List 🦁

一个功能丰富的待办事项管理应用，支持多平台部署。

## ✨ 功能特性

### 基础功能
- ✅ 多清单管理
- ✅ 任务增删改查
- ✅ 任务完成状态切换
- ✅ localStorage 持久化

### 进阶功能
- 🎯 任务优先级（低/中/高）
- 📅 截止日期设置
- 🔍 任务搜索筛选
- 📝 子任务步骤管理
- 🏷️ 标签系统
- 🔄 重复任务（每天/每周/每月）
- 🔗 任务依赖关系
- 📊 任务统计

### UI/UX
- 🎨 5种主题切换（梦幻紫、海洋蓝、日落橙、森林绿、暗黑模式）
- 📱 响应式设计（移动端优化）
- ✨ 动画效果
- 🌙 深色模式支持

### 高级功能
- 📤 数据导出（JSON/CSV）
- 📥 数据导入
- 🔗 清单分享链接
- 🔔 浏览器通知
- ⌨️ 键盘快捷键
- 📲 PWA 支持（可添加到主屏幕）
- 🛡️ 错误边界

## 🏗️ 技术架构

```
src/
├── components/           # React 组件
│   ├── common/        # 通用组件
│   ├── layout/        # 布局组件
│   └── tasks/        # 任务相关组件
├── hooks/             # 自定义 Hooks
├── lib/               # 工具库
│   ├── supabase.js  # Supabase 客户端
│   └── database.js  # 数据访问层
└── App.js            # 主应用组件
```

### 技术栈
- **前端框架**: React 19
- **后端**: Supabase (PostgreSQL)
- **部署**: Vercel / GitHub Pages
- **构建工具**: Create React App

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm start
```

### 构建生产版本
```bash
npm run build
```

## 🔧 环境变量

在 `.env.local` 中配置：

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## 📋 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 新建任务 |
| Ctrl+F | 搜索 |
| Ctrl+L | 新建清单 |
| Esc | 关闭弹窗 |

## 🌐 部署

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### GitHub Pages 部署
```bash
npm run deploy
```

## 📄 许可证

MIT License

## 👤 作者

shellwalker
