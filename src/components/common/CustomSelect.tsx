import { useState, useRef, useEffect, useCallback } from 'react';
import ArrowDownIcon from '@/icons/arrow-down.svg';

interface Option {
  id: string;
  name: string;
}

interface CustomSelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  placeholder?: string;
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  disabled = false,
  loading = false,
  className = '',
  placeholder = '選択してください'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 選択された option を取得
  const selectedOption = options.find(option => option.id === value);

  // ドロップダウンの位置を計算
  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = Math.min(options.length * 40 + 8, 200); // 最大高さ200px
    
    // 下に表示する余裕があるかチェック
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      setDropdownPosition('bottom');
    } else {
      setDropdownPosition('top');
    }
  }, [options.length]);

  // ドロップダウンを開く
  const handleToggle = () => {
    if (disabled || loading) return;
    
    if (!isOpen) {
      calculatePosition();
    }
    setIsOpen(!isOpen);
  };

  // オプション選択
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // 外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // ESCキーで閉じる
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen]);

  // リサイズ時に位置を再計算
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, calculatePosition]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* プルダウンボタン（既存デザインを完全維持） */}
      <div className="relative">
        <button
          type="button"
          id={id}
          onClick={handleToggle}
          disabled={disabled || loading}
          className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-left appearance-none"
        >
          <span className="block truncate">
            {loading ? '読み込み中...' : selectedOption ? selectedOption.name : placeholder}
          </span>
        </button>
        
        {/* 矢印アイコン（既存と同じ） */}
        <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none pr-1">
          <ArrowDownIcon 
            width="46" 
            height="46" 
            className={`text-[#374151] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* ドロップダウンリスト */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-200 ${
            dropdownPosition === 'bottom' 
              ? 'top-full mt-1' 
              : 'bottom-full mb-1'
          }`}
          style={{ minWidth: '100%' }}
        >
          <div className="py-1 px-1 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionClick(option.id)}
                className={`w-full text-left px-3 py-2 text-base transition-colors mb-1 [&:last-child]:mb-0 ${
                  option.id === value
                    ? 'bg-blue-50 text-blue-600 font-medium rounded'
                    : 'text-gray-900 hover:bg-gray-100 hover:rounded'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 