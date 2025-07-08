'use client';

// URLクエリパラメータでソート状態を管理するカスタムフック
// Phase 8: ソート機能強化

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SortOption } from '@/types/todo';

/**
 * URLクエリパラメータでソート状態を管理するフック
 * Phase 8: ソート機能強化で実装
 */
export function useTodoSort() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>('created_desc');
  
  // 有効なソートオプションかチェック
  const isValidSortOption = (value: string): value is SortOption => {
    const validOptions: SortOption[] = [
      'created_desc', 'created_asc', 'updated_desc', 'updated_asc',
      'priority_high', 'priority_low', 'state_progress', 'state_no_progress'
    ];
    return validOptions.includes(value as SortOption);
  };

  // コンポーネントマウント時にready状態を設定
  useEffect(() => {
    setIsReady(true);
  }, []);

  // URLパラメータの変化を監視
  useEffect(() => {
    if (isReady) {
      const sortParam = searchParams.get('sort') || 'created_desc';
      const validSortOption = isValidSortOption(sortParam) ? sortParam : 'created_desc';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 ソートURL変化検知:', { 
          raw: sortParam, 
          validated: validSortOption, 
          searchParams: searchParams.toString() 
        });
      }
      
      // 状態の安定化：前回と同じ値の場合は更新をスキップ
      setCurrentSort(prev => {
        if (prev === validSortOption) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 ソート状態変更なし、更新スキップ');
          }
          return prev;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 ソート状態更新:', { from: prev, to: validSortOption });
        }
        return validSortOption;
      });
    }
  }, [searchParams, isReady]);
  
  /**
   * URLからソートパラメータを読み取る
   * Phase 8: 監視済みの状態を返す（パフォーマンス最適化）
   */
  const getSortFromURL = (): SortOption => {
    return currentSort;
  };
  
  /**
   * URLにソートパラメータを設定する
   * Phase 8: 実際にURLを更新する機能を実装
   */
  const updateSort = (sortOption: SortOption) => {
    if (!isReady) {
      if (process.env.NODE_ENV === 'development') {
        console.log('updateSort: not ready yet');
      }
      return;
    }
    
    try {
      const params = new URLSearchParams(searchParams);
      
      // デフォルト値の場合はパラメータを削除
      if (sortOption === 'created_desc') {
        params.delete('sort');
      } else {
        // 有効なソートオプションかチェック
        if (isValidSortOption(sortOption)) {
          params.set('sort', sortOption);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.warn('無効なソートオプション:', sortOption);
          }
          params.delete('sort');
        }
      }
      
      // ブラウザ履歴に追加してURL更新（scroll無効化）
      const queryString = params.toString();
      const urlString = queryString ? `/todos?${queryString}` : '/todos';
      console.log('🔍 ソートURL更新:', urlString);
      router.push(urlString);
    } catch (error) {
      console.error('ソートURL更新エラー:', error);
      // URL更新に失敗してもアプリケーションは継続動作
    }
  };
  
  return { 
    getSortFromURL, 
    updateSort, 
    isReady,
    currentSort // URL変化を監視可能にする
  };
}