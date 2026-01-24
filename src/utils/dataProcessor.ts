import { SubscriptionData, Filters, AggregatedMetrics, ChartDataPoint } from '../types';
import { subDays, format, isAfter, isBefore } from 'date-fns';

// フィルタに基づいて日付範囲を取得
function getDateRangeFromFilter(dateRange: string): { start: Date; end: Date } {
  const end = new Date();
  let start: Date;

  switch (dateRange) {
    case '7d':
      start = subDays(end, 7);
      break;
    case '30d':
      start = subDays(end, 30);
      break;
    case '90d':
      start = subDays(end, 90);
      break;
    case '1y':
      start = subDays(end, 365);
      break;
    default:
      start = subDays(end, 365);
  }

  return { start, end };
}

// フィルタに基づいてデータをフィルタリング
export function filterData(data: SubscriptionData[], filters: Filters): SubscriptionData[] {
  const { start, end } = getDateRangeFromFilter(filters.dateRange);

  return data.filter((item) => {
    // 日付フィルタ
    const dateMatch = !isBefore(item.date, start) && !isAfter(item.date, end);

    // プラットフォームフィルタ
    const platformMatch = filters.platform === 'All' || item.platform === filters.platform;

    // プランタイプフィルタ
    const planTypeMatch = filters.planType === 'All' || item.planType === filters.planType;

    return dateMatch && platformMatch && planTypeMatch;
  });
}

// データを集計してメトリクスを計算
export function aggregateMetrics(
  data: SubscriptionData[],
  allData: SubscriptionData[]
): AggregatedMetrics {
  if (data.length === 0) {
    return {
      totalActive: 0,
      totalNew: 0,
      totalCancellations: 0,
      totalMRR: 0,
      totalTrialConversions: 0,
      newChange: 0,
      cancellationChange: 0,
      mrrChange: 0,
      trialConversionChange: 0,
    };
  }

  // 最新の日付のデータを取得
  const latestDate = data[data.length - 1].date;
  const latestData = data.filter((item) => item.date.getTime() === latestDate.getTime());

  // 前期間のデータを計算（同じ期間長だけ前）
  const periodLength = data.length;
  const previousPeriodData = allData.slice(
    Math.max(0, allData.length - periodLength * 2),
    allData.length - periodLength
  );

  // 現在の期間の集計
  const totalActive = latestData.reduce((sum, item) => sum + item.activeSubscriptions, 0);
  const totalNew = data.reduce((sum, item) => sum + item.newSubscriptions, 0);
  const totalCancellations = data.reduce((sum, item) => sum + item.cancellations, 0);
  const totalMRR = latestData.reduce((sum, item) => sum + item.mrr, 0);
  const totalTrialConversions = data.reduce((sum, item) => sum + item.trialConversions, 0);

  // 前期間の集計
  const previousNew = previousPeriodData.reduce((sum, item) => sum + item.newSubscriptions, 0);
  const previousCancellations = previousPeriodData.reduce(
    (sum, item) => sum + item.cancellations,
    0
  );
  const previousTrialConversions = previousPeriodData.reduce(
    (sum, item) => sum + item.trialConversions,
    0
  );

  // 前期間の最新日付のMRR
  const previousLatestDate =
    previousPeriodData.length > 0
      ? previousPeriodData[previousPeriodData.length - 1].date
      : new Date(0);
  const previousLatestData = previousPeriodData.filter(
    (item) => item.date.getTime() === previousLatestDate.getTime()
  );
  const previousMRR = previousLatestData.reduce((sum, item) => sum + item.mrr, 0);

  // 変化率を計算
  const newChange = previousNew > 0 ? ((totalNew - previousNew) / previousNew) * 100 : 0;
  const cancellationChange =
    previousCancellations > 0
      ? ((totalCancellations - previousCancellations) / previousCancellations) * 100
      : 0;
  const mrrChange = previousMRR > 0 ? ((totalMRR - previousMRR) / previousMRR) * 100 : 0;
  const trialConversionChange =
    previousTrialConversions > 0
      ? ((totalTrialConversions - previousTrialConversions) / previousTrialConversions) * 100
      : 0;

  return {
    totalActive,
    totalNew,
    totalCancellations,
    totalMRR,
    totalTrialConversions,
    newChange,
    cancellationChange,
    mrrChange,
    trialConversionChange,
  };
}

// チャート用のデータを生成
export function prepareChartData(
  data: SubscriptionData[],
  metric: 'new' | 'cancellations' | 'mrr' | 'active' | 'trial'
): ChartDataPoint[] {
  // 日付ごとにグループ化
  const groupedByDate = data.reduce(
    (acc, item) => {
      const dateKey = format(item.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    },
    {} as Record<string, SubscriptionData[]>
  );

  // 日付順にソートして集計
  const sortedDates = Object.keys(groupedByDate).sort();

  return sortedDates.map((dateKey) => {
    const items = groupedByDate[dateKey];
    let value = 0;

    switch (metric) {
      case 'new':
        value = items.reduce((sum, item) => sum + item.newSubscriptions, 0);
        break;
      case 'cancellations':
        value = items.reduce((sum, item) => sum + item.cancellations, 0);
        break;
      case 'mrr':
        value = items.reduce((sum, item) => sum + item.mrr, 0);
        break;
      case 'active':
        value = items.reduce((sum, item) => sum + item.activeSubscriptions, 0);
        break;
      case 'trial':
        value = items.reduce((sum, item) => sum + item.trialConversions, 0);
        break;
    }

    return {
      date: format(new Date(dateKey), 'M/d'),
      value,
    };
  });
}
