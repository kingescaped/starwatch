import type { CalendarDay } from '../state/types';

export const NOV_2026_CALENDAR: CalendarDay[] = [
  { day: 2, weekday: 'Thứ Hai', dateLabel: '02/11/2026', moonPercent: 48, milkyWayScore: 68 },
  { day: 3, weekday: 'Thứ Ba', dateLabel: '03/11/2026', moonPercent: 39, milkyWayScore: 72 },
  { day: 4, weekday: 'Thứ Tư', dateLabel: '04/11/2026', moonPercent: 31, milkyWayScore: 75 },
  { day: 5, weekday: 'Thứ Năm', dateLabel: '05/11/2026', moonPercent: 24, milkyWayScore: 78 },
  { day: 6, weekday: 'Thứ Sáu', dateLabel: '06/11/2026', moonPercent: 18, milkyWayScore: 81 },
  { day: 7, weekday: 'Thứ Bảy', dateLabel: '07/11/2026', moonPercent: 12, milkyWayScore: 85 },
  { day: 8, weekday: 'Chủ Nhật', dateLabel: '08/11/2026', moonPercent: 8, milkyWayScore: 87 },
  { day: 9, weekday: 'Thứ Hai', dateLabel: '09/11/2026', moonPercent: 4, milkyWayScore: 90 },
  { day: 10, weekday: 'Thứ Ba', dateLabel: '10/11/2026', moonPercent: 2, milkyWayScore: 92 },
  { day: 11, weekday: 'Thứ Tư', dateLabel: '11/11/2026', moonPercent: 1, milkyWayScore: 94 },
  { day: 12, weekday: 'Thứ Năm', dateLabel: '12/11/2026', moonPercent: 3, milkyWayScore: 93 },
  { day: '13' as unknown as number, weekday: 'Thứ Sáu', dateLabel: '13/11/2026', moonPercent: 6, milkyWayScore: 91 }.day ? { day: 13, weekday: 'Thứ Sáu', dateLabel: '13/11/2026', moonPercent: 6, milkyWayScore: 91 } : { day: 13, weekday: 'Thứ Sáu', dateLabel: '13/11/2026', moonPercent: 6, milkyWayScore: 91 },
  { day: 14, weekday: 'Thứ Bảy', dateLabel: '14/11/2026', moonPercent: 10, milkyWayScore: 89 },
  { day: 15, weekday: 'Chủ Nhật', dateLabel: '15/11/2026', moonPercent: 12, milkyWayScore: 88 },
  { day: 16, weekday: 'Thứ Hai', dateLabel: '16/11/2026', moonPercent: 14, milkyWayScore: 89 },
  {
    day: 17,
    weekday: 'Thứ Ba',
    dateLabel: '17/11/2026',
    moonPercent: 16,
    milkyWayScore: 90,
    isMeteorPeak: true,
    eventTitle: 'TIỀN CỰC ĐẠI LEONIDS',
    zhr: '10-15 sao/giờ',
    radiant: 'Chòm Sư Tử · 078° ENE',
    moonDetail: '16% (Lặn 22:45)',
    milkyWayWindow: '20:45 - 03:20',
  },
  {
    day: 18,
    weekday: 'Thứ Tư',
    dateLabel: '18/11/2026',
    moonPercent: 18,
    milkyWayScore: 94,
    isMeteorPeak: true,
    eventTitle: 'CỰC ĐẠI SAO BĂNG LEONIDS',
    zhr: '15-20 sao/giờ',
    radiant: 'Chòm Sư Tử · 078° ENE',
    moonDetail: '18% (Lặn 23:30)',
    milkyWayWindow: '21:00 - 03:30',
  },
  { day: 19, weekday: 'Thứ Năm', dateLabel: '19/11/2026', moonPercent: 25, milkyWayScore: 88 },
  { day: 20, weekday: 'Thứ Sáu', dateLabel: '20/11/2026', moonPercent: 34, milkyWayScore: 82 },
  { day: 21, weekday: 'Thứ Bảy', dateLabel: '21/11/2026', moonPercent: 45, milkyWayScore: 76 },
  { day: 22, weekday: 'Chủ Nhật', dateLabel: '22/11/2026', moonPercent: 56, milkyWayScore: 70 },
  { day: 23, weekday: 'Thứ Hai', dateLabel: '23/11/2026', moonPercent: 67, milkyWayScore: 62 },
  { day: 24, weekday: 'Thứ Ba', dateLabel: '24/11/2026', moonPercent: 77, milkyWayScore: 55 },
  { day: 25, weekday: 'Thứ Tư', dateLabel: '25/11/2026', moonPercent: 85, milkyWayScore: 48 },
  { day: 26, weekday: 'Thứ Năm', dateLabel: '26/11/2026', moonPercent: 92, milkyWayScore: 42 },
  { day: 27, weekday: 'Thứ Sáu', dateLabel: '27/11/2026', moonPercent: 97, milkyWayScore: 36 },
  { day: 28, weekday: 'Thứ Bảy', dateLabel: '28/11/2026', moonPercent: 100, milkyWayScore: 32 },
  { day: 29, weekday: 'Chủ Nhật', dateLabel: '29/11/2026', moonPercent: 96, milkyWayScore: 38 },
];

export const CALENDAR_WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

export const MONTH_HIGHLIGHTS: Record<number, string> = {
  1: 'Mùa sao băng Quadrantids · Trời quang hanh',
  2: 'Cung Thiên Lang & Orion sáng rõ',
  3: 'Lõi Ngân Hà mọc dần về rạng sáng',
  4: 'Mưa sao băng Lyrids · Ngân Hà bình minh',
  5: 'Eta Aquariids & Mùa lõi Ngân Hà',
  6: 'Đỉnh mùa săn Dải Ngân Hà hướng Nam',
  7: 'Ngân Hà vắt ngang thiên đỉnh & Delta Aquariids',
  8: 'Cực đại Mưa sao băng Perseids rực rỡ',
  9: 'Ráng thu trong trẻo & Ngân Hà đầu tối',
  10: 'Mưa sao băng Orionids · Thiên hà M31',
  11: 'Mùa sao băng Leonids & Biển mây',
  12: 'Cực đại Geminids (120 vệt/giờ) · M31 / M42',
};

const FALLBACK_WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export function buildClientMonthFallback(year: number, month: number): CalendarDay[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const out: CalendarDay[] = [];
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dt = new Date(Date.UTC(year, month - 1, dayNum));
    const age = ((dt.getTime() / 86_400_000 + 2_440_587.5 - 2_451_550.1) % 29.53058867 + 29.53058867) % 29.53058867;
    const moonPercent = Math.round((1 - Math.cos((age / 29.53058867) * 2 * Math.PI)) * 50);
    const milkyWayScore = Math.max(30, Math.min(96, Math.round(92 - moonPercent * 0.45)));
    out.push({
      day: dayNum,
      weekday: FALLBACK_WEEKDAYS[dt.getUTCDay()],
      dateLabel: `${String(dayNum).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
      moonPercent,
      milkyWayScore,
    });
  }
  return out;
}
