import {PACK_API_BASE_URL, PACK_API_TOKEN} from '../constants/api';

export type SlotProvider = {
  slug: string;
  name: string;
};

export type SlotThumbnail = {
  url: string;
  key: string;
  version: string;
};

export type SlotListItem = {
  slug: string;
  name: string;
  provider: SlotProvider | null;
  game_category: string | null;
  rtp_default: string | null;
  volatility: string | null;
  mechanic: string | null;
  thumbnail_url: string | null;
  thumbnail: SlotThumbnail | null;
  volume_12m: number | null;
  trend: string | null;
  release_date: string | null;
};

type Paginated<T> = {
  next: string | null;
  previous: string | null;
  count?: number;
  results: T[];
};

async function readPackApi<T>(pathOrUrl: string): Promise<T> {
  const url = pathOrUrl.startsWith('http')
    ? pathOrUrl
    : `${PACK_API_BASE_URL}${pathOrUrl}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Token ${PACK_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Pack request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export type SlotDetail = {
  data: SlotListItem & {
    reels?: number | null;
    rows?: number | null;
  };
  assets: {
    logo_url?: string | null;
  };
};

function stripListItem(raw: Record<string, unknown>): SlotListItem {
  return {
    slug: String(raw.slug ?? ''),
    name: String(raw.name ?? ''),
    provider: (raw.provider as SlotProvider | null) ?? null,
    game_category: (raw.game_category as string | null) ?? null,
    rtp_default: (raw.rtp_default as string | null) ?? null,
    volatility: (raw.volatility as string | null) ?? null,
    mechanic: (raw.mechanic as string | null) ?? null,
    thumbnail_url: (raw.thumbnail_url as string | null) ?? null,
    thumbnail: (raw.thumbnail as SlotThumbnail | null) ?? null,
    volume_12m: (raw.volume_12m as number | null) ?? null,
    trend: (raw.trend as string | null) ?? null,
    release_date: (raw.release_date as string | null) ?? null,
  };
}

function stripDetail(raw: Record<string, unknown>): SlotDetail {
  const dataRaw = (raw.data as Record<string, unknown> | undefined) ?? raw;
  const assetsRaw = (raw.assets as Record<string, unknown> | undefined) ?? {};

  return {
    data: {
      ...stripListItem(dataRaw),
      reels: (dataRaw.reels as number | null | undefined) ?? null,
      rows: (dataRaw.rows as number | null | undefined) ?? null,
    },
    assets: {
      // Only keep logo artwork — skip gameplay screenshots (UI overlays, autoplay, etc.).
      logo_url: (assetsRaw.logo_url as string | null) ?? null,
    },
  };
}

export async function fetchPublicSlots(pageSize = 40) {
  const query = `page_size=${pageSize}&ordering=-captured_at`;
  const page = await readPackApi<Paginated<Record<string, unknown>>>(
    `/slots/?${query}`,
  );
  return {
    ...page,
    results: page.results.map(stripListItem),
  };
}

export async function fetchSlotBySlug(slug: string) {
  const raw = await readPackApi<Record<string, unknown>>(
    `/slots/${encodeURIComponent(slug)}/`,
  );
  return stripDetail(raw);
}

export async function fetchSlotsByUrl(url: string) {
  const page = await readPackApi<Paginated<Record<string, unknown>>>(url);
  return {
    ...page,
    results: page.results.map(stripListItem),
  };
}
