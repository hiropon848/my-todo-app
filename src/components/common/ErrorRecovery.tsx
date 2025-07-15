'use client';

import { useState } from 'react';
import { ClassifiedError, ErrorType } from '@/utils/errorClassifier';

interface RecoveryStep {
  id: string;
  text: string;
  isCompleted?: boolean;
}

interface ErrorRecoveryProps {
  error: ClassifiedError;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

/**
 * エラータイプ別復旧手順定義
 * Step 2-A分類システムと連携
 */
const getRecoverySteps = (errorType: ErrorType): RecoveryStep[] => {
  switch (errorType) {
    case 'NETWORK_ERROR':
      return [
        { id: 'network-1', text: 'Wi-Fi接続を確認してください' },
        { id: 'network-2', text: 'モバイルデータ通信の状況を確認してください' },
        { id: 'network-3', text: 'ブラウザを再読み込みしてください' },
        { id: 'network-4', text: '問題が続く場合は、しばらく時間をおいて再度お試しください' }
      ];
    case 'AUTH_ERROR':
      return [
        { id: 'auth-1', text: 'ページを再読み込みしてください' },
        { id: 'auth-2', text: '再度ログインしてください' },
        { id: 'auth-3', text: 'パスワードに問題がある場合は、パスワードリセットをお試しください' }
      ];
    case 'VALIDATION_ERROR':
      return [
        { id: 'validation-1', text: '入力内容を確認してください' },
        { id: 'validation-2', text: '必要な項目がすべて入力されているか確認してください' },
        { id: 'validation-3', text: '特殊文字や絵文字が問題を起こしていないか確認してください' }
      ];
    case 'DATABASE_ERROR':
      return [
        { id: 'database-1', text: 'しばらく時間をおいて再度お試しください' },
        { id: 'database-2', text: 'ページを再読み込みしてください' },
        { id: 'database-3', text: '問題が続く場合は、管理者にお問い合わせください' }
      ];
    case 'PERMISSION_ERROR':
      return [
        { id: 'permission-1', text: '管理者にお問い合わせください' },
        { id: 'permission-2', text: '適切なアクセス権限があるか確認してください' }
      ];
    case 'UNKNOWN_ERROR':
    default:
      return [
        { id: 'unknown-1', text: 'ブラウザを再読み込みしてください' },
        { id: 'unknown-2', text: 'しばらく時間をおいて再度お試しください' },
        { id: 'unknown-3', text: '問題が続く場合は、管理者にお問い合わせください' }
      ];
  }
};

/**
 * エラー復旧UIコンポーネント
 * 既存ToastやModalデザインと統一されたガラスモーフィズムスタイル
 */
export function ErrorRecovery({ error, onRetry, isRetrying = false, className = '' }: ErrorRecoveryProps) {
  const [isStepsExpanded, setIsStepsExpanded] = useState(false);
  const recoverySteps = getRecoverySteps(error.type);

  return (
    <div className={`
      p-4 rounded-2xl shadow-xl
      bg-red-50/80 border border-red-200/50
      backdrop-blur-md
      ${className}
    `}>
      {/* エラーメッセージ */}
      <div className="flex items-start space-x-3 mb-4">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
          <svg 
            className="w-4 h-4 text-red-600" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-red-800 font-medium text-sm leading-relaxed">
            {error.message}
          </p>
          {process.env.NODE_ENV === 'development' && error.code && (
            <p className="text-red-600 text-xs mt-1">
              エラーコード: {error.code}
            </p>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex items-center justify-between">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium
            transition-all duration-200
            ${isRetrying 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800'
            }
            focus:outline-none focus:ring-2 focus:ring-red-300
          `}
        >
          {isRetrying ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              再試行中...
            </span>
          ) : (
            '再試行'
          )}
        </button>

        <button
          onClick={() => setIsStepsExpanded(!isStepsExpanded)}
          className="
            px-3 py-2 rounded-lg text-sm font-medium
            bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-red-300
          "
        >
          復旧手順 {isStepsExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* 復旧手順リスト */}
      {isStepsExpanded && (
        <div className="mt-4 pt-4 border-t border-red-200/50">
          <h4 className="text-red-800 font-medium text-sm mb-3">復旧手順:</h4>
          <ol className="space-y-2">
            {recoverySteps.map((step, index) => (
              <li 
                key={step.id}
                className="flex items-start text-sm text-red-700"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-medium flex items-center justify-center mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}