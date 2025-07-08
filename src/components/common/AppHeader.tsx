import React from 'react';
import MenuIcon from '@/icons/menu-main.svg';
import AddIcon from '@/icons/add.svg';

interface AppHeaderProps {
  userName: string;
  onLogout: () => void;
  title: string;
  onMenuOpen: () => void;
  onAddClick?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  userName, 
  onLogout: _onLogout, 
  title, 
  onMenuOpen,
  onAddClick
}) => {
  // onLogoutは使用しないが、HeaderWithMenuで必要なため型定義は維持
  void _onLogout;

  return (
  <header className="bg-white/15 [backdrop-filter:blur(10px)] border-b border-white/30 rounded-t-2xl w-full">
    <div className="px-2 pt-2">
      <div className="flex items-center justify-between mb-2 relative">
        <button 
          className="p-3 rounded-full hover:bg-black/10 transition-colors"
          onClick={onMenuOpen}
        >
          <MenuIcon 
            width="22" 
            height="22" 
            className="text-[#374151]"
          />
        </button>
        <span className="text-xl font-bold text-text absolute left-1/2 transform -translate-x-1/2">{title}</span>
        <button
          className="rounded-full hover:bg-black/10 transition-colors"
          onClick={onAddClick}
        >
          <AddIcon 
            width="46" 
            height="46" 
            className="transition-colors duration-200"
            style={{
              fill: '#3b82f6'
            }}
            onMouseEnter={(e: React.MouseEvent<SVGSVGElement>) => {
              e.currentTarget.style.fill = '#2563eb';
            }}
            onMouseLeave={(e: React.MouseEvent<SVGSVGElement>) => {
              e.currentTarget.style.fill = '#3b82f6';
            }}
          />
        </button>
      </div>
    </div>
    <div className="w-full bg-blue-100/70 border-t border-white/30 text-text text-center py-1">
      <span className="text-sm font-medium text-text">ようこそ {userName} さん</span>
    </div>
  </header>
  );
}; 