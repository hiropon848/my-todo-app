import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Todo } from '@/types/todo';
import { usePriorities } from './usePriorities';

export function useTodos(userId: string | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  // Priority情報を取得
  const { getDefaultPriorityId } = usePriorities();

  useEffect(() => {
    if (!userId) {
      setLoading(true);
      return;
    }
    setLoading(true);
    setError('');
    (async () => {
      const { data: todosData, error: todosError } = await supabase
        .from('todos')
        .select(`
          *,
          priority:priorities(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (todosError) {
        setError('ToDoの取得に失敗しました');
        setTodos([]);
      } else {
        setTodos(todosData || []);
      }
      setLoading(false);
    })();
  }, [userId]);

  // ToDo削除ロジック
  const deleteTodo = async (id: string) => {
    const { error: deleteError } = await supabase.from('todos').delete().eq('id', id);
    if (deleteError) {
      setError('削除に失敗しました');
      throw new Error('削除に失敗しました');
    }
    // 削除成功時のみUIを更新
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // ToDo完了トグルロジック
  const toggleTodo = async (id: string, is_completed: boolean) => {
    setError('');
    setToggleLoading(id);
    try {
      const { error: updateError } = await supabase.from('todos').update({ is_completed: !is_completed }).eq('id', id);
      if (updateError) {
        setError('完了状態の更新に失敗しました');
      } else {
        setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, is_completed: !is_completed } : todo));
      }
    } finally {
      setToggleLoading(null);
    }
  };

  // ToDo追加ロジック
  const addTodo = async (
    title: string, 
    text: string, 
    priorityId?: string,
    onSuccess?: (todo: Todo) => void
  ) => {
    setError('');
    if (!title.trim()) {
      setError('タイトルは必須です');
      return false;
    }
    
    // priorityIdが指定されていない場合はデフォルト（「中」）を使用
    const finalPriorityId = priorityId || getDefaultPriorityId();
    if (!finalPriorityId) {
      setError('優先度データの取得に失敗しました');
      return false;
    }
    
    setAddLoading(true);
    try {
      const { data: inserted, error: insertError } = await supabase.from('todos').insert({
        user_id: userId,
        task_title: title,
        task_text: text,
        is_completed: false,
        priority_id: finalPriorityId,
      }).select(`
        *,
        priority:priorities(*)
      `).single();
      
      if (insertError) {
        setError('ToDoの追加に失敗しました');
        return false;
      } else if (inserted) {
        setTodos(prev => [inserted, ...prev]);
        onSuccess?.(inserted);
        return true;
      }
      return false;
    } finally {
      setAddLoading(false);
    }
  };

  // ToDo更新ロジック
  const updateTodo = async (
    id: string,
    title: string,
    text: string,
    priorityId?: string,
    onSuccess?: (todo: Todo) => void
  ) => {
    setError('');
    try {
      // 1. Supabaseで更新実行
      const updateData: { task_title: string; task_text: string; priority_id?: string } = {
        task_title: title,
        task_text: text,
      };
      
      if (priorityId) {
        updateData.priority_id = priorityId;
      }
      
      const { error: updateError } = await supabase.from('todos').update(updateData).eq('id', id);
      
      if (updateError) {
        setError('編集に失敗しました');
        throw updateError;
      }
      
      // 2. 更新成功後、最新データを取得（Priority情報含む）
      const { data: updatedTodo, error: fetchError } = await supabase
        .from('todos')
        .select(`*, priority:priorities(*)`)
        .eq('id', id)
        .single();
      
      if (fetchError) {
        setError('更新データの取得に失敗しました');
        throw fetchError;
      }
      
      // 3. レスポンス受信後にUI更新
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      
      // 成功コールバック実行
      onSuccess?.(updatedTodo);
      return true;
    } catch (err) {
      // エラー時は何もしない（UIは元のまま保持）
      throw err;
    }
  };

  return { 
    todos, 
    setTodos, 
    loading, 
    error, 
    deleteTodo, 
    toggleTodo, 
    toggleLoading,
    addTodo,
    addLoading,
    updateTodo
  };
}