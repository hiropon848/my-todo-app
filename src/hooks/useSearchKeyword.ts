'use client';

// URLクエリパラメータで検索キーワードを管理するカスタムフック
// Phase 7: 検索機能実装

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

/**
 * URLクエリパラメータで検索キーワードを管理するフック
 * Phase 7: 検索機能実装で作成
 */
export function useSearchKeyword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [currentSearchKeyword, setCurrentSearchKeyword] = useState<string>('');
  
  // コンポーネントマウント時にready状態を設定
  useEffect(() => {
    setIsReady(true);
  }, []);

  // URLパラメータの変化を監視
  useEffect(() => {
    if (isReady) {
      const searchKeyword = searchParams.get('q') || '';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 検索キーワードURL変化検知:', { 
          searchKeyword, 
          searchParams: searchParams.toString() 
        });
      }
      
      // 状態の安定化：前回と同じ値の場合は更新をスキップ
      setCurrentSearchKeyword(prev => {
        if (prev === searchKeyword) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 検索キーワード状態変更なし、更新スキップ');
          }
          return prev;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 検索キーワード状態更新:', { from: prev, to: searchKeyword });
        }
        return searchKeyword;
      });
    }
  }, [searchParams, isReady]);
  
  /**
   * URLから検索キーワードを読み取る
   * Phase 7: 監視済みの状態を返す（パフォーマンス最適化）
   */
  const getSearchKeywordFromURL = (): string => {
    return currentSearchKeyword;
  };
  
  /**
   * URLに検索キーワードを設定する
   * Phase 7: 実際にURLを更新する機能を実装
   */
  const updateSearchKeyword = (keyword: string) => {
    if (!isReady) {
      if (process.env.NODE_ENV === 'development') {
        console.log('updateSearchKeyword: not ready yet');
      }
      return;
    }
    
    try {
      const params = new URLSearchParams(searchParams);
      
      // 空文字またはトリム後空の場合はパラメータを削除
      const trimmedKeyword = keyword.trim();
      if (trimmedKeyword === '') {
        params.delete('q');
      } else {
        params.set('q', trimmedKeyword);
      }
      
      // ブラウザ履歴に追加してURL更新（scroll無効化）
      const queryString = params.toString();
      const urlString = queryString ? `/todos?${queryString}` : '/todos';
      console.log('🔍 検索キーワードURL更新:', urlString);
      router.push(urlString);
    } catch (error) {
      console.error('検索キーワードURL更新エラー:', error);
      // URL更新に失敗してもアプリケーションは継続動作
    }
  };
  
  return { 
    getSearchKeywordFromURL, 
    updateSearchKeyword, 
    isReady,
    currentSearchKeyword // URL変化を監視可能にする
  };
}