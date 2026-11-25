import type { ThemeMode } from '../../design-system/tokens/colors';
import type { BasemapId } from '../../state/types';

export interface MapPalette {
  ocean: string;
  grid: string;
  landmass: string;
  coastline: string;
  vietnam: string;
  vietnamBorder: string;
  lpStrong: string;
  lpWarm: string;
  cloudFill: string;
  cloudStroke: string;
  cloudCore: string;
  cityLabel: string;
}

export function getMapPalette(mode: ThemeMode, basemap: BasemapId): MapPalette {
  if (mode === 'red') {
    return {
      ocean: '#090101',
      grid: 'rgba(239, 68, 68, 0.12)',
      landmass: '#160304',
      coastline: 'rgba(239, 68, 68, 0.35)',
      vietnam: '#230506',
      vietnamBorder: 'rgba(244, 63, 94, 0.55)',
      lpStrong: '#EF4444',
      lpWarm: '#F87171',
      cloudFill: 'rgba(248, 113, 113, 0.14)',
      cloudStroke: 'rgba(248, 113, 113, 0.28)',
      cloudCore: 'rgba(248, 113, 113, 0.20)',
      cityLabel: '#DE4646',
    };
  }
  if (mode === 'light') {
    return {
      ocean: basemap === 'astroDark' ? '#1E293B' : '#CBE0F5',
      grid: 'rgba(15, 23, 42, 0.08)',
      landmass: basemap === 'astroDark' ? '#273549' : '#DFE8D5',
      coastline: 'rgba(100, 116, 139, 0.45)',
      vietnam: basemap === 'astroDark' ? '#2B3E50' : '#CFE0C3',
      vietnamBorder: '#0284C7',
      lpStrong: '#F59E0B',
      lpWarm: '#EA580C',
      cloudFill: 'rgba(255, 255, 255, 0.72)',
      cloudStroke: 'rgba(148, 163, 184, 0.55)',
      cloudCore: 'rgba(241, 245, 249, 0.90)',
      cityLabel: '#334155',
    };
  }
  return {
    ocean: basemap === 'esriDark' ? '#0B0F17' : basemap === 'astroDark' ? '#040814' : '#061529',
    grid: 'rgba(56, 189, 248, 0.08)',
    landmass: basemap === 'esriDark' ? '#141B29' : '#0D262B',
    coastline: 'rgba(56, 189, 248, 0.24)',
    vietnam: basemap === 'topo' ? '#14332C' : '#102C2A',
    vietnamBorder: 'rgba(16, 185, 129, 0.45)',
    lpStrong: '#F97316',
    lpWarm: '#FBBF24',
    cloudFill: 'rgba(226, 232, 240, 0.14)',
    cloudStroke: 'rgba(148, 163, 184, 0.24)',
    cloudCore: 'rgba(16, 185, 129, 0.16)',
    cityLabel: '#9BAAC0',
  };
}

export function projectSpotToMap(lat: number, lng: number): { x: number; y: number } {
  const latNorm = Math.max(0, Math.min(1, (23.5 - lat) / (23.5 - 8.5)));
  const lngNorm = Math.max(0, Math.min(1, (lng - 102.2) / (109.5 - 102.2)));
  const y = 48 + latNorm * 365;
  const x = 165 + lngNorm * 185;
  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  };
}
