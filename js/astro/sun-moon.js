import { equatorialToHorizontal } from '../astro/coordinates.js';
import { DEG2RAD, getJulianDate, RAD2DEG } from '../astro/time.js';

/**
 * Sun and Moon position plus azimuth formatting.
 */

export function getSunPosition(dateObj, latDeg, lonDeg) {
  const jd = getJulianDate(dateObj);
  const d = jd - 2451545.0;

  // Mean anomaly & ecliptic longitude
  const g = ((357.529 + 0.98560028 * d) % 360) * DEG2RAD;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = ((q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) % 360) * DEG2RAD;
  const e = (23.439 - 0.00000036 * d) * DEG2RAD;

  const raRad = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  let raHours = (raRad * RAD2DEG) / 15.0;
  if (raHours < 0) raHours += 24;

  const decDeg = Math.asin(Math.sin(e) * Math.sin(L)) * RAD2DEG;
  const horiz = equatorialToHorizontal(jd, latDeg, lonDeg, raHours, decDeg);
  return { ...horiz, raHours, decDeg };
}

// Compute Moon Position, Phase Illumination (%) and Age (days)
export function getMoonPosition(dateObj, latDeg, lonDeg) {
  const jd = getJulianDate(dateObj);
  const d = jd - 2451545.0;

  // Mean elements of Lunar orbit
  const L = ((218.316 + 13.176396 * d) % 360) * DEG2RAD;
  const M = ((134.963 + 13.064993 * d) % 360) * DEG2RAD;
  const F = ((93.272 + 13.229350 * d) % 360) * DEG2RAD;
  const D = ((297.850 + 12.190749 * d) % 360) * DEG2RAD;

  // Ecliptic longitude & latitude with principal perturbations
  const lonEcl = L + (6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.658 * Math.sin(2 * D)) * DEG2RAD;
  const latEcl = (5.128 * Math.sin(F)) * DEG2RAD;
  const e = 23.439 * DEG2RAD;

  const sinDec = Math.sin(latEcl) * Math.cos(e) + Math.cos(latEcl) * Math.sin(e) * Math.sin(lonEcl);
  const decDeg = Math.asin(sinDec) * RAD2DEG;

  const y = Math.sin(lonEcl) * Math.cos(e) - Math.tan(latEcl) * Math.sin(e);
  const x = Math.cos(lonEcl);
  let raHours = (Math.atan2(y, x) * RAD2DEG) / 15.0;
  if (raHours < 0) raHours += 24;

  // Topocentric parallax correction (~0.95 deg at horizon)
  const horiz = equatorialToHorizontal(jd, latDeg, lonDeg, raHours, decDeg);
  const parallaxAdjustedAlt = horiz.altitude - 0.95 * Math.cos(horiz.trueAltitude * DEG2RAD);

  // Moon phase & illumination
  const synodicMonth = 29.53058867;
  const knownNewMoonJD = 2451550.1;
  let ageDays = (jd - knownNewMoonJD) % synodicMonth;
  if (ageDays < 0) ageDays += synodicMonth;
  const phaseAngle = (ageDays / synodicMonth) * 2 * Math.PI;
  const illuminationPct = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 100);

  let phaseName = 'Trăng non';
  if (ageDays < 1.8) phaseName = 'Trăng mới (New Moon)';
  else if (ageDays < 5.5) phaseName = 'Trăng lưỡi liềm đầu tháng';
  else if (ageDays < 9.2) phaseName = 'Bán nguyệt đầu tháng';
  else if (ageDays < 13.5) phaseName = 'Trăng khuyết đầu tháng';
  else if (ageDays < 16.2) phaseName = 'Trăng tròn (Full Moon)';
  else if (ageDays < 20.5) phaseName = 'Trăng khuyết cuối tháng';
  else if (ageDays < 24.2) phaseName = 'Bán nguyệt cuối tháng';
  else if (ageDays < 28.0) phaseName = 'Trăng lưỡi liềm cuối tháng';

  return {
    altitude: parallaxAdjustedAlt,
    azimuth: horiz.azimuth,
    illuminationPct,
    ageDays: Number(ageDays.toFixed(1)),
    phaseName
  };
}


export function azimuthToCardinalVN(az) {
  const dirs = ['B', 'ĐB', 'Đ', 'ĐN', 'N', 'TN', 'T', 'TB'];
  return dirs[Math.round(az / 45) % 8];
}
