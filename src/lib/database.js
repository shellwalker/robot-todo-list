/**
 * 数据访问层 (DAL) - Supabase 数据库操作
 * 提供与 Supabase 数据库的 CRUD 操作
 */

import { supabase, generateId } from './supabase';

// =============================================
// 清单操作 (Lists)
// =============================================

/**
 * 获取所有清单
 */
export const getLists = async () => {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * 创建清单
 */
export const createList = async (name, themeId = 'purple') => {
  const { data, error } = await supabase
    .from('lists')
    .insert([{ name, theme_id: themeId }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 更新清单
 */
export const updateList = async (id, updates) => {
  const { data, error } = await supabase
    .from('lists')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 删除清单
 */
export const deleteList = async (id) => {
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =============================================
// 任务操作 (Tasks)
// =============================================

/**
 * 获取指定清单的所有任务
 */
export const getTasks = async (listId) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('list_id', listId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * 获取所有任务（用于搜索）
 */
export const getAllTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * 创建任务
 */
export const createTask = async (task) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      list_id: task.listId,
      title: task.title,
      completed: task.completed || false,
      priority: task.priority || 'medium',
      due_date: task.dueDate || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 更新任务
 */
export const updateTask = async (id, updates) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 切换任务完成状态
 */
export const toggleTaskComplete = async (id, completed) => {
  return updateTask(id, { completed });
};

/**
 * 删除任务
 */
export const deleteTask = async (id) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =============================================
// 步骤操作 (Steps)
// =============================================

/**
 * 获取指定任务的所有步骤
 */
export const getSteps = async (taskId) => {
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * 获取多个任务的步骤
 */
export const getStepsForTasks = async (taskIds) => {
  if (!taskIds || taskIds.length === 0) return [];
  
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .in('task_id', taskIds)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * 创建步骤
 */
export const createStep = async (taskId, title) => {
  const { data, error } = await supabase
    .from('steps')
    .insert([{
      task_id: taskId,
      title,
      completed: false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 更新步骤
 */
export const updateStep = async (id, updates) => {
  const { data, error } = await supabase
    .from('steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 切换步骤完成状态
 */
export const toggleStepComplete = async (id, completed) => {
  return updateStep(id, { completed });
};

/**
 * 删除步骤
 */
export const deleteStep = async (id) => {
  const { error } = await supabase
    .from('steps')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

// =============================================
// 批量操作
// =============================================

/**
 * 删除清单及其所有相关任务和步骤
 * 由于设置了 CASCADE，删除清单会自动删除相关任务和步骤
 */
export const deleteListWithTasks = async (listId) => {
  // 先获取所有任务
  const tasks = await getTasks(listId);
  const taskIds = tasks.map(t => t.id);

  // 删除所有步骤
  if (taskIds.length > 0) {
    const { error: stepsError } = await supabase
      .from('steps')
      .delete()
      .in('task_id', taskIds);
    
    if (stepsError) throw stepsError;
  }

  // 删除所有任务
  const { error: tasksError } = await supabase
    .from('tasks')
    .delete()
    .eq('list_id', listId);

  if (tasksError) throw tasksError;

  // 删除清单
  return deleteList(listId);
};

// =============================================
// 数据迁移工具
// =============================================

/**
 * 从 localStorage 迁移数据到 Supabase
 */
export const migrateFromLocalStorage = async () => {
  try {
    // 获取 localStorage 数据
    const localData = localStorage.getItem('robot-todo-lists');
    if (!localData) {
      console.log('没有找到 localStorage 数据');
      return { success: false, message: '没有数据需要迁移' };
    }

    const lists = JSON.parse(localData);
    const results = {
      lists: 0,
      tasks: 0,
      steps: 0,
      errors: [],
    };

    // 迁移每个清单
    for (const list of lists) {
      try {
        // 创建清单
        const newList = await createList(list.name, list.themeId);
        results.lists++;

        // 迁移每个任务
        if (list.tasks && list.tasks.length > 0) {
          for (const task of list.tasks) {
            try {
              const newTask = await createTask({
                listId: newList.id,
                title: task.title,
                completed: task.completed,
                priority: task.priority,
                dueDate: task.dueDate,
              });
              results.tasks++;

              // 迁移每个步骤
              if (task.steps && task.steps.length > 0) {
                for (const step of task.steps) {
                  try {
                    await createStep(newTask.id, step.title);
                    // 更新步骤完成状态
                    if (step.completed) {
                      const steps = await getSteps(newTask.id);
                      const lastStep = steps[steps.length - 1];
                      if (lastStep) {
                        await toggleStepComplete(lastStep.id, true);
                      }
                    }
                    results.steps++;
                  } catch (e) {
                    results.errors.push(`步骤错误: ${e.message}`);
                  }
                }
              }
            } catch (e) {
              results.errors.push(`任务错误: ${e.message}`);
            }
          }
        }
      } catch (e) {
        results.errors.push(`清单错误: ${e.message}`);
      }
    }

    console.log('迁移结果:', results);
    return { success: true, ...results };
  } catch (error) {
    console.error('迁移失败:', error);
    return { success: false, message: error.message };
  }
};

export default {
  // Lists
  getLists,
  createList,
  updateList,
  deleteList,
  // Tasks
  getTasks,
  getAllTasks,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  // Steps
  getSteps,
  getStepsForTasks,
  createStep,
  updateStep,
  toggleStepComplete,
  deleteStep,
  // Batch
  deleteListWithTasks,
  // Migration
  migrateFromLocalStorage,
};
