'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { HeaderWithMenu } from '@/components/common/HeaderWithMenu';
import { useTodos } from '@/hooks/useTodos';
import { TodoEditModal } from '@/components/TodoEditModal';
import { TodoAddModal } from '@/components/TodoAddModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { ProfileModal } from '@/components/common/ProfileModal';
import { Toast } from '@/components/common/Toast';
import { useToast } from '@/hooks/useToast';
import SubMenuIcon from '@/icons/menu-sub.svg';
import { PriorityBadge } from '@/components/common/PriorityBadge';

export default function TodosPage() {
  const router = useRouter();
  const { user, isLoading, isLoggingOut, logout, updateUser } = useAuth();
  
  const [error, setError] = useState('');
  const [showCompletedLoading, setShowCompletedLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<{
    id: string;
    task_title: string;
    task_text: string;
    priority_id?: string;
    status_id?: string;
    priority?: {
      id: string;
      name: string;
      color_code: string;
    };
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingTodo, setDeletingTodo] = useState<{ id: string; task_title: string } | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // useTodosカスタムフック
  const { 
    todos, 
    loading, 
    error: todosError, 
    deleteTodo, 
    // toggleTodo: 削除済み（is_completedカラム削除により不要）
    toggleLoading: _toggleLoading, // Phase 3で削除予定（メニューボタンで使用中）
    addTodo,
    updateTodo
  } = useTodos(user?.id || null);
  
  // 未使用変数の警告を抑制（メニューボタンで使用予定だが現在は無効化）
  void _toggleLoading;
  const { toast, showToast } = useToast();

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
    task_title: string;
    task_text: string;
    priority_id?: string;
    status_id?: string;
    priority?: {
      id: string;
      name: string;
      color_code: string;
    };
  }) => {
    setEditingTodo(todo);
    setEditModalOpen(true);
    setOpenMenuId(null);
  };

  // モーダル保存処理
  const handleModalSave = async (id: string, title: string, text: string, priorityId?: string, statusId?: string) => {
    setError('');
    try {
      await updateTodo(id, title, text, priorityId, statusId, () => {
        // 成功時のトースト表示
        showToast('ToDoを更新しました', 'success');
      });
    } catch (err) {
      // エラーハンドリング（useTodosでエラーメッセージは設定済み）
      throw err;
    }
  };

  // モーダルキャンセル処理
  const handleModalCancel = () => {
    setEditModalOpen(false);
    setEditingTodo(null);
  };

  // 削除開始（確認モーダルを開く）
  const startDelete = (todo: { id: string; task_title: string }) => {
    setDeletingTodo(todo);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  // 削除確認処理
  const handleDeleteConfirm = async () => {
    if (!deletingTodo) return;
    
    try {
      await deleteTodo(deletingTodo.id);
      showToast('ToDoを削除しました', 'success');
    } catch {
      showToast('削除に失敗しました', 'error');
    }
  };

  // 削除キャンセル処理
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeletingTodo(null);
  };

  // プロフィール編集開始
  const handleProfileClick = () => {
    setProfileModalOpen(true);
  };

  // プロフィール保存処理
  const handleProfileSave = async (lastName: string, firstName: string) => {
    if (!user) return;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        last_name: lastName, 
        first_name: firstName 
      })
      .eq('id', user.id);
    
    if (updateError) {
      throw new Error('プロフィールの更新に失敗しました');
    }
    
    // Context内のユーザー情報を更新
    updateUser({ lastName, firstName });
    showToast('プロフィールを更新しました', 'success');
  };

  // プロフィールキャンセル処理
  const handleProfileCancel = () => {
    setProfileModalOpen(false);
  };

  // 追加モーダル開始
  const handleAddClick = () => {
    setAddModalOpen(true);
  };

  // 追加モーダル保存処理
  const handleAddModalSave = async (title: string, text: string, priorityId?: string, statusId?: string) => {
    await addTodo(title, text, priorityId, statusId, () => {
      // 追加成功時のコールバック
      showToast('ToDoを作成しました', 'success');
    });
  };

  // 追加モーダルキャンセル処理
  const handleAddModalCancel = () => {
    setAddModalOpen(false);
  };

  // ログアウト処理（Contextのlogout関数を使用）
  const handleLogout = logout;

  // ログアウト処理中の表示（最優先・他の条件を完全に無視）
  if (isLoggingOut) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚪 TodosPage showing logout LoadingScreen (priority)');
    }
    return <LoadingScreen message="ログアウト処理実行中..." />;
  }

  // ログアウト処理中でない場合のみ、他の条件を評価
  if (!isLoggingOut && (isLoading || !user || loading)) {
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
        <HeaderWithMenu userName={user.displayName} onLogout={handleLogout} title="あなたのToDo" onProfileClick={handleProfileClick} onAddClick={handleAddClick} />
        <main className="px-6 pt-6 pb-8">
          {/* エラーメッセージ */}
          {(error || todosError) && (
            <div className="mb-4 text-red-600 font-semibold text-sm text-center">
              {error || todosError}
            </div>
          )}

          {/* 完了したToDoの表示切り替え */}
          <div className="flex flex-col mb-6 bg-white/30 rounded-xl p-4 border border-white/20 shadow">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show-completed"
                className="w-5 h-5 accent-primary mr-2"
                checked={user.showCompleted}
                disabled={showCompletedLoading}
                onChange={async (e) => {
                  const checked = e.target.checked;
                  setShowCompletedLoading(true);
                  try {
                    // 削除されたカラムの更新を無効化（Phase 3で機能ごと削除予定）
                    // const { error: updateError } = await supabase
                    //   .from('profiles')
                    //   .update({ is_show_completed_todos: checked })
                    //   .eq('id', user.id);
                    // if (updateError) {
                    //   setError('表示設定の更新に失敗しました');
                    // } else {
                      updateUser({ showCompleted: checked });
                    // }
                  } finally {
                    setShowCompletedLoading(false);
                  }
                }}
              />
              <label htmlFor="show-completed" className="text-text">
                完了したToDoを表示する
              </label>
            </div>
          </div>
          {/* ToDoリスト */}
          <ul className="divide-y divide-white/20 space-y-2">
            {todos
              .map((todo) => (
                <li
                  key={todo.id}
                  className={`relative flex items-start gap-2 p-4 rounded-lg bg-white/60 border border-white/20 shadow transition-all`}
                >
                                     {/* チェックボックス機能削除済み（is_completedカラム削除により） */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-lg text-text">{todo.task_title}</div>
                      <PriorityBadge priority={todo.priority} size="sm" />
                    </div>
                    <div className="text-text text-sm whitespace-pre-wrap">{todo.task_text}</div>
                  </div>
                  {/* メニューボタン */}
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => toggleMenu(todo.id, e)}
                      className="p-3 rounded-full hover:bg-black/10 transition-colors disabled:opacity-50"
                      disabled={false} // toggleLoading機能を無効化
                    >
                      <SubMenuIcon 
                        width="22" 
                        height="22" 
                        className="text-[#374151]"
                      />
                    </button>
                    {/* ドロップダウンメニュー */}
                    {openMenuId === todo.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 px-1 min-w-[120px]">
                        <button
                          onClick={() => startEdit(todo)}
                          className="w-full text-left px-3 py-2 text-base text-gray-900 hover:bg-gray-100 rounded hover:rounded mb-1 [&:last-child]:mb-0 flex items-center gap-2"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => startDelete(todo)}
                          className="w-full text-left px-3 py-2 text-base text-red-600 hover:bg-red-50 rounded hover:rounded mb-1 [&:last-child]:mb-0 flex items-center gap-2"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </main>
      </div>

      {/* 追加モーダル */}
      <TodoAddModal
        isOpen={addModalOpen}
        onSave={handleAddModalSave}
        onCancel={handleAddModalCancel}
      />

      {/* 編集モーダル */}
      <TodoEditModal
        todo={editingTodo}
        isOpen={editModalOpen}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
      />

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="削除"
        message="ToDoを削除します。<br>この操作は戻すことはできませんがよろしいですか？"
        confirmText="OK"
        cancelText="キャンセル"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />

      {/* プロフィールモーダル */}
      <ProfileModal
        isOpen={profileModalOpen}
        onSave={handleProfileSave}
        onCancel={handleProfileCancel}
        initialProfile={{ lastName: user?.lastName || '', firstName: user?.firstName || '' }}
      />

      {/* トースト通知 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
      />
    </div>
  );
} 