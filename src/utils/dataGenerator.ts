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

// ランダムシード値を保存（セッションごとに異なる）
let randomSeed = Math.random();

// セッションごとに異なる成長率を生成
const getGrowthRate = (): number => {
  return 0.002 + randomSeed * 0.003; // 0.002 ~ 0.005
};

// ランダムな変動を追加（より大きな変動幅）
function addRandomVariation(value: number, variation: number = 0.3): number {
  return Math.round(value * (1 + (Math.random() - 0.5) * variation));
}

// 曜日効果 (週末は少し低め) - ランダム性を追加
function getDayOfWeekMultiplier(date: Date): number {
  const day = date.getDay();
  const randomFactor = 0.95 + Math.random() * 0.1; // 0.95 ~ 1.05
  if (day === 0 || day === 6) return (0.8 + Math.random() * 0.1) * randomFactor; // 週末
  if (day === 1) return (1.05 + Math.random() * 0.1) * randomFactor; // 月曜日
  return randomFactor;
}

// スパイクをランダムに発生させる（確率もランダム）
function shouldAddSpike(): boolean {
  const spikeChance = 0.03 + randomSeed * 0.04; // 3% ~ 7%
  return Math.random() < spikeChance;
}

// スパイクの倍率（より広い範囲）
function getSpikeMultiplier(): number {
  return 1.3 + Math.random() * 2.0; // 1.3x ~ 3.3x
}

// 初期アクティブサブスクリプション数をランダムに生成
function getInitialActiveSubscriptions(): Record<string, number> {
  return {
    'iOS-monthly': Math.round(4000 + Math.random() * 2000), // 4000 ~ 6000
    'iOS-annual': Math.round(1200 + Math.random() * 800), // 1200 ~ 2000
    'Android-monthly': Math.round(6000 + Math.random() * 2500), // 6000 ~ 8500
    'Android-annual': Math.round(1000 + Math.random() * 600), // 1000 ~ 1600
  };
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
  // セッションごとに新しいランダムシードを生成
  randomSeed = Math.random();

  const data: SubscriptionData[] = [];
  const today = new Date();
  const growthRate = getGrowthRate();

  // 各プラットフォーム・プランタイプごとのアクティブサブスクリプション数を追跡
  const activeTracker = getInitialActiveSubscriptions();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeekMultiplier = getDayOfWeekMultiplier(date);
    const growthMultiplier = 1 + growthRate * (days - i);
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

// データを再生成する関数
export function regenerateData(): SubscriptionData[] {
  return generateSubscriptionData(365);
}

// 初回のデータ生成（アプリ起動時に毎回異なるデータが生成される）
export let ALL_SUBSCRIPTION_DATA = generateSubscriptionData(365);
