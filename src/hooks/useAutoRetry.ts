/**
 * 自動リトライフック（指数バックオフ実装）
 * Step 2-C-1: 復旧手順の提案 - 自動リトライ機能
 * 
 * 既存のuseFilteredTodos.tsとerrorClassifier.tsパターンを参考に、
 * 統一的なリトライ機能を提供
 */

import { useCallback } from 'react';
import { classifyError, logClassifiedError, ErrorType, ClassifiedError } from '@/utils/errorClassifier';

export interface RetryOptions {
  maxRetries?: number;          // 最大リトライ回数（デフォルト: 3回）
  baseDelay?: number;           // 基本遅延時間（ミリ秒、デフォルト: 1000ms）
  maxDelay?: number;            // 最大遅延時間（ミリ秒、デフォルト: 8000ms）
  retryableErrors?: ErrorType[]; // リトライ対象のエラータイプ
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  classifiedError?: ClassifiedError;
  attemptCount: number;
  totalTime: number;
}

/**
 * デフォルトのリトライ対象エラータイプ
 * ネットワークエラーとデータベースエラーのみリトライ
 */
const DEFAULT_RETRYABLE_ERRORS: ErrorType[] = [
  'NETWORK_ERROR',
  'DATABASE_ERROR'
];

export function useAutoRetry() {
  /**
   * 指数バックオフでリトライを実行
   * 
   * @param fn リトライ対象の非同期関数
   * @param options リトライオプション
   * @returns リトライ結果
   */
  const retryWithBackoff = useCallback(async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> => {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 8000,
      retryableErrors = DEFAULT_RETRYABLE_ERRORS
    } = options;
    
    const startTime = Date.now();
    let lastError: unknown = null;
    
    // 無限ループ検証: maxRetriesは3回固定、attemptは1から開始してmaxRetries+1まで
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[useAutoRetry] 試行 ${attempt}/${maxRetries + 1}`);
        }
        
        const result = await fn();
        const totalTime = Date.now() - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[useAutoRetry] 成功 (試行: ${attempt}, 総時間: ${totalTime}ms)`);
        }
        
        return {
          success: true,
          data: result,
          attemptCount: attempt,
          totalTime
        };
      } catch (error) {
        lastError = error;
        console.log('🔵 [useAutoRetry] エラー発生:', error);
        const classifiedError = classifyError(error);
        console.log('🔵 [useAutoRetry] エラー分類結果:', {
          type: classifiedError.type,
          message: classifiedError.message,
          code: classifiedError.code
        });
        
        if (process.env.NODE_ENV === 'development') {
          logClassifiedError(classifiedError, 'useAutoRetry');
        }
        
        // 最終試行の場合、リトライせずに終了
        if (attempt >= maxRetries + 1) {
          console.log(`🔵 [useAutoRetry] 最終試行失敗、リトライ終了`);
          break;
        }
        
        // リトライ対象外のエラーの場合、即座に終了
        console.log('🔵 [useAutoRetry] リトライ対象判定:', {
          errorType: classifiedError.type,
          retryableErrors,
          isRetryable: retryableErrors.includes(classifiedError.type)
        });
        if (!retryableErrors.includes(classifiedError.type)) {
          console.log(`🔴 [useAutoRetry] リトライ対象外エラー (${classifiedError.type})、リトライ終了`);
          break;
        }
        console.log(`✅ [useAutoRetry] リトライ対象エラー、継続`);
        
        // 指数バックオフの遅延計算
        // attempt-1を使用: 1回目は即座(0ms)、2回目は1000ms、3回目は2000ms、4回目は4000ms
        const delay = Math.min(baseDelay * Math.pow(2, attempt - 2), maxDelay);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[useAutoRetry] リトライ ${attempt}回目失敗、${delay}ms後に再試行 (エラータイプ: ${classifiedError.type})`);
        }
        
        // 遅延実行（1回目の場合は即座に次の試行）
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // 全ての試行が失敗した場合
    const totalTime = Date.now() - startTime;
    const classifiedError = classifyError(lastError);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[useAutoRetry] 全試行失敗 (総時間: ${totalTime}ms)`);
    }
    
    return {
      success: false,
      error: classifiedError.message,
      classifiedError: classifiedError,
      attemptCount: maxRetries + 1,
      totalTime
    };
  }, []);

  /**
   * Todo操作専用のリトライ関数
   * プロジェクトの既存パターンに合わせた簡易ラッパー
   * Step 2-C-2: エラー復旧UI連携のため、失敗時は例外を投げる
   */
  const retryTodoOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    console.log('🔵 [useAutoRetry] retryTodoOperation開始:', context);
    const result = await retryWithBackoff(operation, {
      maxRetries: 3,
      baseDelay: 1000,
      retryableErrors: ['NETWORK_ERROR', 'DATABASE_ERROR']
    });
    console.log('🔵 [useAutoRetry] retryWithBackoff結果:', result);
    
    if (result.success && result.data !== undefined) {
      console.log('✅ [useAutoRetry] 成功、data返却:', result.data);
      return result.data;
    }
    
    // エラーログ出力（既存パターンに合わせて）
    if (process.env.NODE_ENV === 'development' && context) {
      console.error(`[${context}] リトライ失敗:`, result.error);
    }
    
    console.log('🔴 [useAutoRetry] 失敗、例外投げ:', result.error);
    // Step 2-C-2: エラー復旧UI表示のため、失敗時は元のエラーを投げる
    if (result.classifiedError) {
      throw result.classifiedError.originalError;
    }
    throw new Error(result.error || '操作に失敗しました');
  }, [retryWithBackoff]);

  return {
    retryWithBackoff,
    retryTodoOperation
  };
}