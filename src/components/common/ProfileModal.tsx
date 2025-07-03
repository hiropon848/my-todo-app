'use client';

import { useState, useEffect } from 'react';
import CloseIcon from '@/icons/close.svg';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ProfileModalProps {
  isOpen: boolean;
  onSave: (lastName: string, firstName: string) => Promise<boolean>;
  onCancel: () => void;
  initialProfile?: { lastName: string; firstName: string } | null;
}

export function ProfileModal({ isOpen, onSave, onCancel, initialProfile }: ProfileModalProps) {
  const [lastName, setLastName] = useState('');
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [lastNameError, setLastNameError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 背景スクロール制御
  useBodyScrollLock(isOpen);

  // モーダルアニメーション制御
  useEffect(() => {
    if (isOpen) {
      // 少し遅らせてアニメーション開始
      const timer = setTimeout(() => setShowModal(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  // 初期値設定（モーダルが閉じている時のみ実行）
  useEffect(() => {
    if (isOpen && initialProfile && showModal === false) {
      setLastName(initialProfile.lastName);
      setFirstName(initialProfile.firstName);
    }
  }, [isOpen, initialProfile, showModal]);

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

  // バリデーション
  const validateLastName = (value: string, blur = false) => {
    if (blur && value === '') {
      setLastNameError('必須項目です');
      return;
    }
    setLastNameError('');
  };

  const validateFirstName = (value: string, blur = false) => {
    if (blur && value === '') {
      setFirstNameError('必須項目です');
      return;
    }
    setFirstNameError('');
  };

  const resetForm = () => {
    setLastName('');
    setFirstName('');
    setLastNameError('');
    setFirstNameError('');
    setLastNameTouched(false);
    setLastNameFocused(false);
    setFirstNameTouched(false);
    setFirstNameFocused(false);
  };

  const handleSave = async () => {
    if (!lastName.trim()) {
      setLastNameError('必須項目です');
      return;
    }
    if (!firstName.trim()) {
      setFirstNameError('必須項目です');
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(lastName, firstName);
      if (success) {
        setShowModal(false);
        setTimeout(() => {
          resetForm();
          onCancel();
        }, 300);
      }
    } catch {
      // エラー表示の処理を削除
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
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
            <h2 className="text-xl font-bold text-text">プロフィール</h2>
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
          {/* エラーメッセージ */}
          {lastNameError && (lastNameTouched || (!lastNameFocused && lastName === '')) && (
            <p className="text-xs text-red-600 font-semibold mt-2">{lastNameError}</p>
          )}
          
          {firstNameError && (firstNameTouched || (!firstNameFocused && firstName === '')) && (
            <p className="text-xs text-red-600 font-semibold mt-2">{firstNameError}</p>
          )}

          {/* プロフィールフォーム */}
          <div className="space-y-4">
            <div>
              <label htmlFor="modal-lastName" className="block text-sm font-medium text-text mb-1">
                姓
              </label>
              <input
                id="modal-lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (lastNameError) validateLastName(e.target.value, false);
                }}
                onFocus={() => setLastNameFocused(true)}
                onBlur={() => {
                  setLastNameFocused(false);
                  setLastNameTouched(true);
                  validateLastName(lastName, true);
                }}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="山田"
                disabled={isSaving}
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="modal-firstName" className="block text-sm font-medium text-text mb-1">
                名
              </label>
              <input
                id="modal-firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (firstNameError) validateFirstName(e.target.value, false);
                }}
                onFocus={() => setFirstNameFocused(true)}
                onBlur={() => {
                  setFirstNameFocused(false);
                  setFirstNameTouched(true);
                  validateFirstName(firstName, true);
                }}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="太郎"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* フッターボタン */}
          <div className="mt-6">
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
                disabled={isSaving || !lastName.trim() || !firstName.trim()}
                className={`flex-1 px-4 py-2 text-base font-bold rounded-[2rem] transition-colors ${
                  isSaving || !lastName.trim() || !firstName.trim()
                    ? 'bg-blue-500/15 text-blue-500/50 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 