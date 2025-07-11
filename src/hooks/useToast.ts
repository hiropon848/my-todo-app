import { useState, useCallback, useRef } from 'react';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  isShow: boolean;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'success',
    isShow: false
  });
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // 既存のタイマーをクリア
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // 新しいトーストを表示
    setToast({ message, type, isShow: true });
    
    // 3秒後にフェードアウト開始
    timeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, isShow: false }));
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(prev => ({ ...prev, isShow: false }));
  }, []);

  return { toast, showToast, hideToast };
} 