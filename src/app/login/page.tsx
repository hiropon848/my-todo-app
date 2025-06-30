'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [loginError, setLoginError] = useState('');
  const router = useRouter();
  const { login } = useAuth();





  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('handleSubmit called');
    setLoginError('');
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('signIn result:', result);
      if (result.error) {
        setLoginError('メールアドレスまたはパスワードが間違っています');
      } else {
        // プロフィール情報を取得してContextに設定
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_name, first_name')
          .eq('id', result.data.user.id)
          .single();

        if (profile) {
          const userData = {
            id: result.data.user.id,
            lastName: profile.last_name || '',
            firstName: profile.first_name || '',
            displayName: `${profile.last_name} ${profile.first_name} さん`,
            showCompleted: false // デフォルト値に設定（機能は後で削除予定）
          };
          login(userData);
        }
        router.push('/todos');
      }
    } catch {
      setLoginError('メールアドレスまたはパスワードが間違っています');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md">
        <AuthForm type="login" onSubmit={handleSubmit} loginError={loginError} />
      </div>
    </div>
  );
} 