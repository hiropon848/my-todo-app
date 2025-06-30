import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TaskStatus } from '@/types/taskStatus';

export function useTaskStatuses() {
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTaskStatuses();
  }, []);

  const loadTaskStatuses = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: taskStatusesData, error: taskStatusesError } = await supabase
        .from('task_statuses')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (taskStatusesError) {
        setError('タスク状態データの取得に失敗しました');
        setTaskStatuses([]);
      } else {
        setTaskStatuses(taskStatusesData || []);
      }
    } catch {
      setError('タスク状態データの取得中にエラーが発生しました');
      setTaskStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  // タスク状態IDからタスク状態オブジェクトを取得
  const getTaskStatusById = (id: string): TaskStatus | undefined => {
    return taskStatuses.find(taskStatus => taskStatus.id === id);
  };

  // タスク状態名からタスク状態オブジェクトを取得
  const getTaskStatusByName = (name: string): TaskStatus | undefined => {
    return taskStatuses.find(taskStatus => taskStatus.name === name);
  };

  // デフォルトタスク状態（「未着手」）のIDを取得
  const getDefaultTaskStatusId = (): string | null => {
    const defaultTaskStatus = getTaskStatusByName('未着手');
    return defaultTaskStatus?.id || null;
  };

  return {
    taskStatuses,
    loading,
    error,
    loadTaskStatuses,
    getTaskStatusById,
    getTaskStatusByName,
    getDefaultTaskStatusId
  };
} 