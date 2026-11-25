import { equatorialToHorizontal, toCompassLabel } from './coordinates.ts';
import { getPlanetHorizontal, isPlanetId } from './planets.ts';
import { getMoonPosition, getSunPosition } from './sunMoon.ts';
import { formatHourMinute, getJulianDate, getLocalSiderealTimeDegrees, localDateTimeToUtc } from './time.ts';
import type { WeatherHour } from '../integrations/openMeteo.ts';

export interface BackendTarget {
  id: string;
  name: string;
  shortName: string;
  raHours: number;
  decDeg: number;
  constellation: string;
  description: string;
}

export const BACKEND_TARGETS: BackendTarget[] = [
  { id: 'galactic_center', name: 'Tâm Ngân Hà · Sgr A*', shortName: 'Tâm Ngân Hà', raHours: 17.76, decDeg: -29.01, constellation: 'Sagittarius', description: 'Lõi Dải Ngân Hà rực rỡ nhất bầu trời đêm.' },
  { id: 'm31', name: 'M31 Andromeda', shortName: 'M31 Andromeda', raHours: 0.71, decDeg: 41.27, constellation: 'Andromeda', description: 'Thiên hà xoắn ốc láng giềng 2.5 triệu năm ánh sáng.' },
  { id: 'm42', name: 'M42 Tinh vân Orion', shortName: 'M42 Orion', raHours: 5.59, decDeg: -5.39, constellation: 'Orion', description: 'Tinh vân phát xạ rực rỡ dễ nhận diện bằng mắt thường.' },
  { id: 'm45', name: 'M45 Cụm sao Thất Nữ', shortName: 'M45 Pleiades', raHours: 3.79, decDeg: 24.12, constellation: 'Taurus', description: 'Cụm sao mở ánh xanh nổi bật trên bầu trời Thu-Đông.' },
  { id: 'saturn', name: 'Sao Thổ (Saturn)', shortName: 'Sao Thổ', raHours: 23.2, decDeg: -7.5, constellation: 'Aquarius', description: 'Hành tinh có vành đai sáng rõ.' },
  { id: 'jupiter', name: 'Sao Mộc (Jupiter)', shortName: 'Sao Mộc', raHours: 4.9, decDeg: 21.8, constellation: 'Taurus', description: 'Hành tinh lớn nhất hệ Mặt Trời.' },
];

export function computeTargetHoriz(date: Date, lat: number, lng: number, targetId: string) {
  const mappedId = targetId === 'sgr-a' ? 'galactic_center' : targetId;
  if (isPlanetId(mappedId)) {
    const p = getPlanetHorizontal(date, lat, lng, mappedId);
    if (p) return { altitudeDegrees: p.altitudeDegrees, azimuthDegrees: p.azimuthDegrees, raHours: p.raHours, decDeg: p.decDeg };
  }
  const target = BACKEND_TARGETS.find((t) => t.id === mappedId) ?? BACKEND_TARGETS[0];
  const pos = equatorialToHorizontal(getJulianDate(date), lat, lng, target.raHours, target.decDeg);
  return { altitudeDegrees: pos.altitudeDegrees, azimuthDegrees: pos.azimuthDegrees, raHours: target.raHours, decDeg: target.decDeg };
}

export function buildNightSeries(
  date: string,
  lat: number,
  lng: number,
  targetId: string,
  weatherHours: WeatherHour[],
  timeZone = 'Asia/Ho_Chi_Minh'
) {
  const slots: Array<{
    hour: string;
    highCloud: number;
    midCloud: number;
    lowCloud: number;
    tempC: number;
    dewC: number;
    deltaT: number;
    windKmh: number;
    targetAlt: number;
    moonAlt: number;
    sunAlt: number;
    phaseLabel: string;
  }> = [];

  for (let idx = 0; idx < 13; idx++) {
    const hourNum = (18 + idx) % 24;
    const hourLabel = `${String(hourNum).padStart(2, '0')}:00`;
    const slotDate = idx < 6 ? date : addOneDay(date);
    const minuteOfDay = hourNum * 60;
    const instant = localDateTimeToUtc(slotDate, minuteOfDay, timeZone);

    const sun = getSunPosition(instant, lat, lng);
    const moon = getMoonPosition(instant, lat, lng);
    const target = computeTargetHoriz(instant, lat, lng, targetId);
    const matchedWeather = findNearestWeather(weatherHours, instant.getTime());

    const tempC = matchedWeather?.temperatureC ?? 14;
    const humidity = matchedWeather?.humidityPercent ?? 82;
    const dewC = Number(calcDewPoint(tempC, humidity).toFixed(1));
    const deltaT = Number(Math.max(0.4, tempC - dewC).toFixed(1));

    slots.push({
      hour: hourLabel,
      highCloud: matchedWeather?.cloudHighPercent ?? 18,
      midCloud: matchedWeather?.cloudMidPercent ?? 14,
      lowCloud: matchedWeather?.cloudLowPercent ?? 24,
      tempC: Math.round(tempC),
      dewC: Math.round(dewC),
      deltaT,
      windKmh: matchedWeather?.windKmh ?? 8,
      targetAlt: Number(target.altitudeDegrees.toFixed(1)),
      moonAlt: Number(moon.altitudeDegrees.toFixed(1)),
      sunAlt: Number(sun.altitudeDegrees.toFixed(1)),
      phaseLabel: classifyPhase(sun.altitudeDegrees, target.altitudeDegrees),
    });
  }
  return slots;
}

export function buildDailyEvents(date: string, lat: number, lng: number, timeZone = 'Asia/Ho_Chi_Minh') {
  let sunrise = '05:54';
  let sunset = '17:38';
  let dawn = '04:36';
  let dusk = '18:56';
  let prevAlt: number | null = null;

  for (let m = 0; m <= 1440; m += 8) {
    const inst = localDateTimeToUtc(date, m, timeZone);
    const alt = getSunPosition(inst, lat, lng).trueAltitudeDegrees;
    if (prevAlt !== null) {
      if (prevAlt < -18 && alt >= -18) dawn = formatHourMinute(m - 4);
      if (prevAlt < -0.833 && alt >= -0.833) sunrise = formatHourMinute(m - 4);
      if (prevAlt >= -0.833 && alt < -0.833) sunset = formatHourMinute(m - 4);
      if (prevAlt >= -18 && alt < -18) dusk = formatHourMinute(m - 4);
    }
    prevAlt = alt;
  }

  return [
    { id: 'dawn-18', label: 'Rạng sáng -18°', subLabel: 'Bình minh thiên văn', time: dawn, tone: 'violet' as const },
    { id: 'sunrise', label: 'Mặt Trời mọc', subLabel: 'Chân trời Đông', time: sunrise, tone: 'amber' as const },
    { id: 'sunset', label: 'Mặt Trời lặn', subLabel: 'Hoàng hôn · Chân trời Tây', time: sunset, tone: 'amber' as const },
    { id: 'dusk-18', label: 'Chập tối -18°', subLabel: 'Bắt đầu đêm thiên văn', time: dusk, tone: 'cyan' as const },
  ];
}

export function buildSkyScene(date: string, minuteOfDay: number, lat: number, lng: number, targetId: string) {
  const inst = localDateTimeToUtc(date, minuteOfDay, 'Asia/Ho_Chi_Minh');
  const jd = getJulianDate(inst);
  const lstDeg = getLocalSiderealTimeDegrees(jd, lng);
  const sun = getSunPosition(inst, lat, lng);
  const moon = getMoonPosition(inst, lat, lng);
  const saturn = getPlanetHorizontal(inst, lat, lng, 'saturn');
  const active = computeTargetHoriz(inst, lat, lng, targetId);

  return {
    latDeg: lat,
    lstDeg: Number(lstDeg.toFixed(2)),
    sunAlt: Number(sun.altitudeDegrees.toFixed(1)),
    sunAz: Number(sun.azimuthDegrees.toFixed(1)),
    sunAzLabel: toCompassLabel(sun.azimuthDegrees),
    moonAlt: Number(moon.altitudeDegrees.toFixed(1)),
    moonAz: Number(moon.azimuthDegrees.toFixed(1)),
    moonAzLabel: toCompassLabel(moon.azimuthDegrees),
    moonIllum: moon.illuminationPercent,
    moonPhase: moon.phaseName,
    saturnAlt: Number((saturn?.altitudeDegrees ?? 41).toFixed(1)),
    saturnAz: Number((saturn?.azimuthDegrees ?? 210).toFixed(1)),
    targetAlt: Number(active.altitudeDegrees.toFixed(1)),
    targetAz: Number(active.azimuthDegrees.toFixed(1)),
    targetAzLabel: toCompassLabel(active.azimuthDegrees),
    targetRaHours: active.raHours,
    targetDecDeg: active.decDeg,
  };
}

function addOneDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const next = new Date(Date.UTC(y, (m || 1) - 1, (d || 1) + 1));
  return next.toISOString().slice(0, 10);
}

function findNearestWeather(hours: WeatherHour[], targetMs: number): WeatherHour | null {
  if (!hours.length) return null;
  let best = hours[0];
  let bestDist = Math.abs(Date.parse(best.timestamp) - targetMs);
  for (const h of hours) {
    const dist = Math.abs(Date.parse(h.timestamp) - targetMs);
    if (dist < bestDist) { best = h; bestDist = dist; }
  }
  return best;
}

function calcDewPoint(tempC: number, humidityPct: number): number {
  const rh = Math.max(1, Math.min(100, humidityPct)) / 100;
  const gamma = Math.log(rh) + (17.62 * tempC) / (243.12 + tempC);
  return (243.12 * gamma) / (17.62 - gamma);
}

function classifyPhase(sunAlt: number, targetAlt: number): string {
  if (sunAlt > -6) return sunAlt > 0 ? 'Bình minh' : 'Chập tối dân dụng';
  if (sunAlt > -18) return 'Ráng chiều';
  if (targetAlt >= 50) return 'Đỉnh Ngân Hà';
  return 'Đêm thiên văn';
}
