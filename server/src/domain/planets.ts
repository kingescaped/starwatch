import { equatorialToHorizontal } from './coordinates.ts';
import { DEGREES_TO_RADIANS, getJulianDate, normalizeDegrees, RADIANS_TO_DEGREES } from './time.ts';

interface OrbitalElements {
  N0: number; N1: number; i0: number; i1: number;
  w0: number; w1: number; a: number; e0: number; e1: number; M0: number; M1: number;
}

const PLANETS: Record<string, OrbitalElements> = {
  venus: { N0: 76.6799, N1: 2.4659e-5, i0: 3.3946, i1: 2.75e-8, w0: 54.891, w1: 1.38374e-5, a: 0.72333, e0: 0.006773, e1: -1.302e-9, M0: 48.0052, M1: 1.6021302244 },
  mars: { N0: 49.5574, N1: 2.11081e-5, i0: 1.8497, i1: -1.78e-8, w0: 286.5016, w1: 2.92961e-5, a: 1.523688, e0: 0.093405, e1: 2.516e-9, M0: 18.6021, M1: 0.5240207766 },
  jupiter: { N0: 100.4542, N1: 2.76854e-5, i0: 1.303, i1: -1.557e-7, w0: 273.8777, w1: 1.64505e-5, a: 5.20256, e0: 0.048498, e1: 4.469e-9, M0: 19.895, M1: 0.0830853001 },
  saturn: { N0: 113.6634, N1: 2.3898e-5, i0: 2.4886, i1: -1.081e-7, w0: 339.3939, w1: 2.97661e-5, a: 9.55475, e0: 0.055546, e1: -9.499e-9, M0: 316.967, M1: 0.0334442282 },
};

export function isPlanetId(id: string): boolean {
  return id in PLANETS;
}

export function getPlanetEquatorial(date: Date, planetId: string): { raHours: number; decDeg: number } | null {
  const p = PLANETS[planetId];
  if (!p) return null;
  const d = getJulianDate(date) - 2_451_545.0;

  const wSun = normalizeDegrees(282.9404 + 4.70935e-5 * d) * DEGREES_TO_RADIANS;
  const eSun = 0.016709 - 1.151e-9 * d;
  const mSun = normalizeDegrees(356.047 + 0.9856002585 * d) * DEGREES_TO_RADIANS;
  const eSunAnom = mSun + eSun * Math.sin(mSun) * (1 + eSun * Math.cos(mSun));
  const lSun = Math.atan2(Math.sin(eSunAnom) * Math.sqrt(1 - eSun * eSun), Math.cos(eSunAnom) - eSun) + wSun;
  const xe = -Math.cos(lSun);
  const ye = -Math.sin(lSun);

  const nRad = normalizeDegrees(p.N0 + p.N1 * d) * DEGREES_TO_RADIANS;
  const iRad = normalizeDegrees(p.i0 + p.i1 * d) * DEGREES_TO_RADIANS;
  const wRad = normalizeDegrees(p.w0 + p.w1 * d) * DEGREES_TO_RADIANS;
  const e = p.e0 + p.e1 * d;
  const mRad = normalizeDegrees(p.M0 + p.M1 * d) * DEGREES_TO_RADIANS;
  let eAnom = mRad + e * Math.sin(mRad) * (1 + e * Math.cos(mRad));
  eAnom -= (eAnom - e * Math.sin(eAnom) - mRad) / (1 - e * Math.cos(eAnom));

  const xv = p.a * (Math.cos(eAnom) - e);
  const yv = p.a * Math.sqrt(1 - e * e) * Math.sin(eAnom);
  const r = Math.hypot(xv, yv);
  const u = Math.atan2(yv, xv) + wRad;
  const xh = r * (Math.cos(nRad) * Math.cos(u) - Math.sin(nRad) * Math.sin(u) * Math.cos(iRad));
  const yh = r * (Math.sin(nRad) * Math.cos(u) + Math.cos(nRad) * Math.sin(u) * Math.cos(iRad));
  const zh = r * (Math.sin(u) * Math.sin(iRad));

  const xg = xh + xe;
  const yg = yh + ye;
  const eclObliq = 23.4393 * DEGREES_TO_RADIANS;
  const xeq = xg;
  const yeq = yg * Math.cos(eclObliq) - zh * Math.sin(eclObliq);
  const zeq = yg * Math.sin(eclObliq) + zh * Math.cos(eclObliq);

  const raHours = normalizeDegrees(Math.atan2(yeq, xeq) * RADIANS_TO_DEGREES) / 15;
  const decDeg = Math.atan2(zeq, Math.hypot(xeq, yeq)) * RADIANS_TO_DEGREES;
  return { raHours, decDeg };
}

export function getPlanetHorizontal(date: Date, lat: number, lng: number, planetId: string) {
  const eq = getPlanetEquatorial(date, planetId);
  if (!eq) return null;
  return {
    ...eq,
    ...equatorialToHorizontal(getJulianDate(date), lat, lng, eq.raHours, eq.decDeg),
  };
}
