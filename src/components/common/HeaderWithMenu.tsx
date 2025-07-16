'use client';

import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { MenuModal } from '@/components/common/MenuModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { PasswordModal } from '@/components/common/PasswordModal';
import { ProfileModal } from '@/components/common/ProfileModal';
import { usePasswordChange } from '@/hooks/usePasswordChange';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/contexts/ToastContext';

interface HeaderWithMenuProps {
  title: string;
  user?: {
    id: string;
    lastName: string;
    firstName: string;
  } | null;
  onLogoutClick?: () => void;
  onAddClick?: () => void;
  onUserUpdate?: (user: { lastName: string; firstName: string }) => void;
}

export function HeaderWithMenu({ title, user, onLogoutClick, onAddClick, onUserUpdate }: HeaderWithMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // カスタムフック
  const { changePassword } = usePasswordChange();
  const { updateProfile } = useProfile();
  const { showToast } = useToast();

  const handleMenuOpen = () => {
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    // プロフィールモーダルを開く（パスワード変更と同じパターン）
    setIsProfileModalOpen(true);
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

  // プロフィール保存処理
  const handleProfileSave = async (lastName: string, firstName: string) => {
    if (!user) return false;
    
    try {
      const success = await updateProfile(user.id, lastName, firstName);
      if (!success) {
        showToast('プロフィールの更新に失敗しました', 'error');
        return false;
      }
      
      // 先にモーダルを閉じて300ms後にユーザー更新とトースト表示
      setIsProfileModalOpen(false);
      setTimeout(() => {
        onUserUpdate?.({ lastName, firstName });
        showToast('プロフィールを更新しました', 'success');
      }, 300);
      return true;
    } catch {
      showToast('プロフィールの更新に失敗しました', 'error');
      return false;
    }
  };

  // プロフィールモーダルキャンセル処理
  const handleProfileCancel = () => {
    setIsProfileModalOpen(false);
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

      {/* プロフィールモーダル */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onSave={handleProfileSave}
        onCancel={handleProfileCancel}
        initialProfile={user ? { lastName: user.lastName, firstName: user.firstName } : null}
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