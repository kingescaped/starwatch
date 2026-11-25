import { equatorialToHorizontal } from './coordinates.ts';
import { DEGREES_TO_RADIANS, getJulianDate, normalizeDegrees, RADIANS_TO_DEGREES } from './time.ts';

export interface SunPosition {
  altitudeDegrees: number;
  trueAltitudeDegrees: number;
  azimuthDegrees: number;
}

export interface MoonPosition {
  altitudeDegrees: number;
  azimuthDegrees: number;
  illuminationPercent: number;
  ageDays: number;
  phaseName: string;
}

export function getSunPosition(date: Date, lat: number, lng: number): SunPosition {
  const jd = getJulianDate(date);
  const d = jd - 2_451_545;
  const meanAnomaly = normalizeDegrees(357.529 + 0.98560028 * d) * DEGREES_TO_RADIANS;
  const meanLon = normalizeDegrees(280.459 + 0.98564736 * d);
  const eclLon =
    normalizeDegrees(meanLon + 1.915 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly)) *
    DEGREES_TO_RADIANS;
  const obliquity = (23.439 - 0.00000036 * d) * DEGREES_TO_RADIANS;
  const raRad = Math.atan2(Math.cos(obliquity) * Math.sin(eclLon), Math.cos(eclLon));
  const raHours = normalizeDegrees(raRad * RADIANS_TO_DEGREES) / 15;
  const decDeg = Math.asin(Math.sin(obliquity) * Math.sin(eclLon)) * RADIANS_TO_DEGREES;
  return equatorialToHorizontal(jd, lat, lng, raHours, decDeg);
}

export function getMoonPosition(date: Date, lat: number, lng: number): MoonPosition {
  const jd = getJulianDate(date);
  const d = jd - 2_451_545;
  const meanLon = normalizeDegrees(218.316 + 13.176396 * d) * DEGREES_TO_RADIANS;
  const meanAnomaly = normalizeDegrees(134.963 + 13.064993 * d) * DEGREES_TO_RADIANS;
  const argLat = normalizeDegrees(93.272 + 13.22935 * d) * DEGREES_TO_RADIANS;
  const elongation = normalizeDegrees(297.85 + 12.190749 * d) * DEGREES_TO_RADIANS;
  const eclLon =
    meanLon +
    (6.289 * Math.sin(meanAnomaly) +
      1.274 * Math.sin(2 * elongation - meanAnomaly) +
      0.658 * Math.sin(2 * elongation)) *
      DEGREES_TO_RADIANS;
  const eclLat = 5.128 * Math.sin(argLat) * DEGREES_TO_RADIANS;
  const obliquity = 23.439 * DEGREES_TO_RADIANS;
  const decRad = Math.asin(
    Math.sin(eclLat) * Math.cos(obliquity) + Math.cos(eclLat) * Math.sin(obliquity) * Math.sin(eclLon)
  );
  const y = Math.sin(eclLon) * Math.cos(obliquity) - Math.tan(eclLat) * Math.sin(obliquity);
  const raHours = normalizeDegrees(Math.atan2(y, Math.cos(eclLon)) * RADIANS_TO_DEGREES) / 15;
  const horiz = equatorialToHorizontal(jd, lat, lng, raHours, decRad * RADIANS_TO_DEGREES);
  const ageDays = ((jd - 2_451_550.1) % 29.53058867 + 29.53058867) % 29.53058867;
  return {
    altitudeDegrees: horiz.altitudeDegrees - 0.95 * Math.cos(horiz.trueAltitudeDegrees * DEGREES_TO_RADIANS),
    azimuthDegrees: horiz.azimuthDegrees,
    illuminationPercent: Math.round((1 - Math.cos((ageDays / 29.53058867) * 2 * Math.PI)) * 50),
    ageDays: Number(ageDays.toFixed(1)),
    phaseName: getMoonPhaseName(ageDays),
  };
}

function getMoonPhaseName(ageDays: number): string {
  if (ageDays < 1.8) return 'Trăng mới';
  if (ageDays < 5.5) return 'Lưỡi liềm đầu tháng';
  if (ageDays < 9.2) return 'Bán nguyệt đầu tháng';
  if (ageDays < 13.5) return 'Trăng khuyết đầu tháng';
  if (ageDays < 16.2) return 'Trăng tròn';
  if (ageDays < 20.5) return 'Trăng khuyết cuối tháng';
  if (ageDays < 24.2) return 'Bán nguyệt cuối tháng';
  if (ageDays < 28) return 'Lưỡi liềm cuối tháng';
  return 'Trăng non';
}
