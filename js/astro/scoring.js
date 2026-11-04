import { getCelestialTargetPosition } from '../astro/ephemeris.js';
import { getMoonPosition, getSunPosition } from '../astro/sun-moon.js';
import { makeVietnamDate } from '../astro/time.js';
import { state } from '../core/state.js';

/**
 * Photography scoring engine (Milky Way, afterglow, cloud sea).
 */

export function computePhotographyScores(spot, dateStr, minutesOfDay, hourWeather) {
  const dt = makeVietnamDate(dateStr, minutesOfDay);
  const sun = getSunPosition(dt, spot.lat, spot.lon);
  const moon = getMoonPosition(dt, spot.lat, spot.lon);
  const target = getCelestialTargetPosition(dt, spot.lat, spot.lon, state.selectedTargetKey);

  const w = hourWeather || {
    temp: 17, humidity: 88, dewPoint: 15.2,
    cloudTotal: 18, cloudLow: 22, cloudMid: 15, cloudHigh: 35,
    visibilityKm: 18, windKmh: 7, precipProb: 10
  };

  // --- 1. MILKY WAY / DARK SKY SCORE ---
  let mwScore = 100;
  // Cloud cover penalty
  mwScore -= w.cloudTotal * 0.72;
  // Bortle light pollution penalty (Bortle 1-3 ideal, >5 heavy penalty)
  mwScore -= Math.max(0, (spot.bortle - 2.2) * 8.5);
  // Moon interference if Moon is above horizon
  if (moon.altitude > -2) {
    const moonFactor = (moon.illuminationPct / 100) * Math.min(1, (moon.altitude + 5) / 35);
    mwScore -= moonFactor * 48;
  }
  // Sun altitude check (if daytime or bright twilight, evaluate tonight's peak dark window or current hour)
  const isNightNow = sun.trueAltitude <= -12;
  if (!isNightNow) {
    // Still show potential based on sky clarity & Bortle, with small daytime indicator
    mwScore -= 8;
  }
  // Target altitude bonus/penalty
  if (target.altitude > 15) mwScore += 6;
  else if (target.altitude < 0 && isNightNow) mwScore -= 18;

  mwScore = Math.max(5, Math.min(99, Math.round(mwScore)));

  // --- 2. RÁNG BÌNH MINH / HOÀNG HÔN (AFTERGLOW SCORE) ---
  // Best afterglow requires 30%-75% high/mid clouds to scatter red/gold light, and low cloudLow (<35%) so horizon isn't blocked!
  const highMidAvg = (w.cloudHigh * 0.6 + w.cloudMid * 0.4);
  let cloudCanopyScore = 45;
  if (highMidAvg >= 25 && highMidAvg <= 75) {
    cloudCanopyScore = 95 - Math.abs(highMidAvg - 50) * 0.6;
  } else if (highMidAvg < 25) {
    cloudCanopyScore = 55 + highMidAvg * 1.2; // Clear golden sky, less dramatic cloud fire
  } else {
    cloudCanopyScore = Math.max(20, 85 - (highMidAvg - 75) * 2.2);
  }

  let afterglowScore = cloudCanopyScore;
  // Low cloud blocking horizon penalty
  if (w.cloudLow > 40) afterglowScore -= (w.cloudLow - 40) * 0.65;
  // Rain penalty
  afterglowScore -= w.precipProb * 0.35;
  // Visibility bonus
  if (w.visibilityKm >= 15) afterglowScore += 5;

  afterglowScore = Math.max(10, Math.min(98, Math.round(afterglowScore)));

  // --- 3. SĂN BIỂN MÂY (CLOUD SEA SCORE) ---
  // Lifted Condensation Level (LCL cloud base in meters) = 125 * (Temp - DewPoint)
  const dewSpread = Math.max(0.2, w.temp - w.dewPoint);
  const lclCloudBaseMeters = Math.round(spot.elevation * 0.45 + 125 * dewSpread);

  let cloudSeaScore = 25;
  if (spot.elevation >= 500) {
    // Elevation advantage over valley cloud base
    if (spot.elevation > lclCloudBaseMeters) {
      cloudSeaScore += 32;
    } else {
      cloudSeaScore += 14;
    }
    // High relative humidity (82% - 98%) fuels valley condensation
    if (w.humidity >= 82) cloudSeaScore += Math.min(24, (w.humidity - 75) * 1.1);
    // Low wind (< 14 km/h) keeps cloud sea stable & unbroken
    if (w.windKmh <= 12) cloudSeaScore += 14;
    else if (w.windKmh > 20) cloudSeaScore -= 18;
    // Ideal when low clouds are present in valley (35-85%) while mid/high clouds are clearer
    if (w.cloudLow >= 30 && w.cloudLow <= 88) cloudSeaScore += 10;
    if (w.cloudHigh > 85 && w.cloudMid > 85) cloudSeaScore -= 12;
  } else {
    // Coastal / Lowland spot: low cloud sea score, evaluates coastal mist
    cloudSeaScore = Math.round(18 + (w.humidity > 88 ? 15 : 0) + (w.windKmh < 10 ? 8 : 0));
  }

  cloudSeaScore = Math.max(8, Math.min(98, Math.round(cloudSeaScore)));

  return {
    mwScore,
    afterglowScore,
    cloudSeaScore,
    lclCloudBaseMeters,
    dewSpread: Number(dewSpread.toFixed(1)),
    sun,
    moon,
    target
  };
}
