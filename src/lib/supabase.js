import { createClient } from '@supabase/supabase-js';

// Supabase 配置 - 优先使用环境变量
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://aezcrkvcggyaxloxftkl.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_lSTEoV4kloIJpbgniR6bPw_VLn6_vuE';

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseKey);

// 导出配置（用于调试）
export const config = {
  url: supabaseUrl,
  hasKey: !!supabaseKey,
};

// 数据库表名常量
export const TABLES = {
  LISTS: 'lists',
  TASKS: 'tasks',
  STEPS: 'steps',
};

// 辅助函数：生成 UUID
export const generateId = () => {
  return crypto.randomUUID();
};

// 检查是否为有效的 UUID
export const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export default supabase;
