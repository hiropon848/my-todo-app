import { TodoPriority } from './todoPriority';
import { TodoStatus } from './todoStatus';

export interface Todo {
  id: string;
  user_id: string;
  todo_title: string;
  todo_text: string;
  todo_status_id: string;
  todo_priority_id: string;
  priority?: TodoPriority; // JOINクエリ時に使用
  status?: TodoStatus; // JOINクエリ時に使用
  created_at: string;
  updated_at: string;
}

/**
 * ソートオプションの型定義
 * Phase 8: ソート機能強化
 */
export type SortOption = 
  | 'created_desc'      // 作成日時新しい順
  | 'created_asc'       // 作成日時古い順  
  | 'updated_desc'      // 更新日時新しい順
  | 'updated_asc'       // 更新日時古い順
  | 'priority_high'     // 優先度高い順
  | 'priority_low'      // 優先度低い順
  | 'state_progress'    // 状態進捗順
  | 'state_no_progress'; // 状態未進捗順 