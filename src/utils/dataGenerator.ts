import { SubscriptionData } from '../types';
import { subDays } from 'date-fns';

const MONTHLY_PRICE_IOS = 980;
const MONTHLY_PRICE_ANDROID = 950;
const ANNUAL_PRICE_IOS = 9800;
const ANNUAL_PRICE_ANDROID = 9500;

// ベースとなるメトリクスの値
const BASE_METRICS = {
  iOS: {
    monthly: { new: 150, cancellation: 30, trial: 80 },
    annual: { new: 50, cancellation: 5, trial: 25 },
  },
  Android: {
    monthly: { new: 200, cancellation: 45, trial: 100 },
    annual: { new: 40, cancellation: 4, trial: 20 },
  },
};

// トレンド成長率 (日次)
const GROWTH_RATE = 0.003;

// ランダムな変動を追加
function addRandomVariation(value: number, variation: number = 0.2): number {
  return Math.round(value * (1 + (Math.random() - 0.5) * variation));
}

// 曜日効果 (週末は少し低め)
function getDayOfWeekMultiplier(date: Date): number {
  const day = date.getDay();
  if (day === 0 || day === 6) return 0.85; // 週末
  if (day === 1) return 1.1; // 月曜日は少し多め
  return 1.0;
}

// スパイクをランダムに発生させる (約5%の確率)
function shouldAddSpike(): boolean {
  return Math.random() < 0.05;
}

// スパイクの倍率
function getSpikeMultiplier(): number {
  return 1.5 + Math.random() * 1.0; // 1.5x ~ 2.5x
}

// 累積アクティブサブスクリプション数を計算
function calculateActiveSubscriptions(
  previousActive: number,
  newSubs: number,
  cancellations: number
): number {
  return Math.max(0, previousActive + newSubs - cancellations);
}

// MRRを計算
function calculateMRR(
  activeSubscriptions: number,
  planType: 'monthly' | 'annual',
  platform: 'iOS' | 'Android'
): number {
  let price: number;

  if (planType === 'monthly') {
    price = platform === 'iOS' ? MONTHLY_PRICE_IOS : MONTHLY_PRICE_ANDROID;
  } else {
    // 年間プランは月額換算
    price = platform === 'iOS' ? ANNUAL_PRICE_IOS / 12 : ANNUAL_PRICE_ANDROID / 12;
  }

  return Math.round(activeSubscriptions * price);
}

// データを生成
export function generateSubscriptionData(days: number = 365): SubscriptionData[] {
  const data: SubscriptionData[] = [];
  const today = new Date();

  // 各プラットフォーム・プランタイプごとのアクティブサブスクリプション数を追跡
  const activeTracker: Record<string, number> = {
    'iOS-monthly': 5000,
    'iOS-annual': 1500,
    'Android-monthly': 7000,
    'Android-annual': 1200,
  };

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeekMultiplier = getDayOfWeekMultiplier(date);
    const growthMultiplier = 1 + GROWTH_RATE * (days - i);
    const hasSpike = shouldAddSpike();
    const spikeMultiplier = hasSpike ? getSpikeMultiplier() : 1;

    // iOS Monthly
    const iosMonthlyNew = addRandomVariation(
      BASE_METRICS.iOS.monthly.new * growthMultiplier * dayOfWeekMultiplier * spikeMultiplier
    );
    const iosMonthlyCancellation = addRandomVariation(
      BASE_METRICS.iOS.monthly.cancellation * growthMultiplier * dayOfWeekMultiplier
    );
    const iosMonthlyTrial = addRandomVariation(
      BASE_METRICS.iOS.monthly.trial * growthMultiplier * dayOfWeekMultiplier * spikeMultiplier
    );
    activeTracker['iOS-monthly'] = calculateActiveSubscriptions(
      activeTracker['iOS-monthly'],
      iosMonthlyNew,
      iosMonthlyCancellation
    );

    data.push({
      date,
      platform: 'iOS',
      planType: 'monthly',
      newSubscriptions: iosMonthlyNew,
      cancellations: iosMonthlyCancellation,
      activeSubscriptions: activeTracker['iOS-monthly'],
      trialConversions: iosMonthlyTrial,
      mrr: calculateMRR(activeTracker['iOS-monthly'], 'monthly', 'iOS'),
    });

    // iOS Annual
    const iosAnnualNew = addRandomVariation(
      BASE_METRICS.iOS.annual.new * growthMultiplier * dayOfWeekMultiplier * spikeMultiplier
    );
    const iosAnnualCancellation = addRandomVariation(
      BASE_METRICS.iOS.annual.cancellation * growthMultiplier * dayOfWeekMultiplier
    );
    const iosAnnualTrial = addRandomVariation(
      BASE_METRICS.iOS.annual.trial * growthMultiplier * dayOfWeekMultiplier * spikeMultiplier
    );
    activeTracker['iOS-annual'] = calculateActiveSubscriptions(
      activeTracker['iOS-annual'],
      iosAnnualNew,
      iosAnnualCancellation
    );

    data.push({
      date,
      platform: 'iOS',
      planType: 'annual',
      newSubscriptions: iosAnnualNew,
      cancellations: iosAnnualCancellation,
      activeSubscriptions: activeTracker['iOS-annual'],
      trialConversions: iosAnnualTrial,
      mrr: calculateMRR(activeTracker['iOS-annual'], 'annual', 'iOS'),
    });

    // Android Monthly
    const androidMonthlyNew = addRandomVariation(
      BASE_METRICS.Android.monthly.new * growthMultiplier * dayOfWeekMultiplier * spikeMultiplier
    );
    const androidMonthlyCancellation = addRandomVariation(
      BASE_METRICS.Android.monthly.cancellation * growthMultiplier * dayOfWeekMultiplier
    );
    const androidMonthlyTrial = addRandomVariation(
      BASE_METRICS.Android.monthly.trial * growthMultiplier * dayOfWeekMultiplier * spikeMultiplier
    );
    activeTracker['Android-monthly'] = calculateActiveSubscriptions(
      activeTracker['Android-monthly'],
      androidMonthlyNew,
      androidMonthlyCancellation
    );

    data.push({
      date,
      platform: 'Android',
      planType: 'monthly',
      newSubscriptions: androidMonthlyNew,
      cancellations: androidMonthlyCancellation,
      activeSubscriptions: activeTracker['Android-monthly'],
      trialConversions: androidMonthlyTrial,
      mrr: calculateMRR(activeTracker['Android-monthly'], 'monthly', 'Android'),
    });

    // Android Annual
    const androidAnnualNew = addRandomVariation(
      BASE_METRICS.Android.annual.new * growthMultiplier * dayOfWeekMultiplier * spikeMultiplier
    );
    const androidAnnualCancellation = addRandomVariation(
      BASE_METRICS.Android.annual.cancellation * growthMultiplier * dayOfWeekMultiplier
    );
    const androidAnnualTrial = addRandomVariation(
      BASE_METRICS.Android.annual.trial * growthMultiplier * dayOfWeekMultiplier * spikeMultiplier
    );
    activeTracker['Android-annual'] = calculateActiveSubscriptions(
      activeTracker['Android-annual'],
      androidAnnualNew,
      androidAnnualCancellation
    );

    data.push({
      date,
      platform: 'Android',
      planType: 'annual',
      newSubscriptions: androidAnnualNew,
      cancellations: androidAnnualCancellation,
      activeSubscriptions: activeTracker['Android-annual'],
      trialConversions: androidAnnualTrial,
      mrr: calculateMRR(activeTracker['Android-annual'], 'annual', 'Android'),
    });
  }

  return data;
}

// 全データを一度生成してキャッシュ
export const ALL_SUBSCRIPTION_DATA = generateSubscriptionData(365);
