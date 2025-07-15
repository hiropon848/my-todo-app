import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Todo } from '@/types/todo';
import { useTodoPriorities } from './useTodoPriorities';

/**
 * ToDoデータベース操作を管理するフック
 * 責任: Supabaseとの直接的なCRUD操作・データ検証・エラーハンドリング
 */
export function useTodoDatabase() {
  const [error, setError] = useState('');
  const { getDefaultPriorityId } = useTodoPriorities();

  // ToDo追加ロジック
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
    
    try {
      const finalPriorityId = priorityId || getDefaultPriorityId();
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Priority ID:', finalPriorityId);
      }
      if (!finalPriorityId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ Failed to get priority ID');
        }
        setError('優先度データの取得に失敗しました');
        return null;
      }
      
      let finalStatusId = statusId;
      if (!finalStatusId) {
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 Fetching default status...');
        }
        const { data: defaultStatus, error: statusError } = await supabase
          .from('todo_statuses')
          .select('id')
          .eq('name', '未着手')
          .single();

        if (statusError || !defaultStatus) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Failed to get default status:', statusError);
          }
          setError('デフォルト状態の取得に失敗しました');
          return null;
        }
        finalStatusId = defaultStatus.id;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Default status ID:', finalStatusId);
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Inserting todo...');
      }
      
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
      
      if (insertError || !inserted) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Insert failed:', insertError);
        }
        setError('ToDoの追加に失敗しました');
        return null;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Todo inserted successfully:', inserted);
      }
      
      return inserted;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Unexpected error in addTodo:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'ToDoの追加に失敗しました';
      setError(errorMessage);
      return null;
    }
  }, [getDefaultPriorityId]);

  // ToDo更新ロジック
  const updateTodo = useCallback(async (
    id: string,
    title: string,
    text: string,
    priorityId?: string,
    statusId?: string
  ): Promise<Todo | null> => {
    setError('');
    try {
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
    } catch (error) {
      setError(error instanceof Error ? error.message : '編集に失敗しました');
      return null;
    }
  }, []);

  // ToDo削除ロジック
  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase.from('todos').delete().eq('id', id);
      if (deleteError) {
        throw deleteError;
      }
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : '削除に失敗しました');
      return false;
    }
  }, []);

  return {
    error,
    setError,
    addTodo,
    updateTodo,
    deleteTodo
  };
}