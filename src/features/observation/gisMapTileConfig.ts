import type { BasemapId, LightDomeItem } from '../../state/types';

export interface TileLayerSpec {
  primaryUrl: string;
  overlayUrl?: string;
  attribution: string;
  maxZoom: number;
}

export const MAP_TILE_LAYERS: Record<BasemapId, TileLayerSpec> = {
  satellite: {
    primaryUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri World Imagery',
    maxZoom: 17,
  },
  astroDark: {
    primaryUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: 'Carto Dark Matter',
    maxZoom: 18,
  },
  esriDark: {
    primaryUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    overlayUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Esri Dark Canvas',
    maxZoom: 16,
  },
  topo: {
    primaryUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'OpenTopoMap',
    maxZoom: 16,
  },
};

export const FALLBACK_LIGHT_DOMES: LightDomeItem[] = [
  { name: 'Hà Nội', lat: 21.0285, lng: 105.8542, maxBortle: 8.8, radiusKm: 65 },
  { name: 'TP.HCM', lat: 10.7769, lng: 106.7009, maxBortle: 9.0, radiusKm: 75 },
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, maxBortle: 7.8, radiusKm: 36 },
  { name: 'Đà Lạt', lat: 11.9404, lng: 108.4583, maxBortle: 6.9, radiusKm: 24 },
];

export function computeRayDestination(lat: number, lng: number, azDeg: number, distanceKm = 180): [number, number] {
  const rad = (azDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  const dLat = (Math.cos(rad) * distanceKm) / 111.32;
  const dLng = (Math.sin(rad) * distanceKm) / (111.32 * Math.max(0.2, Math.cos(latRad)));
  return [lat + dLat, lng + dLng];
}

export function getBortleMarkerColor(bortle: number): string {
  if (bortle <= 2.5) return '#10B981';
  if (bortle <= 3.8) return '#84CC16';
  if (bortle <= 5.2) return '#FBBF24';
  if (bortle <= 7.0) return '#F97316';
  return '#F43F5E';
}
