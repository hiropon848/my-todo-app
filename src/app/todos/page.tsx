'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { StatusBadge } from '@/components/common/StatusBadge';
import { useProfile } from '@/hooks/useProfile';

export default function TodosPage() {
  const router = useRouter();
  const { user, isLoading, isLoggingOut, logout, updateUser } = useAuth();
  
  const [error, setError] = useState('');
  const [showCompletedLoading, setShowCompletedLoading] = useState(false);
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

  // useTodosカスタムフック
  const { 
    todos, 
    isLoading: loading, 
    error: todosError, 
    deleteTodo, 
    isToggleLoading: _isToggleLoading,
    addTodo,
    updateTodo,
    isAddTodoLoading: _isAddTodoLoading,
    isUpdateTodoLoading: _isUpdateTodoLoading,
    isDeleteTodoLoading: _isDeleteTodoLoading
  } = useTodos(user?.id || null);
  
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
      
      updateUser({ lastName, firstName });
      setShowProfileModal(false);
      // モーダルのアニメーション完了後にトースト表示
      setTimeout(() => {
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
        <HeaderWithMenu
          title="あなたのToDo"
          user={user ? { lastName: user.lastName, firstName: user.firstName } : null}
          onProfileClick={handleProfileClick}
          onLogoutClick={handleLogout}
          onAddClick={handleAddClick}
        />
        <main className="px-2 pt-6 pb-8">
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
          <div className="space-y-4">
            {todos.map(todo => (
              <div
                key={todo.id}
                className="bg-white/30 rounded-xl p-4 border border-white/20 shadow relative group"
              >
                {/* メニューボタン */}
                <button
                  onClick={(e) => toggleMenu(todo.id, e)}
                  className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-full transition-colors"
                >
                  <SubMenuIcon width="20" height="20" className="text-[#374151]" />
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
            ))}
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