import type { DailyAstroEvent, GoldenWindowItem, HourlyForecast, TonightSlot } from '../state/types';

export const HOURLY_FORECAST: HourlyForecast[] = [
  { hour: '18:00', highCloud: 18, midCloud: 12, lowCloud: 22, tempC: 16, dewC: 11, deltaT: 5.2, windKmh: 7, targetAlt: 8, moonAlt: 51, sunAlt: -5.4, phaseLabel: 'Chập tối dân dụng' },
  { hour: '19:00', highCloud: 15, midCloud: 10, lowCloud: 18, tempC: 15, dewC: 11, deltaT: 4.3, windKmh: 8, targetAlt: 16, moonAlt: 39, sunAlt: -18.2, phaseLabel: 'Ráng chiều' },
  { hour: '20:00', highCloud: 12, midCloud: 8, lowCloud: 15, tempC: 14, dewC: 10, deltaT: 3.8, windKmh: 8, targetAlt: 25, moonAlt: 26, sunAlt: -30.5, phaseLabel: 'Đêm thiên văn' },
  { hour: '21:00', highCloud: 10, midCloud: 6, lowCloud: 12, tempC: 14, dewC: 10, deltaT: 3.4, windKmh: 8, targetAlt: 34.8, moonAlt: 14.6, sunAlt: -42.5, phaseLabel: 'Đêm thiên văn' },
  { hour: '22:00', highCloud: 8, midCloud: 5, lowCloud: 14, tempC: 13, dewC: 10, deltaT: 3.0, windKmh: 9, targetAlt: 44, moonAlt: 4, sunAlt: -54.1, phaseLabel: 'Đêm thiên văn' },
  { hour: '23:00', highCloud: 12, midCloud: 8, lowCloud: 18, tempC: 12, dewC: 10, deltaT: 2.6, windKmh: 9, targetAlt: 53, moonAlt: -8, sunAlt: -63.0, phaseLabel: 'Đêm thiên văn' },
  { hour: '00:00', highCloud: 16, midCloud: 14, lowCloud: 28, tempC: 12, dewC: 9, deltaT: 2.4, windKmh: 10, targetAlt: 61, moonAlt: -19, sunAlt: -68.4, phaseLabel: 'Đỉnh Ngân Hà' },
  { hour: '01:00', highCloud: 24, midCloud: 20, lowCloud: 36, tempC: 11, dewC: 9, deltaT: 2.1, windKmh: 11, targetAlt: 64, moonAlt: -29, sunAlt: -65.2, phaseLabel: 'Đỉnh Ngân Hà' },
  { hour: '02:00', highCloud: 30, midCloud: 28, lowCloud: 48, tempC: 11, dewC: 9, deltaT: 1.8, windKmh: 12, targetAlt: 58, moonAlt: -38, sunAlt: -55.0, phaseLabel: 'Đêm sâu' },
  { hour: '03:00', highCloud: 42, midCloud: 35, lowCloud: 64, tempC: 10, dewC: 9, deltaT: 1.5, windKmh: 13, targetAlt: 47, moonAlt: -44, sunAlt: -41.8, phaseLabel: 'Trước rạng sáng' },
  { hour: '04:00', highCloud: 58, midCloud: 46, lowCloud: 78, tempC: 10, dewC: 9, deltaT: 1.4, windKmh: 10, targetAlt: 33, moonAlt: -46, sunAlt: -27.5, phaseLabel: 'Biển mây sớm' },
  { hour: '05:00', highCloud: 68, midCloud: 52, lowCloud: 88, tempC: 10, dewC: 8, deltaT: 1.4, windKmh: 8, targetAlt: 20, moonAlt: -41, sunAlt: -13.0, phaseLabel: 'Rạng sáng' },
  { hour: '06:00', highCloud: 72, midCloud: 60, lowCloud: 92, tempC: 10, dewC: 9, deltaT: 1.9, windKmh: 7, targetAlt: 9, moonAlt: -32, sunAlt: 2.4, phaseLabel: 'Bình minh' },
];

export const DAILY_ASTRO_EVENTS: DailyAstroEvent[] = [
  { id: 'dawn-18', label: 'Rạng sáng -18°', subLabel: 'Bình minh thiên văn', time: '04:36', tone: 'violet' },
  { id: 'sunrise', label: 'Mặt Trời mọc', subLabel: 'Chân trời Đông', time: '05:54', tone: 'amber' },
  { id: 'sunset', label: 'Mặt Trời lặn', subLabel: 'Hoàng hôn · Chân trời Tây', time: '17:38', tone: 'amber' },
  { id: 'dusk-18', label: 'Chập tối -18°', subLabel: 'Bắt đầu đêm thiên văn', time: '18:56', tone: 'cyan' },
];

export const GOLDEN_WINDOWS: GoldenWindowItem[] = [
  {
    id: 'golden-evening',
    title: 'Giờ Vàng & Ráng Chiều',
    subtitle: 'Mây cao 38% · Hướng Tây WNW',
    timeRange: '17:45 - 18:25',
    score: 76,
    tone: 'amber',
  },
  {
    id: 'blue-hour',
    title: 'Giờ Xanh (Blue Hour)',
    subtitle: 'Tỷ lệ tương phản trời / núi tối ưu',
    timeRange: '18:25 - 19:05',
    score: 82,
    tone: 'cyan',
  },
  {
    id: 'astro-night',
    title: 'Đêm Thiên Văn (-18°)',
    subtitle: 'Trời tối sâu chuẩn Bortle 3.5',
    timeRange: '21:00 - 04:36',
    score: 91,
    tone: 'violet',
  },
  {
    id: 'cloud-sea-dawn',
    title: 'Biển Mây Bình Minh',
    subtitle: 'Mây thấp 78% tại thung lũng · Gió 8 km/h',
    timeRange: '05:00 - 06:15',
    score: 92,
    tone: 'emerald',
  },
];

export const TONIGHT_SLOTS: TonightSlot[] = [
  { time: '20:00', score: 72, label: 'Trời trong', icon: 'sparkles', tone: 'violet' },
  { time: '22:00', score: 86, label: 'Ngân Hà lên', icon: 'sparkles', tone: 'cyan' },
  { time: '00:00', score: 94, label: 'Đẹp nhất', icon: 'sparkles', tone: 'cyan', featured: true },
  { time: '02:00', score: 88, label: 'Ít ánh trăng', icon: 'sparkles', tone: 'violet' },
  { time: '04:00', score: 79, label: 'Mây nhẹ', icon: 'sparkles', tone: 'violet' },
  { time: '05:30', score: 92, label: 'Bình minh', icon: 'cloud', tone: 'amber' },
];

export function countDewAlertHours(forecast: HourlyForecast[], threshold: number): {
  hours: HourlyForecast[];
  minDelta: number;
  minHour: string;
} {
  const hours = forecast.filter((item) => item.deltaT <= threshold);
  const lowest = forecast.reduce((acc, cur) => (cur.deltaT < acc.deltaT ? cur : acc), forecast[0]);
  return {
    hours,
    minDelta: lowest.deltaT,
    minHour: lowest.hour,
  };
}
