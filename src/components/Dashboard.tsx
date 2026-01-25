import React, { useState, useMemo } from 'react';
import { Filters } from './Filters';
import { KPICard } from './KPICard';
import { MetricChart } from './MetricChart';
import { DataViewer } from './DataViewer';
import { Filters as FiltersType, SubscriptionData } from '../types';
import { regenerateData } from '../utils/dataGenerator';
import { filterData, aggregateMetrics, prepareChartData } from '../utils/dataProcessor';

export const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<FiltersType>({
    dateRange: '30d',
    platform: 'All',
    planType: 'All',
  });

  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>(() =>
    regenerateData()
  );
  const [isDataViewerOpen, setIsDataViewerOpen] = useState(false);

  const handleRegenerateData = () => {
    setSubscriptionData(regenerateData());
  };

  const handleOpenDataViewer = () => {
    setIsDataViewerOpen(true);
  };

  const handleCloseDataViewer = () => {
    setIsDataViewerOpen(false);
  };

  // フィルタリングされたデータ
  const filteredData = useMemo(() => {
    return filterData(subscriptionData, filters);
  }, [subscriptionData, filters]);

  // 集計メトリクス
  const metrics = useMemo(() => {
    return aggregateMetrics(filteredData, subscriptionData);
  }, [filteredData, subscriptionData]);

  // チャートデータ
  const activeSubsChartData = useMemo(() => {
    return prepareChartData(filteredData, 'active');
  }, [filteredData]);

  const newSubsChartData = useMemo(() => {
    return prepareChartData(filteredData, 'new');
  }, [filteredData]);

  const cancellationsChartData = useMemo(() => {
    return prepareChartData(filteredData, 'cancellations');
  }, [filteredData]);

  const mrrChartData = useMemo(() => {
    return prepareChartData(filteredData, 'mrr');
  }, [filteredData]);

  const trialChartData = useMemo(() => {
    return prepareChartData(filteredData, 'trial');
  }, [filteredData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                サブスクリプション分析ダッシュボード
              </h1>
              <p className="text-gray-600">モバイルアプリの契約状況をリアルタイムで確認</p>
            </div>
            <div className="flex flex-wrap gap-3 sm:flex-nowrap">
              <button
                type="button"
                onClick={handleOpenDataViewer}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                生データを表示
              </button>
              <button
                type="button"
                onClick={handleRegenerateData}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                データを再生成
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Filters filters={filters} onFiltersChange={setFilters} />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KPICard
            title="有効サブスクリプション数"
            value={metrics.totalActive}
            format="number"
            icon={
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
          <KPICard
            title="新規サブスクリプション"
            value={metrics.totalNew}
            change={metrics.newChange}
            format="number"
            icon={
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            }
          />
          <KPICard
            title="解約数"
            value={metrics.totalCancellations}
            change={metrics.cancellationChange}
            format="number"
            trend="down"
            icon={
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                />
              </svg>
            }
          />
          <KPICard
            title="MRR"
            value={metrics.totalMRR}
            change={metrics.mrrChange}
            format="currency"
            icon={
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <KPICard
            title="トライアル転換"
            value={metrics.totalTrialConversions}
            change={metrics.trialConversionChange}
            format="number"
            icon={
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <MetricChart
            title="有効サブスクリプション数の推移"
            data={activeSubsChartData}
            color="#0ea5e9"
            type="area"
          />
          <MetricChart
            title="MRR（月次経常収益）の推移"
            data={mrrChartData}
            color="#10b981"
            format="currency"
            type="area"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MetricChart
            title="新規サブスクリプション"
            data={newSubsChartData}
            color="#8b5cf6"
            type="line"
          />
          <MetricChart
            title="解約数"
            data={cancellationsChartData}
            color="#ef4444"
            type="line"
          />
          <MetricChart
            title="トライアル転換数"
            data={trialChartData}
            color="#f59e0b"
            type="line"
          />
        </div>
      </div>

      {/* Data Viewer Modal */}
      <DataViewer
        data={filteredData}
        isOpen={isDataViewerOpen}
        onClose={handleCloseDataViewer}
      />
    </div>
  );
};
