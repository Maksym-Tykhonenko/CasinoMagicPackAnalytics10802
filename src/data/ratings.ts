import type {TitleRating} from '../routing/LibraryContext';
import type {CatalogueTitle} from './pack';

export type RatedEntry = {
  title: CatalogueTitle;
  rating: TitleRating;
};

export type CategoryAvg = {
  label: string;
  avg: number;
};

export type MonthPoint = {
  label: string;
  value: number;
  highlighted: boolean;
};

export type StarBucket = {
  stars: number;
  count: number;
  pct: number;
};

export function starGlyph(stars: number) {
  const filled = Math.min(5, Math.max(0, Math.round(stars)));
  return `${'★'.repeat(filled)}${'☆'.repeat(5 - filled)}`;
}

export function formatRatedDate(at?: number) {
  const date = new Date(at ?? Date.now());
  return date.toLocaleString('en-US', {month: 'short', day: 'numeric'});
}

export function formatRatedAgo(at?: number) {
  if (!at) {
    return 'just now';
  }
  const minutes = Math.max(1, Math.round((Date.now() - at) / 60000));
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  if (days === 1) {
    return 'yesterday';
  }
  return `${days} days ago`;
}

export function buildRatingsModel(
  titles: CatalogueTitle[],
  ratings: Record<string, TitleRating>,
) {
  const byId = new Map(titles.map(title => [title.id, title]));
  const entries: RatedEntry[] = Object.entries(ratings)
    .map(([id, rating]) => {
      const title = byId.get(id);
      if (!title || !rating.stars) {
        return null;
      }
      return {title, rating};
    })
    .filter((entry): entry is RatedEntry => Boolean(entry));

  const count = entries.length;
  const avg = count
    ? entries.reduce((sum, entry) => sum + entry.rating.stars, 0) / count
    : 0;
  const catalogueAvg = titles.length
    ? titles.reduce((sum, title) => sum + title.rating, 0) / titles.length
    : 0;
  const vsCatalogue = count && catalogueAvg ? avg - catalogueAvg : 0;

  const distribution: StarBucket[] = [5, 4, 3, 2, 1].map(stars => {
    const bucket = entries.filter(entry => entry.rating.stars === stars).length;
    return {
      stars,
      count: bucket,
      pct: count ? Math.round((bucket / count) * 100) : 0,
    };
  });
  const distMax = Math.max(1, ...distribution.map(item => item.count));

  const grouped = new Map<string, number[]>();
  entries.forEach(entry => {
    const list = grouped.get(entry.title.category) ?? [];
    list.push(entry.rating.stars);
    grouped.set(entry.title.category, list);
  });
  const categories: CategoryAvg[] = [...grouped.entries()]
    .map(([label, values]) => ({
      label,
      avg: values.reduce((sum, value) => sum + value, 0) / values.length,
    }))
    .sort((left, right) => right.avg - left.avg);

  const now = new Date();
  const months: MonthPoint[] = [];
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const values = entries.filter(entry => {
      const stamp = entry.rating.ratedAt ?? 0;
      if (!stamp) {
        return false;
      }
      const point = new Date(stamp);
      return (
        point.getFullYear() === date.getFullYear() &&
        point.getMonth() === date.getMonth()
      );
    });
    const value = values.length
      ? values.reduce((sum, entry) => sum + entry.rating.stars, 0) /
        values.length
      : 0;
    months.push({
      label: date.toLocaleString('en-US', {month: 'short'}),
      value,
      highlighted: offset <= 1,
    });
  }

  const earlier = months.slice(0, 3).filter(item => item.value > 0);
  const later = months.slice(3).filter(item => item.value > 0);
  const earlierAvg = earlier.length
    ? earlier.reduce((sum, item) => sum + item.value, 0) / earlier.length
    : 0;
  const laterAvg = later.length
    ? later.reduce((sum, item) => sum + item.value, 0) / later.length
    : 0;
  const trendDelta = laterAvg && earlierAvg ? laterAvg - earlierAvg : laterAvg;

  const byStarsDesc = [...entries].sort(
    (left, right) =>
      right.rating.stars - left.rating.stars ||
      (right.rating.ratedAt ?? 0) - (left.rating.ratedAt ?? 0),
  );
  const byStarsAsc = [...entries].sort(
    (left, right) => left.rating.stars - right.rating.stars,
  );
  const byRecent = [...entries].sort(
    (left, right) => (right.rating.ratedAt ?? 0) - (left.rating.ratedAt ?? 0),
  );

  return {
    count,
    avg,
    vsCatalogue,
    distribution,
    distMax,
    categories: categories.slice(0, 4),
    favorites: categories.slice(0, 4),
    months,
    trendDelta,
    highest: byStarsDesc.slice(0, 2),
    lowest: byStarsAsc.slice(0, 2),
    recent: byRecent.slice(0, 3),
  };
}
