'use client';

import { useEffect, useState } from 'react';
import SuccessToastIcon from '@/icons/toast-success.svg';
import ErrorToastIcon from '@/icons/toast-error.svg';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isOpen: boolean;
  onClose?: () => void;
}

export function Toast({ message, type, isOpen, onClose }: ToastProps) {
  const [toastFade, setToastFade] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setToastFade(false);
      // フェードイン開始
      setShowToast(true);
      // フェードアウト開始のタイミングを制御
      const fadeTimer = setTimeout(() => {
        setToastFade(true);
        // フェードアウト完了後にonClose実行
        if (onClose) {
          setTimeout(onClose, 600);
        }
      }, 2000);

      return () => clearTimeout(fadeTimer);
    } else {
      setShowToast(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // タイプ別のスタイル設定
  const styles = {
    success: {
      background: 'rgba(34,197,94,0.12)',
      borderTop: '1.5px solid rgba(34,197,94,0.18)',
      boxShadow: '0 -2px 32px 0 rgba(34,197,94,0.10)',
      iconColor: '#22c55e',
      textColor: 'text-green-700'
    },
    error: {
      background: 'rgba(239,68,68,0.12)',
      borderTop: '1.5px solid rgba(239,68,68,0.18)',
      boxShadow: '0 -2px 32px 0 rgba(239,68,68,0.10)',
      iconColor: '#ef4444',
      textColor: 'text-red-700'
    }
  };

  const currentStyle = styles[type];

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 z-[100] w-full px-0 py-4 flex items-center justify-center transition-all duration-300 ${
        showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${toastFade ? 'opacity-0' : ''}`}
      style={{
        background: currentStyle.background,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: currentStyle.borderTop,
        fontWeight: 'bold',
        fontSize: '1rem',
        boxShadow: currentStyle.boxShadow
      }}
    >
      {type === 'success' ? (
        <SuccessToastIcon 
          width="24" 
          height="24" 
          className="text-green-500"
          style={{ strokeWidth: '2' }}
        />
      ) : (
        <ErrorToastIcon 
          width="24" 
          height="24" 
          className="text-red-500"
        />
      )}
      <span className={`ml-2 ${currentStyle.textColor}`}>{message}</span>
    </div>
  );
} 