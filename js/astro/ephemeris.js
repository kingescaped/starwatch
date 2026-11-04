import { equatorialToHorizontal } from '../astro/coordinates.js';
import { getSunPosition } from '../astro/sun-moon.js';
import { getJulianDate, makeVietnamDate } from '../astro/time.js';
import { CELESTIAL_CATALOG } from '../data/celestial.js';

/**
 * Daily ephemeris summary for the selected celestial target.
 */

export function getCelestialTargetPosition(dateObj, latDeg, lonDeg, targetKey) {
  const target = CELESTIAL_CATALOG[targetKey] || CELESTIAL_CATALOG.galactic_center;
  const jd = getJulianDate(dateObj);
  const horiz = equatorialToHorizontal(jd, latDeg, lonDeg, target.raHours, target.decDeg);
  return {
    ...horiz,
    ...target
  };
}

// Scan 24 hours of the selected date (every 10 mins) to find exact Sunrise, Sunset, Astronomical Twilight, and Target Peak
export function computeDailyEphemerisSummary(dateStr, latDeg, lonDeg, targetKey) {
  let sunriseMin = null;
  let sunsetMin = null;
  let astroDawnMin = null;
  let astroDuskMin = null;
  let targetRiseMin = null;
  let targetSetMin = null;
  let targetPeakMin = 0;
  let targetPeakAlt = -90;

  let prevSunAlt = null;
  let prevTargetAlt = null;

  for (let m = 0; m <= 1440; m += 10) {
    const dt = makeVietnamDate(dateStr, m);
    const sun = getSunPosition(dt, latDeg, lonDeg);
    const target = getCelestialTargetPosition(dt, latDeg, lonDeg, targetKey);

    if (prevSunAlt !== null) {
      // Sunrise / Sunset (-0.833 deg)
      if (prevSunAlt < -0.833 && sun.trueAltitude >= -0.833 && sunriseMin === null) sunriseMin = m - 5;
      if (prevSunAlt >= -0.833 && sun.trueAltitude < -0.833 && sunsetMin === null) sunsetMin = m - 5;
      // Astronomical Twilight (-18 deg)
      if (prevSunAlt < -18 && sun.trueAltitude >= -18 && astroDawnMin === null) astroDawnMin = m - 5;
      if (prevSunAlt >= -18 && sun.trueAltitude < -18 && astroDuskMin === null) astroDuskMin = m - 5;
    }

    if (prevTargetAlt !== null) {
      if (prevTargetAlt < 0 && target.altitude >= 0 && targetRiseMin === null) targetRiseMin = m - 5;
      if (prevTargetAlt >= 0 && target.altitude < 0 && targetSetMin === null) targetSetMin = m - 5;
    }

    // Prefer highest target altitude during night hours, or overall peak if none at night
    if (sun.trueAltitude < -12 && target.altitude > targetPeakAlt) {
      targetPeakAlt = target.altitude;
      targetPeakMin = m;
    }

    prevSunAlt = sun.trueAltitude;
    prevTargetAlt = target.altitude;
  }

  // If target didn't peak during night, find overall peak
  if (targetPeakAlt <= -85) {
    for (let m = 0; m <= 1440; m += 15) {
      const dt = makeVietnamDate(dateStr, m);
      const target = getCelestialTargetPosition(dt, latDeg, lonDeg, targetKey);
      if (target.altitude > targetPeakAlt) {
        targetPeakAlt = target.altitude;
        targetPeakMin = m;
      }
    }
  }

  return {
    sunriseMin: sunriseMin ?? 355,
    sunsetMin: sunsetMin ?? 1060,
    astroDawnMin: astroDawnMin ?? 275,
    astroDuskMin: astroDuskMin ?? 1140,
    targetRiseMin,
    targetSetMin,
    targetPeakMin,
    targetPeakAlt
  };
}
