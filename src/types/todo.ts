import { Priority } from './priority';

export interface Todo {
  id: string;
  user_id: string;
  task_title: string;
  task_text: string;
  is_completed: boolean;
  priority_id: string;
  priority?: Priority; // JOINクエリ時に使用
  created_at: string;
  updated_at: string;
} 