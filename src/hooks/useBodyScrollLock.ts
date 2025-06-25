import { useEffect, useRef } from 'react';

/**
 * モーダル表示時に背景スクロールを無効化するカスタムフック
 * 複数モーダル対応、スクロール位置保存・復元機能付き
 */
export function useBodyScrollLock(isLocked: boolean) {
  const scrollPositionRef = useRef<number>(0);
  
  useEffect(() => {
    // サーバーサイドレンダリング対応
    if (typeof window === 'undefined') return;
    
    if (isLocked) {
      // スクロール位置を保存
      scrollPositionRef.current = window.scrollY;
      
      // 既存のoverflow値を保存（他のCSS設定との競合を避ける）
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;
      
      // bodyのスクロールを無効化
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      
      // クリーンアップ関数で元の状態に復元
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        
        // スクロール位置を復元
        window.scrollTo(0, scrollPositionRef.current);
      };
    }
  }, [isLocked]);
} 