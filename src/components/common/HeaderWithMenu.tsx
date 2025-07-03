'use client';

import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { MenuModal } from '@/components/common/MenuModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { PasswordModal } from '@/components/common/PasswordModal';
import { usePasswordChange } from '@/hooks/usePasswordChange';
import { useToast } from '@/hooks/useToast';
import { Toast } from './Toast';
import MainMenuIcon from '@/icons/menu-main.svg';

interface HeaderWithMenuProps {
  title: string;
  user?: {
    lastName: string;
    firstName: string;
  } | null;
  onProfileClick?: () => void;
  onLogoutClick?: () => void;
  onAddClick?: () => void;
}

export function HeaderWithMenu({ title, user, onProfileClick, onLogoutClick, onAddClick }: HeaderWithMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // カスタムフック
  const { changePassword } = usePasswordChange();
  const { showToast } = useToast();

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
      // モーダルを閉じて300ms後にトースト表示
      setIsPasswordModalOpen(false);
      setTimeout(() => {
        showToast('パスワードを変更しました', 'success');
      }, 300);
    } else {
      showToast('パスワード変更に失敗しました', 'error');
    }
    
    return success;
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
    await onLogoutClick?.();
  };

  // ログアウト確認キャンセル処理
  const handleLogoutConfirmCancel = () => {
    setIsLogoutConfirmOpen(false);
  };

  const userName = user ? `${user.lastName} ${user.firstName}` : '';

  return (
    <>
      <AppHeader
        title={title}
        userName={userName}
        onLogout={onLogoutClick || (() => {})}
        onMenuOpen={handleMenuOpen}
        onAddClick={onAddClick}
      />

      {/* メニューモーダル */}
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
        message="ログアウトしますか？"
        confirmText="ログアウト"
        variant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutConfirmCancel}
      />
    </>
  );
} 