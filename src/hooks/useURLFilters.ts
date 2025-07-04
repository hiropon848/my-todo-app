'use client';

// URLクエリパラメータでフィルター状態を管理するカスタムフック
// Phase 3 Step 3-2: URL更新機能実装

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { URLFilterParams } from '@/types/filter';

/**
 * URLクエリパラメータでフィルター状態を管理するフック
 * Phase 3で本実装: URL読み取り・更新機能を実装
 */
export function useURLFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  
  // コンポーネントマウント時にready状態を設定
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  /**
   * URLからフィルターパラメータを読み取る
   * Phase 3: 実際にURLパラメータを解析して返す
   */
  const getFiltersFromURL = (): URLFilterParams => {
    if (!isReady) {
      return { priorities: [], statuses: [] };
    }
    
    const priorities = searchParams.get('priorities')?.split(',').filter(p => p.trim()) || [];
    const statuses = searchParams.get('statuses')?.split(',').filter(s => s.trim()) || [];
    
    return { priorities, statuses };
  };
  
  /**
   * URLにフィルターパラメータを設定する
   * Phase 3: 実際にURLを更新する機能を実装
   */
  const updateFilters = (priorities: string[], statuses: string[]) => {
    if (!isReady) {
      console.log('updateFilters: not ready yet');
      return;
    }
    
    const params = new URLSearchParams(searchParams);
    
    // 空の場合はパラメータを削除
    if (priorities.length === 0) {
      params.delete('priorities');
    } else {
      params.set('priorities', priorities.join(','));
    }
    
    if (statuses.length === 0) {
      params.delete('statuses');
    } else {
      params.set('statuses', statuses.join(','));
    }
    
    // ページ遷移ではなくURLの更新のみ（scroll無効化）
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  
  return { 
    getFiltersFromURL, 
    updateFilters, 
    isReady 
  };
}