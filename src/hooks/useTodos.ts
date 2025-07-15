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
    updateTodo: filteredUpdateTodo
  } = useFilteredTodos(userId, filterParams);

  // 既存APIとの互換性維持: userIdを自動的に渡すラッパー関数
  const addTodo = async (
    title: string,
    text: string,
    priorityId?: string,
    statusId?: string
  ): Promise<boolean> => {
    if (!userId) {
      setError('ユーザーIDが無効です');
      return false;
    }
    const result = await filteredAddTodo(userId, title, text, priorityId, statusId);
    return result !== null;
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
    updateTodo
  };
}