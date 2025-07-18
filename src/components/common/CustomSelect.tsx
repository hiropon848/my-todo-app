import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import ArrowDownIcon from '@/icons/arrow-down.svg';

interface Option {
  id: string;
  name: string;
  color_code?: string;
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
  renderOption?: (option: Option) => ReactNode;
  renderSelectedOption?: (option: Option) => ReactNode;
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  disabled = false,
  loading = false,
  className = '',
  placeholder = '選択してください',
  renderOption,
  renderSelectedOption
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 選択された option を取得
  const selectedOption = options.find(option => option.id === value);

  // 適応的高さ管理（項目数に応じて最適化）
  const getDropdownStyle = useCallback(() => {
    // 少数項目（5個以下）: 自然な高さ、スクロールなし
    // 多数項目（6個以上）: 最大高さ制限、スクロール有効
    const MAX_ITEMS_WITHOUT_SCROLL = 5;
    
    if (options.length <= MAX_ITEMS_WITHOUT_SCROLL) {
      return {
        maxHeight: 'none',
        overflow: 'visible' as const
      };
    } else {
      return {
        maxHeight: '200px', // 従来の固定値を使用
        overflow: 'auto' as const
      };
    }
  }, [options.length]);

  // ドロップダウンの位置を計算
  const calculatePosition = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    // 実測値に基づく高さ計算（46px/項目 + container padding）
    const estimatedHeight = options.length <= 5 ? options.length * 46 + 8 : 200;
    
    // 下に表示する余裕があるかチェック
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
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
          className="mt-1 block w-full px-3 py-2 bg-white/50 border border-white/20 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/80 focus:border-transparent transition-all duration-200 text-left appearance-none"
        >
          <span className="block truncate">
            {loading ? '読み込み中...' : selectedOption ? (
              renderSelectedOption ? renderSelectedOption(selectedOption) : selectedOption.name
            ) : placeholder}
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
          <div 
            className="py-1 px-1 space-y-1"
            style={getDropdownStyle()}
          >
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleOptionClick(option.id)}
                className={`w-full text-left px-3 py-2 text-base transition-colors ${
                  option.id === value
                    ? 'bg-blue-100 font-medium rounded'
                    : 'text-gray-900 hover:bg-gray-100 hover:rounded'
                }`}
              >
                {renderOption ? renderOption(option) : option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 