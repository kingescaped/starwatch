import type { DeviceType, FocalLength, ShootingMode } from '../state/types';

export interface AstroAdvisorMetrics {
  npfSeconds: number;
  adjustedShutterSeconds: number;
  rule500Seconds: number;
  pixelPitchUm: number;
  effectiveBortle: number;
  targetDecDeg: number;
  moonIllum: number;
  moonAboveHorizon: boolean;
  windKmh: number;
  windPenaltyPct: number;
}

export interface AstroSetupSpec {
  shutterTitle: string;
  shutterValue: string;
  shutterHint: string;
  apertureTitle: string;
  apertureValue: string;
  apertureHint: string;
  isoTitle: string;
  isoValue: string;
  isoHint: string;
  wbTitle: string;
  wbValue: string;
  wbHint: string;
  checklist: string[];
  metrics?: AstroAdvisorMetrics;
}

const FOCAL_SHUTTER_MAP: Record<string, string> = {
  '14mm': '13s · Quy tắc NPF/500',
  '20mm': '10s · Quy tắc NPF/500',
  '24mm': '8s · Quy tắc NPF/500',
  '35mm': '5s · Quy tắc NPF/500',
};

export function computeAstroSetup(
  mode: ShootingMode,
  device: DeviceType,
  focalLength: FocalLength,
  bortle: number
): AstroSetupSpec {
  if (device === 'phone') {
    return {
      shutterTitle: 'TỐC ĐỘ MÀN TRẬP',
      shutterValue: mode === 'moon' ? '1/250s · ProRAW' : '25s · Night/Astro Mode',
      shutterHint: 'Gắn điện thoại lên tripod cố định 100%',
      apertureTitle: 'KHẨU ĐỘ ỐNG KÍNH',
      apertureValue: 'f/1.78 (Chính 1x)',
      apertureHint: 'Ưu tiên ống kính chính 24mm ít nhiễu',
      isoTitle: 'ĐỘ NHẠY SÁNG',
      isoValue: mode === 'moon' ? 'ISO 100' : 'ISO 1600',
      isoHint: 'Chụp ProRAW/DNG 12-bit để kéo chi tiết',
      wbTitle: 'CÂN BẰNG TRẮNG',
      wbValue: '4000K',
      wbHint: 'Khử ám vàng đô thị nhẹ ở chân trời',
      checklist: [
        'Cố định tripod tránh rung gió',
        'Khóa nét vô cực AE/AF Lock',
        'Hẹn giờ chụp 3s · Bật RAW/DNG',
      ],
    };
  }

  if (mode === 'nebula') {
    return {
      shutterTitle: 'TỐC ĐỘ MÀN TRẬP',
      shutterValue: '60s · Star Tracker',
      shutterHint: `Theo dõi trục xích đạo · ${focalLength}`,
      apertureTitle: 'KHẨU ĐỘ ỐNG KÍNH',
      apertureValue: 'f/2.0',
      apertureHint: 'Khép 1/3 stop cho sao góc ảnh sắc nét',
      isoTitle: 'ĐỘ NHẠY SÁNG',
      isoValue: 'ISO 1600',
      isoHint: 'Chụp tối thiểu 30–60 frame để stack',
      wbTitle: 'CÂN BẰNG TRẮNG',
      wbValue: '4300K',
      wbHint: 'Tái tạo chuẩn dải H-alpha hồng tím',
      checklist: [
        'Cân cực Bắc Polaris chuẩn xác',
        'Chụp thêm 15 Dark & 20 Flat frames',
        'Bật Dew Heater suốt phiên phơi sáng',
      ],
    };
  }

  if (mode === 'meteor') {
    return {
      shutterTitle: 'TỐC ĐỘ MÀN TRẬP',
      shutterValue: '15s · Interval 1s',
      shutterHint: `Chụp liên tục không nghỉ trên ${focalLength} FF`,
      apertureTitle: 'KHẨU ĐỘ ỐNG KÍNH',
      apertureValue: 'f/1.4 – f/1.8',
      apertureHint: 'Mở tối đa để bắt sao băng mờ nhanh',
      isoTitle: 'ĐỘ NHẠY SÁNG',
      isoValue: 'ISO 6400',
      isoHint: 'Ưu tiên bắt vệt sao băng mảnh tức thời',
      wbTitle: 'CÂN BẰNG TRẮNG',
      wbValue: '4100K',
      wbHint: 'Giữ màu vệt ion xanh ngọc tự nhiên',
      checklist: [
        'Hướng tâm ngắm cách Radiant 40°',
        'Dùng pin dự phòng Dummy Battery',
        'Bật Dew Heater tránh mờ sương',
      ],
    };
  }

  if (mode === 'moon') {
    return {
      shutterTitle: 'TỐC ĐỘ MÀN TRẬP',
      shutterValue: '1/320s · Sunny 11',
      shutterHint: 'Chống nhòe do Mặt Trăng di chuyển nhanh',
      apertureTitle: 'KHẨU ĐỘ ỐNG KÍNH',
      apertureValue: 'f/8.0',
      apertureHint: 'Điểm ngọt sắc nét cho miệng núi lửa',
      isoTitle: 'ĐỘ NHẠY SÁNG',
      isoValue: 'ISO 100',
      isoHint: 'Dải tương phản động cao nhất',
      wbTitle: 'CÂN BẰNG TRẮNG',
      wbValue: '5200K',
      wbHint: 'Màu bề mặt xám bạc trung tính',
      checklist: [
        'Tắt chống rung trên tripod',
        'Dùng màn trập điện tử hoàn toàn',
        'Chụp 20 tấm lấy nét chuẩn rồi stack',
      ],
    };
  }

  if (mode === 'cloudSea') {
    return {
      shutterTitle: 'TỐC ĐỘ MÀN TRẬP',
      shutterValue: '1/4s – 2s · ND Filter',
      shutterHint: 'Làm mượt sóng mây trôi qua thung lũng',
      apertureTitle: 'KHẨU ĐỘ ỐNG KÍNH',
      apertureValue: 'f/8.0 – f/11',
      apertureHint: 'Nét sâu từ tiền cảnh núi đến chân trời',
      isoTitle: 'ĐỘ NHẠY SÁNG',
      isoValue: 'ISO 100',
      isoHint: 'Giữ chi tiết vùng sáng mặt trời mọc',
      wbTitle: 'CÂN BẰNG TRẮNG',
      wbValue: '5600K',
      wbHint: 'Tôn sắc vàng cam tia nắng bình minh',
      checklist: [
        'Lắp filter GND 0.9 cân bằng bầu trời',
        'Chụp bracketing ±1.3 EV',
        'Theo dõi hướng gió lùa trên sống núi',
      ],
    };
  }

  const bortleIso = bortle <= 2.5 ? 'ISO 3200' : bortle <= 4 ? 'ISO 3200' : 'ISO 1600';
  const mm = Math.max(4, parseInt(focalLength, 10) || 14);
  const fallbackNpf = Math.max(2, Math.min(30, Math.round(182 / mm)));
  return {
    shutterTitle: 'TỐC ĐỘ MÀN TRẬP',
    shutterValue: FOCAL_SHUTTER_MAP[focalLength] ?? `${fallbackNpf}s · Quy tắc NPF/500`,
    shutterHint: `Chống vệt sao trên ${focalLength} FF`,
    apertureTitle: 'KHẨU ĐỘ ỐNG KÍNH',
    apertureValue: 'f/1.8',
    apertureHint: 'Mở tối đa · giảm coma nhẹ f/2.0',
    isoTitle: 'ĐỘ NHẠY SÁNG',
    isoValue: bortleIso,
    isoHint: 'Dual Native ISO · ít nhiễu vùng tối',
    wbTitle: 'CÂN BẰNG TRẮNG',
    wbValue: '3900K',
    wbHint: 'Giữ màu lõi Ngân Hà tự nhiên',
    checklist: [
      'Tắt IBIS/OSS trên tripod',
      'Live View 10× lấy nét vô cực vào sao sáng',
      'Hẹn giờ 2s · RAW 14-bit · Bật Dew Heater sau 00:00',
    ],
  };
}
