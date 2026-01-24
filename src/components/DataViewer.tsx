import React, { useState, useEffect } from 'react';
import { SubscriptionData } from '../types';
import { format } from 'date-fns';

interface DataViewerProps {
  data: SubscriptionData[];
  isOpen: boolean;
  onClose: () => void;
}

export const DataViewer: React.FC<DataViewerProps> = ({ data, isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // モーダルが開いたときにページを1にリセット
  useEffect(() => {
    if (isOpen) {
      console.log('DataViewer opened', { dataLength: data.length });
      setCurrentPage(1);
    }
  }, [isOpen, data.length]);

  console.log('DataViewer render check', { isOpen, dataLength: data.length });

  if (!isOpen) {
    console.log('DataViewer not open - returning null');
    return null;
  }

  console.log('DataViewer rendering modal now!');

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const exportToCSV = () => {
    const headers = [
      '日付',
      'プラットフォーム',
      'プランタイプ',
      '新規サブスク',
      '解約数',
      '有効サブスク',
      'トライアル転換',
      'MRR',
    ];

    const rows = data.map((item) => [
      format(item.date, 'yyyy-MM-dd'),
      item.platform,
      item.planType === 'monthly' ? '月額' : '年額',
      item.newSubscriptions,
      item.cancellations,
      item.activeSubscriptions,
      item.trialConversions,
      item.mrr,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscription_data_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    const jsonData = data.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      platform: item.platform,
      planType: item.planType,
      newSubscriptions: item.newSubscriptions,
      cancellations: item.cancellations,
      activeSubscriptions: item.activeSubscriptions,
      trialConversions: item.trialConversions,
      mrr: item.mrr,
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscription_data_${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">生データビューア</h2>
            <p className="text-sm text-gray-600 mt-1">
              全 {data.length} 件のレコード（フィルタ適用済み）
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            CSV出力
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            JSON出力
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          {data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium">データがありません</p>
              <p className="text-gray-400 text-sm mt-2">
                フィルター条件を変更してください
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                  日付
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                  プラットフォーム
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b-2 border-gray-200">
                  プラン
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b-2 border-gray-200">
                  新規
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b-2 border-gray-200">
                  解約
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b-2 border-gray-200">
                  有効
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b-2 border-gray-200">
                  トライアル転換
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b-2 border-gray-200">
                  MRR
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr
                  key={`${item.date}-${item.platform}-${item.planType}`}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-3 border-b border-gray-200 whitespace-nowrap">
                    {format(item.date, 'yyyy/MM/dd')}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        item.platform === 'iOS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        item.planType === 'monthly'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {item.planType === 'monthly' ? '月額' : '年額'}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-right font-mono">
                    {item.newSubscriptions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-right font-mono">
                    {item.cancellations.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-right font-mono font-semibold">
                    {item.activeSubscriptions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-right font-mono">
                    {item.trialConversions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 text-right font-mono">
                    ¥{item.mrr.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination */}
        {data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {startIndex + 1} - {Math.min(endIndex, data.length)} / {data.length} 件
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              前へ
            </button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              次へ
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
