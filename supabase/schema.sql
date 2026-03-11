-- =============================================
-- Robot Todo List - Supabase Database Schema
-- =============================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 清单表 (Lists)
-- =============================================
CREATE TABLE IF NOT EXISTS lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    theme_id TEXT DEFAULT 'purple',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 任务表 (Tasks)
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES lists(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 步骤表 (Steps)
-- =============================================
CREATE TABLE IF NOT EXISTS steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 创建索引以提升查询性能
-- =============================================
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_steps_task_id ON steps(task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- =============================================
-- 启用行级安全策略 (RLS)
-- =============================================
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 公开读取策略（可根据需要调整）
-- =============================================
CREATE POLICY "Enable read access for all users" ON lists
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON steps
    FOR SELECT USING (true);

-- =============================================
-- 公开写入策略（可根据需要调整）
-- =============================================
CREATE POLICY "Enable insert for all users" ON lists
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON lists
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON lists
    FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON tasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON tasks
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON tasks
    FOR DELETE USING (true);

CREATE POLICY "Enable insert for all users" ON steps
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON steps
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON steps
    FOR DELETE USING (true);

-- =============================================
-- 创建更新时间戳的触发器函数
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为每个表创建更新触发器
CREATE TRIGGER update_lists_updated_at BEFORE UPDATE ON lists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 测试数据（可选）
-- =============================================
-- INSERT INTO lists (name, theme_id) VALUES ('我的任务', 'purple');
