import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {accountIdForEmail, GUEST_ACCOUNT_ID, libraryStorageKey} from './accountStorage';
import {useAuth} from './AuthContext';

export type TitleRating = {
  stars: number;
  tags: string[];
  review: string;
  ratedAt?: number;
};

type LibrarySnapshot = {
  savedIds: string[];
  savedAt: Record<string, number>;
  ratings: Record<string, TitleRating>;
  recentSearches: string[];
};

type LibraryContextValue = {
  savedIds: string[];
  savedAt: Record<string, number>;
  ratedIds: string[];
  ratings: Record<string, TitleRating>;
  recentSearches: string[];
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  rateTitle: (id: string, rating: TitleRating) => void;
  pushRecent: (query: string) => void;
  removeRecent: (query: string) => void;
};

const EMPTY_SNAPSHOT: LibrarySnapshot = {
  savedIds: [],
  savedAt: {},
  ratings: {},
  recentSearches: [],
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

function parseSnapshot(raw: string): LibrarySnapshot | null {
  try {
    const parsed = JSON.parse(raw) as Partial<LibrarySnapshot>;
    const savedIds = Array.isArray(parsed.savedIds)
      ? parsed.savedIds.filter(id => typeof id === 'string')
      : [];
    const savedAt: Record<string, number> =
      parsed.savedAt && typeof parsed.savedAt === 'object' ? parsed.savedAt : {};
    const now = Date.now();
    savedIds.forEach(id => {
      if (typeof savedAt[id] !== 'number' || !Number.isFinite(savedAt[id])) {
        savedAt[id] = now;
      }
    });
    return {
      savedIds,
      savedAt,
      ratings:
        parsed.ratings && typeof parsed.ratings === 'object'
          ? parsed.ratings
          : {},
      recentSearches: Array.isArray(parsed.recentSearches)
        ? parsed.recentSearches.filter(item => typeof item === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

function applySnapshot(
  snapshot: LibrarySnapshot,
  setters: {
    setSavedIds: (value: string[]) => void;
    setSavedAt: (value: Record<string, number>) => void;
    setRatings: (value: Record<string, TitleRating>) => void;
    setRecentSearches: (value: string[]) => void;
  },
) {
  setters.setSavedIds(snapshot.savedIds);
  setters.setSavedAt(snapshot.savedAt);
  setters.setRatings(snapshot.ratings);
  setters.setRecentSearches(snapshot.recentSearches);
}

export function LibraryProvider({children}: {children: React.ReactNode}) {
  const {sessionEmail} = useAuth();
  const storageKey = libraryStorageKey(accountIdForEmail(sessionEmail));
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedAt, setSavedAt] = useState<Record<string, number>>({});
  const [ratings, setRatings] = useState<Record<string, TitleRating>>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const hydratedKey = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    hydratedKey.current = null;
    setReady(false);
    applySnapshot(EMPTY_SNAPSHOT, {
      setSavedIds,
      setSavedAt,
      setRatings,
      setRecentSearches,
    });

    AsyncStorage.getItem(storageKey)
      .then(async raw => {
        if (!alive) {
          return;
        }
        let payload = raw;
        if (
          !payload &&
          accountIdForEmail(sessionEmail) === GUEST_ACCOUNT_ID
        ) {
          payload = await AsyncStorage.getItem('pack-magg.library.v1');
          if (payload) {
            await AsyncStorage.setItem(storageKey, payload);
          }
        }
        if (!alive) {
          return;
        }
        const snapshot = payload ? parseSnapshot(payload) : EMPTY_SNAPSHOT;
        applySnapshot(snapshot ?? EMPTY_SNAPSHOT, {
          setSavedIds,
          setSavedAt,
          setRatings,
          setRecentSearches,
        });
      })
      .finally(() => {
        if (!alive) {
          return;
        }
        hydratedKey.current = storageKey;
        setReady(true);
      });

    return () => {
      alive = false;
    };
  }, [sessionEmail, storageKey]);

  useEffect(() => {
    if (hydratedKey.current !== storageKey || !ready) {
      return;
    }
    const snapshot: LibrarySnapshot = {
      savedIds,
      savedAt,
      ratings,
      recentSearches,
    };
    AsyncStorage.setItem(storageKey, JSON.stringify(snapshot)).catch(() => {});
  }, [ratings, ready, recentSearches, savedAt, savedIds, storageKey]);

  const isSaved = useCallback(
    (id: string) => savedIds.includes(id),
    [savedIds],
  );

  const toggleSaved = useCallback((id: string) => {
    setSavedIds(current => {
      const exists = current.includes(id);
      setSavedAt(times => {
        if (exists) {
          const next = {...times};
          delete next[id];
          return next;
        }
        return {...times, [id]: Date.now()};
      });
      return exists ? current.filter(item => item !== id) : [id, ...current];
    });
  }, []);

  const rateTitle = useCallback((id: string, rating: TitleRating) => {
    setRatings(current => ({
      ...current,
      [id]: {
        ...rating,
        ratedAt: rating.ratedAt ?? Date.now(),
      },
    }));
  }, []);

  const pushRecent = useCallback((query: string) => {
    const next = query.trim();
    if (!next) {
      return;
    }
    setRecentSearches(current =>
      [next, ...current.filter(item => item !== next)].slice(0, 8),
    );
  }, []);

  const removeRecent = useCallback((query: string) => {
    setRecentSearches(current => current.filter(item => item !== query));
  }, []);

  const ratedIds = useMemo(() => Object.keys(ratings), [ratings]);

  const value = useMemo(
    () => ({
      savedIds,
      savedAt,
      ratedIds,
      ratings,
      recentSearches,
      isSaved,
      toggleSaved,
      rateTitle,
      pushRecent,
      removeRecent,
    }),
    [
      isSaved,
      pushRecent,
      ratedIds,
      ratings,
      recentSearches,
      removeRecent,
      savedAt,
      savedIds,
      toggleSaved,
      rateTitle,
    ],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return context;
}
