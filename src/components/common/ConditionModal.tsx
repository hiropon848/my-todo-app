'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTodoPriorities } from '@/hooks/useTodoPriorities';
import { useTodoStatuses } from '@/hooks/useTodoStatuses';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { SortOption } from '@/types/todo';
import CloseIcon from '@/icons/close.svg';

interface ConditionModalProps {
  isOpen: boolean;
  onSave: (selectedPriorities: Set<string>, selectedStatuses: Set<string>, sortOption: SortOption) => Promise<boolean>;
  onCancel: () => void;
  // Phase 2: 初期値props追加（デフォルト値でUI破壊防止）
  initialPriorities?: Set<string>;
  initialStatuses?: Set<string>;
  // Phase 8: ソート機能強化で追加（デフォルト値で既存動作維持）
  initialSortOption?: SortOption;
}

export function ConditionModal({ 
  isOpen, 
  onSave, 
  onCancel,
  // デフォルト値で既存動作を完全に維持
  initialPriorities = new Set(),
  initialStatuses = new Set(),
  // Phase 8: ソート機能強化で追加（デフォルト値で既存動作維持）
  initialSortOption = 'created_desc'
}: ConditionModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // Phase 2: 初期値をpropsから設定（既存動作維持）
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(initialPriorities);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(initialStatuses);
  // Phase 8: ソート機能強化で追加（既存パターンと同様）
  const [selectedSortOption, setSelectedSortOption] = useState<SortOption>(initialSortOption);

  // データ取得  
  const { priorities, isLoading: prioritiesLoading } = useTodoPriorities();
  const { todoStatuses, isLoading: statusesLoading } = useTodoStatuses();

  // Phase 8: ソート機能強化で追加（計画書通りのソートオプション定義）
  const sortOptions = [
    { id: 'created_desc', name: '作成日時（新しい順）' },
    { id: 'created_asc', name: '作成日時（古い順）' },
    { id: 'updated_desc', name: '更新日時（新しい順）' },
    { id: 'updated_asc', name: '更新日時（古い順）' },
    { id: 'priority_high', name: '優先度（高い順）' },
    { id: 'priority_low', name: '優先度（低い順）' },
    { id: 'state_progress', name: '状態（進捗順）' },
    { id: 'state_no_progress', name: '状態（未進捗順）' }
  ];

  // 背景スクロール制御
  useBodyScrollLock(isOpen);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      onCancel();
    }, 300);
  }, [onCancel]);

  // モーダルアニメーション制御
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowModal(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  // Phase 2: 初期値復元（モーダルが開かれるたびに初期値を設定）
  useEffect(() => {
    if (isOpen) {
      setSelectedPriorities(new Set(initialPriorities));
      setSelectedStatuses(new Set(initialStatuses));
      // Phase 8: ソート機能強化で追加（既存パターンと同様）
      setSelectedSortOption(initialSortOption);
    }
  }, [isOpen, initialPriorities, initialStatuses, initialSortOption]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, handleCancel]);

  const handlePriorityToggle = (priorityId: string) => {
    // ID→名前変換
    const priority = priorities.find(p => p.id === priorityId);
    if (!priority) return;
    
    const priorityName = priority.name;
    const newSelected = new Set(selectedPriorities);
    if (newSelected.has(priorityName)) {
      newSelected.delete(priorityName);
    } else {
      newSelected.add(priorityName);
    }
    setSelectedPriorities(newSelected);
  };

  const handleStatusToggle = (statusId: string) => {
    // ID→名前変換
    const status = todoStatuses.find(s => s.id === statusId);
    if (!status) return;
    
    const statusName = status.name;
    const newSelected = new Set(selectedStatuses);
    if (newSelected.has(statusName)) {
      newSelected.delete(statusName);
    } else {
      newSelected.add(statusName);
    }
    setSelectedStatuses(newSelected);
  };

  const handleClearPriorities = () => {
    setSelectedPriorities(new Set());
  };

  const handleClearStatuses = () => {
    setSelectedStatuses(new Set());
  };

  // Phase 8: ソート機能強化で追加（CustomSelectのonChangeハンドラー）
  const handleSortChange = (sortValue: string) => {
    setSelectedSortOption(sortValue as SortOption);
  };

  // 条件をクリアするハンドラー
  const handleClearAll = async () => {
    setSelectedPriorities(new Set());
    setSelectedStatuses(new Set());
    setSelectedSortOption('created_desc');
    
    // 検索キーワードを保持したままクリアを実行
    await onSave(new Set(), new Set(), 'created_desc');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Phase 8: ソート機能強化で実装済み
      const success = await onSave(selectedPriorities, selectedStatuses, selectedSortOption);
      if (success) {
        setShowModal(false);
        setTimeout(() => {
          onCancel();
        }, 300);
      }
    } catch (error) {
      console.error('Filter save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 背景クリックでモーダルを閉じる
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[90] flex items-center justify-center px-4 transition-all duration-300 ${
        showModal ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: showModal ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
        backdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
        WebkitBackdropFilter: showModal ? 'blur(4px)' : 'blur(0px)',
      }}
      onClick={handleBackgroundClick}
    >
      {/* モーダルウィンドウ */}
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
        {/* ヘッダー */}
        <div className="border-b border-white/30 rounded-t-2xl px-4 py-4">
          <div className="flex items-center justify-center relative">
            <h2 className="text-xl font-bold text-text">絞り込み/並び替え</h2>
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

        {/* コンテンツ */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* 優先度フィルタ */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-text">優先度</label>
                <button
                  onClick={handleClearPriorities}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  選択解除
                </button>
              </div>
              {prioritiesLoading ? (
                <div className="text-sm text-gray-500">読み込み中...</div>
              ) : (
                <div className="bg-white rounded-lg py-1 px-1">
                  <div className="space-y-1">
                    {priorities.map((priority) => (
                      <button
                        key={priority.id}
                        onClick={() => handlePriorityToggle(priority.id)}
                        className={`w-full text-left px-3 py-2 text-base transition-colors ${
                          selectedPriorities.has(priority.name)
                            ? 'bg-blue-100 font-medium rounded'
                            : 'text-gray-900 hover:bg-gray-100 hover:rounded'
                        }`}
                      >
                        <PriorityBadge priority={priority} size="md" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 状態フィルタ */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-text">状態</label>
                <button
                  onClick={handleClearStatuses}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  選択解除
                </button>
              </div>
              {statusesLoading ? (
                <div className="text-sm text-gray-500">読み込み中...</div>
              ) : (
                <div className="bg-white rounded-lg py-1 px-1">
                  <div className="space-y-1">
                    {todoStatuses.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => handleStatusToggle(status.id)}
                        className={`w-full text-left px-3 py-2 text-base transition-colors ${
                          selectedStatuses.has(status.name)
                            ? 'bg-blue-100 font-medium rounded'
                            : 'text-gray-900 hover:bg-gray-100 hover:rounded'
                        }`}
                      >
                        <StatusBadge status={status} size="md" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phase 8: ソート機能強化で追加（ディバイダー） */}
          <div className="border-t border-white/30 my-4" />

          {/* Phase 8: ソート機能強化で追加（ソート選択） */}
          <div>
            <label className="block text-sm font-medium text-text mb-1">並び替え</label>
            <CustomSelect
              id="sort-select"
              value={selectedSortOption}
              onChange={handleSortChange}
              options={sortOptions}
              placeholder="並び替え順を選択"
              className=""
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/30 rounded-b-2xl">
          <div className="space-y-3">
            {/* 条件をクリアボタン */}
            <div className="flex justify-center">
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2 bg-gray-500 text-white text-base font-bold rounded-[2rem] hover:bg-gray-600 transition-colors"
                disabled={isSaving}
              >
                条件をクリア
              </button>
            </div>
            
            {/* キャンセル・OKボタン */}
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
                disabled={isSaving}
                className={`flex-1 px-4 py-2 text-base font-bold rounded-[2rem] transition-colors ${
                  isSaving
                    ? 'bg-blue-500/15 text-blue-500/50 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isSaving ? '保存中...' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}