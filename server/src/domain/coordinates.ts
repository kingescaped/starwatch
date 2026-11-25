import { DEGREES_TO_RADIANS, getLocalSiderealTimeDegrees, RADIANS_TO_DEGREES } from './time.ts';

export interface HorizontalPosition {
  trueAltitudeDegrees: number;
  altitudeDegrees: number;
  azimuthDegrees: number;
}

export function equatorialToHorizontal(
  julianDate: number,
  latitude: number,
  longitude: number,
  rightAscensionHours: number,
  declinationDegrees: number
): HorizontalPosition {
  const lst = getLocalSiderealTimeDegrees(julianDate, longitude);
  const hourAngle = normalizeSignedDegrees(lst - rightAscensionHours * 15);
  const haRad = hourAngle * DEGREES_TO_RADIANS;
  const latRad = latitude * DEGREES_TO_RADIANS;
  const decRad = declinationDegrees * DEGREES_TO_RADIANS;
  const sinAlt =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const trueAlt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RADIANS_TO_DEGREES;
  const y = -Math.sin(haRad);
  const x =
    Math.tan(decRad) * Math.cos(latRad) -
    Math.sin(latRad) * Math.cos(haRad);
  const azimuthDegrees = ((Math.atan2(y, x) * RADIANS_TO_DEGREES) % 360 + 360) % 360;
  return {
    trueAltitudeDegrees: trueAlt,
    altitudeDegrees: applyRefraction(trueAlt),
    azimuthDegrees,
  };
}

export function applyRefraction(trueAltitudeDegrees: number): number {
  if (trueAltitudeDegrees < -1.5) return trueAltitudeDegrees;
  const angle = (trueAltitudeDegrees + 10.3 / (trueAltitudeDegrees + 5.11)) * DEGREES_TO_RADIANS;
  return trueAltitudeDegrees + 1.02 / Math.tan(angle) / 60;
}

export function toCompassLabel(azimuthDegrees: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(((azimuthDegrees % 360) + 360) % 360 / 22.5) % 16;
  return `${Math.round(azimuthDegrees)}° ${dirs[idx]}`;
}

function normalizeSignedDegrees(value: number): number {
  const normalized = ((value % 360) + 360) % 360;
  return normalized > 180 ? normalized - 360 : normalized;
}
