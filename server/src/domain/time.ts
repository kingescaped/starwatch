export const DEGREES_TO_RADIANS = Math.PI / 180;
export const RADIANS_TO_DEGREES = 180 / Math.PI;

export function localDateTimeToUtc(date: string, minuteOfDay: number, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const localAsUtc = Date.UTC(year, (month || 1) - 1, day || 1, hour, minute);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(localAsUtc));
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const clockAsUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute)
  );
  return new Date(localAsUtc - (clockAsUtc - localAsUtc));
}

export function getJulianDate(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5;
}

export function getLocalSiderealTimeDegrees(julianDate: number, longitude: number): number {
  const daysSinceJ2000 = julianDate - 2_451_545;
  const greenwich = 280.46061837 + 360.98564736629 * daysSinceJ2000;
  return normalizeDegrees(greenwich + longitude);
}

export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function formatHourMinute(totalMinutes: number): string {
  const wrapped = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  const h = String(Math.floor(wrapped / 60)).padStart(2, '0');
  const m = String(wrapped % 60).padStart(2, '0');
  return `${h}:${m}`;
}
