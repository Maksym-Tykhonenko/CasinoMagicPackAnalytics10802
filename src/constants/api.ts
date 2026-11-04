export const PACK_API_BASE_URL = 'https://i-gaming.tools/api/v1';

export const PACK_API_TOKEN =
  '657dc7fd9b187e7eb50b5e81ecd5201fb977058bb70ed53074c13156bc8622a2';

export const CATALOGUE_PAGE_SIZE = 40;
export const CATALOGUE_LIMIT = 500;

/** Providers excluded from the listed pack. */
export const EXCLUDED_PROVIDERS = [
  'pocket games soft',
  'bgaming',
  'turbo games',
] as const;

/** Title names / slugs excluded from the listed pack. */
export const EXCLUDED_TITLES = [
  'chicken road',
  'sweet bonanza',
  'sweet rush bonanza',
] as const;

/** Prefer these for Home SPOTLIGHT (slug first, then title/id hint). */
export const FEATURED_PREFERRED_SLUGS = [
  'zeus-vs-hades-gods-of-war',
  'zeus-vs-hades-gods-of-war-250',
  'zeus-vs-hades',
] as const;
export const FEATURED_PREFERRED_HINTS = [
  'zeus vs hades gods of war',
  'zeus vs hades',
] as const;
/** Bad covers for SPOTLIGHT — skip these Zeus variants. */
export const FEATURED_SKIP_HINTS = [
  'zeus x machina',
  'zeus-x-machina',
  'power of zeus',
  'might of zeus',
  'book of zeus',
] as const;
