import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Priority } from '@/types/priority';

export function usePriorities() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPriorities();
  }, []);

  const loadPriorities = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: prioritiesData, error: prioritiesError } = await supabase
        .from('priorities')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (prioritiesError) {
        setError('優先度データの取得に失敗しました');
        setPriorities([]);
      } else {
        setPriorities(prioritiesData || []);
      }
    } catch {
      setError('優先度データの取得中にエラーが発生しました');
      setPriorities([]);
    } finally {
      setLoading(false);
    }
  };

  // 優先度IDから優先度オブジェクトを取得
  const getPriorityById = (id: string): Priority | undefined => {
    return priorities.find(priority => priority.id === id);
  };

  // 優先度名から優先度オブジェクトを取得
  const getPriorityByName = (name: string): Priority | undefined => {
    return priorities.find(priority => priority.name === name);
  };

  // デフォルト優先度（「中」）のIDを取得
  const getDefaultPriorityId = (): string | null => {
    const defaultPriority = getPriorityByName('中');
    return defaultPriority?.id || null;
  };

  return {
    priorities,
    loading,
    error,
    loadPriorities,
    getPriorityById,
    getPriorityByName,
    getDefaultPriorityId
  };
} 