import type { ServerEnv } from '../env.ts';
import { CURATED_SPOTS } from '../data/curatedSpots.ts';
import { buildMonthlyCalendar } from '../domain/calendar.ts';
import { estimateBortleAtCoords, VIETNAM_LIGHT_DOMES } from '../domain/bortle.ts';
import { buildDailyEvents, buildNightSeries, buildSkyScene } from '../domain/ephemeris.ts';
import { computeAstroAdvisor, computeCameraSpecsSummary, computeSpotScores, type CameraGearInput } from '../domain/scoring.ts';
import { fetchOpenMeteoForecast } from '../integrations/openMeteo.ts';
import { deleteCustomSpotById, readLocalStore, writeLocalStore } from '../integrations/localStore.ts';
import { HttpError, readJsonBody } from '../http/helpers.ts';
import { requireAdminSession } from './accountRoutes.ts';
import type http from 'node:http';

export function handleGetSpots() {
  const store = readLocalStore();
  return { spots: [...store.customSpots, ...CURATED_SPOTS] };
}

export async function handleCreateSpot(req: http.IncomingMessage) {
  const body = await readJsonBody(req);
  const name = String(body.name ?? '').trim();
  const province = String(body.province ?? '').trim();
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const elevation = Number(body.elevation ?? 500);
  if (!name || !province || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new HttpError(400, 'invalid_spot', 'Vui lòng nhập đầy đủ tên, tỉnh thành và tọa độ hợp lệ.');
  }
  const est = estimateBortleAtCoords(lat, lng);
  const bortle = Number.isFinite(Number(body.bortle)) ? Number(body.bortle) : est.bortle;
  const sqm = Number((22.05 - (bortle - 1) * 0.44).toFixed(2));
  const scores = computeSpotScores(bortle, elevation, 24, 22, 18, 82, 8, 52, 18);

  const spot = {
    id: `custom-${Date.now()}`,
    name,
    subtitle: String(body.subtitle ?? '').trim() || '(Điểm đóng góp cộng đồng)',
    region: province,
    province,
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    elevation: Math.round(elevation),
    bortle: Number(bortle.toFixed(1)),
    sqm,
    ...scores,
    savedSizeMb: null,
    isFavorite: true,
    tags: ['Cộng đồng', `Bortle ${bortle.toFixed(1)}`],
    statusText: String(body.safetyNote ?? '').trim() || 'Điểm săn ảnh mới từ cộng đồng StarWatch',
    safetyNote: String(body.safetyNote ?? '').trim() || 'Kiểm tra thời tiết và địa hình trước khi di chuyển.',
  };

  const store = readLocalStore();
  store.customSpots = [spot, ...store.customSpots];
  writeLocalStore(store);
  return { spot };
}

export async function handleDeleteSpot(req: http.IncomingMessage, env: ServerEnv, spotId: string) {
  await requireAdminSession(req, env);
  const cleanId = spotId.trim();
  if (!cleanId) throw new HttpError(400, 'invalid_spot_id', 'Mã địa điểm cần xóa không hợp lệ.');
  if (!deleteCustomSpotById(cleanId)) {
    throw new HttpError(404, 'spot_not_found', 'Không tìm thấy điểm cộng đồng để xóa.');
  }
  return { ok: true, deletedId: cleanId };
}

export async function handleGetObservation(url: URL, env: ServerEnv) {
  const spotId = url.searchParams.get('spotId') ?? 'ta-xua';
  const allSpots = handleGetSpots().spots as Array<{ id: string; lat: number; lng: number; bortle: number; elevation: number }>;
  const found = allSpots.find((s) => s.id === spotId);

  const lat = Number(url.searchParams.get('lat')) || found?.lat || 21.2981;
  const lng = Number(url.searchParams.get('lng')) || found?.lng || 104.4652;
  const bortle = Number(url.searchParams.get('bortle')) || found?.bortle || 3.5;
  const elevation = Number(url.searchParams.get('elevation')) || found?.elevation || 1865;
  const targetId = url.searchParams.get('targetId') ?? 'sgr-a';
  const date = url.searchParams.get('date') ?? '2026-11-18';
  const hourIndex = Math.max(0, Math.min(12, Number(url.searchParams.get('hourIndex') ?? 3) || 3));
  const minuteOfDay = ((18 + hourIndex) % 24) * 60;

  const weather = await fetchOpenMeteoForecast(env, lat, lng, 'Asia/Ho_Chi_Minh');
  const forecast = buildNightSeries(date, lat, lng, targetId, weather.hours, 'Asia/Ho_Chi_Minh');
  const dailyEvents = buildDailyEvents(date, lat, lng, 'Asia/Ho_Chi_Minh');
  const skyScene = buildSkyScene(date, minuteOfDay, lat, lng, targetId);

  const peakHour = forecast.reduce((best, cur) => (cur.targetAlt > best.targetAlt ? cur : best), forecast[0]);
  const current = forecast[hourIndex] ?? forecast[3];
  const avgCloud = Math.round(forecast.reduce((acc, h) => acc + (h.highCloud * 0.4 + h.midCloud * 0.35 + h.lowCloud * 0.25), 0) / forecast.length);
  const scores = computeSpotScores(bortle, elevation, avgCloud, current.lowCloud, current.highCloud, 82, current.windKmh ?? 8, peakHour.targetAlt, skyScene.moonIllum);

  const goldenWindows = [
    { id: 'golden-evening', title: 'Giờ Vàng & Ráng Chiều', subtitle: `Mây cao ${forecast[0].highCloud}% · Hướng Tây WNW`, timeRange: `${dailyEvents[2].time} - 18:25`, score: scores.twilightScore, tone: 'amber' as const },
    { id: 'blue-hour', title: 'Giờ Xanh (Blue Hour)', subtitle: 'Tỷ lệ tương phản trời / núi tối ưu', timeRange: `18:25 - ${dailyEvents[3].time}`, score: Math.min(96, scores.twilightScore + 6), tone: 'cyan' as const },
    { id: 'astro-night', title: 'Đêm Thiên Văn (-18°)', subtitle: `Trời tối chuẩn Bortle ${bortle.toFixed(1)}`, timeRange: `${dailyEvents[3].time} - ${dailyEvents[0].time}`, score: scores.milkyWayScore, tone: 'violet' as const },
    { id: 'cloud-sea-dawn', title: 'Biển Mây Bình Minh', subtitle: `Mây thấp ${forecast[10]?.lowCloud ?? 78}% · Gió ${forecast[10]?.windKmh ?? 8} km/h`, timeRange: `05:00 - ${dailyEvents[1].time}`, score: scores.cloudSeaScore, tone: 'emerald' as const },
  ];

  const tonightSlots = [2, 4, 6, 8, 10, 11].map((idx, i) => {
    const row = forecast[idx];
    const slotScore = Math.max(40, Math.min(97, Math.round(scores.milkyWayScore - row.highCloud * 0.25 + (idx === 6 ? 6 : 0))));
    const labels = ['Trời trong', 'Ngân Hà lên', 'Đẹp nhất', 'Ít ánh trăng', 'Mây nhẹ', 'Bình minh'];
    const tones: Array<'violet' | 'cyan' | 'amber'> = ['violet', 'cyan', 'cyan', 'violet', 'violet', 'amber'];
    return {
      time: row.hour === '05:00' ? '05:30' : row.hour,
      score: i === 5 ? scores.cloudSeaScore : slotScore,
      label: labels[i],
      icon: i === 5 ? ('cloud' as const) : ('sparkles' as const),
      tone: tones[i],
      featured: i === 2,
    };
  });

  const cloudSystems = [
    { id: 'c1', label: `Mây Vịnh Bắc Bộ ${forecast[0].lowCloud}%`, lat: 20.6, lng: 107.6, radiusKm: 135, opacity: Math.min(0.45, Math.max(0.16, forecast[0].lowCloud / 160)) },
    { id: 'c2', label: `Giải mây Biển Đông ${forecast[5].midCloud}%`, lat: 15.8, lng: 109.1, radiusKm: 150, opacity: Math.min(0.42, Math.max(0.15, forecast[5].midCloud / 150)) },
    { id: 'c3', label: `Mây Nam Bộ ${forecast[9].lowCloud}%`, lat: 10.1, lng: 106.2, radiusKm: 120, opacity: Math.min(0.4, Math.max(0.14, forecast[9].lowCloud / 160)) },
  ];

  return {
    source: weather.stale ? 'Open-Meteo fallback + StarWatch Ephemeris' : 'Open-Meteo Live + StarWatch Ephemeris',
    retrievedAt: weather.retrievedAt,
    scores,
    forecast,
    dailyEvents,
    skyScene,
    goldenWindows,
    tonightSlots,
    lightDomes: VIETNAM_LIGHT_DOMES,
    cloudSystems,
  };
}

export async function handleInspectMap(req: http.IncomingMessage, env: ServerEnv) {
  const body = await readJsonBody(req);
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new HttpError(400, 'invalid_coords', 'Tọa độ không hợp lệ.');
  }
  const est = estimateBortleAtCoords(lat, lng);
  const weather = await fetchOpenMeteoForecast(env, lat, lng, 'Asia/Ho_Chi_Minh');
  const cloud = weather.hours[2]?.cloudTotalPercent ?? 26;
  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
    bortle: est.bortle,
    sqm: est.sqm,
    label: est.label,
    cloud,
    name: `Tọa độ ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E · ${est.label}`,
  };
}

export async function handleAdvisorSetup(req: http.IncomingMessage) {
  const body = await readJsonBody(req);
  const mode = (body.mode ?? 'milkyWay') as 'milkyWay' | 'nebula' | 'meteor' | 'moon' | 'cloudSea';
  const device = (body.device ?? 'camera') as 'camera' | 'phone';
  const focalLengthMm = Number(body.focalLengthMm ?? 14) || 14;
  const bortle = Number(body.bortle ?? 3.5) || 3.5;
  const dewRisk = Boolean(body.dewRisk);
  const gear = body.gear as CameraGearInput | undefined;
  const targetDecDeg = body.targetDecDeg !== undefined ? Number(body.targetDecDeg) : undefined;
  const targetName = typeof body.targetName === 'string' ? body.targetName : undefined;
  const moonIllum = body.moonIllum !== undefined ? Number(body.moonIllum) : undefined;
  const moonAlt = body.moonAlt !== undefined ? Number(body.moonAlt) : undefined;
  const windKmh = body.windKmh !== undefined ? Number(body.windKmh) : undefined;
  const cloudPct = body.cloudPct !== undefined ? Number(body.cloudPct) : undefined;
  return {
    spec: computeAstroAdvisor({
      mode,
      device,
      focalLengthMm,
      bortle,
      dewRisk,
      gear,
      targetDecDeg,
      targetName,
      moonIllum,
      moonAlt,
      windKmh,
      cloudPct,
    }),
  };
}

export async function handleGearPreview(req: http.IncomingMessage) {
  const body = await readJsonBody(req);
  const gear = body as unknown as CameraGearInput;
  return { summary: computeCameraSpecsSummary(gear) };
}

export function handleGetCalendar(url: URL) {
  const year = Number(url.searchParams.get('year') ?? 2026) || 2026;
  const month = Number(url.searchParams.get('month') ?? 11) || 11;
  const lat = Number(url.searchParams.get('lat') ?? 21.2981) || 21.2981;
  const lng = Number(url.searchParams.get('lng') ?? 104.4652) || 104.4652;
  const bortle = Number(url.searchParams.get('bortle') ?? 3.5) || 3.5;
  return { days: buildMonthlyCalendar(year, month, lat, lng, bortle) };
}
