import type {ImageSourcePropType} from 'react-native';

import type {SlotDetail, SlotListItem} from '../api/packClient';
import {
  EXCLUDED_PROVIDERS,
  EXCLUDED_TITLES,
  FEATURED_PREFERRED_HINTS,
  FEATURED_SKIP_HINTS,
} from '../constants/api';
import {packArt} from './assets';

export type CatalogueTitle = {
  id: string;
  title: string;
  category: string;
  studio?: string;
  rating: number;
  interest?: string;
  rank: number;
  art: ImageSourcePropType;
  popularity: number;
  badge?: string;
  tags: string[];
  volatility?: string;
  reels?: string;
  paylines?: string;
  theme?: string;
  bonus?: string;
  released?: string;
  ratingsCount?: number;
  description?: string;
};

export type PulseStat = {
  label: string;
  value: string;
  delta: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  video_slot: 'Video slot',
  crash: 'Crash',
  instant_win: 'Instant win',
  live: 'Live',
  scratch: 'Scratch',
  table: 'Table',
  other: 'Other',
  unknown: 'Slot',
};

const TREND_LABELS: Record<string, string> = {
  growing: 'Growing',
  declining: 'Cooling',
  flat: 'Stable',
};

const FALLBACK_ART = [
  packArt.neonFortune,
  packArt.solarPharaoh,
  packArt.cyberReels,
  packArt.aztecTemple,
  packArt.diamondRush,
];

export const FILTER_CATEGORIES = [
  'Adventure',
  'Classic',
  'Cyberpunk',
  'Ocean',
  'Winter',
  'Fruits',
  'Mythology',
  'Retro',
];

export const FILTER_PROVIDERS = [
  'Nexus',
  'Vortex',
  'LumenPlay',
  'Astra',
  'Orbit',
];

export const FILTER_VOLATILITY = ['Low', 'Medium', 'Medium-high', 'High'];

export const SORT_OPTIONS = ['Popularity', 'Rating', 'Newest', 'A–Z'] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];

function formatCategory(value: string | null) {
  if (!value) {
    return 'Slot';
  }
  return CATEGORY_LABELS[value] ?? value.replace(/_/g, ' ');
}

function ratingFromRtp(rtp: string | null) {
  const parsed = rtp ? Number.parseFloat(rtp) : Number.NaN;
  if (!Number.isFinite(parsed)) {
    return 4.2;
  }
  return Math.min(5, Math.max(3.6, (parsed - 88) / 2));
}

function interestFromSlot(slot: SlotListItem) {
  if (slot.volume_12m && slot.volume_12m > 0) {
    return `${Math.round(slot.volume_12m / 100) / 10}k searches`;
  }
  if (slot.rtp_default) {
    return `${slot.rtp_default}% RTP`;
  }
  return TREND_LABELS[slot.trend ?? ''] ?? 'Pack';
}

function artForSlot(slot: SlotListItem, index: number): ImageSourcePropType {
  const remote = slot.thumbnail_url ?? slot.thumbnail?.url;
  if (remote) {
    return {uri: remote};
  }
  return FALLBACK_ART[index % FALLBACK_ART.length];
}

function popularityFromSlot(slot: SlotListItem, index: number) {
  if (slot.volume_12m && slot.volume_12m > 0) {
    return Math.min(99, Math.max(42, Math.round(slot.volume_12m / 800)));
  }
  return Math.max(48, 92 - index * 4);
}

function badgeForSlot(slot: SlotListItem, index: number) {
  if (index === 0) {
    return '#1 TOP';
  }
  if (slot.trend === 'growing') {
    return 'TRENDING';
  }
  if (index === 1) {
    return 'STAFF PICK';
  }
  if (slot.release_date) {
    return 'NEW';
  }
  return undefined;
}

function formatVolatility(value: string | null) {
  if (!value) {
    return undefined;
  }
  return value.replace(/_/g, '-').replace(/\b\w/g, char => char.toUpperCase());
}

/** Prefer clean thumbnail tiles — logo banners often bake in title text. */
function safeCoverForDetail(detail: SlotDetail) {
  return (
    detail.data.thumbnail_url ??
    detail.data.thumbnail?.url ??
    detail.assets.logo_url ??
    null
  );
}

export function mapSlotDetailToTitle(detail: SlotDetail): CatalogueTitle {
  const cover = safeCoverForDetail(detail);
  const [title] = mapSlotsToTitles([
    {
      ...detail.data,
      thumbnail_url: cover,
      thumbnail: cover
        ? {url: cover, key: '', version: ''}
        : detail.data.thumbnail,
    },
  ]);
  const reels =
    detail.data.reels && detail.data.rows
      ? `${detail.data.reels} × ${detail.data.rows}`
      : title.reels;
  return {
    ...title,
    rank: 1,
    badge: '#1 TOP',
    reels,
  };
}

export function pickRandomTitle(titles: CatalogueTitle[]): CatalogueTitle | null {
  if (titles.length === 0) {
    return null;
  }
  return titles[Math.floor(Math.random() * titles.length)] ?? null;
}

function normalizeFeaturedHint(value: string) {
  return value.trim().toLowerCase().replace(/[-_]+/g, ' ');
}

export function matchesFeaturedHint(
  title: Pick<CatalogueTitle, 'id' | 'title'>,
  hints: readonly string[] = FEATURED_PREFERRED_HINTS,
) {
  const id = normalizeFeaturedHint(title.id);
  const name = normalizeFeaturedHint(title.title);
  return hints.some(hint => {
    const needle = normalizeFeaturedHint(hint);
    return (
      name.includes(needle) ||
      id.includes(needle) ||
      title.id.toLowerCase() === hint.toLowerCase()
    );
  });
}

function isSkippedFeatured(title: Pick<CatalogueTitle, 'id' | 'title'>) {
  return matchesFeaturedHint(title, FEATURED_SKIP_HINTS);
}

function isZeusTitle(title: Pick<CatalogueTitle, 'id' | 'title'>) {
  const id = normalizeFeaturedHint(title.id);
  const name = normalizeFeaturedHint(title.title);
  return id.includes('zeus') || name.includes('zeus');
}

/** True when this title matches the current SPOTLIGHT preference list. */
export function isPinnedFeaturedCandidate(
  title: Pick<CatalogueTitle, 'id' | 'title'>,
  hints: readonly string[] = FEATURED_PREFERRED_HINTS,
) {
  if (isSkippedFeatured(title)) {
    return false;
  }
  return matchesFeaturedHint(title, hints);
}

/** Prefer pinned spotlight titles; fall back to another Zeus, then random. */
export function pickFeaturedTitle(
  titles: CatalogueTitle[],
  hints: readonly string[] = FEATURED_PREFERRED_HINTS,
): CatalogueTitle | null {
  const preferred = titles.find(
    title =>
      matchesFeaturedHint(title, hints) && !isSkippedFeatured(title),
  );
  if (preferred) {
    return preferred;
  }
  const otherZeus = titles.find(
    title => isZeusTitle(title) && !isSkippedFeatured(title),
  );
  if (otherZeus) {
    return otherZeus;
  }
  return pickRandomTitle(titles.filter(title => !isSkippedFeatured(title)));
}

export function shuffleTitles(titles: CatalogueTitle[]): CatalogueTitle[] {
  const next = [...titles];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const left = next[i];
    const right = next[j];
    if (left === undefined || right === undefined) {
      continue;
    }
    next[i] = right;
    next[j] = left;
  }
  return next;
}

export function isFeaturedSlot(
  title: Pick<CatalogueTitle, 'id'>,
  featuredId: string,
) {
  return title.id === featuredId;
}

export function isExcludedProvider(providerName: string | null | undefined) {
  const normalized = providerName?.trim().toLowerCase() ?? '';
  if (!normalized) {
    return false;
  }
  return EXCLUDED_PROVIDERS.some(
    blocked =>
      normalized === blocked ||
      normalized.includes(blocked) ||
      blocked.includes(normalized),
  );
}

export function isExcludedTitle(
  nameOrSlug: string | null | undefined,
): boolean {
  const normalized = nameOrSlug?.trim().toLowerCase().replace(/[-_]+/g, ' ') ?? '';
  if (!normalized) {
    return false;
  }
  return EXCLUDED_TITLES.some(
    blocked =>
      normalized === blocked ||
      normalized.includes(blocked) ||
      blocked.includes(normalized),
  );
}

export function isExcludedSlot(slot: Pick<SlotListItem, 'name' | 'slug' | 'provider'>) {
  return (
    isExcludedProvider(slot.provider?.name) ||
    isExcludedTitle(slot.name) ||
    isExcludedTitle(slot.slug)
  );
}

export function filterListedSlots(slots: SlotListItem[]): SlotListItem[] {
  return slots.filter(slot => !isExcludedSlot(slot));
}

export function mapSlotsToTitles(slots: SlotListItem[]): CatalogueTitle[] {
  return filterListedSlots(slots).map((slot, index) => {
    const category = formatCategory(slot.game_category);
    const mechanic = slot.mechanic ? slot.mechanic.replace(/_/g, ' ') : null;
    return {
      id: slot.slug,
      title: slot.name,
      category,
      studio: slot.provider?.name,
      rating: ratingFromRtp(slot.rtp_default),
      interest: interestFromSlot(slot),
      rank: index + 1,
      art: artForSlot(slot, index),
      popularity: popularityFromSlot(slot, index),
      badge: badgeForSlot(slot, index),
      tags: [category, mechanic].filter(Boolean) as string[],
      volatility: formatVolatility(slot.volatility),
      reels: '5 × 3',
      paylines: '25',
      theme: category,
      bonus: mechanic ?? 'Bonus feature',
      released: slot.release_date
        ? new Date(slot.release_date).toLocaleString('en-US', {
            month: 'short',
            year: 'numeric',
          })
        : undefined,
      ratingsCount: 180 + index * 37,
      description:
        'Game info for browsing and ratings only — there is no wagering, deposit or payout of any kind.',
    };
  });
}

export function pulseFromSlots(slots: SlotListItem[]): PulseStat[] {
  const rtpValues = slots
    .map(slot => Number.parseFloat(slot.rtp_default ?? ''))
    .filter(value => Number.isFinite(value));
  const avgRtp =
    rtpValues.length > 0
      ? rtpValues.reduce((sum, value) => sum + value, 0) / rtpValues.length
      : 0;
  const growing = slots.filter(slot => slot.trend === 'growing').length;

  return [
    {
      label: 'Avg RTP',
      value: avgRtp ? avgRtp.toFixed(2) : '—',
      delta: rtpValues.length ? `${rtpValues.length} titles` : 'Live feed',
    },
    {
      label: 'Games tracked',
      value: String(slots.length),
      delta: slots.length ? 'This pack' : 'Waiting',
    },
    {
      label: 'Growing',
      value: String(growing),
      delta: growing ? 'Demand up' : 'Stable set',
    },
  ];
}

const PHARAOH_COPY =
  'A hieroglyph-lit adventure title with cascading reels and an expanding-symbol bonus round. Info and ratings only — there is no wagering, deposit or payout of any kind.';

export const featuredTitle: CatalogueTitle = {
  id: 'neon-fortune-x',
  title: 'Neon Fortune X',
  category: 'Cyberpunk',
  studio: 'Nexus',
  rating: 4.8,
  interest: '96.80% RTP',
  rank: 1,
  art: packArt.neonFortune,
  popularity: 99,
  badge: '#1 TOP',
  tags: ['Cyberpunk', '5×3'],
  volatility: 'High',
  reels: '5 × 3',
  paylines: '20',
  theme: 'Neon city',
  bonus: 'Free spins',
  released: 'Jan 2026',
  ratingsCount: 2140,
  description:
    'Game info for browsing and ratings only — there is no wagering, deposit or payout of any kind.',
};

export const pulseStats: PulseStat[] = [
  {label: 'Avg rating', value: '4.42', delta: '+0.06'},
  {label: 'Games tracked', value: '1,240', delta: '+48'},
  {label: 'Your saves', value: '36', delta: '+4'},
];

export const popularTitles: CatalogueTitle[] = [
  {
    id: 'neon-fortune-x',
    title: 'Neon Fortune X',
    category: 'Cyberpunk',
    studio: 'Nexus',
    rating: 4.8,
    rank: 1,
    art: packArt.neonFortune,
    popularity: 92,
    badge: '#1 TOP',
    tags: ['Cyberpunk', '5×3'],
    volatility: 'High',
    reels: '5 × 3',
    paylines: '20',
    theme: 'Neon city',
    bonus: 'Free spins',
    released: 'Jan 2026',
    ratingsCount: 2140,
    description: featuredTitle.description,
  },
  {
    id: 'golden-pharaoh',
    title: 'Solar Pharaoh',
    category: 'Adventure',
    studio: 'Vortex',
    rating: 4.6,
    rank: 2,
    art: packArt.solarPharaoh,
    popularity: 88,
    badge: 'TOP 3 THIS WEEK',
    tags: ['Adventure', 'Cascade'],
    volatility: 'Medium-high',
    reels: '5 × 3',
    paylines: '25',
    theme: 'Ancient Egypt',
    bonus: 'Expanding symbols',
    released: 'Mar 2026',
    ratingsCount: 1842,
    description: PHARAOH_COPY,
  },
  {
    id: 'cyber-reels-88',
    title: 'Cyber Reels 88',
    category: 'Cyberpunk',
    studio: 'LumenPlay',
    rating: 4.5,
    rank: 3,
    art: packArt.cyberReels,
    popularity: 81,
    badge: 'TRENDING',
    tags: ['Cyberpunk', 'Bonus'],
    volatility: 'Medium',
    reels: '5 × 3',
    paylines: '15',
    theme: 'Cyberpunk',
    bonus: 'Bonus round',
    released: 'Feb 2026',
    ratingsCount: 960,
    description:
      'A cyberpunk title with stacked wilds. Info and ratings only — no wagering, deposit or payout.',
  },
  {
    id: 'aztec-vault',
    title: 'Aztec Temple',
    category: 'Adventure',
    studio: 'Astra',
    rating: 4.7,
    rank: 4,
    art: packArt.aztecTemple,
    popularity: 76,
    badge: 'STAFF PICK',
    tags: ['Adventure', 'Free spins'],
    volatility: 'High',
    reels: '5 × 4',
    paylines: '30',
    theme: 'Aztec',
    bonus: 'Free spins',
    released: 'Dec 2025',
    ratingsCount: 1288,
    description:
      'A jungle-temple title with expanding wilds. Entertainment info only — no cash prizes.',
  },
  {
    id: 'diamond-rush',
    title: 'Diamond Rush',
    category: 'Classic',
    studio: 'Nexus',
    rating: 4.4,
    rank: 5,
    art: packArt.diamondRush,
    popularity: 69,
    badge: 'NEW',
    tags: ['Classic', '5×3'],
    volatility: 'Low',
    reels: '5 × 3',
    paylines: '10',
    theme: 'Gems',
    bonus: 'Scatter pays',
    released: 'Apr 2026',
    ratingsCount: 540,
    description:
      'A classic gem title with scatter pays. Browse and rate only — no wagering.',
  },
];
