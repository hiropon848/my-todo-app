import React, { useState } from 'react';

interface ProfileFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  const [lastName, setLastName] = useState('');
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [lastNameError, setLastNameError] = useState('');

  const [firstName, setFirstName] = useState('');
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');

  const [isHovered, setIsHovered] = useState(false);

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

  const isFormValid = lastName.length > 0 && firstName.length > 0;

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
              プロフィール登録
            </h2>
            <p className="mt-2 text-text">
              あなたの情報を登録しましょう
            </p>
          </div>
          <form className="mt-6 space-y-6 mb-6" onSubmit={onSubmit} autoComplete="off">
            <div className="space-y-4">
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-text mb-1">
                  姓
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={e => {
                    setLastName(e.target.value);
                    if (lastNameError) validateLastName(e.target.value, false);
                  }}
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => {
                    setLastNameFocused(false);
                    setLastNameTouched(true);
                    validateLastName(lastName, true);
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all duration-200 text-base placeholder-gray-400"
                  placeholder="山田"
                />
                {lastNameError && (lastNameTouched || (!lastNameFocused && lastName === '')) && (
                  <p className="text-xs text-red-600 font-semibold mt-2">{lastNameError}</p>
                )}
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-text mb-1">
                  名
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={e => {
                    setFirstName(e.target.value);
                    if (firstNameError) validateFirstName(e.target.value, false);
                  }}
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => {
                    setFirstNameFocused(false);
                    setFirstNameTouched(true);
                    validateFirstName(firstName, true);
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all duration-200 text-base placeholder-gray-400"
                  placeholder="太郎"
                />
                {firstNameError && (firstNameTouched || (!firstNameFocused && firstName === '')) && (
                  <p className="text-xs text-red-600 font-semibold mt-2">{firstNameError}</p>
                )}
              </div>
            </div>
            <div>
              {/* GlassButton風登録ボタン */}
              <button
                type="submit"
                disabled={!isFormValid}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative w-full flex justify-center py-3 rounded-[2rem] overflow-hidden text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-100 ${isFormValid ? '' : 'opacity-80 cursor-not-allowed bg-black'}`}
                style={
                  !isFormValid
                    ? {
                        background: 'none',
                        border: 'none',
                        boxShadow: '0 0 0 1.5px rgba(255,255,255,0.18) inset, 0 0 16px 4px rgba(255,255,255,0.10) inset',
                      }
                    : isHovered
                    ? {
                        background: 'var(--tw-color-primary, #2563eb)',
                        border: 'none',
                        boxShadow: '0 0 0 1.5px rgba(255,255,255,0.18) inset, 0 0 16px 4px rgba(255,255,255,0.10) inset',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(32px)',
                        WebkitBackdropFilter: 'blur(32px)',
                        border: 'none',
                        boxShadow: '0 0 0 1.5px rgba(255,255,255,0.18) inset, 0 0 16px 4px rgba(255,255,255,0.10) inset',
                      }
                }
              >
                <span className={`relative z-10 ${!isFormValid ? 'opacity-50' : ''}`}>
                  登録する
                </span>
                {/* 内側ベベル・グロー */}
                <span
                  className="absolute inset-0 rounded-[2rem] pointer-events-none"
                  style={{
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.25) inset, 0 0 24px 4px rgba(255,255,255,0.10) inset',
                    background:
                      'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 80%, rgba(255,255,255,0.00) 100%)',
                    mixBlendMode: 'screen',
                  }}
                />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 