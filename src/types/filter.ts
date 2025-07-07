// フィルター機能に関する型定義
// Phase 1: 基盤準備で作成 - 既存UIに影響なし

/**
 * フィルター状態を管理するためのインターフェース
 * ConditionModalの内部状態で使用
 */
export interface FilterState {
  selectedPriorities: Set<string>;
  selectedStatuses: Set<string>;
}

/**
 * URLクエリパラメータとして使用するフィルターパラメータ
 * ?priorities=high,medium&statuses=todo,progress&sort=created_desc 形式
 */
export interface URLFilterParams {
  priorities?: string[];
  statuses?: string[];
  sort?: string; // Phase 8: ソート機能強化で追加
}