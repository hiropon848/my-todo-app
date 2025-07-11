import React, { useState } from 'react';
import VisibilityOnIcon from '@/icons/visibility-on.svg';
import VisibilityOffIcon from '@/icons/visibility-off.svg';

interface AuthFormProps {
  type: 'signup' | 'login';
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loginError?: string;
  signupError?: string;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, loginError, signupError }) => {
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailError, setEmailError] = useState('');

  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // ホバー状態管理
  const [isHovered, setIsHovered] = useState(false);

  // メールアドレス用バリデーション
  const isEmailHalfWidth = (value: string) => /^[\x21-\x7E]+$/.test(value);
  const isEmailFormat = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // パスワード用バリデーション
  const isPasswordHalfWidth = (value: string) => /^[\x21-\x7E]+$/.test(value);
  const isPasswordLength = (value: string) => value.length >= 6;

  // メールアドレスのエラー判定
  const validateEmail = (value: string, blur = false) => {
    if (blur && value === '') {
      setEmailError('必須項目です');
      return;
    }
    if (value && !isEmailHalfWidth(value)) {
      setEmailError('無効な文字が含まれています');
      return;
    }
    if (blur && value && isEmailHalfWidth(value) && !isEmailFormat(value)) {
      setEmailError('フォーマットが正しくありません');
      return;
    }
    setEmailError('');
  };

  // パスワードのエラー判定
  const validatePassword = (value: string, blur = false) => {
    if (blur && value === '') {
      setPasswordError('必須項目です');
      return;
    }
    if (value && !isPasswordHalfWidth(value)) {
      setPasswordError('無効な文字が含まれています');
      return;
    }
    if (blur && value && isPasswordHalfWidth(value) && !isPasswordLength(value)) {
      setPasswordError('6文字以上で入力してください(半角英数字および半角記号のみ)');
      return;
    }
    setPasswordError('');
  };

  // フォームの有効判定
  const isFormValid =
    isEmailHalfWidth(email) &&
    isEmailFormat(email) &&
    isPasswordHalfWidth(password) &&
    isPasswordLength(password);

  const [showPassword, setShowPassword] = useState(false);

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
              {type === 'signup' ? 'アカウント作成' : 'ログイン'}
            </h2>
            <p className="mt-2 text-text">
              {type === 'signup' 
                ? '新しいアカウントを作成しましょう' 
                : 'アカウントにログインしてください'}
            </p>
          </div>
          <form className="mt-6 space-y-6 mb-6" onSubmit={onSubmit} autoComplete="off">
            <div className="space-y-4">
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
                    setEmailFocused(true);
                  }}
                  onBlur={() => {
                    setEmailFocused(false);
                    setEmailTouched(true);
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
                {emailError && (emailTouched || (!emailFocused && email !== '')) && (
                  <p className="text-xs text-red-600 font-semibold mt-2">{emailError}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value, false);
                    }}
                    onFocus={() => {
                      setPasswordFocused(true);
                    }}
                    onBlur={() => {
                      setPasswordFocused(false);
                      setPasswordTouched(true);
                      validatePassword(password, true);
                    }}
                    onKeyUp={e => {
                      const inputKey = e.key;
                      if (
                        inputKey.length === 1 ||
                        inputKey === 'Backspace' ||
                        inputKey === 'Delete'
                      ) {
                        validatePassword((e.target as HTMLInputElement).value, false);
                      }
                    }}
                    className="mt-1 block w-full px-3 py-2 pr-10 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all duration-200 text-base placeholder-gray-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute inset-y-0 right-2 flex items-center px-1 text-text hover:text-primary focus:outline-none"
                  >
                    {showPassword ? (
                      // 表示中：SVGコンポーネント
                      <VisibilityOnIcon className="w-6 h-6 relative top-[1px]" />
                    ) : (
                      // 非表示中：SVGコンポーネント
                      <VisibilityOffIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
                {passwordError && (passwordTouched || (!passwordFocused && password !== '')) && (
                  <p className="text-xs text-red-600 font-semibold mt-2">{passwordError}</p>
                )}
              </div>
            </div>
            <div>
              {/* GlassButton風ログインボタン（Apple純正コントロールセンター風・極薄白・内側ベベル・グロー） */}
              <button
                type="submit"
                disabled={!isFormValid}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative w-full flex justify-center py-3 rounded-[2rem] overflow-hidden text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-100 ${isFormValid ? '' : 'opacity-80 cursor-not-allowed'}`}
                style={
                  !isFormValid
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
                <span className={`relative z-10 ${!isFormValid ? 'opacity-50' : ''}`}>
                  {type === 'signup' ? 'アカウント作成' : 'ログイン'}
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
              {/* ログインエラー時のメッセージ（ボタン直下） */}
              {type === 'login' && loginError && (
                <div className="mt-2 text-red-600 font-semibold text-xs text-center">
                  {loginError}
                </div>
              )}
              {/* サインアップエラー時のメッセージ（ボタン直下） */}
              {type === 'signup' && signupError && (
                <div className="mt-2 text-red-600 font-semibold text-xs text-center">
                  {signupError}
                </div>
              )}
            </div>
          </form>
          <div className="text-center space-y-2">
            <p className="text-sm text-text">
              {type === 'signup' ? (
                <>
                  すでにアカウントをお持ちのかたは
                  <a href="/login" className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline">
                    コチラ
                  </a>
                </>
              ) : (
                <>
                  アカウントをお持ちでないかたは
                  <a href="/signup" className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline">
                    コチラ
                  </a>
                </>
              )}
            </p>
            {type === 'login' && (
              <p className="text-sm text-text">
                パスワードを忘れたかたは
                <a href="/reset-password" className="font-medium text-primary hover:text-primary/90 transition-colors duration-200 underline">
                  コチラ
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 