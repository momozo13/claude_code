export type Platform = 'iOS' | 'Android' | 'All';
export type PlanType = 'monthly' | 'annual' | 'All';
export type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

export interface SubscriptionData {
  date: Date;
  platform: 'iOS' | 'Android';
  planType: 'monthly' | 'annual';
  newSubscriptions: number;
  cancellations: number;
  activeSubscriptions: number;
  trialConversions: number;
  mrr: number;
}

export interface AggregatedMetrics {
  totalActive: number;
  totalNew: number;
  totalCancellations: number;
  totalMRR: number;
  totalTrialConversions: number;
  newChange: number;
  cancellationChange: number;
  mrrChange: number;
  trialConversionChange: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  platform?: string;
  planType?: string;
}

export interface Filters {
  dateRange: DateRange;
  platform: Platform;
  planType: PlanType;
}
