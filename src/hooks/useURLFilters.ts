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
  const [currentFilters, setCurrentFilters] = useState<URLFilterParams>({ priorities: [], statuses: [] });
  
  // コンポーネントマウント時にready状態を設定
  useEffect(() => {
    setIsReady(true);
  }, []);

  // URLパラメータの変化を監視
  useEffect(() => {
    if (isReady) {
      // URLデコードを適用してから処理
      const prioritiesParam = searchParams.get('priorities');
      const statusesParam = searchParams.get('statuses');
      
      const priorities = prioritiesParam 
        ? prioritiesParam.split(',').map(p => decodeURIComponent(p.trim())).filter(p => p) 
        : [];
      const statuses = statusesParam 
        ? statusesParam.split(',').map(s => decodeURIComponent(s.trim())).filter(s => s) 
        : [];
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 URL変化検知:', { priorities, statuses, searchParams: searchParams.toString() });
      }
      
      // 状態の安定化：前回と同じ値の場合は更新をスキップ
      setCurrentFilters(prev => {
        const isSame = 
          prev.priorities?.length === priorities.length &&
          prev.statuses?.length === statuses.length &&
          prev.priorities?.every(p => priorities.includes(p)) &&
          prev.statuses?.every(s => statuses.includes(s));
        
        if (isSame) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 フィルター状態変更なし、更新スキップ');
          }
          return prev;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 フィルター状態更新:', { from: prev, to: { priorities, statuses } });
        }
        return { priorities, statuses };
      });
    }
  }, [searchParams, isReady]);
  
  /**
   * URLからフィルターパラメータを読み取る
   * Phase 3: 監視済みの状態を返す（パフォーマンス最適化）
   */
  const getFiltersFromURL = (): URLFilterParams => {
    return currentFilters;
  };
  
  /**
   * URLにフィルターパラメータを設定する
   * Phase 3: 実際にURLを更新する機能を実装
   */
  const updateFilters = (priorities: string[], statuses: string[]) => {
    if (!isReady) {
      if (process.env.NODE_ENV === 'development') {
        console.log('updateFilters: not ready yet');
      }
      return;
    }
    
    try {
      const params = new URLSearchParams(searchParams);
      
      // 空の場合はパラメータを削除
      if (priorities.length === 0) {
        params.delete('priorities');
      } else {
        // 無効な文字をサニタイズ（カンマ、スペースなど）
        const sanitizedPriorities = priorities
          .filter(p => p && typeof p === 'string' && p.trim())
          .map(p => p.trim());
        if (sanitizedPriorities.length > 0) {
          params.set('priorities', sanitizedPriorities.join(','));
        } else {
          params.delete('priorities');
        }
      }
      
      if (statuses.length === 0) {
        params.delete('statuses');
      } else {
        // 無効な文字をサニタイズ（カンマ、スペースなど）
        const sanitizedStatuses = statuses
          .filter(s => s && typeof s === 'string' && s.trim())
          .map(s => s.trim());
        if (sanitizedStatuses.length > 0) {
          params.set('statuses', sanitizedStatuses.join(','));
        } else {
          params.delete('statuses');
        }
      }
      
      // ブラウザ履歴に追加してURL更新（scroll無効化）
      const queryString = params.toString();
      const urlString = queryString ? `/todos?${queryString}` : '/todos';
      console.log('🔍 router.replace実行:', urlString);
      console.log('🔍 router instance:', router);
      console.log('🔍 パラメータ詳細:', params.toString());
      
      // Next.js 15のApp Router対応: 履歴に追加してブラウザバック対応
      router.push(urlString);
      console.log('🔍 router.replace完了');
    } catch (error) {
      console.error('URL更新エラー:', error);
      // URL更新に失敗してもアプリケーションは継続動作
    }
  };
  
  return { 
    getFiltersFromURL, 
    updateFilters, 
    isReady,
    currentFilters // URL変化を監視可能にする
  };
}