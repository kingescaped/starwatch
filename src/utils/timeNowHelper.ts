export const DESKTOP_TIMELINE_TICKS = [
  { label: '17:38 Lặn', idx: 0 },
  { label: '19:00 Ráng', idx: 1 },
  { label: '21:00', idx: 3 },
  { label: '00:00', idx: 6 },
  { label: '01:30 Đỉnh', idx: 7 },
  { label: '04:36 Rạng', idx: 10 },
  { label: '05:54 Mọc', idx: 12 },
];

export const MOBILE_TIMELINE_TICKS = [
  { label: '18:00', idx: 0 },
  { label: '21:00', idx: 3 },
  { label: '00:00', idx: 6 },
  { label: '03:00', idx: 9 },
  { label: '06:00', idx: 12 },
];

export const QUICK_TIME_PRESETS = [
  { label: '19:00 Ráng chiều', idx: 1 },
  { label: '21:00 Đêm thiên văn', idx: 3 },
  { label: '01:30 Đỉnh Ngân Hà', idx: 7 },
];

export const DESKTOP_SPEED_OPTIONS: { value: '10m' | '60m'; label: string }[] = [
  { value: '10m', label: '10 phút/giây' },
  { value: '60m', label: '60 phút/giây' },
];

export const MOBILE_SPEED_OPTIONS: { value: '10m' | '60m'; label: string }[] = [
  { value: '10m', label: '10 phút' },
  { value: '60m', label: '60 phút' },
];

export function resolveCurrentNightHourIndex(now: Date, forecastHours: string[]): number {
  const hour = now.getHours();
  if (hour >= 7 && hour < 18) return 0;
  const label = `${String(hour).padStart(2, '0')}:00`;
  const idx = forecastHours.indexOf(label);
  return idx >= 0 ? idx : 0;
}

export function formatCurrentDateParts(now: Date): {
  year: number;
  month: number;
  day: number;
  dateLabel: string;
} {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dateLabel = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  return { year, month, day, dateLabel };
}
