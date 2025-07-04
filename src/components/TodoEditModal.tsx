'use client';

import { useState, useEffect } from 'react';
import CloseIcon from '@/icons/close.svg';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useTodoPriorities } from '@/hooks/useTodoPriorities';
import { useTodoStatuses } from '@/hooks/useTodoStatuses';
import { CustomSelect } from '@/components/common/CustomSelect';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { TodoPriority } from '@/types/todoPriority';
import { TodoStatus } from '@/types/todoStatus';

interface TodoEditModalProps {
  todo: {
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
  isOpen: boolean;
  onSave: (id: string, title: string, text: string, priorityId?: string, statusId?: string) => Promise<boolean>;
  onCancel: () => void;
}

export function TodoEditModal({ todo, isOpen, onSave, onCancel }: TodoEditModalProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedPriorityId, setSelectedPriorityId] = useState<string>('');
  const [selectedStatusId, setSelectedStatusId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [titleFocused, setTitleFocused] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { priorities, isLoading: prioritiesLoading, getDefaultPriorityId } = useTodoPriorities();
  const { todoStatuses, isLoading: todoStatusesLoading, getDefaultTodoStatusId } = useTodoStatuses();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowModal(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && todo) {
      setTitle(todo.todo_title);
      setText(todo.todo_text);
      if (todo.todo_status_id) {
        setSelectedStatusId(todo.todo_status_id);
      }
      
      setTitleError('');
      setTitleTouched(false);
      setTitleFocused(false);
    }
  }, [isOpen, todo]);

  useEffect(() => {
    if (isOpen && todo && !prioritiesLoading && priorities.length > 0 && selectedPriorityId === '') {
      if (todo.todo_priority_id) {
        setSelectedPriorityId(todo.todo_priority_id);
      } else {
        try {
          const defaultPriorityId = getDefaultPriorityId();
          if (defaultPriorityId) {
            setSelectedPriorityId(defaultPriorityId);
          }
        } catch (error) {
          console.error('Error setting default priority:', error);
          if (priorities[0]) {
            setSelectedPriorityId(priorities[0].id);
          }
        }
      }
    }
  }, [isOpen, todo, prioritiesLoading, priorities, selectedPriorityId, getDefaultPriorityId]);

  useEffect(() => {
    if (isOpen && todo && !todoStatusesLoading && todoStatuses.length > 0 && selectedStatusId === '') {
      if (todo.todo_status_id) {
        setSelectedStatusId(todo.todo_status_id);
      } else {
        try {
          const defaultStatusId = getDefaultTodoStatusId();
          if (defaultStatusId) {
            setSelectedStatusId(defaultStatusId);
          }
        } catch (error) {
          console.error('Error setting default status:', error);
          if (todoStatuses[0]) {
            setSelectedStatusId(todoStatuses[0].id);
          }
        }
      }
    }
  }, [isOpen, todo, todoStatusesLoading, todoStatuses, selectedStatusId, getDefaultTodoStatusId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onCancel]);

  const validateTitle = (value: string, blur = false) => {
    if (blur && value === '') {
      setTitleError('必須項目です');
      return;
    }
    setTitleError('');
  };

  const isFormValid = 
    title.trim() !== '' &&
    titleError === '';

  const handleSave = async () => {
    if (!todo) return;
    
    if (!title.trim()) {
      setTitleError('必須項目です');
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(todo.id, title, text, selectedPriorityId || undefined, selectedStatusId || undefined);
      if (success) {
        setShowModal(false);
        setTimeout(() => {
          setTitle('');
          setText('');
          setSelectedPriorityId('');
          setSelectedStatusId('');
          setTitleError('');
          setTitleTouched(false);
          setTitleFocused(false);
          onCancel();
        }, 300);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setTimeout(() => {
      setTitle('');
      setText('');
      setSelectedPriorityId('');
      setSelectedStatusId('');
      setTitleError('');
      setTitleTouched(false);
      setTitleFocused(false);
      onCancel();
    }, 300);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[70] flex items-center justify-center px-4 transition-all duration-300 ${
        showModal ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: showModal ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
        WebkitBackdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
      }}
      onClick={handleBackgroundClick}
    >
      <div 
        className={`rounded-2xl shadow-2xl border border-white/30 w-full max-w-md mx-auto transition-all duration-300 ${
          showModal ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/30 rounded-t-2xl px-4 py-4">
          <div className="flex items-center justify-center relative">
            <h2 className="text-xl font-bold text-text">編集</h2>
            <button
              onClick={handleCancel}
              className="absolute -right-2 p-3 hover:bg-black/10 rounded-full transition-colors"
              disabled={isSaving}
            >
              <CloseIcon 
                width="22" 
                height="22" 
                className="text-[#374151]"
                style={{ strokeWidth: '3' }}
              />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="modal-title" className="block text-sm font-medium text-text mb-1">
                タイトル
              </label>
              <input
                id="modal-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) validateTitle(e.target.value, false);
                }}
                onKeyUp={e => {
                  const inputKey = e.key;
                  if (
                    inputKey.length === 1 ||
                    inputKey === 'Backspace' ||
                    inputKey === 'Delete'
                  ) {
                    validateTitle((e.target as HTMLInputElement).value, false);
                  }
                }}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => {
                  setTitleFocused(false);
                  setTitleTouched(true);
                  validateTitle(title, true);
                }}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="タイトル"
                disabled={isSaving}
                autoFocus
              />
              {titleError && (titleTouched || (!titleFocused && title === '')) && (
                <p className="text-xs text-red-600 font-semibold mt-2">{titleError}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="modal-priority" className="block text-sm font-medium text-text mb-1">
                優先度
              </label>
              <CustomSelect
                id="modal-priority"
                value={selectedPriorityId}
                onChange={setSelectedPriorityId}
                options={priorities}
                disabled={isSaving || prioritiesLoading}
                loading={prioritiesLoading}
                placeholder="優先度を選択"
                renderOption={(option) => (
                  <PriorityBadge
                    priority={option as TodoPriority}
                    size="md"
                  />
                )}
                renderSelectedOption={(option) => (
                  <PriorityBadge
                    priority={option as TodoPriority}
                    size="md"
                  />
                )}
              />
            </div>

            <div>
              <label htmlFor="modal-status" className="block text-sm font-medium text-text mb-1">
                状態
              </label>
              <CustomSelect
                id="modal-status"
                value={selectedStatusId}
                onChange={setSelectedStatusId}
                options={todoStatuses}
                disabled={isSaving || todoStatusesLoading}
                loading={todoStatusesLoading}
                placeholder="状態を選択"
                renderOption={(option) => (
                  <StatusBadge
                    status={option as TodoStatus}
                    size="md"
                  />
                )}
                renderSelectedOption={(option) => (
                  <StatusBadge
                    status={option as TodoStatus}
                    size="md"
                  />
                )}
              />
            </div>
            
            <div>
              <label htmlFor="modal-text" className="block text-sm font-medium text-text mb-1">
                本文
              </label>
              <textarea
                id="modal-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="本文（複数行入力可）"
                rows={3}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/30 rounded-b-2xl">
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-500 text-white text-base font-bold rounded-[2rem] hover:bg-gray-600 transition-colors"
              disabled={isSaving}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className={`flex-1 px-4 py-2 text-base font-bold rounded-[2rem] transition-colors ${
                isFormValid && !isSaving
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-500/15 text-blue-500/50 cursor-not-allowed'
              }`}
              disabled={isSaving || !isFormValid}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 