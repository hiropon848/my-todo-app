interface PriorityBadgeProps {
  priority?: {
    id: string;
    name: string;
    color_code: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriorityBadge({ priority, size = 'sm', className = '' }: PriorityBadgeProps) {
  // priorityが未定義の場合は何も表示しない
  if (!priority) {
    return null;
  }

  // サイズ別のスタイル設定
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded font-medium text-white shadow-sm transition-all duration-200 ${sizeStyles[size]} ${className}`}
      style={{
        backgroundColor: priority.color_code,
        boxShadow: `0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px ${priority.color_code}20`,
      }}
    >
      {priority.name}
    </span>
  );
} 