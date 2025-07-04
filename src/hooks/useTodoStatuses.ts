import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TodoStatus } from '@/types/todoStatus';

export function useTodoStatuses() {
  const [todoStatuses, setTodoStatuses] = useState<TodoStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTodoStatuses();
  }, []);

  const loadTodoStatuses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data: todoStatusesData, error: todoStatusesError } = await supabase
        .from('todo_statuses')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (todoStatusesError) {
        setError('ToDo状態データの取得に失敗しました');
        setTodoStatuses([]);
      } else {
        setTodoStatuses(todoStatusesData || []);
      }
    } catch {
      setError('ToDo状態データの取得中にエラーが発生しました');
      setTodoStatuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ToDo状態IDからToDo状態オブジェクトを取得
  const getTodoStatusById = (id: string): TodoStatus | undefined => {
    return todoStatuses.find(todoStatus => todoStatus.id === id);
  };

  // ToDo状態名からToDo状態オブジェクトを取得
  const getTodoStatusByName = (name: string): TodoStatus | undefined => {
    return todoStatuses.find(todoStatus => todoStatus.name === name);
  };

  // デフォルトToDo状態（「未着手」）のIDを取得
  const getDefaultTodoStatusId = (): string | null => {
    const defaultTodoStatus = getTodoStatusByName('未着手');
    return defaultTodoStatus?.id || null;
  };

  return {
    todoStatuses,
    isLoading,
    error,
    loadTodoStatuses,
    getTodoStatusById,
    getTodoStatusByName,
    getDefaultTodoStatusId
  };
} 