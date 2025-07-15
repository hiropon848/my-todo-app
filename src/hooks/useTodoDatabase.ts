import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Todo } from '@/types/todo';
import { useTodoPriorities } from './useTodoPriorities';
import { useAutoRetry } from './useAutoRetry';

/**
 * ToDoデータベース操作を管理するフック
 * 責任: Supabaseとの直接的なCRUD操作・データ検証・エラーハンドリング
 */
export function useTodoDatabase() {
  const [error, setError] = useState('');
  const { getDefaultPriorityId } = useTodoPriorities();
  const { retryTodoOperation } = useAutoRetry();

  // ToDo追加ロジック（Step 2-C-1: 自動リトライ機能適用）
  const addTodo = useCallback(async (
    userId: string,
    title: string, 
    text: string, 
    priorityId?: string,
    statusId?: string
  ): Promise<Todo | null> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 addTodo called:', { title, text, priorityId, statusId });
    }
    setError('');
    if (!title.trim()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Title validation failed');
      }
      setError('タイトルは必須です');
      return null;
    }
    
    // Step 2-C-1: 自動リトライ機能適用 - addTodo操作をリトライ対応
    return await retryTodoOperation(async () => {
      console.log('🟠 [useTodoDatabase] retryTodoOperation内部関数開始');
      console.log('🟠 [useTodoDatabase] getDefaultPriorityId呼び出し');
      const defaultPriorityId = getDefaultPriorityId();
      console.log('🟠 [useTodoDatabase] getDefaultPriorityId結果:', defaultPriorityId);
      const finalPriorityId = priorityId || defaultPriorityId;
      console.log('🟠 [useTodoDatabase] 最終priorityId:', finalPriorityId);
      
      if (!finalPriorityId) {
        console.log('🔴 [useTodoDatabase] priorityID取得失敗');
        setError('優先度データの取得に失敗しました');
        return null;
      }
      
      let finalStatusId = statusId;
      console.log('🟠 [useTodoDatabase] statusId確認:', statusId);
      if (!finalStatusId) {
        console.log('🟠 [useTodoDatabase] デフォルトstatus取得開始');
        const { data: defaultStatus, error: statusError } = await supabase
          .from('todo_statuses')
          .select('id')
          .eq('name', '未着手')
          .single();
        console.log('🟠 [useTodoDatabase] デフォルトstatus結果:', { defaultStatus, statusError });

        if (statusError || !defaultStatus) {
          console.log('🔴 [useTodoDatabase] デフォルトstatus取得失敗');
          setError('デフォルト状態の取得に失敗しました');
          return null;
        }
        finalStatusId = defaultStatus.id;
        console.log('🟠 [useTodoDatabase] 最終statusId:', finalStatusId);
      }
      
      console.log('🟠 [useTodoDatabase] Supabase insert開始');
      console.log('🟠 [useTodoDatabase] insert対象データ:', {
        user_id: userId,
        todo_title: title,
        todo_text: text,
        todo_status_id: finalStatusId,
        todo_priority_id: finalPriorityId,
      });
      
      const { data: inserted, error: insertError } = await supabase.from('todos').insert({
        user_id: userId,
        todo_title: title,
        todo_text: text,
        todo_status_id: finalStatusId,
        todo_priority_id: finalPriorityId,
      }).select(`
        *,
        priority:todo_priorities(*),
        status:todo_statuses(*)
      `).single();
      
      console.log('🟠 [useTodoDatabase] Supabase insert結果:', { inserted, insertError });
      
      if (insertError || !inserted) {
        console.log('🔴 [useTodoDatabase] insert失敗、例外投げ:', insertError);
        if (insertError) {
          throw insertError;
        }
        throw new Error('ToDoの追加に失敗しました');
      }
      
      console.log('🟠 [useTodoDatabase] insert成功、Todo返却');
      return inserted;
    }, 'useTodoDatabase.addTodo');
  }, [getDefaultPriorityId, retryTodoOperation]);

  // ToDo更新ロジック（Step 2-C-1: 自動リトライ機能適用）
  const updateTodo = useCallback(async (
    id: string,
    title: string,
    text: string,
    priorityId?: string,
    statusId?: string
  ): Promise<Todo | null> => {
    setError('');
    
    // Step 2-C-1: 自動リトライ機能適用 - updateTodo操作をリトライ対応
    return await retryTodoOperation(async () => {
      const updateData: { todo_title: string; todo_text: string; todo_priority_id?: string; todo_status_id?: string } = {
        todo_title: title,
        todo_text: text,
      };
      
      if (priorityId) {
        updateData.todo_priority_id = priorityId;
      }
      
      if (statusId) {
        updateData.todo_status_id = statusId;
      }
      
      const { error: updateError } = await supabase.from('todos').update(updateData).eq('id', id);
      
      if (updateError) {
        throw updateError;
      }
      
      // 更新されたToDoデータを取得
      const { data: updatedTodo, error: fetchError } = await supabase
        .from('todos')
        .select(`*, priority:todo_priorities(*), status:todo_statuses(*)`)
        .eq('id', id)
        .single();
      
      if (fetchError || !updatedTodo) {
        throw new Error('更新データの取得に失敗しました');
      }
      
      return updatedTodo;
    }, 'useTodoDatabase.updateTodo');
  }, [retryTodoOperation]);

  // ToDo削除ロジック（Step 2-C-1: 自動リトライ機能適用）
  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    // Step 2-C-1: 自動リトライ機能適用 - deleteTodo操作をリトライ対応
    const result = await retryTodoOperation(async () => {
      const { error: deleteError } = await supabase.from('todos').delete().eq('id', id);
      if (deleteError) {
        throw deleteError;
      }
      return true;
    }, 'useTodoDatabase.deleteTodo');
    
    return result !== null ? result : false;
  }, [retryTodoOperation]);

  return {
    error,
    setError,
    addTodo,
    updateTodo,
    deleteTodo
  };
}