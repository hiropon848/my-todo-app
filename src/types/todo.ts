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