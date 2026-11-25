import type { Spot } from '../state/types';

export interface GeocodedPlace {
  id: string;
  name: string;
  subtitle: string;
  province: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  elevation: number;
  source: 'coords' | 'open-meteo' | 'nominatim';
}

export interface BrowserCoordsResult {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
}

const COORDS_REGEX =
  /^\s*(-?\d+(?:\.\d+)?)\s*°?\s*([NnSs])?\s*[,\s;]\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EeWw])?\s*$/;

export function parseCoordinateQuery(query: string): { lat: number; lng: number } | null {
  const match = COORDS_REGEX.exec(query.trim());
  if (!match) return null;
  let lat = Number.parseFloat(match[1]);
  let lng = Number.parseFloat(match[3]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (match[2]?.toUpperCase() === 'S' && lat > 0) lat = -lat;
  if (match[4]?.toUpperCase() === 'W' && lng > 0) lng = -lng;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
}

function slugifyPlace(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 28);
}

function makeSearchSpotId(name: string, lat: number, lng: number): string {
  const slug = slugifyPlace(name) || 'place';
  return `search-${slug}-${lat.toFixed(2)}-${lng.toFixed(2)}`;
}

async function fetchOpenMeteoPlaces(query: string, signal?: AbortSignal): Promise<GeocodedPlace[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=vi&format=json`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as {
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      elevation?: number;
      admin1?: string;
      admin2?: string;
      country?: string;
    }>;
  };
  return (data.results ?? []).map((item) => {
    const province = item.admin1 || item.admin2 || item.country || 'Việt Nam';
    const country = item.country || '';
    const region = country && province !== country ? country : 'Toàn cầu';
    return {
      id: makeSearchSpotId(item.name, item.latitude, item.longitude),
      name: item.name,
      subtitle: item.admin2 && item.admin2 !== item.name ? `(${item.admin2})` : '(Tìm kiếm địa điểm)',
      province,
      region,
      country,
      lat: Number(item.latitude.toFixed(4)),
      lng: Number(item.longitude.toFixed(4)),
      elevation: Math.max(0, Math.round(item.elevation ?? 120)),
      source: 'open-meteo',
    };
  });
}

async function fetchNominatimPlaces(query: string, signal?: AbortSignal): Promise<GeocodedPlace[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=vi&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const rows = (await res.json().catch(() => [])) as Array<{
    name?: string;
    display_name?: string;
    lat: string;
    lon: string;
    address?: { city?: string; town?: string; state?: string; province?: string; country?: string };
  }>;
  return rows.map((row) => {
    const lat = Number(Number.parseFloat(row.lat).toFixed(4));
    const lng = Number(Number.parseFloat(row.lon).toFixed(4));
    const firstPart = row.display_name?.split(',')[0]?.trim();
    const name = row.name?.trim() || firstPart || `${lat}, ${lng}`;
    const addr = row.address ?? {};
    const province = addr.province || addr.state || addr.city || addr.town || addr.country || 'Bản đồ OpenStreetMap';
    return {
      id: makeSearchSpotId(name, lat, lng),
      name,
      subtitle: '(OpenStreetMap)',
      province,
      region: addr.country || 'Toàn cầu',
      country: addr.country || '',
      lat,
      lng,
      elevation: 80,
      source: 'nominatim',
    };
  });
}

export async function searchRemotePlaces(query: string, signal?: AbortSignal): Promise<GeocodedPlace[]> {
  const trimmed = query.trim();
  const parsedCoords = parseCoordinateQuery(trimmed);
  if (parsedCoords) {
    return [
      {
        id: makeSearchSpotId('coords', parsedCoords.lat, parsedCoords.lng),
        name: `Tọa độ ${parsedCoords.lat.toFixed(4)}°N, ${parsedCoords.lng.toFixed(4)}°E`,
        subtitle: '(Tọa độ GPS tùy chọn)',
        province: 'Soi trực tiếp trên bản đồ',
        region: 'GPS',
        country: '',
        lat: parsedCoords.lat,
        lng: parsedCoords.lng,
        elevation: 150,
        source: 'coords',
      },
    ];
  }
  if (trimmed.length < 2) return [];

  const primary = await fetchOpenMeteoPlaces(trimmed, signal).catch(() => []);
  if (primary.length >= 2) return primary;

  const secondary = await fetchNominatimPlaces(trimmed, signal).catch(() => []);
  const combined = [...primary];
  for (const cand of secondary) {
    const duplicate = combined.some(
      (item) => Math.abs(item.lat - cand.lat) < 0.02 && Math.abs(item.lng - cand.lng) < 0.02
    );
    if (!duplicate) combined.push(cand);
  }
  return combined.slice(0, 6);
}

export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<{ name: string; province: string; region: string } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=vi&zoom=12&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      name?: string;
      address?: {
        suburb?: string;
        town?: string;
        village?: string;
        city_district?: string;
        city?: string;
        state?: string;
        province?: string;
        country?: string;
      };
    };
    const addr = data.address ?? {};
    const name = data.name || addr.suburb || addr.village || addr.town || addr.city_district || addr.city;
    const province = addr.province || addr.state || addr.city || addr.country || 'Việt Nam';
    if (!name) return null;
    return { name, province, region: addr.country || 'GPS Hiện tại' };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function requestBrowserPosition(): Promise<BrowserCoordsResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Trình duyệt hiện tại chưa hỗ trợ định vị GPS.'));
      return;
    }
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      reject(new Error('Định vị GPS yêu cầu kết nối HTTPS an toàn.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
          accuracy: Math.round(pos.coords.accuracy || 0),
          altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude) : null,
        });
      },
      (err) => {
        if (err.code === 1) reject(new Error('Bạn đã từ chối quyền truy cập vị trí. Hãy cấp quyền GPS trong trình duyệt.'));
        else if (err.code === 3) reject(new Error('Hết thời gian chờ tín hiệu GPS. Vui lòng thử lại ở nơi thoáng hơn.'));
        else reject(new Error('Không thể xác định tọa độ GPS lúc này.'));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

export function buildDynamicSpot(input: {
  id: string;
  name: string;
  subtitle: string;
  region: string;
  province: string;
  lat: number;
  lng: number;
  elevation: number;
  bortle: number;
  sqm: number;
  tags: string[];
  statusText: string;
}): Spot {
  const skyBonus = Math.max(25, Math.min(96, Math.round(108 - input.bortle * 9)));
  return {
    id: input.id,
    name: input.name,
    subtitle: input.subtitle,
    region: input.region,
    province: input.province,
    lat: input.lat,
    lng: input.lng,
    elevation: input.elevation,
    bortle: input.bortle,
    sqm: input.sqm,
    milkyWayScore: skyBonus,
    twilightScore: Math.min(90, Math.round(skyBonus * 0.88)),
    cloudSeaScore: input.elevation >= 700 ? Math.min(92, skyBonus + 4) : 48,
    overallScore: skyBonus,
    savedSizeMb: null,
    isFavorite: false,
    tags: input.tags,
    statusText: input.statusText,
    safetyNote: 'Địa điểm tạo từ GPS hoặc tìm kiếm bản đồ. Luôn kiểm tra thời tiết & đường đi trước khi di chuyển.',
  };
}
