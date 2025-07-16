/**
 * オフライン復旧フック
 * Step 2-C-3: リアルタイム復旧機能実装
 * 
 * オフライン状態の検知、失敗操作の保存、復旧時の自動再実行
 */

import { useState, useEffect, useCallback } from 'react';
import { useAutoRetry } from './useAutoRetry';

export interface OfflineOperation {
  id: string;
  operation: 'add' | 'update' | 'delete';
  data: {
    userId?: string;
    title?: string;
    text?: string;
    priorityId?: string;
    statusId?: string;
    id?: string;
  };
  timestamp: number;
  context: string;
}

export interface OfflineRecoveryState {
  isOnline: boolean;
  isRecovering: boolean;
  queuedOperations: OfflineOperation[];
  recoveredCount: number;
  failedCount: number;
}

const OFFLINE_QUEUE_KEY = 'todo_offline_queue';

export function useOfflineRecovery() {
  console.log('🔍 [useOfflineRecovery] 関数実行開始');
  
  const [state, setState] = useState<OfflineRecoveryState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isRecovering: false,
    queuedOperations: [],
    recoveredCount: 0,
    failedCount: 0
  });

  const { retryTodoOperation } = useAutoRetry();

  // localStorageからキューを読み込み
  const loadQueue = useCallback((): OfflineOperation[] => {
    console.log('🔍 [useOfflineRecovery] loadQueue 再生成');
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[useOfflineRecovery] キュー読み込みエラー:', error);
      return [];
    }
  }, []);

  // localStorageにキューを保存
  const saveQueue = useCallback((operations: OfflineOperation[]): void => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(operations));
    } catch (error) {
      console.error('[useOfflineRecovery] キュー保存エラー:', error);
    }
  }, []);

  // キューに操作を追加
  const queueOperation = useCallback((operation: OfflineOperation): void => {
    setState(prev => {
      const newQueue = [...prev.queuedOperations, operation];
      saveQueue(newQueue);
      return {
        ...prev,
        queuedOperations: newQueue
      };
    });
  }, [saveQueue]);

  // キューから操作を削除
  const removeFromQueue = useCallback((operationId: string): void => {
    setState(prev => {
      const newQueue = prev.queuedOperations.filter(op => op.id !== operationId);
      saveQueue(newQueue);
      return {
        ...prev,
        queuedOperations: newQueue
      };
    });
  }, [saveQueue]);

  // 復旧処理の実行
  const executeRecovery = useCallback(async (): Promise<void> => {
    console.log('🔍 [useOfflineRecovery] executeRecovery 再生成');
    setState(prev => {
      if (prev.isRecovering || prev.queuedOperations.length === 0) {
        return prev;
      }

      console.log('[useOfflineRecovery] 復旧処理開始:', prev.queuedOperations.length);

      // 復旧処理を非同期で実行
      (async () => {
        const currentQueue = prev.queuedOperations;
        let recoveredCount = 0;
        let failedCount = 0;

        for (const operation of currentQueue) {
          try {
            // 既存のretryTodoOperationを活用してリトライ実行
            await retryTodoOperation(async () => {
              console.log('[useOfflineRecovery] 復旧操作実行:', operation);
              return operation.data;
            }, `offline-recovery-${operation.context}`);

            // 成功時はキューから削除
            removeFromQueue(operation.id);
            recoveredCount++;

          } catch (error) {
            console.error('[useOfflineRecovery] 復旧失敗:', operation, error);
            failedCount++;
          }
        }

        setState(prev => ({
          ...prev,
          isRecovering: false,
          recoveredCount,
          failedCount
        }));

        console.log('[useOfflineRecovery] 復旧処理完了');
      })();

      return {
        ...prev,
        isRecovering: true,
        recoveredCount: 0,
        failedCount: 0
      };
    });
  }, [retryTodoOperation, removeFromQueue]);

  // オンライン状態変化の監視
  useEffect(() => {
    console.log('🔍 [useOfflineRecovery] useEffect 実行 依存配列:', { loadQueue: !!loadQueue, executeRecovery: !!executeRecovery });
    const handleOnline = () => {
      console.log('[useOfflineRecovery] オンライン状態に変化');
      setState(prev => ({
        ...prev,
        isOnline: true
      }));
      
      // オンライン復旧時に自動で復旧処理を実行
      setTimeout(() => {
        executeRecovery();
      }, 1000); // 1秒後に実行（接続安定化待ち）
    };

    const handleOffline = () => {
      console.log('[useOfflineRecovery] オフライン状態に変化');
      setState(prev => ({
        ...prev,
        isOnline: false
      }));
    };

    // イベントリスナーの登録
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 初期状態の設定
    setState(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      queuedOperations: loadQueue()
    }));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadQueue, executeRecovery]);

  // 手動復旧実行
  const manualRecovery = useCallback(async (): Promise<void> => {
    if (state.isOnline) {
      await executeRecovery();
    }
  }, [executeRecovery]);

  // キューのクリア
  const clearQueue = useCallback((): void => {
    setState(prev => ({
      ...prev,
      queuedOperations: [],
      recoveredCount: 0,
      failedCount: 0
    }));
    saveQueue([]);
  }, [saveQueue]);

  return {
    state,
    queueOperation,
    manualRecovery,
    clearQueue
  };
}