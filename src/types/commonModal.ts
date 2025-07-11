/**
 * 共通のモーダルプロパティ
 * Phase 1: 型定義の集約・統一
 * 
 * 8箇所で重複していた `isOpen: boolean` を統合
 */
export interface CommonModalProps {
  /** モーダルの表示状態 */
  isOpen: boolean;
}

/**
 * キャンセル機能付きモーダルの基本プロパティ
 */
export interface CancelableModalProps extends CommonModalProps {
  /** キャンセル時のコールバック */
  onCancel: () => void;
}