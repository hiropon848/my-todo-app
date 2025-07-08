import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Todo, SortOption } from '@/types/todo';
import { useTodoPriorities } from './useTodoPriorities';

export function useTodos(userId: string | null, filterParams?: {
  priorityIds?: string[];
  statusIds?: string[];
  sortOption?: SortOption; // Phase 8: ソート機能強化で追加
  searchKeyword?: string; // Phase 7: 検索機能実装で追加
}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isToggleLoading] = useState<string | null>(null);
  const [isAddTodoLoading, setIsAddTodoLoading] = useState(false);
  const [isUpdateTodoLoading, setIsUpdateTodoLoading] = useState(false);
  const [isDeleteTodoLoading, setIsDeleteTodoLoading] = useState(false);

  // Priority情報を取得
  const { getDefaultPriorityId } = useTodoPriorities();

  // ソートクエリ構築関数（Phase 8: ソート機能強化）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applySortToQuery = useCallback((query: any, sortOption: SortOption = 'created_desc') => {
    switch (sortOption) {
      case 'created_desc':
        return query.order('created_at', { ascending: false });
      case 'created_asc':
        return query.order('created_at', { ascending: true });
      case 'updated_desc':
        return query.order('updated_at', { ascending: false });
      case 'updated_asc':
        return query.order('updated_at', { ascending: true });
      case 'priority_high':
      case 'priority_low':
      case 'state_progress':
      case 'state_no_progress':
        // リレーションフィールドでのソートはSupabaseでサポートされていないため、
        // データ取得後にクライアント側でソートする必要がある
        // 一旦、更新日時順でソートして返す
        return query.order('updated_at', { ascending: false });
      default:
        // フォールバック: デフォルトのソート（既存動作と同じ）
        return query.order('created_at', { ascending: false });
    }
  }, []);

  // データ取得関数を分離（再利用可能にする）
  const fetchTodos = useCallback(async () => {
    if (!userId) {
      setIsLoading(true);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // 基本クエリを構築（既存と同じ）
      let query = supabase
        .from('todos')
        .select(`
          *,
          priority:todo_priorities(*),
          status:todo_statuses(*)
        `)
        .eq('user_id', userId);
      
      // フィルターパラメータが存在する場合のみ適用（既存動作への影響なし）
      if (filterParams?.priorityIds?.length) {
        query = query.in('todo_priority_id', filterParams.priorityIds);
      }
      if (filterParams?.statusIds?.length) {
        query = query.in('todo_status_id', filterParams.statusIds);
      }
      
      // Phase 7: 検索機能実装 - タイトルと本文のOR検索
      if (filterParams?.searchKeyword?.trim()) {
        const keyword = filterParams.searchKeyword.trim();
        query = query.or(`todo_title.ilike.%${keyword}%,todo_text.ilike.%${keyword}%`);
      }
      
      // ソート適用（Phase 8: ソート機能強化）
      // 既存の固定ソートをパラメータベースに変更
      const sortOption = filterParams?.sortOption || 'created_desc';
      query = applySortToQuery(query, sortOption);
      
      const { data: todosData, error: todosError } = await query;
      
      if (todosError) {
        throw todosError;
      }
      
      // クライアント側でのソート処理
      let sortedData = todosData || [];
      if (filterParams?.sortOption) {
        switch (filterParams.sortOption) {
          case 'priority_high':
            // 優先度高い順（display_order昇順）
            sortedData = [...sortedData].sort((a, b) => {
              const orderA = a.priority?.display_order || 999;
              const orderB = b.priority?.display_order || 999;
              if (orderA !== orderB) return orderA - orderB;
              // 第2ソート: 更新日時新しい順
              return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            });
            break;
          case 'priority_low':
            // 優先度低い順（display_order降順）
            sortedData = [...sortedData].sort((a, b) => {
              const orderA = a.priority?.display_order || 0;
              const orderB = b.priority?.display_order || 0;
              if (orderA !== orderB) return orderB - orderA;
              // 第2ソート: 更新日時新しい順
              return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            });
            break;
          case 'state_progress':
            // 状態進捗順（display_order降順）
            sortedData = [...sortedData].sort((a, b) => {
              const orderA = a.status?.display_order || 0;
              const orderB = b.status?.display_order || 0;
              if (orderA !== orderB) return orderB - orderA;
              // 第2ソート: 更新日時新しい順
              return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            });
            break;
          case 'state_no_progress':
            // 状態未進捗順（display_order昇順）
            sortedData = [...sortedData].sort((a, b) => {
              const orderA = a.status?.display_order || 999;
              const orderB = b.status?.display_order || 999;
              if (orderA !== orderB) return orderA - orderB;
              // 第2ソート: 更新日時新しい順
              return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
            });
            break;
        }
      }
      
      setTodos(sortedData);
    } catch (error) {
      // エラーの詳細をログ出力（デバッグ用）
      if (process.env.NODE_ENV === 'development') {
        console.error('ToDoデータ取得エラー:', error);
      }
      
      // エラーの種類を判別
      if (error && typeof error === 'object' && 'code' in error) {
        // Supabaseのエラーコードで判別
        const errorCode = (error as { code: string }).code;
        if (errorCode === 'PGRST301') {
          // 認証エラー
          setError('認証エラーが発生しました。再度ログインしてください。');
        } else if (errorCode === 'PGRST116') {
          // 不正なフィルター条件
          setError('検索条件に問題があります。');
        } else {
          // その他のデータベースエラー
          setError('データの取得中にエラーが発生しました。');
        }
      } else {
        // 予期しないエラー
        setError('予期しないエラーが発生しました。');
      }
      
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, filterParams, applySortToQuery]); // useCallbackの依存配列（Phase 8: ソート機能対応）

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]); // fetchTodosが変化したときに実行

  // ToDo削除ロジック
  const deleteTodo = async (id: string) => {
    setIsDeleteTodoLoading(true);
    try {
      const { error: deleteError } = await supabase.from('todos').delete().eq('id', id);
      if (deleteError) {
        throw deleteError;
      }
      // 削除成功時のみUIを更新
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      setError('削除に失敗しました');
      throw error;
    } finally {
      setIsDeleteTodoLoading(false);
    }
  };

  // ToDo追加ロジック
  const addTodo = async (
    title: string, 
    text: string, 
    priorityId?: string,
    statusId?: string
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 addTodo called:', { title, text, priorityId, statusId });
    }
    setError('');
    if (!title.trim()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Title validation failed');
      }
      setError('タイトルは必須です');
      return false;
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
        return false;
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
          return false;
        }
        finalStatusId = defaultStatus.id;
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Default status ID:', finalStatusId);
        }
      }
      
      setIsAddTodoLoading(true);
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
        return false;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Todo inserted successfully:', inserted);
      }
      
      // フィルターまたはソートが適用されている場合は完全なデータ再取得
      // 新しく作成されたToDoがフィルター条件に合うかどうか、ソート順序に影響するかを正確に判定
      const hasActiveFilters = filterParams && (
        (filterParams.priorityIds && filterParams.priorityIds.length > 0) || 
        (filterParams.statusIds && filterParams.statusIds.length > 0) ||
        (filterParams.sortOption && filterParams.sortOption !== 'created_desc') || // デフォルト以外のソート
        (filterParams.searchKeyword && filterParams.searchKeyword.trim()) // Phase 7: 検索キーワードも判定に追加
      );
      
      if (hasActiveFilters) {
        // フィルター適用時: 完全なデータ再取得でフィルタリングを再実行
        await fetchTodos();
      } else {
        // フィルターなし時: 既存の個別追加ロジックを維持（パフォーマンス重視）
        setTodos(prev => [inserted, ...prev]);
      }
      
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Unexpected error in addTodo:', error);
      }
      const errorMessage = error instanceof Error ? error.message : 'ToDoの追加に失敗しました';
      setError(errorMessage);
      return false;
    } finally {
      setIsAddTodoLoading(false);
    }
  };

  // ToDo更新ロジック
  const updateTodo = async (
    id: string,
    title: string,
    text: string,
    priorityId?: string,
    statusId?: string
  ) => {
    setError('');
    setIsUpdateTodoLoading(true);
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
      
      // フィルターまたはソートが適用されている場合は完全なデータ再取得
      // フィルター条件に合わなくなったToDoが適切に除外され、ソート順序が正しく反映される
      const hasActiveFilters = filterParams && (
        (filterParams.priorityIds && filterParams.priorityIds.length > 0) || 
        (filterParams.statusIds && filterParams.statusIds.length > 0) ||
        (filterParams.sortOption && filterParams.sortOption !== 'created_desc') || // デフォルト以外のソート
        (filterParams.searchKeyword && filterParams.searchKeyword.trim()) // Phase 7: 検索キーワードも判定に追加
      );
      
      if (hasActiveFilters) {
        // フィルター適用時: 完全なデータ再取得でフィルタリングを再実行
        await fetchTodos();
      } else {
        // フィルターなし時: 既存の個別更新ロジックを維持（パフォーマンス重視）
        const { data: updatedTodo, error: fetchError } = await supabase
          .from('todos')
          .select(`*, priority:todo_priorities(*), status:todo_statuses(*)`)
          .eq('id', id)
          .single();
        
        if (fetchError || !updatedTodo) {
          throw new Error('更新データの取得に失敗しました');
        }
        
        setTodos(prev => prev.map(todo => 
          todo.id === id ? updatedTodo : todo
        ));
      }
      
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : '編集に失敗しました');
      return false;
    } finally {
      setIsUpdateTodoLoading(false);
    }
  };

  return { 
    todos, 
    setTodos, 
    isLoading, 
    error, 
    deleteTodo, 
    isToggleLoading,
    addTodo,
    isAddTodoLoading,
    isUpdateTodoLoading,
    isDeleteTodoLoading,
    updateTodo
  };
}