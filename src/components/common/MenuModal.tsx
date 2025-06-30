'use client';

import { useState, useEffect, useCallback } from 'react';
import CloseIcon from '@/icons/close.svg';
import UserIcon from '@/icons/user.svg';
import LockIcon from '@/icons/lock.svg';
import LogoutIcon from '@/icons/logout.svg';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onPasswordChangeClick: () => void;
  onLogoutClick: () => void;
}

export function MenuModal({ isOpen, onClose, onProfileClick, onPasswordChangeClick, onLogoutClick }: MenuModalProps) {
  const [showModal, setShowModal] = useState(false);

  // 背景スクロール制御
  useBodyScrollLock(isOpen);

  // モーダルが開かれた時のアニメーション制御（表示・非表示の両方にアニメーション）
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

  // モーダルを閉じる処理（アニメーション付き）
  const handleClose = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleClose]);

  // 背景クリックでモーダルを閉じる
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center px-4 transition-all duration-300 ${
        showModal ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: showModal ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
        WebkitBackdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
      }}
      onClick={handleBackgroundClick}
    >
      {/* メニューウィンドウ */}
      <div 
        className={`rounded-2xl shadow-2xl border border-white/30 w-full max-w-sm mx-auto transition-all duration-300 ${
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
            <h2 className="text-xl font-bold text-text">メニュー</h2>
            <button
              onClick={handleClose}
              className="absolute -right-2 p-3 hover:bg-black/10 rounded-full transition-colors"
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
          <div className="space-y-2">
            {/* プロフィールメニュー */}
            <button
              onClick={() => {
                // アニメーション付きで閉じる
                setShowModal(false);
                // アニメーション完了後（300ms + 50ms待機）にプロフィールを開く
                setTimeout(() => {
                  onClose(); // メニューを完全に閉じる
                  setTimeout(() => {
                    onProfileClick(); // プロフィールモーダルを開く
                  }, 50);
                }, 300);
              }}
              className="w-full text-left px-4 py-3 text-text hover:bg-black/10 rounded-full transition-colors flex items-center gap-3"
            >
              <UserIcon 
                width="22" 
                height="22" 
                className="text-[#374151]"
                style={{ strokeWidth: '3' }}
              />
              プロフィール
            </button>

            {/* パスワード変更メニュー */}
            <button
              onClick={() => {
                // アニメーション付きで閉じる（プロフィールと同じパターン）
                setShowModal(false);
                // アニメーション完了後（300ms + 50ms待機）にパスワード変更を開く
                setTimeout(() => {
                  onClose(); // メニューを完全に閉じる
                  setTimeout(() => {
                    onPasswordChangeClick(); // パスワード変更モーダルを開く
                  }, 50);
                }, 300);
              }}
              className="w-full text-left px-4 py-3 text-text hover:bg-black/10 rounded-full transition-colors flex items-center gap-3"
            >
              <LockIcon 
                width="22" 
                height="22" 
                className="text-[#374151]"
                style={{ strokeWidth: '3' }}
              />
              パスワード変更
            </button>

            {/* ログアウトメニュー */}
            <button
              onClick={() => {
                // アニメーション付きで閉じる（プロフィールと同じパターン）
                setShowModal(false);
                // アニメーション完了後（300ms + 50ms待機）にログアウト確認を開く
                setTimeout(() => {
                  onClose(); // メニューを完全に閉じる
                  setTimeout(() => {
                    onLogoutClick(); // ログアウト確認モーダルを開く
                  }, 50);
                }, 300);
              }}
              className="w-full text-left px-4 py-3 text-text hover:bg-black/10 rounded-full transition-colors flex items-center gap-3"
            >
              <LogoutIcon 
                width="22" 
                height="22" 
                className="text-[#374151]"
                style={{ strokeWidth: '3' }}
              />
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 