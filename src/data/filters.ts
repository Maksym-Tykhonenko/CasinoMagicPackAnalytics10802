import type {CatalogueTitle, SortOption} from './pack';
import {FILTER_VOLATILITY} from './pack';

export type ExploreFilters = {
  sort: SortOption;
  categories: string[];
  providers: string[];
  volatility: string[];
  minRating: number;
  onlySaved: boolean;
  hideRated: boolean;
};

export type FilterOptions = {
  categories: string[];
  providers: string[];
  volatility: string[];
};

export const DEFAULT_FILTERS: ExploreFilters = {
  sort: 'Popularity',
  categories: [],
  providers: [],
  volatility: [],
  minRating: 1,
  onlySaved: false,
  hideRated: false,
};

function uniqueSorted(values: Array<string | null | undefined>) {
  return [
    ...new Set(
      values
        .map(value => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((left, right) => left.localeCompare(right));
}

/** Build filter chips from the live pack. */
export function buildFilterOptions(titles: CatalogueTitle[]): FilterOptions {
  const categories = uniqueSorted([
    ...titles.map(title => title.category),
    ...titles.map(title => title.theme),
    ...titles.flatMap(title => title.tags),
  ]);
  const providers = uniqueSorted(titles.map(title => title.studio));
  const fromTitles = uniqueSorted(titles.map(title => title.volatility));
  const volatility =
    fromTitles.length > 0
      ? FILTER_VOLATILITY.filter(option => fromTitles.includes(option)).concat(
          fromTitles.filter(option => !FILTER_VOLATILITY.includes(option)),
        )
      : [...FILTER_VOLATILITY];

  return {categories, providers, volatility};
}

export function countActiveFilters(filters: ExploreFilters) {
  return (
    (filters.sort !== DEFAULT_FILTERS.sort ? 1 : 0) +
    filters.categories.length +
    filters.providers.length +
    filters.volatility.length +
    (filters.minRating > 1 ? 1 : 0) +
    (filters.onlySaved ? 1 : 0) +
    (filters.hideRated ? 1 : 0)
  );
}

export function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter(item => item !== value)
    : [...list, value];
}

export function applyFilters(
  titles: CatalogueTitle[],
  filters: ExploreFilters,
  savedIds: string[],
  ratedIds: string[],
) {
  const filtered = titles.filter(title => {
    if (filters.categories.length > 0) {
      const hit =
        filters.categories.includes(title.category) ||
        (title.theme ? filters.categories.includes(title.theme) : false) ||
        title.tags.some(tag => filters.categories.includes(tag));
      if (!hit) {
        return false;
      }
    }
    if (filters.providers.length > 0) {
      const studio = (title.studio ?? '').trim().toLowerCase();
      const hit = filters.providers.some(
        provider => studio === provider.trim().toLowerCase(),
      );
      if (!hit) {
        return false;
      }
    }
    if (filters.volatility.length > 0) {
      if (!title.volatility || !filters.volatility.includes(title.volatility)) {
        return false;
      }
    }
    if (title.rating < filters.minRating) {
      return false;
    }
    if (filters.onlySaved && !savedIds.includes(title.id)) {
      return false;
    }
    if (filters.hideRated && ratedIds.includes(title.id)) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case 'Rating':
      sorted.sort((left, right) => right.rating - left.rating);
      break;
    case 'Newest':
      sorted.sort((left, right) => right.rank - left.rank);
      break;
    case 'A–Z':
      sorted.sort((left, right) => left.title.localeCompare(right.title));
      break;
    default:
      sorted.sort((left, right) => right.popularity - left.popularity);
  }
  return sorted;
}

export function searchTitles(titles: CatalogueTitle[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return titles;
  }
  return titles.filter(title => {
    const haystack = [
      title.title,
      title.category,
      title.studio ?? '',
      ...title.tags,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}
