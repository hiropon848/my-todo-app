'use client';

import { useState, useEffect } from 'react';
import CloseIcon from '@/icons/close.svg';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  variant?: 'danger' | 'default';
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'OK', 
  cancelText = 'キャンセル',
  onConfirm, 
  onCancel,
  variant = 'default'
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // 背景スクロール制御
  useBodyScrollLock(isOpen);

  // モーダルが開かれた時の処理（表示・非表示の両方にアニメーション）
  useEffect(() => {
    if (isOpen) {
      setError('');
      setIsLoading(false);
      
      // 少し遅らせてアニメーション開始
      const timer = setTimeout(() => setShowModal(true), 50);
      return () => clearTimeout(timer);
    } else {
      // 閉じる時もアニメーション後に非表示
      setShowModal(false);
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel, isLoading]);

  const handleConfirm = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onConfirm();
      // 成功時は閉じるアニメーションを実行
      setShowModal(false);
      setTimeout(() => {
        onCancel();
      }, 300);
    } catch {
      setError('処理に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      // 閉じるアニメーションを開始
      setShowModal(false);
      // アニメーション完了後にモーダルを閉じる
      setTimeout(() => {
        setError('');
        onCancel();
      }, 300);
    }
  };

  // 背景クリックでモーダルを閉じる
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  // variant別のボタンスタイル
  const confirmButtonStyle = variant === 'danger' 
    ? 'bg-red-500 hover:bg-red-600 text-white'
    : 'bg-blue-500 hover:bg-blue-600 text-white';

  return (
    <div 
      className={`fixed inset-0 z-[80] flex items-center justify-center px-4 transition-all duration-300 ${
        showModal ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: showModal ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
        WebkitBackdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
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
            <h2 className="text-xl font-bold text-text">{title}</h2>
            <button
              onClick={handleCancel}
              className="absolute -right-2 p-3 hover:bg-black/10 rounded-full transition-colors"
              disabled={isLoading}
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

          {/* 確認メッセージ */}
          <div 
            className="text-text text-left"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-white/30 rounded-b-2xl">
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-300 text-text text-base font-bold rounded-[2rem] hover:bg-gray-400 transition-colors"
              disabled={isLoading}
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-2 text-base font-bold rounded-[2rem] transition-colors ${confirmButtonStyle}`}
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 