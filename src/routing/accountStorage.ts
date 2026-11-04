import AsyncStorage from '@react-native-async-storage/async-storage';

export const GUEST_ACCOUNT_ID = 'guest';

export function accountIdForEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase() ?? '';
  return normalized || GUEST_ACCOUNT_ID;
}

export function libraryStorageKey(accountId: string) {
  return `pack-magg.library.v2.${accountId}`;
}

export function profileStorageKey(accountId: string) {
  return `pack-magg.profile.v2.${accountId}`;
}

export async function moveLibraryStore(fromId: string, toId: string) {
  if (fromId === toId) {
    return;
  }
  const fromLibrary = libraryStorageKey(fromId);
  const library = await AsyncStorage.getItem(fromLibrary);
  if (library) {
    await AsyncStorage.setItem(libraryStorageKey(toId), library);
  }
  await AsyncStorage.removeItem(fromLibrary);
}
