'use client';

import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { MenuModal } from './MenuModal';
import { ConfirmModal } from './ConfirmModal';
import { PasswordModal } from './PasswordModal';
import { usePasswordChange } from '@/hooks/usePasswordChange';
import { useToast } from '@/hooks/useToast';
import { Toast } from './Toast';


interface HeaderWithMenuProps {
  userName: string;
  onLogout: () => void;
  title: string;
  onProfileClick?: () => void;
  onAddClick?: () => void;
}

export const HeaderWithMenu: React.FC<HeaderWithMenuProps> = ({ userName, onLogout, title, onProfileClick, onAddClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // カスタムフック
  const { changePassword, error: passwordError } = usePasswordChange();
  const { toast, showToast } = useToast();

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    // プロフィールを開く（メニューは MenuModal 内で制御）
    onProfileClick?.();
  };

  const handlePasswordChangeClick = () => {
    // パスワード変更モーダルを開く（プロフィールと同じパターン）
    setIsPasswordModalOpen(true);
  };

  // パスワード変更処理
  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    const success = await changePassword(currentPassword, newPassword);
    
    if (success) {
      setIsPasswordModalOpen(false);
      showToast('パスワードを変更しました', 'success');
    } else {
      showToast(passwordError || 'パスワード変更に失敗しました', 'error');
    }
  };

  // パスワード変更モーダルキャンセル処理
  const handlePasswordChangeCancel = () => {
    setIsPasswordModalOpen(false);
  };

  // ログアウト確認を開く（プロフィールと同じパターン）
  const handleLogoutConfirmOpen = () => {
    setIsLogoutConfirmOpen(true);
  };

  // ログアウト確認処理
  const handleLogoutConfirm = async () => {
    await onLogout();
  };

  // ログアウト確認キャンセル処理
  const handleLogoutConfirmCancel = () => {
    setIsLogoutConfirmOpen(false);
  };

  return (
    <>
      <AppHeader
        userName={userName}
        onLogout={onLogout}
        title={title}
        onMenuOpen={handleMenuOpen}
        onAddClick={onAddClick}
      />
      
      {/* メニューモーダル（画面全体に表示） */}
      <MenuModal
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onProfileClick={handleProfileClick}
        onPasswordChangeClick={handlePasswordChangeClick}
        onLogoutClick={handleLogoutConfirmOpen}
      />

      {/* パスワード変更モーダル */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onSave={handlePasswordChange}
        onCancel={handlePasswordChangeCancel}
      />

      {/* ログアウト確認モーダル */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="ログアウト"
        message="ログアウトします。<br>よろしいですか？"
        confirmText="OK"
        cancelText="キャンセル"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutConfirmCancel}
        variant="danger"
      />

      {/* トースト通知 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
      />
    </>
  );
}; 