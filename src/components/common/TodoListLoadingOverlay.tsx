import React from 'react';

interface TodoListLoadingOverlayProps {
  isVisible: boolean;
}

export const TodoListLoadingOverlay: React.FC<TodoListLoadingOverlayProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg p-6 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div className="text-gray-700 font-medium">検索中...</div>
        </div>
      </div>
    </div>
  );
};