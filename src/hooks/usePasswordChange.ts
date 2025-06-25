import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UsePasswordChangeReturn {
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function usePasswordChange(): UsePasswordChangeReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: 現在のパスワードを確認
      const { data: isValidPassword, error: verifyError } = await supabase
        .rpc('verify_user_password', { password: currentPassword });

      if (verifyError) {
        console.error('パスワード確認エラー:', verifyError);
        setError('パスワードの確認に失敗しました');
        return false;
      }

      if (!isValidPassword) {
        setError('現在のパスワードが間違っています');
        return false;
      }

      // Step 2: パスワードを変更
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('パスワード変更エラー:', updateError);
        
        // Supabaseのエラーメッセージを日本語に変換
        if (updateError.message.includes('Password should be at least')) {
          setError('パスワードは6文字以上で入力してください');
        } else if (updateError.message.includes('Password is too weak')) {
          setError('パスワードが弱すぎます。より強力なパスワードを設定してください');
        } else {
          setError('パスワードの変更に失敗しました');
        }
        return false;
      }

      // 成功
      return true;

    } catch (err) {
      console.error('予期しないエラー:', err);
      setError('予期しないエラーが発生しました');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    changePassword,
    isLoading,
    error
  };
} 