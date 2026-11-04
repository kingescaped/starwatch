import { emit } from '../core/events.js';
import { state } from '../core/state.js';

/**
 * Open-Meteo integration and fallback weather generator.
 */

export async function fetchWeatherForActiveSpot() {
  const spot = state.activeSpot;
  if (!spot) return;

  const statusBadge = document.getElementById('apiStatusBadge');
  statusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Đang tải Open-Meteo...`;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat.toFixed(4)}&longitude=${spot.lon.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,precipitation_probability&timezone=Asia%2FBangkok`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.weatherData = normalizeWeatherResponse(data);
    statusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Open-Meteo LIVE`;
    statusBadge.className = 'active-spot-bar-detail text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1';
  } catch (err) {
    // Graceful physics-based simulation fallback if offline
    state.weatherData = generateFallbackWeather(spot);
    statusBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Mô phỏng Khí tượng`;
    statusBadge.className = 'active-spot-bar-detail text-[11px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1';
  }

  emit('weather:updated');
}

export function normalizeWeatherResponse(raw) {
  const daysMap = {};
  const times = raw.hourly.time || [];

  times.forEach((isoStr, idx) => {
    const [datePart, timePart] = isoStr.split('T');
    const hour = parseInt(timePart.split(':')[0], 10);
    if (!daysMap[datePart]) daysMap[datePart] = [];

    daysMap[datePart][hour] = {
      time: isoStr,
      hour,
      temp: Math.round(raw.hourly.temperature_2m[idx] ?? 18),
      humidity: Math.round(raw.hourly.relative_humidity_2m[idx] ?? 82),
      dewPoint: Number((raw.hourly.dew_point_2m[idx] ?? 15).toFixed(1)),
      cloudTotal: Math.round(raw.hourly.cloud_cover[idx] ?? 25),
      cloudLow: Math.round(raw.hourly.cloud_cover_low[idx] ?? 20),
      cloudMid: Math.round(raw.hourly.cloud_cover_mid[idx] ?? 15),
      cloudHigh: Math.round(raw.hourly.cloud_cover_high[idx] ?? 25),
      visibilityKm: Number(((raw.hourly.visibility?.[idx] ?? 18000) / 1000).toFixed(1)),
      windKmh: Math.round(raw.hourly.wind_speed_10m[idx] ?? 8),
      precipProb: Math.round(raw.hourly.precipitation_probability?.[idx] ?? 10)
    };
  });

  return {
    dates: Object.keys(daysMap),
    byDate: daysMap
  };
}

export function generateFallbackWeather(spot) {
  const daysMap = {};
  const baseDate = new Date();
  const isHighland = spot.elevation >= 800;

  for (let d = 0; d < 7; d++) {
    const dt = new Date(baseDate.getTime() + d * 86400000);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    daysMap[dateKey] = [];

    for (let h = 0; h < 24; h++) {
      const seed = Math.sin((spot.lat * 12 + spot.lon * 7 + d * 24 + h) * 0.35);
      const tempBase = isHighland ? 15 - (spot.elevation / 1000) * 3.5 : 25;
      const diurnal = -4.5 * Math.cos(((h - 3) / 24) * 2 * Math.PI);
      const temp = Math.round(tempBase + diurnal);
      const humidity = Math.min(99, Math.max(58, Math.round((isHighland ? 88 : 76) + 12 * Math.cos(((h - 4) / 24) * 2 * Math.PI) + seed * 5)));
      const dewSpread = ((100 - humidity) / 5);
      const dewPoint = Number((temp - dewSpread).toFixed(1));

      const cloudLow = Math.max(5, Math.min(95, Math.round((isHighland && h >= 4 && h <= 9 ? 65 : 22) + seed * 18)));
      const cloudMid = Math.max(5, Math.min(90, Math.round(28 + Math.cos(h * 0.4 + d) * 22)));
      const cloudHigh = Math.max(8, Math.min(90, Math.round(38 + Math.sin(h * 0.3 + d) * 25)));
      const cloudTotal = Math.min(100, Math.round(Math.max(cloudLow, cloudMid, cloudHigh) * 0.85 + 8));

      daysMap[dateKey][h] = {
        time: `${dateKey}T${String(h).padStart(2, '0')}:00`,
        hour: h,
        temp,
        humidity,
        dewPoint,
        cloudTotal,
        cloudLow,
        cloudMid,
        cloudHigh,
        visibilityKm: Number((humidity > 94 ? 6.5 : 22.0).toFixed(1)),
        windKmh: Math.max(3, Math.round(7 + Math.sin(h * 0.25) * 5)),
        precipProb: cloudTotal > 80 ? 45 : 10
      };
    }
  }

  return {
    dates: Object.keys(daysMap),
    byDate: daysMap
  };
}
