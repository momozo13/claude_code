import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  format?: 'number' | 'currency' | 'percent';
  icon?: React.ReactNode;
  trend?: 'up' | 'down';
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  format = 'number',
  icon,
  trend,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return `¥${val.toLocaleString()}`;
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const getChangeColor = (changeValue: number): string => {
    if (trend === 'down') {
      return changeValue < 0 ? 'text-green-600' : 'text-red-600';
    }
    return changeValue >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (changeValue: number): string => {
    if (trend === 'down') {
      return changeValue < 0 ? '↓' : '↑';
    }
    return changeValue >= 0 ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{formatValue(value)}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${getChangeColor(change)}`}>
                {getChangeIcon(change)} {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">前期間比</span>
            </div>
          )}
        </div>
        {icon && <div className="text-gray-400 opacity-50">{icon}</div>}
      </div>
    </div>
  );
};
