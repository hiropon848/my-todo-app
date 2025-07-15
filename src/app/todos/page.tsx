'use client';

import { useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { HeaderWithMenu } from '@/components/common/HeaderWithMenu';
import { useTodos } from '@/hooks/useTodos';
import { useToast } from '@/hooks/useToast';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useTodoPriorities } from '@/hooks/useTodoPriorities';
import { useTodoStatuses } from '@/hooks/useTodoStatuses';
import { useTodoSort } from '@/hooks/useTodoSort';
import { useSearchKeyword } from '@/hooks/useSearchKeyword';
import { SortOption } from '@/types/todo';
import { TodoSearchBar } from '@/components/todos/TodoSearchBar';
import { TodoList } from '@/components/todos/TodoList';
import { TodoModals } from '@/components/todos/TodoModals';
import { classifyError, logClassifiedError } from '@/utils/errorClassifier';
import { ErrorRecovery } from '@/components/common/ErrorRecovery';

function TodosPageContent() {
  const router = useRouter();
  const { user, isLoading, isLoggingOut, logout, updateUser } = useAuth();
  
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isTodoEditModalOpen, setIsTodoEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<{
    id: string;
    todo_title: string;
    todo_text: string;
    todo_priority_id?: string;
    todo_status_id?: string;
    priority?: {
      id: string;
      name: string;
      color_code: string;
    };
  } | null>(null);
  const [isTodoDeleteModalOpen, setIsTodoDeleteModalOpen] = useState(false);
  const [deletingTodo, setDeletingTodo] = useState<{ id: string; todo_title: string } | null>(null);
  const [isTodoAddModalOpen, setIsTodoAddModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  
  // Step 2-C-2: 手動復旧UI状態管理
  const [lastError, setLastError] = useState<ReturnType<typeof classifyError> | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Phase 7: 検索ワード入力の状態管理
  const [searchInput, setSearchInput] = useState('');

  // Phase 2: URLフィルター管理とConditionModal初期値状態
  const { getFiltersFromURL, currentFilters } = useURLFilters();
  // Phase 8: ソート機能強化で追加
  const { getSortFromURL, currentSort } = useTodoSort();
  // Phase 7: 検索機能実装で追加
  const { currentSearchKeyword } = useSearchKeyword();
  const [conditionModalInitialState, setConditionModalInitialState] = useState({
    priorities: new Set<string>(),
    statuses: new Set<string>(),
    // Phase 8: ソート機能強化でソート初期値を追加
    sortOption: 'created_desc' as SortOption
  });

  const { priorities, isLoading: prioritiesLoading, getPriorityByName } = useTodoPriorities();
  const { todoStatuses, isLoading: statusesLoading, getTodoStatusByName } = useTodoStatuses();
  const [activeFilters, setActiveFilters] = useState<{
    priorityIds: string[];
    statusIds: string[];
  }>({ priorityIds: [], statusIds: [] });



  // 無限ループ解消: 配列参照を安定化
  const priorityIdsString = JSON.stringify(activeFilters.priorityIds);
  const statusIdsString = JSON.stringify(activeFilters.statusIds);
  
  const filterParams = useMemo(() => {
    return {
      priorityIds: activeFilters.priorityIds,
      statusIds: activeFilters.statusIds,
      sortOption: currentSort, // Phase 8: ソート機能強化で追加
      searchKeyword: currentSearchKeyword // Phase 7: 検索機能実装で追加
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priorityIdsString, statusIdsString, currentSort, currentSearchKeyword]);

  // Phase 4: useTodosカスタムフック（フィルターパラメータ付き）
  const { 
    todos, 
    isLoading: loading, 
    isFetchTodosLoading, // 🔴 新規: 部分ローディング
    error: todosError, 
    deleteTodo, 
    addTodo,
    updateTodo
  } = useTodos(user?.id || null, filterParams);
  
  const { toast, showToast, hideToast } = useToast();


  // 認証チェック（AuthContextで管理されているが、未認証時のリダイレクト処理）
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // メニューの開閉制御
  const toggleMenu = (todoId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === todoId ? null : todoId);
  };

  // 編集開始（モーダルを開く）
  const startEdit = (todo: {
    id: string;
    todo_title: string;
    todo_text: string;
    todo_priority_id?: string;
    todo_status_id?: string;
    priority?: {
      id: string;
      name: string;
      color_code: string;
    };
  }) => {
    setEditingTodo(todo);
    setIsTodoEditModalOpen(true);
    setOpenMenuId(null);
  };

  // Step 2-C-2: 手動復旧UI用のリトライ関数
  const handleRetry = async () => {
    if (!lastError) return;
    
    setIsRetrying(true);
    setLastError(null); // エラー表示をクリア
    
    try {
      // 最後に失敗した操作を判定して適切な処理を実行
      // 実際の実装では、失敗した操作の種類を保存して対応する
      // ここでは例として、最後のエラーがあった場合にページリロードを提案
      setTimeout(() => {
        setIsRetrying(false);
        showToast('再試行しました。問題が続く場合はページを再読み込みしてください。', 'success');
      }, 1000);
    } catch (error) {
      setIsRetrying(false);
      const classifiedError = classifyError(error);
      setLastError(classifiedError);
      if (process.env.NODE_ENV === 'development') {
        logClassifiedError(classifiedError, 'TodosPage.handleRetry');
      }
    }
  };

  // モーダル保存処理（Step 2-C-2: エラー復旧UI統合）
  const handleModalSave = async (id: string, title: string, text: string, priorityId?: string, statusId?: string) => {
    setError('');
    setLastError(null); // エラー復旧UIをクリア
    try {
      const success = await updateTodo(id, title, text, priorityId, statusId);
      if (success) {
        setIsTodoEditModalOpen(false);
        // モーダルのアニメーション完了後にトースト表示
        setTimeout(() => {
          showToast('ToDoを更新しました', 'success');
        }, 300);
        return true;
      }
      showToast('更新に失敗しました', 'error');
      return false;
    } catch (error) {
      // Step 2-A,2-B,2-C-2: エラー分類システム適用とエラー復旧UI表示
      const classifiedError = classifyError(error);
      if (process.env.NODE_ENV === 'development') {
        logClassifiedError(classifiedError, 'TodosPage.handleModalSave');
      }
      // Step 2-C-2: エラー復旧UI表示（Toastと併用）
      setLastError(classifiedError);
      showToast('ToDoの更新に失敗しました', 'error');
      return false;
    }
  };

  // モーダルキャンセル処理
  const handleModalCancel = () => {
    setIsTodoEditModalOpen(false);
    setEditingTodo(null);
  };

  // 削除開始（確認モーダルを開く）
  const startDelete = (todo: { id: string; todo_title: string }) => {
    setDeletingTodo(todo);
    setIsTodoDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  // 削除確認処理（Step 2-C-2: エラー復旧UI統合）
  const handleDeleteConfirm = async () => {
    if (!deletingTodo) return;
    
    setLastError(null); // エラー復旧UIをクリア
    try {
      await deleteTodo(deletingTodo.id);
      setIsTodoDeleteModalOpen(false);
      // モーダルのアニメーション完了後にトースト表示
      setTimeout(() => {
        showToast('ToDoを削除しました', 'success');
      }, 300);
    } catch (error) {
      // Step 2-A,2-B,2-C-2: エラー分類システム適用とエラー復旧UI表示
      const classifiedError = classifyError(error);
      if (process.env.NODE_ENV === 'development') {
        logClassifiedError(classifiedError, 'TodosPage.handleDeleteConfirm');
      }
      // Step 2-C-2: エラー復旧UI表示（Toastと併用）
      setLastError(classifiedError);
      showToast('ToDoの削除に失敗しました', 'error');
    }
  };

  // 削除キャンセル処理
  const handleDeleteCancel = () => {
    setIsTodoDeleteModalOpen(false);
    setDeletingTodo(null);
  };


  // 追加モーダル開始
  const handleAddClick = () => {
    setIsTodoAddModalOpen(true);
  };

  // 追加モーダル保存処理（Step 2-C-2: エラー復旧UI統合）
  const handleAddModalSave = async (title: string, text: string, priorityId?: string, statusId?: string) => {
    console.log('🚀 handleAddModalSave called:', { title, text, priorityId, statusId });
    setLastError(null); // エラー復旧UIをクリア
    try {
      const success = await addTodo(title, text, priorityId, statusId);
      console.log('📊 addTodo result:', success);
      if (success) {
        setIsTodoAddModalOpen(false);
        // モーダルのアニメーション完了後にトースト表示
        setTimeout(() => {
          console.log('✨ Showing success toast');
          showToast('ToDoを作成しました', 'success');
        }, 300);
        return true;
      }
      console.log('❌ Showing error toast');
      showToast('作成に失敗しました', 'error');
      return false;
    } catch (error) {
      // Step 2-A,2-B,2-C-2: エラー分類システム適用とエラー復旧UI表示
      const classifiedError = classifyError(error);
      if (process.env.NODE_ENV === 'development') {
        logClassifiedError(classifiedError, 'TodosPage.handleAddModalSave');
      }
      // Step 2-C-2: エラー復旧UI表示（Toastと併用）
      setLastError(classifiedError);
      showToast('ToDoの追加に失敗しました', 'error');
      return false;
    }
  };

  // 追加モーダルキャンセル処理
  const handleAddModalCancel = () => {
    setIsTodoAddModalOpen(false);
  };

  // ログアウト処理（Contextのlogout関数を使用）
  const handleLogout = logout;

  // Phase 4: ConditionModal保存ハンドラー（フィルター統合）
  // Phase 8: ソート機能強化でSortOptionパラメータを追加
  const handleConditionSave = async (selectedPriorities: Set<string>, selectedStatuses: Set<string>, sortOption: SortOption) => {
    const priorityNames = Array.from(selectedPriorities);
    const statusNames = Array.from(selectedStatuses);
    
    // 名前→IDの変換
    console.log('🔍 デバッグ - マスタデータ状態:', {
      prioritiesData: priorities?.map(p => ({id: p.id, name: p.name})),
      todoStatusesData: todoStatuses?.map(s => ({id: s.id, name: s.name})),
      prioritiesLoading,
      statusesLoading
    });
    
    const priorityIds = priorityNames
      .map(name => {
        const found = getPriorityByName(name);
        console.log(`🔍 優先度検索: "${name}" → `, found);
        return found?.id;
      })
      .filter((id): id is string => id !== undefined);
      
    const statusIds = statusNames
      .map(name => {
        const found = getTodoStatusByName(name);
        console.log(`🔍 状態検索: "${name}" → `, found);
        return found?.id;
      })
      .filter((id): id is string => id !== undefined);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 フィルター保存:', {
        priorityNames, statusNames,
        priorityIds, statusIds
      });
    }
    
    // URL更新（一括処理で競合回避）
    console.log('🔍 URL更新直前:', { priorityNames, statusNames, sortOption });
    
    // URLSearchParamsを一度にまとめて更新
    const params = new URLSearchParams();
    
    // Phase 7: 検索キーワード保持（フィルター変更時に検索キーワードを維持）
    if (currentSearchKeyword) {
      params.set('keyword', currentSearchKeyword);
    }
    
    // フィルターパラメータ設定
    if (priorityNames.length > 0) {
      params.set('priorities', priorityNames.join(','));
    }
    if (statusNames.length > 0) {
      params.set('statuses', statusNames.join(','));
    }
    
    // ソートパラメータ設定（デフォルト値以外の場合のみ）
    if (sortOption !== 'created_desc') {
      params.set('sort', sortOption);
    }
    
    // URL更新を一度に実行（履歴に追加してブラウザバック対応）
    const queryString = params.toString();
    const urlString = queryString ? `/todos?${queryString}` : '/todos';
    console.log('🔍 一括URL更新実行:', urlString);
    router.push(urlString);
    console.log('🔍 一括URL更新完了');
    // アクティブフィルター更新（IDベース）
    setActiveFilters({ priorityIds, statusIds });
    setIsConditionModalOpen(false);
    return true;
  };


  useEffect(() => {
    if (!prioritiesLoading && !statusesLoading && priorities && todoStatuses) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 URL変化検知:', { 
          priorities: currentFilters.priorities, 
          statuses: currentFilters.statuses,
          currentSort,
          availablePriorities: priorities.map(p => p.name),
          availableStatuses: todoStatuses.map(s => s.name)
        });
      }
      
      // ConditionModal初期値更新
      setConditionModalInitialState({
        priorities: new Set(currentFilters.priorities),
        statuses: new Set(currentFilters.statuses),
        // Phase 8: ソート機能強化でソート状態も復元
        sortOption: currentSort
      });
      
      // アクティブフィルター更新（名前→IDの変換）
      const priorityIds = currentFilters.priorities
        ?.map(name => {
          const priority = getPriorityByName(name);
          if (!priority) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`⚠️ 不明な優先度名: ${name}`);
            }
          }
          return priority?.id;
        })
        .filter((id): id is string => id !== undefined) || [];
      
      const statusIds = currentFilters.statuses
        ?.map(name => {
          const status = getTodoStatusByName(name);
          if (!status) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`⚠️ 不明なステータス名: ${name}`);
            }
          }
          return status?.id;
        })
        .filter((id): id is string => id !== undefined) || [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 アクティブフィルター更新:', { 
          priorityIds, 
          statusIds,
          fromNames: { priorities: currentFilters.priorities, statuses: currentFilters.statuses }
        });
      }
      
      // 状態の安定化：前回と同じ値の場合は更新をスキップ
      setActiveFilters(prev => {
        const isSame = 
          prev.priorityIds.length === priorityIds.length &&
          prev.statusIds.length === statusIds.length &&
          prev.priorityIds.every(id => priorityIds.includes(id)) &&
          prev.statusIds.every(id => statusIds.includes(id));
        
        if (isSame) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🎯 アクティブフィルター変更なし、更新スキップ');
          }
          return prev;
        }
        
        return { priorityIds, statusIds };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prioritiesLoading, statusesLoading, currentFilters, priorities, todoStatuses, currentSort]); // マスタデータとソート状態も監視

  // Phase 7: 検索ワード入力とURL同期
  useEffect(() => {
    // URLの検索キーワードと入力フィールドを同期
    setSearchInput(currentSearchKeyword);
  }, [currentSearchKeyword]);

  // Phase 7: 検索専用URL更新関数（handleConditionSaveパターンを踏襲）
  const handleSearchUpdate = useCallback((keyword: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 検索URL更新開始:', { keyword, currentSearchKeyword });
      }
      
      // URLSearchParamsを一度にまとめて更新（既存パターン踏襲）
      const params = new URLSearchParams();
      
      // 検索キーワード設定
      const trimmedKeyword = keyword.trim();
      if (trimmedKeyword) {
        params.set('keyword', trimmedKeyword);
      }
      // 空の場合はparams.delete('keyword')ではなく、パラメータ自体を設定しない
      
      // 既存のフィルターパラメータを保持（handleConditionSaveと同じ方式）
      const currentFiltersFromURL = getFiltersFromURL();
      if (currentFiltersFromURL.priorities && currentFiltersFromURL.priorities.length > 0) {
        params.set('priorities', currentFiltersFromURL.priorities.join(','));
      }
      if (currentFiltersFromURL.statuses && currentFiltersFromURL.statuses.length > 0) {
        params.set('statuses', currentFiltersFromURL.statuses.join(','));
      }
      
      // 既存のソートパラメータを保持
      const currentSortFromURL = getSortFromURL();
      if (currentSortFromURL !== 'created_desc') {
        params.set('sort', currentSortFromURL);
      }
      
      // URL更新を一度に実行（履歴に追加してブラウザバック対応）
      const queryString = params.toString();
      const urlString = queryString ? `/todos?${queryString}` : '/todos';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 検索URL更新実行:', urlString);
      }
      
      router.push(urlString);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 検索URL更新完了');
      }
    } catch (error) {
      // Step 2-A: エラー分類システム適用
      const classifiedError = classifyError(error);
      if (process.env.NODE_ENV === 'development') {
        logClassifiedError(classifiedError, 'TodosPage.handleSearchUpdate');
      }
      // URL更新に失敗してもアプリケーションは継続動作
    }
  }, [currentSearchKeyword, getFiltersFromURL, getSortFromURL, router]);


  // Step 2: URL更新専用関数（検索実行とは分離）
  const updateSearchURL = useCallback((keyword: string) => {
    if (keyword !== currentSearchKeyword) {
      handleSearchUpdate(keyword);
    }
  }, [currentSearchKeyword, handleSearchUpdate]);

  const handleConditionModalOpen = () => {
    const urlFilters = getFiltersFromURL();
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 ConditionModal開く:', { 
        urlFilters,
        currentSort,
        currentState: {
          priorities: Array.from(conditionModalInitialState.priorities),
          statuses: Array.from(conditionModalInitialState.statuses),
          sortOption: conditionModalInitialState.sortOption
        }
      });
    }
    setConditionModalInitialState({
      priorities: new Set(urlFilters.priorities),
      statuses: new Set(urlFilters.statuses),
      // Phase 8: ソート機能強化でソート状態も復元
      sortOption: currentSort
    });
    setIsConditionModalOpen(true);
  };

  // ログアウト処理中の表示（最優先・他の条件を完全に無視）
  if (isLoggingOut) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚪 TodosPage showing logout LoadingScreen (priority)');
    }
    return <LoadingScreen message="ログアウト処理実行中..." />;
  }

  // ログアウト処理中でない場合のみ、他の条件を評価
  if (!isLoggingOut && (isLoading || !user || loading || prioritiesLoading || statusesLoading)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('📺 PROBLEMATIC: TodosPage showing LoadingScreen', {
        reason: isLoading ? 'isLoading' : !user ? 'no user' : 'loading',
        isLoggingOut: false // 確実にfalse
      });
    }
    return <LoadingScreen />;
  }

  // この時点でuserは確実に存在する（上記の条件でnullは除外済み）
  if (!user) {
    return <LoadingScreen />; // 安全のための追加チェック
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* 背景グラデーションレイヤー */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(120deg, #a8edea 0%, #fed6e3 100%)',
          minHeight: '100vh',
          width: '100vw',
        }}
      />
      {/* ヘッダー＋メイン全体ラッパー */}
      <div className="rounded-2xl shadow-2xl bg-white/15 border border-white/30 w-full max-w-2xl mx-auto my-6">
        <HeaderWithMenu
          title="あなたのToDo"
          user={user ? { id: user.id, lastName: user.lastName, firstName: user.firstName } : null}
          onLogoutClick={handleLogout}
          onAddClick={handleAddClick}
          onUserUpdate={updateUser}
        />
        <main className="px-2 pt-6 pb-6">
          {/* Step 2-C-2: エラー復旧UI表示 */}
          {lastError && (
            <div className="mb-4">
              <ErrorRecovery
                error={lastError}
                onRetry={handleRetry}
                isRetrying={isRetrying}
              />
            </div>
          )}
          
          {/* 従来のエラーメッセージ（エラー復旧UIと併用） */}
          {(error || todosError) && !lastError && (
            <div className="mb-4 text-red-600 font-semibold text-sm text-center">
              {error || todosError}
            </div>
          )}

          {/* 検索・フィルターバー */}
          <TodoSearchBar
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={updateSearchURL}
            onSearchClear={() => {
              setSearchInput('');
              updateSearchURL('');
            }}
            activeFilters={activeFilters}
            priorities={priorities}
            todoStatuses={todoStatuses}
            onConditionModalOpen={handleConditionModalOpen}
          />
          {/* ToDoリスト */}
          <TodoList
            todos={todos}
            isFetchTodosLoading={isFetchTodosLoading}
            openMenuId={openMenuId}
            onToggleMenu={toggleMenu}
            onStartEdit={startEdit}
            onStartDelete={startDelete}
          />
        </main>
      </div>

      {/* モーダル・トースト管理 */}
      <TodoModals
        isTodoAddModalOpen={isTodoAddModalOpen}
        onAddModalSave={handleAddModalSave}
        onAddModalCancel={handleAddModalCancel}
        editingTodo={editingTodo}
        isTodoEditModalOpen={isTodoEditModalOpen}
        onEditModalSave={handleModalSave}
        onEditModalCancel={handleModalCancel}
        isTodoDeleteModalOpen={isTodoDeleteModalOpen}
        deletingTodo={deletingTodo}
        onDeleteConfirm={handleDeleteConfirm}
        onDeleteCancel={handleDeleteCancel}
        isConditionModalOpen={isConditionModalOpen}
        conditionModalInitialState={conditionModalInitialState}
        onConditionSave={handleConditionSave}
        onConditionCancel={() => setIsConditionModalOpen(false)}
        toast={toast}
        onToastClose={hideToast}
      />
    </div>
  );
}

export default function TodosPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <TodosPageContent />
    </Suspense>
  );
} 