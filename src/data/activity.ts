import type {TitleRating} from '../routing/LibraryContext';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEK_COUNT = 12;
const CHART_HEIGHT = 64;
const MIN_BAR = 6;

export type ActivityModel = {
  bars: number[];
  values: number[];
  deltaLabel: string;
  deltaUp: boolean;
  empty: boolean;
};

export const SAMPLE_ACTIVITY: ActivityModel = {
  bars: [22, 30, 26, 38, 34, 44, 40, 52, 46, 58, 54, 62],
  values: [22, 30, 26, 38, 34, 44, 40, 52, 46, 58, 54, 62],
  deltaLabel: '+12%',
  deltaUp: true,
  empty: false,
};

function startOfLocalWeek(ms: number): number {
  const date = new Date(ms);
  const weekday = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - weekday);
  return date.getTime();
}

export function collectActivityStamps(
  savedIds: string[],
  savedAt: Record<string, number>,
  ratings: Record<string, TitleRating>,
): number[] {
  const stamps: number[] = [];
  const now = Date.now();
  savedIds.forEach(id => {
    const at = savedAt[id];
    stamps.push(typeof at === 'number' && Number.isFinite(at) ? at : now);
  });
  Object.values(ratings).forEach(rating => {
    if (typeof rating.ratedAt === 'number' && Number.isFinite(rating.ratedAt)) {
      stamps.push(rating.ratedAt);
    } else {
      stamps.push(now);
    }
  });
  return stamps;
}

export function buildActivityModel(
  timestamps: number[],
  now = Date.now(),
): ActivityModel {
  const weekStart = startOfLocalWeek(now);
  const windowStart = weekStart - (WEEK_COUNT - 1) * WEEK_MS;
  const values = Array.from({length: WEEK_COUNT}, () => 0);

  timestamps.forEach(stamp => {
    if (typeof stamp !== 'number' || !Number.isFinite(stamp)) {
      return;
    }
    const index = Math.floor((stamp - windowStart) / WEEK_MS);
    if (index >= 0 && index < WEEK_COUNT) {
      values[index] += 1;
    }
  });

  const peak = Math.max(0, ...values);
  const bars = values.map(value =>
    peak === 0
      ? MIN_BAR
      : Math.max(MIN_BAR, Math.round((value / peak) * CHART_HEIGHT)),
  );

  const recent = values.slice(-3).reduce((sum, count) => sum + count, 0);
  const prior = values.slice(-6, -3).reduce((sum, count) => sum + count, 0);

  let deltaLabel = '0%';
  let deltaUp = true;
  if (recent === 0 && prior === 0) {
    deltaLabel = '0%';
  } else if (prior === 0) {
    deltaLabel = '+100%';
  } else {
    const pct = Math.round(((recent - prior) / prior) * 100);
    deltaLabel = `${pct > 0 ? '+' : ''}${pct}%`;
    deltaUp = pct >= 0;
  }

  return {
    bars,
    values,
    deltaLabel,
    deltaUp,
    empty: peak === 0,
  };
}
