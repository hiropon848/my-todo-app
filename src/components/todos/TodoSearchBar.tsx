'use client';

import React from 'react';
import SortAndFilterIcon from '@/icons/sort-and-filter.svg';
import SearchIcon from '@/icons/search.svg';
import CloseIcon from '@/icons/close.svg';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';

interface TodoSearchBarProps {
  // 検索入力状態
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (keyword: string) => void;
  onSearchClear: () => void;
  
  // フィルター状態表示
  activeFilters: {
    priorityIds: string[];
    statusIds: string[];
  };
  priorities?: Array<{
    id: string;
    name: string;
    color_code: string;
    display_order: number;
  }>;
  todoStatuses?: Array<{
    id: string;
    name: string;
    color_code: string;
    display_order: number;
  }>;
  
  // フィルターモーダル制御
  onConditionModalOpen: () => void;
}

export function TodoSearchBar({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onSearchClear,
  activeFilters,
  priorities,
  todoStatuses,
  onConditionModalOpen
}: TodoSearchBarProps) {
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchInput);
    }
  };

  const handleBlur = () => {
    onSearchSubmit(searchInput);
  };

  const handleClearClick = () => {
    onSearchClear();
  };

  return (
    <div className="flex flex-col mb-6 bg-white/30 rounded-xl border border-white/20 shadow">
      {/* 検索条件ヘッダー */}
      <div className="px-4 py-2 border-b border-white/30">
        <h3 className="text-sm font-semibold text-gray-700">検索条件</h3>
      </div>
      
      <div className="px-4 pt-2 pb-4">
        {/* フィルター条件表示とボタン */}
        <div className="flex items-center justify-between mb-2">
          {/* 優先度・状態のフィルター有無のみで判定（検索キーワードは除外） */}
          {(activeFilters.priorityIds.length > 0 || activeFilters.statusIds.length > 0) ? (
            <div className="flex items-center gap-3">
              {/* 優先度バッジ */}
              {activeFilters.priorityIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">[優先度]</span>
                  {activeFilters.priorityIds.map(id => {
                    const priority = priorities?.find(p => p.id === id);
                    return priority ? (
                      <PriorityBadge key={priority.id} priority={priority} size="sm" />
                    ) : null;
                  })}
                </div>
              )}
              {/* ステータスバッジ */}
              {activeFilters.statusIds.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">[状態]</span>
                  {activeFilters.statusIds.map(id => {
                    const status = todoStatuses?.find(s => s.id === id);
                    return status ? (
                      <StatusBadge key={status.id} status={status} size="sm" />
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-500">絞り込み/並び替え なし</span>
          )}
          
          {/* フィルター/ソートボタン */}
          <button
            onClick={onConditionModalOpen}
            className="p-3 rounded-full hover:bg-black/10 transition-colors"
          >
            <SortAndFilterIcon 
              width="22" 
              height="22" 
              className="text-[#374151]"
            />
          </button>
        </div>
        
        {/* 検索フィールド */}
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="タイトルまたは本文"
            className="w-full pl-10 pr-10 py-2 bg-white/50 border border-white/30 rounded-lg 
                     text-base placeholder-gray-400 focus:outline-none focus:ring-2 
                     focus:ring-blue-500/80 focus:border-blue-500/50
                     backdrop-blur-sm transition-all duration-300"
          />
          <SearchIcon 
            width="20" 
            height="20" 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {/* クリアボタン */}
          {searchInput && (
            <button
              onClick={handleClearClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
              aria-label="検索をクリア"
            >
              <CloseIcon 
                width="16" 
                height="16" 
                className="text-gray-600"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}