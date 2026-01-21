import React from 'react';
import { Filters as FiltersType, DateRange, Platform, PlanType } from '../types';

interface FiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export const Filters: React.FC<FiltersProps> = ({ filters, onFiltersChange }) => {
  const handleChange = (key: keyof FiltersType, value: DateRange | Platform | PlanType) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">フィルター</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 期間 */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">期間</label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleChange('dateRange', e.target.value as DateRange)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          >
            <option value="7d">過去7日間</option>
            <option value="30d">過去30日間</option>
            <option value="90d">過去90日間</option>
            <option value="1y">過去1年間</option>
            <option value="all">全期間</option>
          </select>
        </div>

        {/* プラットフォーム */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">プラットフォーム</label>
          <select
            value={filters.platform}
            onChange={(e) => handleChange('platform', e.target.value as Platform)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          >
            <option value="All">全て</option>
            <option value="iOS">iOS</option>
            <option value="Android">Android</option>
          </select>
        </div>

        {/* プランタイプ */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">プラン</label>
          <select
            value={filters.planType}
            onChange={(e) => handleChange('planType', e.target.value as PlanType)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          >
            <option value="All">全て</option>
            <option value="monthly">月額</option>
            <option value="annual">年額</option>
          </select>
        </div>
      </div>
    </div>
  );
};
