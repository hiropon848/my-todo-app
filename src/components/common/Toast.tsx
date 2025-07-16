'use client';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import SuccessToastIcon from '@/icons/toast-success.svg';
import ErrorToastIcon from '@/icons/toast-error.svg';
import { useToast } from '@/contexts/ToastContext';

export function Toast() {
  const { toast } = useToast();
  const { message, type, isShow } = toast;
  const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    if (isShow) {
      // フェードイン開始
      setIsToastVisible(true);
    } else {
      setIsToastVisible(false);
    }
  }, [isShow]);

  if (!isShow) return null;

  // タイプ別のスタイル設定
  const styles = {
    success: {
      background: 'rgba(34,197,94,0.5)',
      borderTop: '1.5px solid rgba(34,197,94,0.18)',
      boxShadow: '0 -2px 32px 0 rgba(34,197,94,0.10)',
      iconColor: '#22c55e',
      textColor: 'text-green-700'
    },
    error: {
      background: 'rgba(239,68,68,0.5)',
      borderTop: '1.5px solid rgba(4, 4, 4, 0.18)',
      boxShadow: '0 -2px 32px 0 rgba(239,68,68,0.10)',
      iconColor: '#ef4444',
      textColor: 'text-red-700'
    }
  };

  const currentStyle = styles[type];

  const toastElement = (
    <div
      className={`fixed left-0 right-0 bottom-0 w-full px-0 py-4 flex items-center justify-center transition-all duration-300 ${
        isToastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        zIndex: 9999,
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

  return ReactDOM.createPortal(toastElement, document.body);
} 