import { SortOption } from '@/types/todo';
import { useFilteredTodos } from './useFilteredTodos';

/**
 * useTodos統合フック（既存インターフェース維持）
 * 統合後: useFilteredTodosから全機能を取得し、既存APIを維持
 */
export function useTodos(userId: string | null, filterParams?: {
  priorityIds?: string[];
  statusIds?: string[];
  sortOption?: SortOption;
  searchKeyword?: string;
}) {
  // 統合されたuseFilteredTodosから全機能を取得
  const {
    todos,
    isLoading,
    isFetchTodosLoading,
    error,
    setError,
    updateTodosList,
    deleteTodo,
    addTodo: filteredAddTodo,
    updateTodo: filteredUpdateTodo,
    offlineState
  } = useFilteredTodos(userId, filterParams);

  // 既存APIとの互換性維持: userIdを自動的に渡すラッパー関数（Step 2-C-2: エラー復旧UI対応）
  const addTodo = async (
    title: string,
    text: string,
    priorityId?: string,
    statusId?: string
  ): Promise<boolean> => {
    console.log('🟢 [useTodos] addTodo開始:', { userId, title, text, priorityId, statusId });
    
    if (!userId) {
      console.log('🔴 [useTodos] ユーザーID無効:', userId);
      setError('ユーザーIDが無効です');
      return false;
    }
    console.log('✅ [useTodos] ユーザーIDチェック通過');
    
    try {
      console.log('🟢 [useTodos] filteredAddTodo呼び出し開始');
      const result = await filteredAddTodo(userId, title, text, priorityId, statusId);
      console.log('🟢 [useTodos] filteredAddTodo結果:', result);
      const returnValue = result !== null;
      console.log('🟢 [useTodos] addTodo戻り値:', returnValue);
      return returnValue;
    } catch (error) {
      console.log('🔴 [useTodos] filteredAddTodo例外:', error);
      // Step 2-C-2: filteredAddTodoの例外を再投げして、todos/page.tsxのcatch文で復旧UI表示
      throw error;
    }
  };

  const updateTodo = async (
    id: string,
    title: string,
    text: string,
    priorityId?: string,
    statusId?: string
  ): Promise<boolean> => {
    const result = await filteredUpdateTodo(id, title, text, priorityId, statusId);
    return result !== null;
  };

  // 既存インターフェースを完全に維持
  return {
    todos,
    setTodos: updateTodosList,
    isLoading,
    isFetchTodosLoading,
    error,
    deleteTodo,
    addTodo,
    updateTodo,
    offlineState
  };
}