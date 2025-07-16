import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Todo, SortOption } from '@/types/todo';
import { useTodoDatabase } from './useTodoDatabase';

/**
 * フィルタリング・検索・ソート・CRUD操作を統合管理するフック
 * 責任: データ取得・フィルタリング・ソート処理・CRUD操作制御・UI状態管理
 */
export function useFilteredTodos(userId: string | null, filterParams?: {
  priorityIds?: string[];
  statusIds?: string[];
  sortOption?: SortOption;
  searchKeyword?: string;
}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchTodosLoading, setIsFetchTodosLoading] = useState(false);
  const [error, setError] = useState('');
  
  // データベース操作フック
  const { error: databaseError, setError: setDatabaseError, addTodo: databaseAddTodo, updateTodo: databaseUpdateTodo, deleteTodo: databaseDeleteTodo, offlineState } = useTodoDatabase();
  
  // 前回のfilterParamsを保持（検索キーワードのみの変更を検知するため）
  const prevFilterParamsRef = useRef<typeof filterParams>(filterParams);

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

  // 無限ループ防止: filterParamsの安定化
  const priorityIdsString = filterParams?.priorityIds ? JSON.stringify([...filterParams.priorityIds].sort()) : undefined;
  const statusIdsString = filterParams?.statusIds ? JSON.stringify([...filterParams.statusIds].sort()) : undefined;
  
  const stableFilterParams = useMemo(() => {
    if (!filterParams) return undefined;
    return {
      priorityIds: filterParams.priorityIds ? [...filterParams.priorityIds].sort() : undefined,
      statusIds: filterParams.statusIds ? [...filterParams.statusIds].sort() : undefined,
      sortOption: filterParams.sortOption,
      searchKeyword: filterParams.searchKeyword
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorityIdsString, statusIdsString, filterParams?.sortOption, filterParams?.searchKeyword]);

  // データ取得関数を分離（再利用可能にする）
  const fetchTodos = useCallback(async (showMainLoading = true) => {
    if (!userId) {
      setIsLoading(true);
      return;
    }
    
    // 🔴 ローディング状態の分岐: 初回・認証時は全画面、検索・フィルター時は部分ローディング
    if (showMainLoading) {
      setIsLoading(true);
    } else {
      setIsFetchTodosLoading(true);
    }
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
      if (stableFilterParams?.priorityIds?.length) {
        query = query.in('todo_priority_id', stableFilterParams.priorityIds);
      }
      if (stableFilterParams?.statusIds?.length) {
        query = query.in('todo_status_id', stableFilterParams.statusIds);
      }
      
      // Phase 7: 検索機能実装 - タイトルと本文のOR検索
      if (stableFilterParams?.searchKeyword?.trim()) {
        const keyword = stableFilterParams.searchKeyword.trim();
        query = query.or(`todo_title.ilike.%${keyword}%,todo_text.ilike.%${keyword}%`);
      }
      
      // ソート適用（Phase 8: ソート機能強化）
      // 既存の固定ソートをパラメータベースに変更
      const sortOption = stableFilterParams?.sortOption || 'created_desc';
      query = applySortToQuery(query, sortOption);
      
      const { data: todosData, error: todosError } = await query;
      
      if (todosError) {
        throw todosError;
      }
      
      // クライアント側でのソート処理
      let sortedData = todosData || [];
      if (stableFilterParams?.sortOption) {
        switch (stableFilterParams.sortOption) {
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
      // 🔴 適切なローディング状態解除
      if (showMainLoading) {
        setIsLoading(false);
      } else {
        setIsFetchTodosLoading(false);
      }
    }
  }, [userId, applySortToQuery, stableFilterParams]); // stableFilterParamsで安定化

  useEffect(() => {
    // 検索キーワードのみが変更されたかを判定
    const prev = prevFilterParamsRef.current;
    const current = stableFilterParams;
    
    if (prev && current) {
      // 各パラメータを個別に比較
      const isPriorityIdsEqual = 
        JSON.stringify(prev.priorityIds?.sort()) === JSON.stringify(current.priorityIds?.sort());
      const isStatusIdsEqual = 
        JSON.stringify(prev.statusIds?.sort()) === JSON.stringify(current.statusIds?.sort());
      const isSortOptionEqual = prev.sortOption === current.sortOption;
      const isSearchKeywordChanged = prev.searchKeyword !== current.searchKeyword;
      
      // 検索キーワードのみが変更された場合
      if (isPriorityIdsEqual && isStatusIdsEqual && isSortOptionEqual && isSearchKeywordChanged) {
        console.log('🔵 検索キーワードのみ変更を検知 → 部分ローディング');
        fetchTodos(false); // 部分ローディング
      } else {
        console.log('🔵 その他の変更を検知 → 全画面ローディング');
        fetchTodos(true); // 全画面ローディング
      }
    } else {
      // 初回実行時
      console.log('🔵 初回実行 → 全画面ローディング');
      fetchTodos(true);
    }
    
    // 現在のfilterParamsを保存
    prevFilterParamsRef.current = stableFilterParams || undefined;
  }, [fetchTodos, stableFilterParams]);

  // ToDoリストの手動更新（追加・更新・削除後の状態反映用）
  const updateTodosList = useCallback((updater: (todos: Todo[]) => Todo[]) => {
    setTodos(updater);
  }, []);

  // データ再取得の公開メソッド
  const refetchTodos = useCallback((showMainLoading = true) => {
    fetchTodos(showMainLoading);
  }, [fetchTodos]);

  // フィルター適用状態の判定
  const hasActiveFilters = useCallback(() => {
    return stableFilterParams && (
      (stableFilterParams.priorityIds && stableFilterParams.priorityIds.length > 0) || 
      (stableFilterParams.statusIds && stableFilterParams.statusIds.length > 0) ||
      (stableFilterParams.sortOption && stableFilterParams.sortOption !== 'created_desc') || // デフォルト以外のソート
      (stableFilterParams.searchKeyword && stableFilterParams.searchKeyword.trim()) // 検索キーワードも判定に追加
    );
  }, [stableFilterParams]);

  // ToDo削除処理（フィルター考慮）
  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    try {
      const success = await databaseDeleteTodo(id);
      if (!success) return false;
      
      // 削除成功時: 登録・編集時と同じパターンでデータ再取得
      // フィルターまたはソートが適用されている場合は完全なデータ再取得
      if (hasActiveFilters()) {
        // フィルター適用時: 部分ローディングで再取得
        refetchTodos(false); // showMainLoading = false
      } else {
        // フィルターなし時: 既存の個別削除ロジックを維持（パフォーマンス重視）
        updateTodosList(prev => prev.filter(todo => todo.id !== id));
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }, [databaseDeleteTodo, hasActiveFilters, refetchTodos, updateTodosList]);

  // ToDo追加処理（フィルター考慮）
  const addTodo = useCallback(async (
    userId: string,
    title: string, 
    text: string, 
    priorityId?: string,
    statusId?: string
  ): Promise<Todo | null> => {
    console.log('🟡 [useFilteredTodos] addTodo開始:', { userId, title, text, priorityId, statusId });
    try {
      console.log('🟡 [useFilteredTodos] databaseAddTodo呼び出し開始');
      const newTodo = await databaseAddTodo(userId, title, text, priorityId, statusId);
      console.log('🟡 [useFilteredTodos] databaseAddTodo結果:', newTodo);
      if (!newTodo) {
        console.log('🔴 [useFilteredTodos] newTodoがnull、null返却');
        return null;
      }
      
      // フィルターまたはソートが適用されている場合は完全なデータ再取得
      // 新しく作成されたToDoがフィルター条件に合うかどうか、ソート順序に影響するかを正確に判定
      if (hasActiveFilters()) {
        console.log('🟡 [useFilteredTodos] フィルター適用中、refetchTodos実行');
        // フィルター適用時: 全体ローディングで再取得
        refetchTodos(); // showMainLoading = true (デフォルト)
      } else {
        console.log('🟡 [useFilteredTodos] フィルターなし、個別追加');
        // フィルターなし時: 既存の個別追加ロジックを維持（パフォーマンス重視）
        updateTodosList(prev => [newTodo, ...prev]);
      }
      
      console.log('🟡 [useFilteredTodos] addTodo成功、newTodo返却');
      return newTodo;
    } catch (error) {
      console.log('🔴 [useFilteredTodos] addTodo例外:', error);
      throw error;
    }
  }, [databaseAddTodo, hasActiveFilters, refetchTodos, updateTodosList]);

  // ToDo更新処理（フィルター考慮）
  const updateTodo = useCallback(async (
    id: string,
    title: string,
    text: string,
    priorityId?: string,
    statusId?: string
  ): Promise<Todo | null> => {
    try {
      const updatedTodo = await databaseUpdateTodo(id, title, text, priorityId, statusId);
      if (!updatedTodo) return null;
      
      // フィルターまたはソートが適用されている場合は完全なデータ再取得
      // フィルター条件に合わなくなったToDoが適切に除外され、ソート順序が正しく反映される
      if (hasActiveFilters()) {
        // フィルター適用時: 全体ローディングで再取得
        refetchTodos(); // showMainLoading = true (デフォルト)
      } else {
        // フィルターなし時: 既存の個別更新ロジックを維持（パフォーマンス重視）
        updateTodosList(prev => prev.map(todo => 
          todo.id === id ? updatedTodo : todo
        ));
      }
      
      return updatedTodo;
    } catch (error) {
      throw error;
    }
  }, [databaseUpdateTodo, hasActiveFilters, refetchTodos, updateTodosList]);

  // エラー状態の統合
  const combinedError = error || databaseError;
  const setCombinedError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setDatabaseError(errorMessage);
  }, [setDatabaseError]);

  return {
    todos,
    isLoading,
    isFetchTodosLoading,
    error: combinedError,
    setError: setCombinedError,
    updateTodosList,
    refetchTodos,
    deleteTodo,
    addTodo,
    updateTodo,
    offlineState
  };
}