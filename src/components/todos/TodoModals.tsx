'use client';

import React from 'react';
import { TodoAddModal } from '@/components/TodoAddModal';
import { TodoEditModal } from '@/components/TodoEditModal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { ConditionModal } from '@/components/common/ConditionModal';
import { Toast } from '@/components/common/Toast';
import { SortOption } from '@/types/todo';

interface TodoModalsProps {
  // 追加モーダル
  isTodoAddModalOpen: boolean;
  onAddModalSave: (title: string, text: string, priorityId?: string, statusId?: string) => Promise<boolean>;
  onAddModalCancel: () => void;
  
  // 編集モーダル
  editingTodo: {
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
  } | null;
  isTodoEditModalOpen: boolean;
  onEditModalSave: (id: string, title: string, text: string, priorityId?: string, statusId?: string) => Promise<boolean>;
  onEditModalCancel: () => void;
  
  // 削除確認モーダル
  isTodoDeleteModalOpen: boolean;
  deletingTodo: { id: string; todo_title: string } | null;
  onDeleteConfirm: () => Promise<void>;
  onDeleteCancel: () => void;
  
  
  // 条件設定モーダル
  isConditionModalOpen: boolean;
  conditionModalInitialState: {
    priorities: Set<string>;
    statuses: Set<string>;
    sortOption: SortOption;
  };
  onConditionSave: (selectedPriorities: Set<string>, selectedStatuses: Set<string>, sortOption: SortOption) => Promise<boolean>;
  onConditionCancel: () => void;
  
  // トースト通知
  toast: {
    message: string;
    type: 'success' | 'error';
    isShow: boolean;
  } | null;
  onToastClose: () => void;
}

export function TodoModals({
  // 追加モーダル
  isTodoAddModalOpen,
  onAddModalSave,
  onAddModalCancel,
  
  // 編集モーダル
  editingTodo,
  isTodoEditModalOpen,
  onEditModalSave,
  onEditModalCancel,
  
  // 削除確認モーダル
  isTodoDeleteModalOpen,
  deletingTodo,
  onDeleteConfirm,
  onDeleteCancel,
  
  
  // 条件設定モーダル
  isConditionModalOpen,
  conditionModalInitialState,
  onConditionSave,
  onConditionCancel,
  
  // トースト通知
  toast,
  onToastClose
}: TodoModalsProps) {
  
  return (
    <>
      {/* 追加モーダル */}
      <TodoAddModal
        isOpen={isTodoAddModalOpen}
        onSave={onAddModalSave}
        onCancel={onAddModalCancel}
      />

      {/* 編集モーダル */}
      <TodoEditModal
        todo={editingTodo}
        isOpen={isTodoEditModalOpen}
        onSave={onEditModalSave}
        onCancel={onEditModalCancel}
      />

      {/* 削除確認モーダル */}
      <ConfirmModal
        isOpen={isTodoDeleteModalOpen}
        title="ToDoの削除"
        message={`「${deletingTodo?.todo_title}」を削除しますか？`}
        confirmText="削除"
        variant="danger"
        onConfirm={onDeleteConfirm}
        onCancel={onDeleteCancel}
      />


      {/* ConditionModal */}
      <ConditionModal
        isOpen={isConditionModalOpen}
        onSave={onConditionSave}
        onCancel={onConditionCancel}
        initialPriorities={conditionModalInitialState.priorities}
        initialStatuses={conditionModalInitialState.statuses}
        initialSortOption={conditionModalInitialState.sortOption}
      />

      {/* トースト通知 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          isShow={toast.isShow} 
          onClose={onToastClose}
        />
      )}
    </>
  );
}