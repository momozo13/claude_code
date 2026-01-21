import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '../types';

interface MetricChartProps {
  title: string;
  data: ChartDataPoint[];
  dataKey?: string;
  color?: string;
  format?: 'number' | 'currency';
  type?: 'line' | 'area';
}

export const MetricChart: React.FC<MetricChartProps> = ({
  title,
  data,
  dataKey = 'value',
  color = '#0ea5e9',
  format = 'number',
  type = 'area',
}) => {
  const formatYAxis = (value: number): string => {
    if (format === 'currency') {
      if (value >= 1000000) {
        return `¥${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `¥${(value / 1000).toFixed(0)}K`;
      }
      return `¥${value}`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const formatTooltip = (value: number | undefined): string => {
    if (value === undefined) return '';
    if (format === 'currency') {
      return `¥${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#color${dataKey})`}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
