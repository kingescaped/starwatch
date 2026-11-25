import type { ServerEnv } from '../env.ts';
import { localDateTimeToUtc } from '../domain/time.ts';

export interface WeatherHour {
  timestamp: string;
  cloudLowPercent: number;
  cloudMidPercent: number;
  cloudHighPercent: number;
  cloudTotalPercent: number;
  humidityPercent: number;
  windKmh: number;
  temperatureC: number;
}

const CACHE_TTL_MS = 10 * 60_000;
const cache = new Map<string, { retrievedAt: string; expiresAt: number; hours: WeatherHour[] }>();

export async function fetchOpenMeteoForecast(
  env: ServerEnv,
  lat: number,
  lng: number,
  timeZone = 'Asia/Ho_Chi_Minh'
): Promise<{ hours: WeatherHour[]; retrievedAt: string; stale: boolean }> {
  const key = `${lat.toFixed(2)}_${lng.toFixed(2)}_${timeZone}`;
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) {
    return { hours: hit.hours, retrievedAt: hit.retrievedAt, stale: false };
  }

  const url = new URL(env.openMeteoBaseUrl || 'https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lng.toFixed(4));
  url.searchParams.set(
    'hourly',
    'cloud_cover_low,cloud_cover_mid,cloud_cover_high,cloud_cover,relative_humidity_2m,wind_speed_10m,temperature_2m'
  );
  url.searchParams.set('timezone', timeZone);
  url.searchParams.set('forecast_days', '3');

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const json = (await res.json()) as { hourly?: Record<string, unknown> };
      const hours = parseHourly(json.hourly ?? {}, timeZone);
      if (hours.length > 0) {
        const retrievedAt = new Date().toISOString();
        cache.set(key, { hours, retrievedAt, expiresAt: Date.now() + CACHE_TTL_MS });
        return { hours, retrievedAt, stale: false };
      }
    }
  } catch {
    // Offline or timeout: fall back cleanly below
  }

  if (hit) return { hours: hit.hours, retrievedAt: hit.retrievedAt, stale: true };
  return { hours: generateFallbackWeather(lat, timeZone), retrievedAt: new Date().toISOString(), stale: true };
}

function parseHourly(hourly: Record<string, unknown>, timeZone: string): WeatherHour[] {
  const times = Array.isArray(hourly.time) ? hourly.time.map(String) : [];
  const low = toNums(hourly.cloud_cover_low);
  const mid = toNums(hourly.cloud_cover_mid);
  const high = toNums(hourly.cloud_cover_high);
  const total = toNums(hourly.cloud_cover);
  const hum = toNums(hourly.relative_humidity_2m);
  const wind = toNums(hourly.wind_speed_10m);
  const temp = toNums(hourly.temperature_2m);

  return times.flatMap((t, i) => {
    const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(t);
    if (!m) return [];
    const ts = localDateTimeToUtc(m[1], Number(m[2]) * 60 + Number(m[3]), timeZone).toISOString();
    return [{
      timestamp: ts,
      cloudLowPercent: Math.round(low[i] ?? 20),
      cloudMidPercent: Math.round(mid[i] ?? 12),
      cloudHighPercent: Math.round(high[i] ?? 16),
      cloudTotalPercent: Math.round(total[i] ?? 22),
      humidityPercent: Math.round(hum[i] ?? 82),
      windKmh: Math.round(wind[i] ?? 8),
      temperatureC: Number((temp[i] ?? 13).toFixed(1)),
    }];
  });
}

function generateFallbackWeather(lat: number, timeZone: string): WeatherHour[] {
  const today = new Date().toISOString().slice(0, 10);
  const out: WeatherHour[] = [];
  for (let i = 0; i < 48; i++) {
    const dayOffset = Math.floor(i / 24);
    const dt = new Date(Date.parse(today) + dayOffset * 86_400_000).toISOString().slice(0, 10);
    const h = i % 24;
    const isNight = h >= 19 || h <= 5;
    const baseTemp = lat > 19 ? 13 : lat > 14 ? 19 : 23;
    out.push({
      timestamp: localDateTimeToUtc(dt, h * 60, timeZone).toISOString(),
      cloudLowPercent: isNight ? 18 + ((h * 7) % 45) : 30,
      cloudMidPercent: isNight ? 8 + ((h * 5) % 24) : 22,
      cloudHighPercent: isNight ? 12 + ((h * 9) % 35) : 28,
      cloudTotalPercent: isNight ? 16 + ((h * 6) % 35) : 34,
      humidityPercent: isNight ? 78 + (h % 18) : 68,
      windKmh: 7 + (h % 6),
      temperatureC: Number((baseTemp - (isNight ? 3 : 0) + (h % 3)).toFixed(1)),
    });
  }
  return out;
}

function toNums(val: unknown): number[] {
  return Array.isArray(val) ? val.map((v) => Number(v) || 0) : [];
}
