import { DEG2RAD, getLocalSiderealTimeDeg, RAD2DEG } from '../astro/time.js';

/**
 * Horizontal coordinate conversion and atmospheric refraction.
 */

export function applyAtmosphericRefraction(trueAltDeg) {
  if (trueAltDeg < -1.5) return trueAltDeg;
  const rArcMin = 1.02 / Math.tan((trueAltDeg + 10.3 / (trueAltDeg + 5.11)) * DEG2RAD);
  return trueAltDeg + rArcMin / 60.0;
}

// Convert Equatorial (RA in hours, Dec in deg) to Horizontal (Apparent Altitude & Azimuth from True North)
export function equatorialToHorizontal(jd, latDeg, lonDeg, raHours, decDeg) {
  const lstDeg = getLocalSiderealTimeDeg(jd, lonDeg);
  const raDeg = raHours * 15.0;
  let haDeg = (lstDeg - raDeg + 360) % 360;
  if (haDeg > 180) haDeg -= 360;

  const haRad = haDeg * DEG2RAD;
  const latRad = latDeg * DEG2RAD;
  const decRad = decDeg * DEG2RAD;

  const sinAlt = Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const trueAltDeg = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * RAD2DEG;
  const apparentAltDeg = applyAtmosphericRefraction(trueAltDeg);

  const y = -Math.sin(haRad);
  const x = Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(haRad);
  let azDeg = Math.atan2(y, x) * RAD2DEG;
  if (azDeg < 0) azDeg += 360;

  return {
    trueAltitude: trueAltDeg,
    altitude: apparentAltDeg,
    azimuth: azDeg
  };
}

