'use client';

// URLクエリパラメータでフィルター状態を管理するカスタムフック
// Phase 1: 基盤準備で作成 - まずは読み取り専用で実装

// Phase 2: useSearchParams一時的に無効化（Suspense boundary問題回避）
// import { useSearchParams, useRouter } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { URLFilterParams } from '@/types/filter';

/**
 * URLクエリパラメータでフィルター状態を管理するフック
 * Phase 1では読み取り専用機能のみ実装、Phase 3でURL更新機能を実装予定
 */
export function useURLFilters() {
  // Phase 2: Suspense boundary問題回避のため一時的に無効化
  // Phase 3で適切なSuspense境界とともに実装予定
  // const searchParams = useSearchParams();
  // Phase 3で使用予定のためESLintエラー回避
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [isReady] = useState(false); // Phase 3で使用予定
  
  /**
   * URLからフィルターパラメータを読み取る
   * Phase 2: 安全のため空配列を返す（Phase 3で本実装）
   */
  const getFiltersFromURL = (): URLFilterParams => {
    // Phase 2: Suspense boundary問題回避のため常に空配列を返す
    return { priorities: [], statuses: [] };
  };
  
  /**
   * URLにフィルターパラメータを設定する
   * Phase 1ではプレースホルダー実装、Phase 3で本実装予定
   */
  const updateFilters = (priorities: string[], statuses: string[]) => {
    // Phase 3で実装予定 - 現在はコンソールログのみ
    console.log('updateFilters called (Phase 1 placeholder)', { priorities, statuses });
  };
  
  return { 
    getFiltersFromURL, 
    updateFilters, 
    isReady 
  };
}