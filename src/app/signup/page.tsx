'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { supabase } from '@/lib/supabase';

export default function SignUpPage() {
  const router = useRouter();
  const [signupError, setSignupError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          setSignupError('このメールアドレスは既に登録されています');
        } else {
          setSignupError('アカウント作成に失敗しました');
        }
        return;
      }

      // サインアップ成功後、プロフィール登録画面へ遷移
      router.push('/profile');
    } catch {
      setSignupError('アカウント作成に失敗しました');
    }
  };

  return <AuthForm type="signup" onSubmit={handleSubmit} signupError={signupError} />;
} 