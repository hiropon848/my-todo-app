'use client';

import React from 'react';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import SubMenuIcon from '@/icons/menu-sub.svg';

interface Todo {
  id: string;
  todo_title: string;
  todo_text: string;
  todo_priority_id?: string;
  todo_status_id?: string;
  priority?: {
    id: string;
    name: string;
    color_code: string;
  };
  status?: {
    id: string;
    name: string;
    color_code: string;
  };
}

interface TodoListProps {
  todos: Todo[];
  isFetchTodosLoading: boolean;
  openMenuId: string | null;
  onToggleMenu: (todoId: string, event: React.MouseEvent) => void;
  onStartEdit: (todo: {
    id: string;
    todo_title: string;
    todo_text: string;
    todo_priority_id?: string;
    todo_status_id?: string;
    priority?: {
      id: string;
      name: string;
      color_code: string;
    };
  }) => void;
  onStartDelete: (todo: { id: string; todo_title: string }) => void;
}

export function TodoList({
  todos,
  isFetchTodosLoading,
  openMenuId,
  onToggleMenu,
  onStartEdit,
  onStartDelete
}: TodoListProps) {
  
  return (
    <div className="bg-white/30 rounded-xl border border-white/20 shadow relative">
      {/* ToDoヘッダー */}
      <div className="px-4 py-2 border-b border-white/30 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">ToDo</h3>
        <span className="text-sm text-blue-600 font-bold">{todos.length} 件</span>
      </div>
      
      {/* 検索実行時の部分ローディングオーバーレイ */}
      <LoadingOverlay isVisible={isFetchTodosLoading} />
      
      {todos.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500">
          該当するToDoがありません
        </div>
      ) : (
        todos.map((todo, index) => {
          const isFirst = index === 0;
          const isLast = index === todos.length - 1;
          const isSingle = todos.length === 1;
          
          let roundedClass = '';
          let borderClass = '';
          if (isSingle) {
            roundedClass = 'rounded-xl';
            borderClass = '';
          } else if (isFirst) {
            roundedClass = 'rounded-t-xl';
            borderClass = 'border-b border-white/20';
          } else if (isLast) {
            roundedClass = 'rounded-b-xl';
            borderClass = '';
          } else {
            roundedClass = 'rounded-none';
            borderClass = 'border-b border-white/20';
          }
          
          return (
            <div
              key={todo.id}
              className={`${roundedClass} ${borderClass} p-4 relative group`}
            >
              {/* メニューボタン */}
              <button
                onClick={(e) => onToggleMenu(todo.id, e)}
                className="absolute top-4 right-4 p-3 hover:bg-black/10 rounded-full transition-colors"
              >
                <SubMenuIcon width="22" height="22" className="text-[#374151]" />
              </button>

              {/* メニュー */}
              {openMenuId === todo.id && (
                <div className="absolute top-12 right-4 bg-white rounded-lg shadow-lg py-2 z-10">
                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                    onClick={() => onStartEdit(todo)}
                  >
                    編集
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 transition-colors"
                    onClick={() => onStartDelete(todo)}
                  >
                    削除
                  </button>
                </div>
              )}

              {/* ToDo内容 */}
              <div className="pr-12">
                <h3 className="font-bold text-lg text-text leading-none pr-8">{todo.todo_title}</h3>
                <div className="flex gap-2 mt-2">
                  {todo.priority && <PriorityBadge priority={todo.priority} size="sm" />}
                  {todo.status && <StatusBadge status={todo.status} size="sm" />}
                </div>
                <div className="text-text text-sm whitespace-pre-wrap mt-2">{todo.todo_text}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}