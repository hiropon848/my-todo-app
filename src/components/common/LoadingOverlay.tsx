import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute inset-0 z-10 rounded-xl"
      style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div className="absolute top-2 left-2 right-2">
        <div className="bg-white bg-opacity-95 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <div className="text-blue-700 font-medium text-sm">検索中...</div>
          </div>
        </div>
      </div>
    </div>
  );
};