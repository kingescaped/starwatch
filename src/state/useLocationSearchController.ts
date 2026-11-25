import { useCallback, useState } from 'react';
import { apiClient } from '../services/apiClient';
import {
  buildDynamicSpot,
  GeocodedPlace,
  requestBrowserPosition,
  reverseGeocodeCoords,
} from '../services/locationClient';
import type { Spot } from './types';
import { playUiSound } from '../utils/soundEngine';

interface LocationControllerDeps {
  setSpots: React.Dispatch<React.SetStateAction<Spot[]>>;
  setSelectedSpotId: React.Dispatch<React.SetStateAction<string>>;
  setInspectedCoords: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number; bortle: number; sqm: number; cloud: number; name: string }>
  >;
}

function upsertDynamicSpot(prev: Spot[], nextSpot: Spot): Spot[] {
  const existing = prev.find((item) => item.id === nextSpot.id);
  const merged: Spot = existing
    ? { ...nextSpot, isFavorite: existing.isFavorite, savedSizeMb: existing.savedSizeMb }
    : nextSpot;
  return [merged, ...prev.filter((item) => item.id !== nextSpot.id)];
}

export function useLocationSearchController({
  setSpots,
  setSelectedSpotId,
  setInspectedCoords,
}: LocationControllerDeps) {
  const [locatingGps, setLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const clearGpsError = useCallback(() => setGpsError(null), []);

  const locateCurrentPosition = useCallback(async () => {
    setLocatingGps(true);
    setGpsError(null);
    try {
      const coords = await requestBrowserPosition();
      const [inspectRes, geoRes] = await Promise.allSettled([
        apiClient.inspectCoords(coords.lat, coords.lng),
        reverseGeocodeCoords(coords.lat, coords.lng),
      ]);

      const inspected = inspectRes.status === 'fulfilled' ? inspectRes.value : null;
      const geocoded = geoRes.status === 'fulfilled' ? geoRes.value : null;
      const bortle = inspected?.bortle ?? 5.4;
      const sqm = inspected?.sqm ?? 19.65;
      const placeName = geocoded?.name || 'Vị trí hiện tại của bạn';
      const province = geocoded?.province || `Sai số ±${coords.accuracy}m`;

      const gpsSpot = buildDynamicSpot({
        id: 'gps-current',
        name: placeName,
        subtitle: '(Vị trí GPS hiện tại)',
        region: geocoded?.region || 'GPS Live',
        province,
        lat: coords.lat,
        lng: coords.lng,
        elevation: coords.altitude ?? 25,
        bortle,
        sqm,
        tags: ['Vị trí GPS', `±${coords.accuracy}m`],
        statusText: `Định vị GPS ±${coords.accuracy}m · ${bortle.toFixed(1)} Bortle`,
      });

      setSpots((prev) => upsertDynamicSpot(prev, gpsSpot));
      setSelectedSpotId(gpsSpot.id);
      setInspectedCoords({
        lat: coords.lat,
        lng: coords.lng,
        bortle,
        sqm,
        cloud: inspected?.cloud ?? 15,
        name: `${placeName} · ${province}`,
      });
      playUiSound('success');
      return true;
    } catch (err) {
      setGpsError(err instanceof Error ? err.message : 'Không thể lấy vị trí hiện tại.');
      return false;
    } finally {
      setLocatingGps(false);
    }
  }, [setInspectedCoords, setSelectedSpotId, setSpots]);

  const selectGeocodedPlace = useCallback(
    async (place: GeocodedPlace) => {
      setGpsError(null);
      let bortle = 4.5;
      let sqm = 20.6;
      let cloud = 16;

      try {
        const inspected = await apiClient.inspectCoords(place.lat, place.lng);
        bortle = inspected.bortle;
        sqm = inspected.sqm;
        cloud = inspected.cloud;
      } catch {
        // Fallback estimates if backend inspection is temporarily unreachable
      }

      const nextSpot = buildDynamicSpot({
        id: place.id,
        name: place.name,
        subtitle: place.subtitle,
        region: place.region,
        province: place.province,
        lat: place.lat,
        lng: place.lng,
        elevation: place.elevation,
        bortle,
        sqm,
        tags: [place.source === 'coords' ? 'Tọa độ' : 'Tìm kiếm', place.province],
        statusText: `Đã chọn qua tìm kiếm · Bortle ${bortle.toFixed(1)}`,
      });

      setSpots((prev) => upsertDynamicSpot(prev, nextSpot));
      setSelectedSpotId(nextSpot.id);
      setInspectedCoords({
        lat: place.lat,
        lng: place.lng,
        bortle,
        sqm,
        cloud,
        name: `${place.name} · ${place.province}`,
      });
      playUiSound('select');
    },
    [setInspectedCoords, setSelectedSpotId, setSpots]
  );

  return { locatingGps, gpsError, clearGpsError, locateCurrentPosition, selectGeocodedPlace };
}
