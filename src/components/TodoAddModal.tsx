'use client';

import { useState, useEffect, useCallback } from 'react';
import CloseIcon from '@/icons/close.svg';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useTodoPriorities } from '@/hooks/useTodoPriorities';
import { useTodoStatuses } from '@/hooks/useTodoStatuses';
import { CustomSelect } from '@/components/common/CustomSelect';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TodoPriority } from '@/types/todoPriority';
import { TodoStatus } from '@/types/todoStatus';

interface TodoAddModalProps {
  isOpen: boolean;
  onSave: (title: string, text: string, priorityId?: string | undefined, statusId?: string | undefined) => Promise<boolean>;
  onCancel: () => void;
}

export function TodoAddModal({ isOpen, onSave, onCancel }: TodoAddModalProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>('');
  const [selectedStatusId, setSelectedStatusId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [titleTouched, setTitleTouched] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Priority情報を取得
  const { priorities, isLoading: prioritiesLoading, getDefaultPriorityId } = useTodoPriorities();

  // Status情報を取得
  const { todoStatuses, isLoading: todoStatusesLoading, getDefaultTodoStatusId } = useTodoStatuses();

  // 背景スクロール制御
  useBodyScrollLock(isOpen);

  // モーダルのアニメーション制御（表示・非表示の両方にアニメーション）
  useEffect(() => {
    if (isOpen) {
      // 少し遅らせてアニメーション開始
      const timer = setTimeout(() => setShowModal(true), 50);
      return () => clearTimeout(timer);
    } else {
      // 閉じる時もアニメーション後に非表示
      setShowModal(false);
    }
  }, [isOpen]);

  // モーダルが開かれた時にフォームをリセット
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setText('');
      setError('');
      setTitleError('');
      setTitleTouched(false);
      setTitleFocused(false);
      setIsCancelling(false);
    }
  }, [isOpen]);

  // デフォルト優先度設定（prioritiesが読み込まれた後）
  useEffect(() => {
    if (isOpen && !prioritiesLoading && priorities.length > 0 && selectedPriorityId === '') {
      try {
        const defaultPriorityId = getDefaultPriorityId();
        if (defaultPriorityId) {
          setSelectedPriorityId(defaultPriorityId);
        }
      } catch (error) {
        console.error('Error setting default priority:', error);
        // エラーが発生した場合は最初のpriorityを選択
        if (priorities[0]) {
          setSelectedPriorityId(priorities[0].id);
        }
      }
    }
  }, [isOpen, prioritiesLoading, priorities, selectedPriorityId, getDefaultPriorityId]);

  // デフォルト状態設定（taskStatusesが読み込まれた後）
  useEffect(() => {
    if (isOpen && !todoStatusesLoading && todoStatuses.length > 0 && selectedStatusId === '') {
      try {
        const defaultStatusId = getDefaultTodoStatusId();
        if (defaultStatusId) {
          setSelectedStatusId(defaultStatusId);
        }
      } catch (error) {
        console.error('Error setting default status:', error);
        // エラーが発生した場合は最初のstatusを選択
        if (todoStatuses[0]) {
          setSelectedStatusId(todoStatuses[0].id);
        }
      }
    }
  }, [isOpen, todoStatusesLoading, todoStatuses, selectedStatusId, getDefaultTodoStatusId]);

  // タイトルのバリデーション
  const validateTitle = (value: string, blur = false) => {
    // フォーカスアウト時かつキャンセル操作中の場合はエラーをセットしない
    if (blur && isCancelling) {
      return;
    }
    
    if (blur && value === '') {
      setTitleError('必須項目です');
      return;
    }
    setTitleError('');
  };

  // フォームの有効性判定
  const isFormValid = 
    title.trim() !== '' &&
    titleError === '';

  const handleCancel = useCallback(() => {
    // キャンセル開始フラグを設定（まだ設定されていない場合のみ）
    if (!isCancelling) {
      setIsCancelling(true);
    }
    
    // キャンセル時は即座にバリデーション状態をクリア
    setTitleError('');
    setTitleTouched(false);
    setTitleFocused(false);
    
    // 閉じるアニメーションを開始
    setShowModal(false);
    // アニメーション完了後にモーダルを閉じる
          setTimeout(() => {
        setTitle('');
        setText('');
        setSelectedPriorityId('');
        setSelectedStatusId('');
        setError('');
        setTitleError('');
        setTitleTouched(false);
        setTitleFocused(false);
        setIsCancelling(false); // フラグをリセット
        onCancel();
      }, 300); // CSSのduration-300と同じ300ms
  }, [onCancel, isCancelling]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleCancel]);

  const handleSave = async () => {
    setError('');
    if (!title.trim()) {
      setTitleError('必須項目です');
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(title, text, selectedPriorityId || undefined, selectedStatusId || undefined);
      if (success) {
        // 成功時は閉じるアニメーションを実行
        setShowModal(false);
        setTimeout(() => {
          // フォームリセット
          setTitle('');
          setText('');
          setSelectedPriorityId('');
          setSelectedStatusId('');
          setError('');
          setTitleError('');
          setTitleTouched(false);
          setTitleFocused(false);
          setIsCancelling(false);
          onCancel();
        }, 300);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // 背景クリックでモーダルを閉じる
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  // 背景スタイルのデバッグログ
  const backgroundStyle = {
    background: showModal ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
    backdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
    WebkitBackdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
  };
  
  console.log('🔴 TodoAddModal 背景状態:', {
    isOpen,
    showModal,
    backgroundStyle,
    className: `fixed inset-0 z-[70] flex items-center justify-center px-4 transition-all duration-300 ${
      showModal ? 'opacity-100' : 'opacity-0'
    }`
  });

  return (
    <div 
      className={`fixed inset-0 z-[70] flex items-center justify-center px-4 transition-all duration-300 ${
        showModal ? 'opacity-100' : 'opacity-0'
      }`}
      style={backgroundStyle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          // 背景マウスダウン時に即座にキャンセルフラグを設定
          setIsCancelling(true);
        }
      }}
      onClick={handleBackgroundClick}
    >
      {/* モーダルウィンドウ */}
      <div 
        className={`rounded-2xl shadow-2xl border border-white/30 w-full max-w-md mx-auto transition-all duration-300 ${
          showModal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="border-b border-white/30 rounded-t-2xl px-4 py-4">
          <div className="flex items-center justify-center relative">
            <h2 className="text-xl font-bold text-text">新規作成</h2>
            <button
              onMouseDown={(e) => {
                // マウスダウン時点で即座にキャンセルフラグを設定
                setIsCancelling(true);
                e.preventDefault(); // デフォルトのフォーカス移動を防ぐ
              }}
              onClick={handleCancel}
              className="absolute -right-2 p-3 hover:bg-black/10 rounded-full transition-colors"
              disabled={isSaving}
            >
              <CloseIcon 
                width="22" 
                height="22" 
                className="text-[#374151]"
                style={{ strokeWidth: '3' }}
              />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 text-red-600 font-semibold text-sm text-center">
              {error}
            </div>
          )}

          {/* 追加フォーム */}
          <div className="space-y-4">
            <div>
              <label htmlFor="add-modal-title" className="block text-sm font-medium text-text mb-1">
                タイトル
              </label>
              <input
                id="add-modal-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) validateTitle(e.target.value, false);
                }}
                onKeyUp={e => {
                  const inputKey = e.key;
                  if (
                    inputKey.length === 1 ||
                    inputKey === 'Backspace' ||
                    inputKey === 'Delete'
                  ) {
                    validateTitle((e.target as HTMLInputElement).value, false);
                  }
                }}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => {
                  setTitleFocused(false);
                  setTitleTouched(true);
                  validateTitle(title, true);
                }}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="タイトル"
                disabled={isSaving}
                autoFocus
              />
              {titleError && (titleTouched || (!titleFocused && title === '')) && (
                <p className="text-xs text-red-600 font-semibold mt-2">{titleError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="add-modal-priority" className="block text-sm font-medium text-text mb-1">
                優先度
              </label>
              <CustomSelect
                id="add-modal-priority"
                value={selectedPriorityId}
                onChange={setSelectedPriorityId}
                options={priorities}
                disabled={isSaving || prioritiesLoading}
                loading={prioritiesLoading}
                placeholder="優先度を選択"
                renderOption={(option) => (
                  <PriorityBadge
                    priority={option as TodoPriority}
                    size="md"
                  />
                )}
                renderSelectedOption={(option) => (
                  <PriorityBadge
                    priority={option as TodoPriority}
                    size="md"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="add-modal-status" className="block text-sm font-medium text-text mb-1">
                状態
              </label>
              <CustomSelect
                id="add-modal-status"
                value={selectedStatusId}
                onChange={setSelectedStatusId}
                options={todoStatuses}
                disabled={isSaving || todoStatusesLoading}
                loading={todoStatusesLoading}
                placeholder="状態を選択"
                renderOption={(option) => (
                  <StatusBadge
                    status={option as TodoStatus}
                    size="md"
                  />
                )}
                renderSelectedOption={(option) => (
                  <StatusBadge
                    status={option as TodoStatus}
                    size="md"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="add-modal-text" className="block text-sm font-medium text-text mb-1">
                本文
              </label>
              <textarea
                id="add-modal-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="本文（複数行入力可）"
                rows={3}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-white/30 rounded-b-2xl">
          <div className="flex gap-3 justify-center">
            <button
              onMouseDown={(e) => {
                // マウスダウン時点で即座にキャンセルフラグを設定
                setIsCancelling(true);
                e.preventDefault(); // デフォルトのフォーカス移動を防ぐ
              }}
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white text-base font-bold rounded-[2rem] hover:bg-gray-600 transition-colors"
              disabled={isSaving}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 px-4 py-2 text-base font-bold rounded-[2rem] transition-colors ${
                isFormValid && !isSaving
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-500/15 text-blue-500/50 cursor-not-allowed'
              }`}
              disabled={isSaving || !isFormValid}
            >
              {isSaving ? '作成中...' : '作成'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 