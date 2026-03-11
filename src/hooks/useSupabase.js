/**
 * useSupabase - 自定义 Hook，用于 Supabase 数据管理
 */

import { useState, useEffect, useCallback } from 'react';
import * as db from '../lib/database';

export const useSupabase = () => {
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasksWithSteps, setTasksWithSteps] = useState({});

  // 加载所有数据
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listsData = await db.getLists();
      setLists(listsData);

      if (listsData.length > 0) {
        setActiveListId(listsData[0].id);
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载任务和步骤
  const loadTasksAndSteps = useCallback(async listId => {
    if (!listId) return;

    try {
      const tasks = await db.getTasks(listId);
      const taskIds = tasks.map(t => t.id);

      // 获取所有步骤
      const allSteps = await db.getStepsForTasks(taskIds);

      // 按 task_id 分组步骤
      const stepsMap = {};
      allSteps.forEach(step => {
        if (!stepsMap[step.task_id]) {
          stepsMap[step.task_id] = [];
        }
        stepsMap[step.task_id].push(step);
      });

      // 将步骤添加到任务中
      const tasksWithSteps = tasks.map(task => ({
        ...task,
        steps: stepsMap[task.id] || [],
      }));

      setTasksWithSteps(prev => ({
        ...prev,
        [listId]: tasksWithSteps,
      }));

      return tasksWithSteps;
    } catch (err) {
      console.error('加载任务失败:', err);
      return [];
    }
  }, []);

  // 初始化
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 当 activeListId 变化时加载任务
  useEffect(() => {
    if (activeListId) {
      loadTasksAndSteps(activeListId);
    }
  }, [activeListId, loadTasksAndSteps]);

  // 获取当前清单
  const activeList = lists.find(l => l.id === activeListId) || lists[0];

  // 获取当前任务
  const activeTasks = activeListId ? tasksWithSteps[activeListId] || [] : [];

  // 添加清单
  const addList = async (name, themeId = 'purple') => {
    try {
      const newList = await db.createList(name, themeId);
      setLists([...lists, newList]);
      setActiveListId(newList.id);
      return newList;
    } catch (err) {
      console.error('添加清单失败:', err);
      throw err;
    }
  };

  // 删除清单
  const deleteList = async listId => {
    try {
      await db.deleteListWithTasks(listId);
      const newLists = lists.filter(l => l.id !== listId);
      setLists(newLists);

      // 删除缓存的任务
      setTasksWithSteps(prev => {
        const newCache = { ...prev };
        delete newCache[listId];
        return newCache;
      });

      if (activeListId === listId && newLists.length > 0) {
        setActiveListId(newLists[0].id);
      }
    } catch (err) {
      console.error('删除清单失败:', err);
      throw err;
    }
  };

  // 更新清单主题
  const updateListTheme = async (listId, themeId) => {
    try {
      await db.updateList(listId, { theme_id: themeId });
      setLists(
        lists.map(l => (l.id === listId ? { ...l, theme_id: themeId } : l))
      );
    } catch (err) {
      console.error('更新主题失败:', err);
      throw err;
    }
  };

  // 添加任务
  const addTask = async (title, dueDate, priority) => {
    if (!activeListId || !title.trim()) return null;

    try {
      const newTask = await db.createTask({
        listId: activeListId,
        title: title.trim(),
        priority: priority || 'medium',
        dueDate: dueDate || null,
      });

      // 更新缓存
      setTasksWithSteps(prev => ({
        ...prev,
        [activeListId]: [
          ...(prev[activeListId] || []),
          { ...newTask, steps: [] },
        ],
      }));

      return newTask;
    } catch (err) {
      console.error('添加任务失败:', err);
      throw err;
    }
  };

  // 切换任务完成状态
  const toggleTask = async taskId => {
    const task = activeTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await db.toggleTaskComplete(taskId, !task.completed);

      // 更新缓存
      setTasksWithSteps(prev => ({
        ...prev,
        [activeListId]: prev[activeListId].map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        ),
      }));
    } catch (err) {
      console.error('切换任务状态失败:', err);
      throw err;
    }
  };

  // 删除任务
  const deleteTask = async taskId => {
    try {
      await db.deleteTask(taskId);

      // 更新缓存
      setTasksWithSteps(prev => ({
        ...prev,
        [activeListId]: prev[activeListId].filter(t => t.id !== taskId),
      }));
    } catch (err) {
      console.error('删除任务失败:', err);
      throw err;
    }
  };

  // 添加步骤
  const addStep = async (taskId, stepTitle) => {
    try {
      const newStep = await db.createStep(taskId, stepTitle);

      // 更新缓存
      setTasksWithSteps(prev => ({
        ...prev,
        [activeListId]: prev[activeListId].map(t =>
          t.id === taskId ? { ...t, steps: [...t.steps, newStep] } : t
        ),
      }));

      return newStep;
    } catch (err) {
      console.error('添加步骤失败:', err);
      throw err;
    }
  };

  // 切换步骤完成状态
  const toggleStep = async (taskId, stepId) => {
    const task = activeTasks.find(t => t.id === taskId);
    const step = task?.steps.find(s => s.id === stepId);
    if (!step) return;

    try {
      await db.toggleStepComplete(stepId, !step.completed);

      // 更新缓存
      setTasksWithSteps(prev => ({
        ...prev,
        [activeListId]: prev[activeListId].map(t =>
          t.id === taskId
            ? {
                ...t,
                steps: t.steps.map(s =>
                  s.id === stepId ? { ...s, completed: !s.completed } : s
                ),
              }
            : t
        ),
      }));
    } catch (err) {
      console.error('切换步骤状态失败:', err);
      throw err;
    }
  };

  return {
    // 数据
    lists,
    activeListId,
    setActiveListId,
    activeList,
    activeTasks,
    loading,
    error,

    // 操作
    addList,
    deleteList,
    updateListTheme,
    addTask,
    toggleTask,
    deleteTask,
    addStep,
    toggleStep,
    refresh: loadData,
  };
};

export default useSupabase;
