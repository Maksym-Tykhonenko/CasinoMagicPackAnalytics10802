import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  accountIdForEmail,
  libraryStorageKey,
  moveLibraryStore,
  profileStorageKey,
} from './accountStorage';
import {readSessionEmail, writeSessionEmail} from './bootStorage';

export type AuthAccount = {
  email: string;
  password: string;
  displayName: string;
};

export type AuthFailure =
  | 'invalid-email'
  | 'weak-password'
  | 'missing'
  | 'mismatch';

type AuthResult = {ok: true} | {ok: false; reason: AuthFailure};

type AuthSnapshot = {
  accounts: AuthAccount[];
};

type AuthContextValue = {
  ready: boolean;
  hasAccount: boolean;
  sessionEmail: string | null;
  register: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  enterGuest: () => void;
  updateAccount: (input: {
    fromEmail?: string;
    email: string;
    displayName?: string;
  }) => Promise<AuthResult>;
  deleteAccount: () => Promise<void>;
};

const STORAGE_KEY = 'pack-magg.auth.v1';
const MIN_PASSWORD = 3;

const AuthContext = createContext<AuthContextValue | null>(null);

let memoryAccounts: AuthAccount[] | null = null;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function hasEmailAt(value: string) {
  return value.includes('@');
}

export function displayNameFromEmail(email: string) {
  const local = email.split('@')[0] ?? 'Player';
  const name = local
    .split(/[._-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  return name || 'Player';
}

function parseSnapshot(raw: string): AuthSnapshot | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AuthSnapshot>;
    const accounts = Array.isArray(parsed.accounts)
      ? parsed.accounts.filter(
          (account): account is AuthAccount =>
            Boolean(
              account &&
                typeof account.email === 'string' &&
                typeof account.password === 'string' &&
                typeof account.displayName === 'string',
            ),
        )
      : [];
    return {accounts};
  } catch {
    return null;
  }
}

async function readAccounts(): Promise<AuthAccount[]> {
  if (memoryAccounts) {
    return memoryAccounts;
  }
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const snapshot = raw ? parseSnapshot(raw) : null;
  memoryAccounts = snapshot?.accounts ?? [];
  return memoryAccounts;
}

async function writeAccounts(next: AuthAccount[]) {
  memoryAccounts = next;
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({accounts: next} satisfies AuthSnapshot),
  );
}

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [accounts, setAccounts] = useState<AuthAccount[]>(
    () => memoryAccounts ?? [],
  );
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(memoryAccounts !== null);

  useEffect(() => {
    let alive = true;
    Promise.all([readAccounts(), readSessionEmail()])
      .then(([nextAccounts, savedEmail]) => {
        if (!alive) {
          return;
        }
        setAccounts(nextAccounts);
        if (
          savedEmail &&
          nextAccounts.some(account => account.email === savedEmail)
        ) {
          setSessionEmail(savedEmail);
        }
      })
      .finally(() => {
        if (alive) {
          setReady(true);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const register = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalized = normalizeEmail(email);
      if (!hasEmailAt(normalized)) {
        return {ok: false, reason: 'invalid-email'};
      }
      if (password.length < MIN_PASSWORD) {
        return {ok: false, reason: 'weak-password'};
      }
      const current = await readAccounts();
      const existing = current.find(account => account.email === normalized);
      const account: AuthAccount = {
        email: normalized,
        password,
        displayName:
          existing?.displayName &&
          existing.displayName !== displayNameFromEmail(existing.email)
            ? existing.displayName
            : 'Guest',
      };
      const next = existing
        ? current.map(item => (item.email === normalized ? account : item))
        : [...current, account];
      await writeAccounts(next);
      setAccounts(next);
      setSessionEmail(normalized);
      await writeSessionEmail(normalized);
      return {ok: true};
    },
    [],
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const normalized = normalizeEmail(email);
      if (!hasEmailAt(normalized) || password.length < 1) {
        return {ok: false, reason: 'missing'};
      }
      const current = await readAccounts();
      const account = current.find(item => item.email === normalized);
      if (!account || account.password !== password) {
        return {ok: false, reason: 'mismatch'};
      }
      setSessionEmail(account.email);
      await writeSessionEmail(account.email);
      return {ok: true};
    },
    [],
  );

  const enterGuest = useCallback(() => {
    setSessionEmail(null);
    writeSessionEmail(null).catch(() => {});
  }, []);

  const updateAccount = useCallback(
    async (input: {
      fromEmail?: string;
      email: string;
      displayName?: string;
    }): Promise<AuthResult> => {
      const normalized = normalizeEmail(input.email);
      if (!hasEmailAt(normalized)) {
        return {ok: false, reason: 'invalid-email'};
      }
      const current = await readAccounts();
      if (!current.length || !sessionEmail) {
        return {ok: true};
      }
      const previous = normalizeEmail(input.fromEmail || sessionEmail);
      const target =
        current.find(account => account.email === previous) ??
        current.find(account => account.email === sessionEmail) ??
        current[0];
      const clash = current.some(
        account =>
          account.email === normalized && account.email !== target.email,
      );
      if (clash) {
        return {ok: false, reason: 'mismatch'};
      }
      await moveLibraryStore(
        accountIdForEmail(target.email),
        accountIdForEmail(normalized),
      );
      const next = current.map(account =>
        account.email === target.email
          ? {
              ...account,
              email: normalized,
              displayName: input.displayName?.trim() || account.displayName,
            }
          : account,
      );
      await writeAccounts(next);
      setAccounts(next);
      setSessionEmail(normalized);
      await writeSessionEmail(normalized);
      return {ok: true};
    },
    [sessionEmail],
  );

  const deleteAccount = useCallback(async () => {
    const accountId = accountIdForEmail(sessionEmail);
    await AsyncStorage.removeItem(profileStorageKey(accountId));
    await AsyncStorage.removeItem(libraryStorageKey(accountId));
    if (sessionEmail) {
      const current = await readAccounts();
      const next = current.filter(account => account.email !== sessionEmail);
      await writeAccounts(next);
      setAccounts(next);
    }
    setSessionEmail(null);
    await writeSessionEmail(null);
  }, [sessionEmail]);

  const value = useMemo(
    () => ({
      ready,
      hasAccount: accounts.length > 0,
      sessionEmail,
      register,
      signIn,
      enterGuest,
      updateAccount,
      deleteAccount,
    }),
    [
      accounts.length,
      deleteAccount,
      enterGuest,
      ready,
      register,
      sessionEmail,
      signIn,
      updateAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
