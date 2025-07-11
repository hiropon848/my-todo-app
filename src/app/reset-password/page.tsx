'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // バリデーション関数
  const isEmailHalfWidth = (value: string) => /^[\x21-\x7E]+$/.test(value);
  const isEmailFormat = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateEmail = (value: string, blur = false) => {
    if (blur && value === '') {
      setEmailError('必須項目です');
      return;
    }
    if (value !== '' && !isEmailHalfWidth(value)) {
      setEmailError('半角文字で入力してください');
      return;
    }
    if (value !== '' && !isEmailFormat(value)) {
      setEmailError('正しいメールアドレスを入力してください');
      return;
    }
    setEmailError('');
  };

  const isFormValid = email.length > 0 && emailError === '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    
    setIsLoading(true);
    setResetError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/confirm`
      });
      
      if (error) {
        console.error('パスワードリセットエラー:', error);
        setResetError('メール送信に失敗しました。しばらく時間をおいて再度お試しください。');
        setIsLoading(false);
        return;
      }
      
      // 成功時
      setIsSubmitted(true);
      setIsLoading(false);
    } catch (error) {
      console.error('予期しないエラー:', error);
      setResetError('予期しないエラーが発生しました。再度お試しください。');
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    // 送信完了画面
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-[448px] mx-auto p-8 space-y-8 bg-white/15 [backdrop-filter:blur(10px)] border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
          {/* 光沢レイヤー */}
          <div
            className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
            style={{
              background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.01) 100%)',
              borderTopLeftRadius: '1rem',
              borderTopRightRadius: '1rem',
              filter: 'blur(4px)'
            }}
          />
          {/* 送信完了メッセージ */}
          <div className="relative z-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-text">
                メールを送信しました
              </h2>
              <p className="mt-4 text-text">
                パスワードリセット用のリンクを<br />
                <span className="font-medium">{email}</span><br />
                に送信しました。
              </p>
              <p className="mt-4 text-sm text-text/80">
                メールが届かない場合は、<br />
                迷惑メールフォルダもご確認ください。
              </p>
            </div>
            <div className="mt-8 space-y-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setResetError('');
                }}
                className="w-full py-3 text-sm text-primary hover:text-primary/80 transition-colors duration-200 underline"
              >
                再送信する
              </button>
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
      </div>
    );
  }

  // メール入力画面
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative w-[448px] mx-auto p-8 space-y-8 bg-white/15 [backdrop-filter:blur(10px)] border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* 光沢レイヤー */}
        <div
          className="absolute top-0 left-0 w-full h-1/2 pointer-events-none"
          style={{
            background: 'linear-gradient(120deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 60%, rgba(255,255,255,0.01) 100%)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            filter: 'blur(4px)'
          }}
        />
        {/* フォーム本体 */}
        <div className="relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text">
              パスワードリセット
            </h2>
            <p className="mt-2 text-text">
              登録されたメールアドレスに<br />
              リセット用のリンクを送信します
            </p>
          </div>
          <form className="mt-6 space-y-6 mb-6" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value, false);
                }}
                onFocus={() => {
                  setIsEmailFocused(true);
                }}
                onBlur={() => {
                  setIsEmailFocused(false);
                  setIsEmailTouched(true);
                  validateEmail(email, true);
                }}
                onKeyUp={e => {
                  const inputKey = e.key;
                  // 文字入力・削除系のみバリデーション
                  if (
                    inputKey.length === 1 || // 1文字のキー（英数字・記号）
                    inputKey === 'Backspace' ||
                    inputKey === 'Delete'
                  ) {
                    validateEmail((e.target as HTMLInputElement).value, false);
                  }
                }}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all duration-200 text-base placeholder-gray-400"
                placeholder="example@example.com"
              />
              {/* エラーメッセージ */}
              {emailError && (isEmailTouched || (!isEmailFocused && email !== '')) && (
                <p className="text-xs text-red-600 font-semibold mt-2">{emailError}</p>
              )}
            </div>
            <div>
              {/* リセット送信ボタン */}
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
                  {isLoading ? '送信中...' : 'リセットメールを送信'}
                </span>
                {/* 内側ベベル・グロー */}
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
              {resetError && (
                <div className="mt-3 text-red-600 font-semibold text-sm text-center">
                  {resetError}
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