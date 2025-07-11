'use client';

import { useState, useEffect } from 'react';
import CloseIcon from '@/icons/close.svg';
import VisibilityOnIcon from '@/icons/visibility-on.svg';
import VisibilityOffIcon from '@/icons/visibility-off.svg';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { CancelableModalProps } from '@/types/commonModal';

interface PasswordModalProps extends CancelableModalProps {
  onSave: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

export function PasswordModal({ isOpen, onSave, onCancel }: PasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [isCurrentPasswordTouched, setIsCurrentPasswordTouched] = useState(false);
  const [isCurrentPasswordFocused, setIsCurrentPasswordFocused] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [isNewPasswordTouched, setIsNewPasswordTouched] = useState(false);
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 背景スクロール制御
  useBodyScrollLock(isOpen);

  // モーダルアニメーション制御
  useEffect(() => {
    if (isOpen) {
      // 少し遅らせてアニメーション開始
      const timer = setTimeout(() => setIsModalVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsModalVisible(false);
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  // パスワード用バリデーション関数
  const isPasswordHalfWidth = (value: string) => /^[\x21-\x7E]+$/.test(value);
  const isPasswordLength = (value: string) => value.length >= 6;

  // バリデーション
  const validateCurrentPassword = (value: string, blur = false) => {
    if (blur && value === '') {
      setCurrentPasswordError('必須項目です');
      return;
    }
    if (value && !isPasswordHalfWidth(value)) {
      setCurrentPasswordError('無効な文字が含まれています');
      return;
    }
    setCurrentPasswordError('');
  };

  const validateNewPassword = (value: string, blur = false) => {
    if (blur && value === '') {
      setNewPasswordError('必須項目です');
      return;
    }
    if (value && !isPasswordHalfWidth(value)) {
      setNewPasswordError('無効な文字が含まれています');
      return;
    }
    if (blur && value && isPasswordHalfWidth(value) && !isPasswordLength(value)) {
      setNewPasswordError('6文字以上で入力してください(半角英数字および半角記号のみ)');
      return;
    }
    setNewPasswordError('');
  };

  const validateConfirmPassword = (value: string, blur = false) => {
    if (blur && value === '') {
      setConfirmPasswordError('必須項目です');
      return;
    }
    if (value && !isPasswordHalfWidth(value)) {
      setConfirmPasswordError('無効な文字が含まれています');
      return;
    }
    // 新しいパスワードが有効で、確認パスワードと一致しない場合
    if (blur && value && newPassword && !newPasswordError && value !== newPassword) {
      setConfirmPasswordError('「新しいパスワード」と「新しいパスワード（確認）」が一致しません');
      return;
    }
    setConfirmPasswordError('');
  };

  // フォームの有効性判定
  const isFormValid = 
    currentPassword.trim() !== '' &&
    newPassword.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    currentPasswordError === '' &&
    newPasswordError === '' &&
    confirmPasswordError === '' &&
    isPasswordHalfWidth(currentPassword) &&
    isPasswordHalfWidth(newPassword) &&
    isPasswordLength(newPassword) &&
    newPassword === confirmPassword;

  const handleSave = async () => {
    if (!currentPassword.trim()) {
      setCurrentPasswordError('必須項目です');
      return;
    }
    if (!isPasswordHalfWidth(currentPassword)) {
      setCurrentPasswordError('無効な文字が含まれています');
      return;
    }
    if (!newPassword.trim()) {
      setNewPasswordError('必須項目です');
      return;
    }
    if (!isPasswordHalfWidth(newPassword)) {
      setNewPasswordError('無効な文字が含まれています');
      return;
    }
    if (!isPasswordLength(newPassword)) {
      setNewPasswordError('6文字以上で入力してください(半角英数字および半角記号のみ)');
      return;
    }
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('必須項目です');
      return;
    }
    if (!isPasswordHalfWidth(confirmPassword)) {
      setConfirmPasswordError('無効な文字が含まれています');
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('新しいパスワードと一致しません');
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(currentPassword, newPassword);
      if (success) {
        // 保存成功時は閉じるアニメーションを実行
        setIsModalVisible(false);
        setTimeout(() => {
          resetForm();
          onCancel();
        }, 300);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setIsCurrentPasswordTouched(false);
    setIsCurrentPasswordFocused(false);
    setCurrentPasswordError('');
    setIsCurrentPasswordVisible(false);

    setNewPassword('');
    setIsNewPasswordTouched(false);
    setIsNewPasswordFocused(false);
    setNewPasswordError('');
    setIsNewPasswordVisible(false);

    setConfirmPassword('');
    setIsConfirmPasswordTouched(false);
    setIsConfirmPasswordFocused(false);
    setConfirmPasswordError('');
    setIsConfirmPasswordVisible(false);
  };

  const handleCancel = () => {
    // 閉じるアニメーションを開始
    setIsModalVisible(false);
    // アニメーション完了後にモーダルを閉じる
    setTimeout(() => {
      resetForm();
      onCancel();
    }, 300);
  };

  // 背景クリックでモーダルを閉じる
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[90] flex items-center justify-center px-4 transition-all duration-300 ${
        isModalVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: isModalVisible ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: isModalVisible ? 'blur(4px)' : 'blur(0px)',
        WebkitBackdropFilter: isModalVisible ? 'blur(4px)' : 'blur(0px)',
      }}
      onClick={handleBackgroundClick}
    >
      {/* モーダルウィンドウ */}
      <div 
        className={`rounded-2xl shadow-2xl border border-white/30 w-full max-w-md mx-auto transition-all duration-300 ${
          isModalVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
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
            <h2 className="text-xl font-bold text-text">パスワード変更</h2>
            <button
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
          {/* パスワード変更フォーム */}
          <div className="space-y-4">
            {/* 現在のパスワード */}
            <div>
              <label htmlFor="modal-currentPassword" className="block text-sm font-medium text-text mb-1">
                現在のパスワード
              </label>
              <div className="relative">
                <input
                  id="modal-currentPassword"
                  type={isCurrentPasswordVisible ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (currentPasswordError) validateCurrentPassword(e.target.value, false);
                  }}
                  onFocus={() => setIsCurrentPasswordFocused(true)}
                  onBlur={() => {
                    setIsCurrentPasswordFocused(false);
                    setIsCurrentPasswordTouched(true);
                    validateCurrentPassword(currentPassword, true);
                  }}
                  onKeyUp={e => {
                    const inputKey = e.key;
                    if (
                      inputKey.length === 1 ||
                      inputKey === 'Backspace' ||
                      inputKey === 'Delete'
                    ) {
                      validateCurrentPassword((e.target as HTMLInputElement).value, false);
                    }
                  }}
                  className="mt-1 block w-full px-3 py-2 pr-10 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all duration-200 text-base placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={isSaving}
                  autoFocus
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={isCurrentPasswordVisible ? 'パスワードを非表示' : 'パスワードを表示'}
                  onClick={() => setIsCurrentPasswordVisible(v => !v)}
                  className="absolute inset-y-0 right-2 flex items-center px-1 text-text hover:text-primary focus:outline-none"
                >
                  {isCurrentPasswordVisible ? (
                    <VisibilityOnIcon className="w-6 h-6 relative top-[1px]" />
                  ) : (
                    <VisibilityOffIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
              {currentPasswordError && (isCurrentPasswordTouched || (!isCurrentPasswordFocused && currentPassword === '')) && (
                <p className="text-xs text-red-600 font-semibold mt-2">{currentPasswordError}</p>
              )}
            </div>
            
            {/* 新しいパスワード */}
            <div>
              <label htmlFor="modal-newPassword" className="block text-sm font-medium text-text mb-1">
                新しいパスワード
              </label>
              <div className="relative">
                <input
                  id="modal-newPassword"
                  type={isNewPasswordVisible ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (newPasswordError) validateNewPassword(e.target.value, false);
                    // 確認パスワードもリアルタイムで再検証
                    if (confirmPassword && isConfirmPasswordTouched) {
                      validateConfirmPassword(confirmPassword, false);
                    }
                  }}
                  onFocus={() => setIsNewPasswordFocused(true)}
                  onBlur={() => {
                    setIsNewPasswordFocused(false);
                    setIsNewPasswordTouched(true);
                    validateNewPassword(newPassword, true);
                  }}
                  onKeyUp={e => {
                    const inputKey = e.key;
                    if (
                      inputKey.length === 1 ||
                      inputKey === 'Backspace' ||
                      inputKey === 'Delete'
                    ) {
                      validateNewPassword((e.target as HTMLInputElement).value, false);
                    }
                  }}
                  className="mt-1 block w-full px-3 py-2 pr-10 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all duration-200 text-base placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={isNewPasswordVisible ? 'パスワードを非表示' : 'パスワードを表示'}
                  onClick={() => setIsNewPasswordVisible(v => !v)}
                  className="absolute inset-y-0 right-2 flex items-center px-1 text-text hover:text-primary focus:outline-none"
                >
                  {isNewPasswordVisible ? (
                    <VisibilityOnIcon className="w-6 h-6 relative top-[1px]" />
                  ) : (
                    <VisibilityOffIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
              {newPasswordError && (isNewPasswordTouched || (!isNewPasswordFocused && newPassword === '')) && (
                <p className="text-xs text-red-600 font-semibold mt-2">{newPasswordError}</p>
              )}
            </div>

            {/* 新しいパスワード（確認） */}
            <div>
              <label htmlFor="modal-confirmPassword" className="block text-sm font-medium text-text mb-1">
                新しいパスワード（確認）
              </label>
              <div className="relative">
                <input
                  id="modal-confirmPassword"
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmPasswordError) validateConfirmPassword(e.target.value, false);
                  }}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => {
                    setIsConfirmPasswordFocused(false);
                    setIsConfirmPasswordTouched(true);
                    validateConfirmPassword(confirmPassword, true);
                  }}
                  onKeyUp={e => {
                    const inputKey = e.key;
                    if (
                      inputKey.length === 1 ||
                      inputKey === 'Backspace' ||
                      inputKey === 'Delete'
                    ) {
                      validateConfirmPassword((e.target as HTMLInputElement).value, false);
                    }
                  }}
                  className="mt-1 block w-full px-3 py-2 pr-10 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all duration-200 text-base placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={isConfirmPasswordVisible ? 'パスワードを非表示' : 'パスワードを表示'}
                  onClick={() => setIsConfirmPasswordVisible(v => !v)}
                  className="absolute inset-y-0 right-2 flex items-center px-1 text-text hover:text-primary focus:outline-none"
                >
                  {isConfirmPasswordVisible ? (
                    <VisibilityOnIcon className="w-6 h-6 relative top-[1px]" />
                  ) : (
                    <VisibilityOffIcon className="w-6 h-6" />
                  )}
                </button>
              </div>
              {confirmPasswordError && (isConfirmPasswordTouched || (!isConfirmPasswordFocused && confirmPassword === '')) && (
                <p className="text-xs text-red-600 font-semibold mt-2">{confirmPasswordError}</p>
              )}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-white/30 rounded-b-2xl">
          <div className="flex gap-3 justify-center">
            <button
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
              {isSaving ? '変更中...' : '変更'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 