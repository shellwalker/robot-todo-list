# robot-todo-list 开发工作规范

## 🏷️ 分支策略

| 分支类型     | 命名规范         | 说明         |
| ------------ | ---------------- | ------------ |
| **主分支**   | `main`           | 生产就绪代码 |
| **功能分支** | `feature/功能名` | 新功能开发   |
| **修复分支** | `fix/问题描述`   | Bug 修复     |

## 🔄 开发流程

```
1. 切换到 main 并拉取最新
   → git checkout main && git pull origin main

2. 创建功能分支
   → git checkout -b feature/xxx

3. 开发测试
   → 本地测试通过 (npm test)

4. 提交 PR
   → 推送到远程并创建 PR

5. 等待 CI 通过
   → Code Quality & Tests
   → Security Audit
   → Vercel 部署（可选）

6. 合并到 main
   → CI 全部通过后合并
   → 删除本地分支
```

## ✅ PR 提交规范

- **标题格式**: `feat: 功能描述` / `fix: 修复描述`
- **必须包含**: `由 AI 自动提交` 结尾
- **CI 必须通过**:
  - Code Quality & Tests (ESLint + Prettier + Test)
  - Security Audit (npm audit)

## 🛠️ 基础设施

| 项目     | 状态                  |
| -------- | --------------------- |
| CI/CD    | GitHub Actions        |
| 代码质量 | ESLint + Prettier     |
| 安全扫描 | npm audit             |
| 部署     | GitHub Pages + Vercel |
| 后端     | Supabase              |

## 📦 技术栈

- React 19
- Supabase (PostgreSQL)
- Vercel
- GitHub Pages
