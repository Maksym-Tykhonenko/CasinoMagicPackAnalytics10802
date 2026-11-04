import {Share} from 'react-native';

import {APP_DISPLAY_NAME} from '../constants/brand';
import type {CatalogueTitle} from '../data/pack';

export async function sharePackTitle(title: CatalogueTitle) {
  const meta = [title.category, title.studio].filter(Boolean).join(' · ');
  const message = [`${title.title}`, meta, `Shared from ${APP_DISPLAY_NAME}`]
    .filter(Boolean)
    .join('\n');

  try {
    await Share.share({
      title: title.title,
      message,
    });
  } catch {
    // User dismissed the sheet or share is unavailable.
  }
}
