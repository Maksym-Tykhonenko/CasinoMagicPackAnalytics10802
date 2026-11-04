import {featuredTitle, popularTitles, type CatalogueTitle} from './pack';

export const ANALYTICS_TABS = [
  'Overview',
  'Ratings',
  'Categories',
  'Popularity',
] as const;

export type AnalyticsTab = (typeof ANALYTICS_TABS)[number];

export const ANALYTICS_PERIODS = [
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
] as const;

export type AnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];

export const CATEGORY_TONES = [
  '#4a9bff',
  '#7fb2ff',
  '#2e7bff',
  '#1b4fa8',
  'rgba(255, 255, 255, 0.16)',
];

function pickCompared(titles: CatalogueTitle[]): CatalogueTitle[] {
  const byId = new Map(titles.map(title => [title.id, title]));
  const preferred = [
    byId.get('neon-fortune-x') ?? featuredTitle,
    byId.get('golden-pharaoh') ??
      popularTitles.find(title => title.id === 'golden-pharaoh') ??
      popularTitles[1] ??
      featuredTitle,
  ];
  const unique: CatalogueTitle[] = [];
  const seen = new Set<string>();
  for (const title of [
    ...preferred,
    ...titles,
    featuredTitle,
    ...popularTitles,
  ]) {
    if (seen.has(title.id)) {
      continue;
    }
    seen.add(title.id);
    unique.push(title);
    if (unique.length === 2) {
      break;
    }
  }
  return unique;
}

const periodFactor = (period: AnalyticsPeriod) => {
  if (period === 'Last 7 days') {
    return 0.74;
  }
  if (period === 'Last 90 days') {
    return 1.16;
  }
  return 1;
};

export function buildAnalyticsModel(
  titles: CatalogueTitle[],
  period: AnalyticsPeriod,
) {
  const factor = periodFactor(period);
  const live = titles.length >= 8;
  const gamesTracked = live
    ? Math.round(titles.length * (period === 'Last 90 days' ? 1 : factor) * 31)
    : Math.round(1240 * factor);
  const avgRating = live
    ? titles.reduce((sum, title) => sum + title.rating, 0) / titles.length
    : 4.42;

  const rtpBars = [
    {label: '< 94%', value: 4.6, highlighted: true},
    {label: '94-95%', value: 4.5, highlighted: true},
    {label: '95-96%', value: 4.3, highlighted: false},
    {label: '96-97%', value: 4.2, highlighted: false},
    {label: '97%+', value: 4.1, highlighted: false},
  ];

  const trend = [42, 48, 51, 58, 63, 71, 79, 92].map(value =>
    Math.round(value * (0.85 + factor * 0.15)),
  );
  const trendDelta = `+${(18.4 * factor).toFixed(1)}%`;

  const counts = new Map<string, number>();
  titles.forEach(title => {
    counts.set(title.category, (counts.get(title.category) ?? 0) + 1);
  });
  const ranked = [...counts.entries()].sort(
    (left, right) => right[1] - left[1],
  );
  const fallbackCats: Array<[string, number]> = [
    ['Adventure', 318],
    ['Classic', 264],
    ['Cyberpunk', 211],
    ['Ocean', 186],
    ['Other', 261],
  ];
  const source = live && ranked.length ? ranked : fallbackCats;
  const top = source.slice(0, 4);
  const rest = source.slice(4).reduce((sum, item) => sum + item[1], 0);
  const categories = [
    ...top.map(([label, count]) => ({label, count})),
    ...(rest > 0 || !live ? [{label: 'Other', count: rest || 261}] : []),
  ].slice(0, 5);

  const compared = pickCompared(titles);

  return {
    gamesTracked,
    gamesDelta: `+${Math.round(48 * factor)} this month`,
    avgRating,
    ratingDelta: '+0.06 vs last month',
    rtpBars,
    trend,
    trendLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'NOW'],
    trendDelta,
    categories,
    compared,
  };
}
