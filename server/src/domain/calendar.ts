import { getMoonPosition } from './sunMoon.ts';
import { computeTargetHoriz } from './ephemeris.ts';
import { localDateTimeToUtc } from './time.ts';

const WEEKDAYS = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const METEOR_PEAKS: Record<string, { eventTitle: string; zhr: string; radiant: string }> = {
  '1-3': { eventTitle: 'CỰC ĐẠI SAO BĂNG QUADRANTIDS', zhr: '80-120 sao/giờ', radiant: 'Chòm Mục Phu · 045° NE' },
  '4-22': { eventTitle: 'CỰC ĐẠI SAO BĂNG LYRIDS', zhr: '15-20 sao/giờ', radiant: 'Chòm Thiên Cầm · 062° ENE' },
  '5-6': { eventTitle: 'CỰC ĐẠI ETA AQUARIIDS', zhr: '40-50 sao/giờ', radiant: 'Chòm Bảo Bình · 108° ESE' },
  '7-30': { eventTitle: 'CỰC ĐẠI DELTA AQUARIIDS', zhr: '20-25 sao/giờ', radiant: 'Chòm Bảo Bình · 142° SE' },
  '8-12': { eventTitle: 'CỰC ĐẠI SAO BĂNG PERSEIDS', zhr: '60-100 sao/giờ', radiant: 'Chòm Anh Tiên · 048° NE' },
  '10-21': { eventTitle: 'CỰC ĐẠI SAO BĂNG ORIONIDS', zhr: '20-25 sao/giờ', radiant: 'Chòm Lạp Hộ · 096° E' },
  '11-17': { eventTitle: 'TIỀN CỰC ĐẠI LEONIDS', zhr: '10-15 sao/giờ', radiant: 'Chòm Sư Tử · 078° ENE' },
  '11-18': { eventTitle: 'CỰC ĐẠI SAO BĂNG LEONIDS', zhr: '15-20 sao/giờ', radiant: 'Chòm Sư Tử · 078° ENE' },
  '12-14': { eventTitle: 'CỰC ĐẠI SAO BĂNG GEMINIDS', zhr: '120 sao/giờ', radiant: 'Chòm Song Tử · 065° ENE' },
};

export function buildMonthlyCalendar(year: number, month: number, lat: number, lng: number, bortle: number) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = [];
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dt = new Date(Date.UTC(year, month - 1, dayNum));
    const iso = dt.toISOString().slice(0, 10);
    const instant = localDateTimeToUtc(iso, 23 * 60 + 30, 'Asia/Ho_Chi_Minh');
    const moon = getMoonPosition(instant, lat, lng);
    const target = computeTargetHoriz(instant, lat, lng, 'galactic_center');
    const weekday = WEEKDAYS[dt.getUTCDay()];
    const meteor = METEOR_PEAKS[`${month}-${dayNum}`];
    const baseScore = 92 - moon.illuminationPercent * 0.45 - Math.max(0, bortle - 2) * 3.5 + Math.max(0, target.altitudeDegrees) * 0.12;
    const milkyWayScore = Math.round(Math.max(25, Math.min(98, meteor ? Math.max(baseScore, 86) : baseScore)));

    days.push({
      day: dayNum,
      weekday,
      dateLabel: `${String(dayNum).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`,
      moonPercent: moon.illuminationPercent,
      milkyWayScore,
      ...(meteor
        ? {
            isMeteorPeak: true,
            eventTitle: meteor.eventTitle,
            zhr: meteor.zhr,
            radiant: meteor.radiant,
            moonDetail: `Trăng ${moon.illuminationPercent}% (${moon.phaseName})`,
            milkyWayWindow: '21:00 - 04:00',
          }
        : {}),
    });
  }
  return days;
}
