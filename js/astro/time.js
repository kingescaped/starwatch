/**
 * Time, Julian date and sidereal time helpers.
 */

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

// Create a Date object representing a specific YYYY-MM-DD and minute-of-day in GMT+7 (Vietnam)
export function makeVietnamDate(dateStr, totalMinutes) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const hh = Math.floor(totalMinutes / 60);
  const mm = Math.floor(totalMinutes % 60);
  // Construct UTC timestamp by subtracting 7 hours from Vietnam local time
  const utcMs = Date.UTC(y, m - 1, d, hh - 7, mm, 0);
  return new Date(utcMs);
}

export function formatHHMM(totalMinutes) {
  if (totalMinutes === null || isNaN(totalMinutes)) return '--:--';
  const norm = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(norm / 60)).padStart(2, '0');
  const mm = String(norm % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function getJulianDate(dateObj) {
  return dateObj.getTime() / 86400000 + 2440587.5;
}

// Local Sidereal Time in degrees (0..360)
export function getLocalSiderealTimeDeg(jd, lonDeg) {
  const d = jd - 2451545.0;
  let gmst = 280.46061837 + 360.98564736629 * d;
  let lst = (gmst + lonDeg) % 360;
  if (lst < 0) lst += 360;
  return lst;
}


export function getCurrentVietnamDateTime() {
  const nowVN = new Date(Date.now() + 7 * 3600000);
  return {
    dateStr: nowVN.toISOString().split('T')[0],
    minutes: nowVN.getUTCHours() * 60 + nowVN.getUTCMinutes()
  };
}
