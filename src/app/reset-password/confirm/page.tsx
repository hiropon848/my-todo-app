'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import VisibilityOnIcon from '@/icons/visibility-on.svg';
import VisibilityOffIcon from '@/icons/visibility-off.svg';

export default function ResetPasswordConfirmPage() {
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

  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // バリデーション関数
  const isPasswordHalfWidth = (value: string) => /^[\x21-\x7E]+$/.test(value);
  const isPasswordLength = (value: string) => value.length >= 6;

  const validateNewPassword = (value: string, blur = false) => {
    if (blur && value === '') {
      setNewPasswordError('必須項目です');
      return;
    }
    if (value !== '' && !isPasswordHalfWidth(value)) {
      setNewPasswordError('半角文字で入力してください');
      return;
    }
    if (value !== '' && !isPasswordLength(value)) {
      setNewPasswordError('6文字以上で入力してください');
      return;
    }
    setNewPasswordError('');
  };

  const validateConfirmPassword = (value: string, blur = false) => {
    if (blur && value === '') {
      setConfirmPasswordError('必須項目です');
      return;
    }
    if (value !== '' && value !== newPassword) {
      setConfirmPasswordError('パスワードが一致しません');
      return;
    }
    setConfirmPasswordError('');
  };

  const isFormValid = 
    newPassword.length > 0 && 
    confirmPassword.length > 0 && 
    newPasswordError === '' && 
    confirmPasswordError === '' &&
    newPassword === confirmPassword;

  // セッション確認
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('セッション確認エラー:', error);
          setIsValidSession(false);
          return;
        }

        if (!session) {
          setIsValidSession(false);
          return;
        }

        setIsValidSession(true);
      } catch (error) {
        console.error('予期しないエラー:', error);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    
    setIsLoading(true);
    setUpdateError('');
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('パスワード更新エラー:', error);
        
        // Supabaseの具体的なエラーメッセージに基づいてユーザーフレンドリーなメッセージを表示
        if (error.message.includes('New password should be different from the old password')) {
          setUpdateError('現在のパスワードと同じパスワードは設定できません。異なるパスワードを入力してください。');
        } else if (error.message.includes('Password should be at least')) {
          setUpdateError('パスワードは6文字以上で入力してください。');
        } else if (error.message.includes('Password is too weak')) {
          setUpdateError('パスワードが弱すぎます。より強力なパスワードを設定してください。');
        } else if (error.message.includes('Unable to validate email address: invalid format')) {
          setUpdateError('無効なセッションです。新しいパスワードリセット要求を送信してください。');
        } else {
          setUpdateError('パスワードの更新に失敗しました。再度お試しください。');
        }
        setIsLoading(false);
        return;
      }
      
      // 成功時
      setIsCompleted(true);
      setIsLoading(false);
    } catch (error) {
      console.error('予期しないエラー:', error);
      setUpdateError('予期しないエラーが発生しました。再度お試しください。');
      setIsLoading(false);
    }
  };

  // ローディング画面
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-[448px] mx-auto p-8 space-y-8 bg-white/15 [backdrop-filter:blur(10px)] border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.01) 100%)',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              filter: 'blur(4px)'
            }}
          />
          <div className="relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-text">
                読み込み中...
              </h2>
              <p className="mt-2 text-text">
                セッション情報を確認しています
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 無効なセッション画面
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-[448px] mx-auto p-8 space-y-8 bg-white/15 [backdrop-filter:blur(10px)] border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.01) 100%)',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              filter: 'blur(4px)'
            }}
          />
          <div className="relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-text">
                無効なリンク
              </h2>
              <p className="mt-4 text-text">
                パスワードリセットのリンクが<br />
                無効であるか、有効期限が切れています。
              </p>
              <p className="mt-4 text-sm text-text/80">
                新しいパスワードリセット要求を<br />
                送信してください。
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-sm text-text">
                  <a href="/reset-password" className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline">
                    パスワードリセット要求ページに戻る
                  </a>
                </p>
                <p className="text-sm text-text">
                  <a href="/login" className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline">
                    ログインページに戻る
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 完了画面
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-[448px] mx-auto p-8 space-y-8 bg-white/15 [backdrop-filter:blur(10px)] border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.01) 100%)',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              filter: 'blur(4px)'
            }}
          />
          <div className="relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-text">
                パスワードを変更しました
              </h2>
              <p className="mt-4 text-text">
                パスワードが正常に更新されました。<br />
                新しいパスワードでログインしてください。
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <div className="text-center">
                <p className="text-sm text-text">
                  <a href="/login" className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline">
                    ログインページに移動
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // パスワード変更フォーム画面
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-[448px] mx-auto p-8 space-y-8 bg-white/15 [backdrop-filter:blur(10px)] border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.01) 100%)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            filter: 'blur(4px)'
          }}
        />
        <div className="relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text">
              新しいパスワード設定
            </h2>
            <p className="mt-2 text-text">
              新しいパスワードを入力してください
            </p>
          </div>
          <form className="mt-6 space-y-6 mb-6" onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-4">
              {/* 新しいパスワード */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-text mb-1">
                  新しいパスワード
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={isNewPasswordVisible ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={e => {
                      setNewPassword(e.target.value);
                      validateNewPassword(e.target.value, false);
                      // 確認パスワードも再バリデーション
                      if (confirmPassword) {
                        validateConfirmPassword(confirmPassword, false);
                      }
                    }}
                    onFocus={() => {
                      setIsNewPasswordFocused(true);
                    }}
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
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={isNewPasswordVisible ? 'パスワードを非表示' : 'パスワードを表示'}
                    onClick={() => setIsNewPasswordVisible(v => !v)}
                    className="absolute inset-y-0 right-2 flex items-center px-1 text-text hover:text-primary focus:outline-none"
                    style={{ strokeWidth: '3' }}
                  >
                    {isNewPasswordVisible ? (
                      <VisibilityOnIcon className="w-6 h-6 relative top-[1px]" />
                    ) : (
                      <VisibilityOffIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
                {newPasswordError && (isNewPasswordTouched || (!isNewPasswordFocused && newPassword !== '')) && (
                  <p className="text-xs text-red-600 font-semibold mt-2">{newPasswordError}</p>
                )}
              </div>

              {/* パスワード確認 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-1">
                  パスワード確認
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={isConfirmPasswordVisible ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      validateConfirmPassword(e.target.value, false);
                    }}
                    onFocus={() => {
                      setIsConfirmPasswordFocused(true);
                    }}
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
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={isConfirmPasswordVisible ? 'パスワードを非表示' : 'パスワードを表示'}
                    onClick={() => setIsConfirmPasswordVisible(v => !v)}
                    className="absolute inset-y-0 right-2 flex items-center px-1 text-text hover:text-primary focus:outline-none"
                    style={{ strokeWidth: '3' }}
                  >
                    {isConfirmPasswordVisible ? (
                      <VisibilityOnIcon className="w-6 h-6 relative top-[1px]" />
                    ) : (
                      <VisibilityOffIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
                {confirmPasswordError && (isConfirmPasswordTouched || (!isConfirmPasswordFocused && confirmPassword !== '')) && (
                  <p className="text-xs text-red-600 font-semibold mt-2">{confirmPasswordError}</p>
                )}
              </div>
            </div>

            <div>
              {/* パスワード更新ボタン */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative w-full flex justify-center py-3 rounded-[2rem] overflow-hidden text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-100 ${isFormValid && !isLoading ? '' : 'opacity-80 cursor-not-allowed'}`}
                style={
                  !isFormValid || isLoading
                    ? {
                        background: 'rgba(37, 99, 235, 0.15)',
                        border: 'none',
                        boxShadow: '0 0 0 1.5px rgba(37, 99, 235, 0.25) inset, 0 0 16px 4px rgba(37, 99, 235, 0.12) inset',
                      }
                    : isHovered
                    ? {
                        background: 'var(--tw-color-primary, #2563eb)',
                        border: 'none',
                        boxShadow: '0 0 0 1.5px rgba(37, 99, 235, 0.8) inset, 0 0 16px 4px rgba(37, 99, 235, 0.6) inset',
                      }
                    : {
                        background: 'rgba(37, 99, 235, 0.5)',
                        backdropFilter: 'blur(32px)',
                        WebkitBackdropFilter: 'blur(32px)',
                        border: 'none',
                        boxShadow: '0 0 0 1.5px rgba(37, 99, 235, 0.6) inset, 0 0 16px 4px rgba(37, 99, 235, 0.4) inset',
                      }
                }
              >
                <span className={`relative z-10 ${!isFormValid || isLoading ? 'opacity-50' : ''}`}>
                  {isLoading ? '更新中...' : 'パスワードを更新'}
                </span>
                <span
                  className="absolute inset-0 rounded-[2rem] pointer-events-none"
                  style={{
                    boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.8) inset, 0 0 24px 4px rgba(37, 99, 235, 0.5) inset',
                    background:
                      'radial-gradient(circle at 50% 40%, rgba(37, 99, 235, 0.6) 0%, rgba(37, 99, 235, 0.2) 80%, rgba(37, 99, 235, 0.00) 100%)',
                    mixBlendMode: 'screen',
                  }}
                />
              </button>
              {/* エラーメッセージ */}
              {updateError && (
                <div className="mt-3 text-red-600 font-semibold text-sm text-center">
                  {updateError}
                </div>
              )}
            </div>
          </form>
          <div className="text-center">
            <p className="text-sm text-text">
              <a href="/login" className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline">
                ログインページに戻る
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 