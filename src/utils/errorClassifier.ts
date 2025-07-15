/**
 * エラー分類システム
 * Step 2-A: エラー種別の詳細分類
 * 
 * 既存のuseFilteredTodos.tsの良好な実装パターンを参考に、
 * プロジェクト全体で統一的なエラー分類を提供
 */

export type ErrorType = 
  | 'AUTH_ERROR'           // 認証エラー（JWT期限切れ、権限不足等）
  | 'NETWORK_ERROR'        // ネットワークエラー（接続失敗、タイムアウト等）
  | 'VALIDATION_ERROR'     // バリデーションエラー（入力データ不正等）
  | 'DATABASE_ERROR'       // データベースエラー（制約違反等）
  | 'PERMISSION_ERROR'     // 権限エラー（RLS違反等）
  | 'UNKNOWN_ERROR';       // 予期しないエラー

export interface ClassifiedError {
  type: ErrorType;
  originalError: unknown;
  message: string;
  code?: string;
}

/**
 * Supabase/PostgRESTエラーコードの分類
 * 既存のuseFilteredTodos.tsの実装パターンを参考
 */
export const classifySupabaseError = (error: unknown): ClassifiedError => {
  // エラーがオブジェクトでcodeプロパティを持つかチェック
  if (error && typeof error === 'object' && 'code' in error) {
    const errorCode = (error as { code: string }).code;
    
    // 認証関連エラー（PGRST301: JWT expired, PGRST302: JWT invalid）
    if (errorCode === 'PGRST301' || errorCode === 'PGRST302') {
      return {
        type: 'AUTH_ERROR',
        originalError: error,
        message: 'ログイン有効期限が切れました。お手数ですが、再度ログインしてください。',
        code: errorCode
      };
    }
    
    // 権限関連エラー（PGRST103: Insufficient privileges）
    if (errorCode === 'PGRST103') {
      return {
        type: 'PERMISSION_ERROR',
        originalError: error,
        message: 'この操作を実行する権限がありません。管理者にお問い合わせください。',
        code: errorCode
      };
    }
    
    // バリデーション・フィルター関連エラー（PGRST116: Schema cache/Filter error）
    if (errorCode === 'PGRST116' || errorCode === 'PGRST117') {
      return {
        type: 'VALIDATION_ERROR',
        originalError: error,
        message: '入力内容に問題があります。必要な項目がすべて入力されているか確認してください。',
        code: errorCode
      };
    }
    
    // リクエスト関連エラー（PGRST100: Bad request）
    if (errorCode === 'PGRST100' || errorCode === 'PGRST106') {
      return {
        type: 'VALIDATION_ERROR',
        originalError: error,
        message: '入力内容に不備があります。タイトルや内容を確認して、もう一度お試しください。',
        code: errorCode
      };
    }
    
    // その他のPGRSTエラー（データベース関連）
    if (errorCode.startsWith('PGRST')) {
      return {
        type: 'DATABASE_ERROR',
        originalError: error,
        message: 'データの保存中に問題が発生しました。しばらく時間をおいて再度お試しください。',
        code: errorCode
      };
    }
  }
  
  // エラーメッセージによる分類
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as { message: string }).message.toLowerCase();
    
    // ネットワーク関連エラー
    if (errorMessage.includes('fetch') || 
        errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout')) {
      return {
        type: 'NETWORK_ERROR',
        originalError: error,
        message: 'インターネット接続に問題があります。Wi-Fiや通信環境を確認して、もう一度お試しください。'
      };
    }
    
    // 認証関連エラー（メッセージベース）
    if (errorMessage.includes('auth') || 
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden')) {
      return {
        type: 'AUTH_ERROR',
        originalError: error,
        message: 'ログイン情報に問題があります。お手数ですが、再度ログインしてください。'
      };
    }
  }
  
  // 分類できない場合
  return {
    type: 'UNKNOWN_ERROR',
    originalError: error,
    message: '予期しない問題が発生しました。ページを再読み込みするか、しばらく時間をおいて再度お試しください。'
  };
};

/**
 * 一般的なJavaScript Errorオブジェクトの分類
 */
export const classifyGeneralError = (error: unknown): ClassifiedError => {
  // Supabaseエラーの場合は専用の分類を使用
  if (error && typeof error === 'object' && 'code' in error) {
    return classifySupabaseError(error);
  }
  
  // Error インスタンスの場合
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // ネットワーク関連
    if (errorMessage.includes('fetch') || 
        errorMessage.includes('network') ||
        errorMessage.includes('failed to fetch')) {
      return {
        type: 'NETWORK_ERROR',
        originalError: error,
        message: 'インターネット接続に問題があります。Wi-Fiや通信環境を確認して、もう一度お試しください。'
      };
    }
    
    // タイプエラー（通常は開発時の問題）
    if (error instanceof TypeError) {
      return {
        type: 'VALIDATION_ERROR',
        originalError: error,
        message: 'データの形式に問題があります。入力内容を確認してください。'
      };
    }
  }
  
  // その他のエラー
  return {
    type: 'UNKNOWN_ERROR',
    originalError: error,
    message: '予期しない問題が発生しました。ページを再読み込みするか、しばらく時間をおいて再度お試しください。'
  };
};

/**
 * メインのエラー分類関数
 * プロジェクト全体でこの関数を使用してエラーを分類
 */
export const classifyError = (error: unknown): ClassifiedError => {
  // null/undefined チェック
  if (!error) {
    return {
      type: 'UNKNOWN_ERROR',
      originalError: error,
      message: '不明な問題が発生しました。ページを再読み込みして、もう一度お試しください。'
    };
  }
  
  // Supabaseエラーかどうかを優先的にチェック
  if (error && typeof error === 'object' && 'code' in error) {
    return classifySupabaseError(error);
  }
  
  // 一般的なエラーとして分類
  return classifyGeneralError(error);
};

/**
 * 開発環境でのエラーログ出力
 * 分類結果と元のエラーの詳細を出力
 */
export const logClassifiedError = (classifiedError: ClassifiedError, context?: string): void => {
  if (process.env.NODE_ENV === 'development') {
    const prefix = context ? `[${context}]` : '[ErrorClassifier]';
    console.group(`${prefix} Error Classification`);
    console.log('Type:', classifiedError.type);
    console.log('Message:', classifiedError.message);
    console.log('Code:', classifiedError.code || 'N/A');
    console.log('Original Error:', classifiedError.originalError);
    console.groupEnd();
  }
};