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

import {accountIdForEmail, GUEST_ACCOUNT_ID, profileStorageKey} from './accountStorage';
import {useAuth} from './AuthContext';

export type GuestProfile = {
  displayName: string;
  email: string;
  photoUri: string | null;
  nameSetByUser?: boolean;
};

type AccountContextValue = {
  profile: GuestProfile;
  updateProfile: (next: GuestProfile) => Promise<void>;
};

export const DEFAULT_PROFILE: GuestProfile = {
  displayName: 'Guest',
  email: '',
  photoUri: null,
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'G';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function emptyProfile(sessionEmail: string | null): GuestProfile {
  return {
    displayName: DEFAULT_PROFILE.displayName,
    email: sessionEmail ?? '',
    photoUri: null,
    nameSetByUser: false,
  };
}

function parseProfile(
  raw: string,
  sessionEmail: string | null,
): GuestProfile | null {
  try {
    const parsed = JSON.parse(raw) as Partial<GuestProfile>;
    const email =
      typeof parsed.email === 'string' && parsed.email.trim()
        ? parsed.email
        : sessionEmail ?? '';
    const nameSetByUser = parsed.nameSetByUser === true;
    const storedName =
      typeof parsed.displayName === 'string' && parsed.displayName.trim()
        ? parsed.displayName.trim()
        : DEFAULT_PROFILE.displayName;
    return {
      displayName: nameSetByUser ? storedName : DEFAULT_PROFILE.displayName,
      email,
      photoUri:
        typeof parsed.photoUri === 'string' && parsed.photoUri
          ? parsed.photoUri
          : null,
      nameSetByUser,
    };
  } catch {
    return null;
  }
}

export function AccountProvider({children}: {children: React.ReactNode}) {
  const {sessionEmail} = useAuth();
  const storageKey = profileStorageKey(accountIdForEmail(sessionEmail));
  const [profile, setProfile] = useState<GuestProfile>(() =>
    emptyProfile(sessionEmail),
  );
  const hydratedKey = useRef<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const key = storageKey;
    hydratedKey.current = null;
    setReady(false);

    AsyncStorage.getItem(key)
      .then(raw => {
        if (!alive) {
          return;
        }
        const next = raw
          ? parseProfile(raw, sessionEmail)
          : emptyProfile(sessionEmail);
        if (next) {
          setProfile(next);
        }
      })
      .finally(() => {
        if (!alive) {
          return;
        }
        hydratedKey.current = key;
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
    AsyncStorage.setItem(storageKey, JSON.stringify(profile)).catch(() => {});
  }, [profile, ready, storageKey]);

  const updateProfile = useCallback(
    async (next: GuestProfile) => {
      const email = next.email.trim() || sessionEmail || '';
      const accountId = sessionEmail
        ? accountIdForEmail(email || sessionEmail)
        : GUEST_ACCOUNT_ID;
      const key = profileStorageKey(accountId);
      const nextProfile: GuestProfile = {
        displayName: next.displayName.trim() || DEFAULT_PROFILE.displayName,
        email,
        photoUri: next.photoUri,
        nameSetByUser: true,
      };
      setProfile(nextProfile);
      await AsyncStorage.setItem(key, JSON.stringify(nextProfile));
    },
    [sessionEmail],
  );

  const value = useMemo(
    () => ({profile, updateProfile}),
    [profile, updateProfile],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return context;
}
