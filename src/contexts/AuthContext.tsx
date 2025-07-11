'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  lastName: string;
  firstName: string;
  displayName: string;
  isCompletedVisible: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

// 統合された認証状態
interface AuthState {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated' | 'logging_out';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 状態を統合（原子的操作を可能にする）
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    status: 'loading'
  });

  // 既存インターフェースとの互換性を保つ派生状態
  const user = authState.user;
  const isLoading = authState.status === 'loading';
  const isLoggingOut = authState.status === 'logging_out';

  // デバッグ用：状態変化をログ出力（核心部分のみ）
  useEffect(() => {
    // 特別な警告：ログアウト状態の変化
    if (authState.status === 'logging_out') {
      console.log('⚠️ LOGGING_OUT STATE ACTIVE');
    }
    if (authState.status === 'unauthenticated' && !authState.user) {
      console.log('⚠️ UNAUTHENTICATED STATE (potential problem)');
    }
  }, [authState]);

  // 初期認証チェックと認証状態監視
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (authError) {
          setAuthState({ user: null, status: 'unauthenticated' });
          return;
        }
        
        if (!authUser) {
          setAuthState({ user: null, status: 'unauthenticated' });
          return;
        }

        // プロフィール情報を取得
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('last_name, first_name')
          .eq('id', authUser.id)
          .single();

        if (!mounted) return;
        
        if (profileError) {
          console.warn('Profile fetch error (user still authenticated):', profileError.message);
          const userData: User = {
            id: authUser.id,
            lastName: '',
            firstName: '',
            displayName: 'ユーザー',
            isCompletedVisible: false
          };
          setAuthState({ user: userData, status: 'authenticated' });
        } else if (profile) {
          const userData: User = {
            id: authUser.id,
            lastName: profile.last_name || '',
            firstName: profile.first_name || '',
            displayName: `${profile.last_name} ${profile.first_name} さん`,
            isCompletedVisible: false // デフォルト値に設定（機能は後で削除予定）
          };
          setAuthState({ user: userData, status: 'authenticated' });
        }
      } catch (error) {
        console.error('Unexpected auth check error:', error);
        if (mounted) {
          setAuthState({ user: null, status: 'unauthenticated' });
        }
      }
    };

    checkAuth();

    // 認証状態の変化を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      if (event === 'SIGNED_OUT' || !session) {
        setAuthState(prev => {
          if (prev.status === 'logging_out') {
            // ログアウト処理中は状態変更しない（ページリロードで解決）
            return prev;
          }
          return { user: null, status: 'unauthenticated' };
        });
      } else if (event === 'SIGNED_IN' && session) {
        setAuthState(prev => ({ ...prev, status: 'authenticated' }));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setAuthState({ user: userData, status: 'authenticated' });
  };

  const logout = async () => {
    console.log('🚪 Logout process started');
    
    // 原子的状態変更でログアウト処理開始
    setAuthState(prev => ({ ...prev, status: 'logging_out' }));
    
    try {
      await supabase.auth.signOut();
      
      // 強制的なページリロードで確実に遷移
      console.log('🔀 Force navigating to login page with page reload');
      window.location.href = '/login';
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      setAuthState(prev => ({ ...prev, status: 'authenticated' }));
    }
  };

  const updateUser = (updates: Partial<User>) => {
    console.log('👤 User update called:', updates);
    setAuthState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...updates };
      if (updates.lastName || updates.firstName) {
        updatedUser.displayName = `${updatedUser.lastName} ${updatedUser.firstName} さん`;
      }
      return { ...prev, user: updatedUser };
    });
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggingOut,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 