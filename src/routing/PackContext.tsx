import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  fetchPublicSlots,
  fetchSlotBySlug,
  fetchSlotsByUrl,
} from '../api/packClient';
import {
  CATALOGUE_LIMIT,
  CATALOGUE_PAGE_SIZE,
  FEATURED_PREFERRED_HINTS,
  FEATURED_PREFERRED_SLUGS,
} from '../constants/api';
import {
  featuredTitle,
  filterListedSlots,
  isExcludedSlot,
  mapSlotDetailToTitle,
  mapSlotsToTitles,
  isPinnedFeaturedCandidate,
  pickFeaturedTitle,
  popularTitles,
  pulseFromSlots,
  pulseStats,
  shuffleTitles,
  type CatalogueTitle,
  type PulseStat,
} from '../data/pack';

type PackContextValue = {
  featured: CatalogueTitle;
  popular: CatalogueTitle[];
  titles: CatalogueTitle[];
  stats: PulseStat[];
  ready: boolean;
  loadingMore: boolean;
  error: string | null;
  refresh: () => void;
};

const PackContext = createContext<PackContextValue | null>(null);

const FALLBACK: Omit<PackContextValue, 'refresh'> = {
  featured: featuredTitle,
  popular: popularTitles.filter(title => title.id !== featuredTitle.id),
  titles: [
    featuredTitle,
    ...popularTitles.filter(title => title.id !== featuredTitle.id),
  ],
  stats: pulseStats,
  ready: true,
  loadingMore: false,
  error: null,
};

function mergeTitles(current: CatalogueTitle[], incoming: CatalogueTitle[]) {
  if (incoming.length === 0) {
    return current;
  }
  const seen = new Set(current.map(title => title.id));
  const extra = incoming.filter(title => !seen.has(title.id));
  if (extra.length === 0) {
    return current;
  }
  return [...current, ...extra].slice(0, CATALOGUE_LIMIT);
}

export function PackProvider({children}: {children: React.ReactNode}) {
  const [featured, setFeatured] = useState(featuredTitle);
  const [popular, setPopular] = useState(popularTitles);
  const [titles, setTitles] = useState<CatalogueTitle[]>(FALLBACK.titles);
  const [stats, setStats] = useState(pulseStats);
  const [ready, setReady] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setReady(false);
    setLoadingMore(false);
    setError(null);
    setTick(current => current + 1);
  }, []);

  useEffect(() => {
    let alive = true;

    async function load() {
      let mapped: CatalogueTitle[] = [];
      let nextUrl: string | null = null;
      let featuredMapped: CatalogueTitle | null = null;

      try {
        const slotsPage = await fetchPublicSlots(CATALOGUE_PAGE_SIZE);
        if (!alive) {
          return;
        }

        mapped = shuffleTitles(mapSlotsToTitles(slotsPage.results));
        for (const slug of FEATURED_PREFERRED_SLUGS) {
          const preferredPage = await fetchSlotBySlug(slug).catch(() => null);
          if (!alive) {
            return;
          }
          if (preferredPage && !isExcludedSlot(preferredPage.data)) {
            featuredMapped = mapSlotDetailToTitle(preferredPage);
            break;
          }
        }

        if (!featuredMapped) {
          const picked = pickFeaturedTitle(mapped, FEATURED_PREFERRED_HINTS);
          const featuredPage = picked
            ? await fetchSlotBySlug(picked.id).catch(() => null)
            : null;
          if (!alive) {
            return;
          }
          featuredMapped =
            featuredPage && !isExcludedSlot(featuredPage.data)
              ? mapSlotDetailToTitle(featuredPage)
              : picked;
        }
        if (featuredMapped) {
          mapped = mergeTitles(mapped, [featuredMapped]);
          mapped = shuffleTitles(mapped);
          setFeatured(featuredMapped);
          setPopular(
            shuffleTitles(
              mapped.filter(title => title.id !== featuredMapped.id),
            ).slice(0, 8),
          );
        } else if (mapped.length > 0) {
          setFeatured(mapped[0]);
          setPopular(mapped.slice(1, 9));
        }
        if (mapped.length > 0) {
          setTitles(mapped);
          setStats(pulseFromSlots(filterListedSlots(slotsPage.results)));
        }

        nextUrl = slotsPage.next;
        setError(null);
        setReady(true);
      } catch {
        if (!alive) {
          return;
        }
        setError('Could not load live games');
        setReady(true);
        return;
      }

      try {
        // Keep paging past excluded providers until the list limit is filled.
        let emptyPages = 0;
        let spotlightPinned =
          !!featuredMapped && isPinnedFeaturedCandidate(featuredMapped);
        while (alive && nextUrl && mapped.length < CATALOGUE_LIMIT) {
          setLoadingMore(true);
          const nextPage = await fetchSlotsByUrl(nextUrl);
          if (!alive) {
            return;
          }
          const before = mapped.length;
          mapped = mergeTitles(
            mapped,
            shuffleTitles(mapSlotsToTitles(nextPage.results)),
          );
          setTitles(mapped);

          if (!spotlightPinned) {
            const delayed = pickFeaturedTitle(
              mapped,
              FEATURED_PREFERRED_HINTS,
            );
            if (delayed && isPinnedFeaturedCandidate(delayed)) {
              const detail = await fetchSlotBySlug(delayed.id).catch(
                () => null,
              );
              if (!alive) {
                return;
              }
              const promoted =
                detail && !isExcludedSlot(detail.data)
                  ? mapSlotDetailToTitle(detail)
                  : delayed;
              featuredMapped = promoted;
              spotlightPinned = true;
              setFeatured(promoted);
              setPopular(
                shuffleTitles(
                  mapped.filter(title => title.id !== promoted.id),
                ).slice(0, 8),
              );
            }
          }

          emptyPages = mapped.length > before ? 0 : emptyPages + 1;
          nextUrl =
            mapped.length < CATALOGUE_LIMIT &&
            nextPage.results.length > 0 &&
            emptyPages < 8
              ? nextPage.next
              : null;
        }
      } catch {
        // Keep the first page if later batches fail.
      } finally {
        if (alive) {
          setLoadingMore(false);
        }
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [tick]);

  const value = useMemo(
    () => ({
      featured,
      popular,
      titles,
      stats,
      ready,
      loadingMore,
      error,
      refresh,
    }),
    [
      error,
      featured,
      loadingMore,
      popular,
      ready,
      refresh,
      stats,
      titles,
    ],
  );

  return (
    <PackContext.Provider value={value}>
      {children}
    </PackContext.Provider>
  );
}

export function usePack() {
  const context = useContext(PackContext);
  if (!context) {
    throw new Error('usePack must be used within PackProvider');
  }
  return context;
}
