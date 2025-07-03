import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UseProfileReturn {
  updateProfile: (userId: string, lastName: string, firstName: string) => Promise<boolean>;
  isProfileLoading: boolean;
  error: string | null;
}

export function useProfile(): UseProfileReturn {
  const [error, setError] = useState<string | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const updateProfile = async (userId: string, lastName: string, firstName: string): Promise<boolean> => {
    setError(null);
    setIsProfileLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ last_name: lastName, first_name: firstName })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      return true;
    } catch {
      setError('プロフィールの更新に失敗しました');
      return false;
    } finally {
      setIsProfileLoading(false);
    }
  };

  return {
    updateProfile,
    isProfileLoading,
    error
  };
} 