import { Priority } from './priority';
import { TaskStatus } from './taskStatus';

export interface Todo {
  id: string;
  user_id: string;
  task_title: string;
  task_text: string;
  // is_completed: boolean; // 削除完了 - データベースから削除済み
  status_id: string;
  priority_id: string;
  priority?: Priority; // JOINクエリ時に使用
  status?: TaskStatus; // JOINクエリ時に使用
  created_at: string;
  updated_at: string;
} 