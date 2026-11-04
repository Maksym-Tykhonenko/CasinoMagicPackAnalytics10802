import AsyncStorage from '@react-native-async-storage/async-storage';

export type BootProgress = {
  consentDone: boolean;
  onboardingDone: boolean;
  welcomeDone: boolean;
};

const BOOT_KEY = 'pack-magg.boot.v1';
const SESSION_KEY = 'pack-magg.session.v1';

const DEFAULT_PROGRESS: BootProgress = {
  consentDone: false,
  onboardingDone: false,
  welcomeDone: false,
};

export async function readBootProgress(): Promise<BootProgress> {
  try {
    const raw = await AsyncStorage.getItem(BOOT_KEY);
    if (!raw) {
      return {...DEFAULT_PROGRESS};
    }
    const parsed = JSON.parse(raw) as Partial<BootProgress>;
    return {
      consentDone: Boolean(parsed.consentDone),
      onboardingDone: Boolean(parsed.onboardingDone),
      welcomeDone: Boolean(parsed.welcomeDone),
    };
  } catch {
    return {...DEFAULT_PROGRESS};
  }
}

export async function writeBootProgress(
  patch: Partial<BootProgress>,
): Promise<BootProgress> {
  const current = await readBootProgress();
  const next: BootProgress = {
    consentDone: patch.consentDone ?? current.consentDone,
    onboardingDone: patch.onboardingDone ?? current.onboardingDone,
    welcomeDone: patch.welcomeDone ?? current.welcomeDone,
  };
  await AsyncStorage.setItem(BOOT_KEY, JSON.stringify(next));
  return next;
}

export async function readSessionEmail(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    const email = raw.trim().toLowerCase();
    return email.includes('@') ? email : null;
  } catch {
    return null;
  }
}

export async function writeSessionEmail(email: string | null): Promise<void> {
  if (!email) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(SESSION_KEY, email.trim().toLowerCase());
}

export function nextPhaseAfterLoader(progress: BootProgress) {
  if (!progress.consentDone) {
    return 'Gate' as const;
  }
  if (!progress.onboardingDone) {
    return 'Onboarding' as const;
  }
  if (!progress.welcomeDone) {
    return 'Auth' as const;
  }
  return 'Main' as const;
}
