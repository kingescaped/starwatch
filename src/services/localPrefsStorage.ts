import type { CameraGearProfile } from '../data/cameraCatalog';
import type { ThemeMode } from '../design-system/tokens/colors';
import type { AppSettings, BasemapId, Spot } from '../state/types';

export interface StoredLocalPrefs {
  themeMode?: ThemeMode;
  selectedSpotId?: string;
  favoriteOverrides?: Record<string, boolean>;
  recentSpots?: Spot[];
  basemap?: BasemapId;
  settings?: Partial<AppSettings>;
  cameraGear?: CameraGearProfile;
}

const PREFS_STORAGE_KEY = 'starwatch_prefs_v1';
const MAX_RECENT_SPOTS = 8;

function getWebStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isDynamicSpotId(spotId: string): boolean {
  return spotId === 'gps-current' || spotId.startsWith('search-');
}

export function readLocalPrefs(): StoredLocalPrefs {
  const storage = getWebStorage();
  if (!storage) return {};
  try {
    const raw = storage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredLocalPrefs;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function patchLocalPrefs(patch: Partial<StoredLocalPrefs>): void {
  const storage = getWebStorage();
  if (!storage) return;
  try {
    const prev = readLocalPrefs();
    const next: StoredLocalPrefs = {
      ...prev,
      ...patch,
      recentSpots: (patch.recentSpots ?? prev.recentSpots ?? [])
        .filter((s) => isDynamicSpotId(s.id))
        .slice(0, MAX_RECENT_SPOTS),
    };
    storage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage quota or private mode restrictions
  }
}

export function buildFavoriteOverrides(spots: Spot[]): Record<string, boolean> {
  const overrides: Record<string, boolean> = {};
  for (const s of spots) {
    if (s.isFavorite) overrides[s.id] = true;
    else overrides[s.id] = false;
  }
  return overrides;
}

/**
 * Keep locally created GPS / searched spots and favorite toggles when server spots arrive.
 */
export function mergeFetchedSpots(
  fetchedSpots: Spot[],
  currentSpots: Spot[],
  favoriteOverrides: Record<string, boolean> = {}
): Spot[] {
  const applyFav = (spot: Spot): Spot =>
    typeof favoriteOverrides[spot.id] === 'boolean'
      ? { ...spot, isFavorite: favoriteOverrides[spot.id] }
      : spot;

  const baseList = fetchedSpots.map(applyFav);
  const existingIds = new Set(baseList.map((s) => s.id));
  const dynamic = currentSpots.filter((s) => isDynamicSpotId(s.id) && !existingIds.has(s.id)).map(applyFav);
  return [...dynamic, ...baseList];
}
