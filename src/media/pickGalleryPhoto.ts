import {launchImageLibrary} from 'react-native-image-picker';

export async function pickGalleryPhoto(): Promise<string | null> {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (result.didCancel || result.errorCode) {
      return null;
    }

    return result.assets?.[0]?.uri ?? null;
  } catch {
    return null;
  }
}
