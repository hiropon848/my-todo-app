'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileForm } from '@/components/auth/ProfileForm';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const router = useRouter();

  // 未ログイン時は/loginにリダイレクト
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
      }
    })();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }

      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          last_name: formData.get('lastName'),
          first_name: formData.get('firstName'),
        });

      if (error) throw error;

      // 登録成功後、完了画面へ遷移
      router.push('/complete');
    } catch (error) {
      console.error('プロフィール登録エラー:', error);
      // TODO: エラーハンドリングの実装
    }
  };

  return <ProfileForm onSubmit={handleSubmit} />;
} 