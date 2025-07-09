'use client';

import { useEffect, useState, Suspense, useMemo, useCallback } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { HeaderWithMenu } from '@/components/common/HeaderWithMenu';
import { useTodos } from '@/hooks/useTodos';
import { TodoEditModal } from '@/components/TodoEditModal';
import { TodoAddModal } from '@/components/TodoAddModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { ProfileModal } from '@/components/common/ProfileModal';
import { ConditionModal } from '@/components/common/ConditionModal';
import { Toast } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';
import SubMenuIcon from '@/icons/menu-sub.svg';
import SortAndFilterIcon from '@/icons/sort-and-filter.svg';
import SearchIcon from '@/icons/search.svg';
import CloseIcon from '@/icons/close.svg';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useProfile } from '@/hooks/useProfile';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useTodoPriorities } from '@/hooks/useTodoPriorities';
import { useTodoStatuses } from '@/hooks/useTodoStatuses';
import { useTodoSort } from '@/hooks/useTodoSort';
import { useSearchKeyword } from '@/hooks/useSearchKeyword';
import { SortOption } from '@/types/todo';
import { TodoListLoadingOverlay } from '@/components/common/TodoListLoadingOverlay';

function TodosPageContent() {
  const router = useRouter();
  const { user, isLoading, isLoggingOut, logout, updateUser } = useAuth();
  
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showTodoEditModal, setShowTodoEditModal] = useState(false);
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
  const [showTodoDeleteModal, setShowTodoDeleteModal] = useState(false);
  const [deletingTodo, setDeletingTodo] = useState<{ id: string; todo_title: string } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTodoAddModal, setShowTodoAddModal] = useState(false);
  const [showConditionModal, setShowConditionModal] = useState(false);

  // Phase 7: 検索ワード入力の状態管理
  const [searchInput, setSearchInput] = useState('');

  // Phase 2: URLフィルター管理とConditionModal初期値状態
  const { getFiltersFromURL, currentFilters } = useURLFilters();
  // Phase 8: ソート機能強化で追加
  const { getSortFromURL, currentSort } = useTodoSort();
  // Phase 7: 検索機能実装で追加
  const { getSearchKeywordFromURL, currentSearchKeyword } = useSearchKeyword();
  // Phase 8: 後続ステップで使用予定のため未使用変数警告を抑制
  void getSortFromURL;
  void getSearchKeywordFromURL;
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



  const filterParams = useMemo(() => {
    return {
      priorityIds: activeFilters.priorityIds,
      statusIds: activeFilters.statusIds,
      sortOption: currentSort, // Phase 8: ソート機能強化で追加
      searchKeyword: currentSearchKeyword // Phase 7: 検索機能実装で追加
    };
  }, [activeFilters.priorityIds, activeFilters.statusIds, currentSort, currentSearchKeyword]);

  // Phase 4: useTodosカスタムフック（フィルターパラメータ付き）
  const { 
    todos, 
    isLoading: loading, 
    isFetchTodosLoading, // 🔴 新規: 部分ローディング
    error: todosError, 
    deleteTodo, 
    isToggleLoading: _isToggleLoading,
    addTodo,
    updateTodo,
    isAddTodoLoading: _isAddTodoLoading,
    isUpdateTodoLoading: _isUpdateTodoLoading,
    isDeleteTodoLoading: _isDeleteTodoLoading
  } = useTodos(user?.id || null, filterParams);
  
  // 未使用変数の警告を抑制（メニューボタンで使用予定だが現在は無効化）
  void _isToggleLoading;
  void _isAddTodoLoading;
  void _isUpdateTodoLoading;
  void _isDeleteTodoLoading;
  const { toast, showToast, hideToast } = useToast();

  const { updateProfile } = useProfile();

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
    setShowTodoEditModal(true);
    setOpenMenuId(null);
  };

  // モーダル保存処理
  const handleModalSave = async (id: string, title: string, text: string, priorityId?: string, statusId?: string) => {
    setError('');
    try {
      const success = await updateTodo(id, title, text, priorityId, statusId);
      if (success) {
        setShowTodoEditModal(false);
        // モーダルのアニメーション完了後にトースト表示
        setTimeout(() => {
          showToast('ToDoを更新しました', 'success');
        }, 300);
        return true;
      }
      showToast('更新に失敗しました', 'error');
      return false;
    } catch {
      showToast('更新に失敗しました', 'error');
      return false;
    }
  };

  // モーダルキャンセル処理
  const handleModalCancel = () => {
    setShowTodoEditModal(false);
    setEditingTodo(null);
  };

  // 削除開始（確認モーダルを開く）
  const startDelete = (todo: { id: string; todo_title: string }) => {
    setDeletingTodo(todo);
    setShowTodoDeleteModal(true);
    setOpenMenuId(null);
  };

  // 削除確認処理
  const handleDeleteConfirm = async () => {
    if (!deletingTodo) return;
    
    try {
      await deleteTodo(deletingTodo.id);
      setShowTodoDeleteModal(false);
      // モーダルのアニメーション完了後にトースト表示
      setTimeout(() => {
        showToast('ToDoを削除しました', 'success');
      }, 300);
    } catch {
      showToast('削除に失敗しました', 'error');
    }
  };

  // 削除キャンセル処理
  const handleDeleteCancel = () => {
    setShowTodoDeleteModal(false);
    setDeletingTodo(null);
  };

  // プロフィール編集開始
  const handleProfileClick = () => {
    setShowProfileModal(true);
  };

  // プロフィール保存処理
  const handleProfileSave = async (lastName: string, firstName: string) => {
    if (!user) return false;
    
    try {
      const success = await updateProfile(user.id, lastName, firstName);
      if (!success) {
        showToast('プロフィールの更新に失敗しました', 'error');
        return false;
      }
      
      // 先にモーダルを閉じる
      setShowProfileModal(false);
      
      // アニメーション完了後にAuthContext更新とトースト表示
      setTimeout(() => {
        updateUser({ lastName, firstName });
        showToast('プロフィールを更新しました', 'success');
      }, 300);
      return true;
    } catch {
      showToast('プロフィールの更新に失敗しました', 'error');
      return false;
    }
  };

  // プロフィールキャンセル処理
  const handleProfileCancel = () => {
    setShowProfileModal(false);
  };

  // 追加モーダル開始
  const handleAddClick = () => {
    setShowTodoAddModal(true);
  };

  // 追加モーダル保存処理
  const handleAddModalSave = async (title: string, text: string, priorityId?: string, statusId?: string) => {
    console.log('🚀 handleAddModalSave called:', { title, text, priorityId, statusId });
    try {
      const success = await addTodo(title, text, priorityId, statusId);
      console.log('📊 addTodo result:', success);
      if (success) {
        setShowTodoAddModal(false);
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
      console.error('❌ Unexpected error in handleAddModalSave:', error);
      showToast('作成に失敗しました', 'error');
      return false;
    }
  };

  // 追加モーダルキャンセル処理
  const handleAddModalCancel = () => {
    setShowTodoAddModal(false);
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
    setShowConditionModal(false);
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
      console.error('検索URL更新エラー:', error);
      // URL更新に失敗してもアプリケーションは継続動作
    }
  }, [currentSearchKeyword, getFiltersFromURL, getSortFromURL, router]);

  // Phase 7: 検索実行関数（Enter時・フォーカス離脱時に実行）
  const executeSearch = useCallback(() => {
    if (searchInput !== currentSearchKeyword) {
      handleSearchUpdate(searchInput);
    }
  }, [searchInput, currentSearchKeyword, handleSearchUpdate]);

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
    setShowConditionModal(true);
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
        className="absolute inset-0 -z-10"
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
          user={user ? { lastName: user.lastName, firstName: user.firstName } : null}
          onProfileClick={handleProfileClick}
          onLogoutClick={handleLogout}
          onAddClick={handleAddClick}
        />
        <main className="px-2 pt-6 pb-6">
          {/* エラーメッセージ */}
          {(error || todosError) && (
            <div className="mb-4 text-red-600 font-semibold text-sm text-center">
              {error || todosError}
            </div>
          )}


          {/* フィルターボタン */}
          <div className="flex flex-col mb-6 bg-white/30 rounded-xl border border-white/20 shadow">
            {/* 検索条件ヘッダー */}
            <div className="px-4 py-2 border-b border-white/30">
              <h3 className="text-sm font-semibold text-gray-700">検索条件</h3>
            </div>
            
            <div className="px-4 py-2">
              {/* フィルター条件表示とボタン */}
              <div className="flex items-center justify-between mb-3">
                {/* 優先度・状態のフィルター有無のみで判定（検索キーワードは除外） */}
                {(activeFilters.priorityIds.length > 0 || activeFilters.statusIds.length > 0) ? (
                  <div className="flex items-center gap-3">
                    {/* 優先度バッジ */}
                    {activeFilters.priorityIds.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600">[優先度]</span>
                        {activeFilters.priorityIds.map(id => {
                          const priority = priorities?.find(p => p.id === id);
                          return priority ? (
                            <PriorityBadge key={priority.id} priority={priority} size="sm" />
                          ) : null;
                        })}
                      </div>
                    )}
                    {/* ステータスバッジ */}
                    {activeFilters.statusIds.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600">[状態]</span>
                        {activeFilters.statusIds.map(id => {
                          const status = todoStatuses?.find(s => s.id === id);
                          return status ? (
                            <StatusBadge key={status.id} status={status} size="sm" />
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">絞り込み/並び替え なし</span>
                )}
                
                {/* フィルター/ソートボタン */}
                <button
                  onClick={handleConditionModalOpen}
                  className="p-3 rounded-full hover:bg-black/10 transition-colors"
                >
                  <SortAndFilterIcon 
                    width="22" 
                    height="22" 
                    className="text-[#374151]"
                  />
                </button>
              </div>
              
              {/* 検索フィールド */}
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      executeSearch();
                    }
                  }}
                  onBlur={executeSearch}
                  placeholder="タイトルまたは本文"
                  className="w-full pl-10 pr-10 py-2 bg-white/50 border border-white/30 rounded-lg 
                           text-sm placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-blue-500/30 focus:border-blue-500/50
                           backdrop-blur-sm transition-all duration-300"
                />
                <SearchIcon 
                  width="20" 
                  height="20" 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                {/* クリアボタン */}
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      // クリア時は即座に検索実行（空文字での検索）
                      if (currentSearchKeyword) {
                        handleSearchUpdate('');
                      }
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
                    aria-label="検索をクリア"
                  >
                    <CloseIcon 
                      width="16" 
                      height="16" 
                      className="text-gray-600"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* ToDoリスト */}
          <div className="bg-white/30 rounded-xl border border-white/20 shadow relative">
            {/* ToDoヘッダー */}
            <div className="px-4 py-2 border-b border-white/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">ToDo</h3>
              <span className="text-sm text-blue-600 font-bold">{todos.length} 件</span>
            </div>
            
            {/* 検索実行時の部分ローディングオーバーレイ */}
            <TodoListLoadingOverlay isVisible={isFetchTodosLoading} />
            
            {todos.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                該当するToDoがありません
              </div>
            ) : (
              todos.map((todo, index) => {
              const isFirst = index === 0;
              const isLast = index === todos.length - 1;
              const isSingle = todos.length === 1;
              
              let roundedClass = '';
              let borderClass = '';
              if (isSingle) {
                roundedClass = 'rounded-xl';
                borderClass = '';
              } else if (isFirst) {
                roundedClass = 'rounded-t-xl';
                borderClass = 'border-b border-white/20';
              } else if (isLast) {
                roundedClass = 'rounded-b-xl';
                borderClass = '';
              } else {
                roundedClass = 'rounded-none';
                borderClass = 'border-b border-white/20';
              }
              
              return (
                <div
                  key={todo.id}
                  className={`${roundedClass} ${borderClass} p-4 relative group`}
                >
                {/* メニューボタン */}
                <button
                  onClick={(e) => toggleMenu(todo.id, e)}
                  className="absolute top-4 right-4 p-3 hover:bg-black/10 rounded-full transition-colors"
                >
                  <SubMenuIcon width="22" height="22" className="text-[#374151]" />
                </button>

                {/* メニュー */}
                {openMenuId === todo.id && (
                  <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg py-2 z-10">
                    <button
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                      onClick={() => startEdit(todo)}
                    >
                      編集
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 transition-colors"
                      onClick={() => startDelete(todo)}
                    >
                      削除
                    </button>
                  </div>
                )}

                {/* ToDo内容 */}
                <div className="pr-12">
                  <h3 className="font-bold text-lg text-text leading-none pr-8">{todo.todo_title}</h3>
                  <div className="flex gap-2 mt-2">
                    {todo.priority && <PriorityBadge priority={todo.priority} size="sm" />}
                    {todo.status && <StatusBadge status={todo.status} size="sm" />}
                  </div>
                  <div className="text-text text-sm whitespace-pre-wrap mt-2">{todo.todo_text}</div>
                </div>
                </div>
              );
            })
            )}
          </div>
        </main>
      </div>

      {/* 追加モーダル */}
      <TodoAddModal
        isOpen={showTodoAddModal}
        onSave={handleAddModalSave}
        onCancel={handleAddModalCancel}
      />

      {/* 編集モーダル */}
      <TodoEditModal
        todo={editingTodo}
        isOpen={showTodoEditModal}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
      />

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={showTodoDeleteModal}
        title="ToDoの削除"
        message={`「${deletingTodo?.todo_title}」を削除しますか？`}
        confirmText="削除"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* プロフィールモーダル */}
      <ProfileModal
        isOpen={showProfileModal}
        onSave={handleProfileSave}
        onCancel={handleProfileCancel}
        initialProfile={user ? { lastName: user.lastName, firstName: user.firstName } : null}
      />

      {/* ConditionModal */}
      <ConditionModal
        isOpen={showConditionModal}
        onSave={handleConditionSave}
        onCancel={() => setShowConditionModal(false)}
        initialPriorities={conditionModalInitialState.priorities}
        initialStatuses={conditionModalInitialState.statuses}
        initialSortOption={conditionModalInitialState.sortOption}
      />

      {/* トースト通知 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          isOpen={toast.isOpen} 
          onClose={hideToast}
        />
      )}
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