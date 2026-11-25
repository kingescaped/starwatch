export type SensorType = 'fullFrame' | 'apsc' | 'm43' | 'phone';

export interface CameraGearInput {
  cameraName: string;
  sensorType: SensorType;
  megapixels: number;
  lensName: string;
  focalLengthMm: number;
  aperture: number;
  dualIso?: string;
}

export interface AdvisorInput {
  mode: 'milkyWay' | 'nebula' | 'meteor' | 'moon' | 'cloudSea';
  device: 'camera' | 'phone';
  focalLengthMm: number;
  bortle: number;
  dewRisk: boolean;
  gear?: CameraGearInput;
  targetDecDeg?: number;
  targetName?: string;
  moonIllum?: number;
  moonAlt?: number;
  windKmh?: number;
  cloudPct?: number;
}

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

const SENSOR_WIDTH_MM: Record<SensorType, number> = { fullFrame: 36, apsc: 23.5, m43: 17.3, phone: 7.2 };
const SENSOR_LABEL: Record<SensorType, string> = { fullFrame: 'Full-Frame', apsc: 'APS-C', m43: 'Micro 4/3', phone: 'Cảm biến ĐT' };

export function computeCameraSpecsSummary(gear: CameraGearInput, targetDecDeg = 0) {
  const widthMm = SENSOR_WIDTH_MM[gear.sensorType] ?? 36;
  const cropFactor = Math.max(1, 36 / widthMm);
  const horizontalPx = Math.sqrt(Math.max(8, gear.megapixels) * 1_000_000 * 1.5);
  const pixelPitchUm = Number(((widthMm * 1000) / horizontalPx).toFixed(2));
  const fInput = Math.max(4, gear.focalLengthMm || 14);
  const fOptical = gear.sensorType === 'phone' ? fInput / cropFactor : fInput;
  const n = Math.max(1.0, gear.aperture || 1.8);
  const clampedDec = Math.max(-75, Math.min(75, targetDecDeg));
  const cosDec = Math.max(0.25, Math.cos((Math.abs(clampedDec) * Math.PI) / 180));
  const npfRaw = (1.5 * (16.9 * n + 0.1 * fOptical + 13.7 * pixelPitchUm)) / (fOptical * cosDec);
  const npfSeconds = Number(Math.max(1.5, Math.min(30, npfRaw)).toFixed(1));
  const rule500Seconds = Math.max(1, Math.round(500 / (fInput * (gear.sensorType === 'phone' ? 1 : cropFactor))));
  const isoBadge = gear.dualIso?.trim() || (gear.sensorType === 'fullFrame' ? 'Dual ISO 3200' : 'ISO 1600');
  return { pixelPitchUm, npfSeconds, rule500Seconds, summaryLine: `${SENSOR_LABEL[gear.sensorType]} · NPF ${npfSeconds}s · ${isoBadge}` };
}

function computeEnvironmentMetrics(
  input: AdvisorInput,
  summary: ReturnType<typeof computeCameraSpecsSummary>
): AstroAdvisorMetrics {
  const moonIllum = Math.max(0, Math.min(100, Math.round(input.moonIllum ?? 18)));
  const moonAlt = input.moonAlt ?? -15;
  const moonAboveHorizon = moonAlt > -2;
  const moonFactor = moonAboveHorizon ? (moonIllum / 100) * Math.min(1, Math.max(0.2, (moonAlt + 4) / 35)) : 0;
  const effectiveBortle = Number(Math.min(9, Math.max(1, input.bortle + moonFactor * 3.0)).toFixed(1));
  const windKmh = Math.max(0, Math.round(input.windKmh ?? 8));
  const windPenaltyPct = windKmh >= 25 ? 25 : windKmh >= 15 ? 12 : 0;
  const adjustedShutterSeconds = Number(Math.max(1.5, summary.npfSeconds * (1 - windPenaltyPct / 100)).toFixed(1));

  return {
    npfSeconds: summary.npfSeconds,
    adjustedShutterSeconds,
    rule500Seconds: summary.rule500Seconds,
    pixelPitchUm: summary.pixelPitchUm,
    effectiveBortle,
    targetDecDeg: Number((input.targetDecDeg ?? 0).toFixed(1)),
    moonIllum,
    moonAboveHorizon,
    windKmh,
    windPenaltyPct,
  };
}

function makeAdvisorSpec(
  fields: [string, string, string, string, string, string, string, string],
  checklist: string[],
  npfSummary: ReturnType<typeof computeCameraSpecsSummary>,
  metrics: AstroAdvisorMetrics
) {
  return {
    shutterTitle: 'TỐC ĐỘ MÀN TRẬP', shutterValue: fields[0], shutterHint: fields[1],
    apertureTitle: 'KHẨU ĐỘ ỐNG KÍNH', apertureValue: fields[2], apertureHint: fields[3],
    isoTitle: 'ĐỘ NHẠY SÁNG', isoValue: fields[4], isoHint: fields[5],
    wbTitle: 'CÂN BẰNG TRẮNG', wbValue: fields[6], wbHint: fields[7],
    checklist, npfSummary, metrics,
  };
}

function buildPhoneSetup(input: AdvisorInput, aperture: number, gearSummary: ReturnType<typeof computeCameraSpecsSummary>, metrics: AstroAdvisorMetrics) {
  const iso = input.mode === 'moon' || input.mode === 'cloudSea' ? 'ISO 100' : input.mode === 'meteor' ? 'ISO 3200' : metrics.effectiveBortle > 5.5 ? 'ISO 800' : 'ISO 1600';
  const shutter = input.mode === 'moon' ? '1/250s · ProRAW' : input.mode === 'cloudSea' ? '1/60s · HDR' : input.mode === 'meteor' ? '15s · Interval' : '25s · Night/Astro Mode';
  return makeAdvisorSpec(
    [
      shutter, `NPF quang học ${metrics.adjustedShutterSeconds}s · ${input.gear?.cameraName ?? 'Điện thoại Tripod'}`,
      `f/${aperture.toFixed(2)} (Chính 1x)`, input.gear?.lensName ?? 'Ưu tiên ống kính chính 24mm ít nhiễu',
      iso, `Bortle hiệu dụng ${metrics.effectiveBortle} · Chụp ProRAW/DNG 12-bit`,
      metrics.effectiveBortle > 5.5 ? '3700K' : '4000K', 'Khử ám vàng đô thị & ánh trăng ở chân trời',
    ],
    [
      metrics.windKmh >= 15 ? `Hạ thấp tripod chắn gió ${metrics.windKmh} km/h` : 'Cố định tripod tránh rung gió',
      'Khóa nét vô cực AE/AF Lock',
      input.dewRisk ? 'Lau kính & giữ ấm tránh đọng sương' : 'Hẹn giờ chụp 3s · Bật RAW/DNG',
    ],
    gearSummary,
    metrics
  );
}

function buildNebulaSetup(input: AdvisorInput, focalMm: number, aperture: number, gearSummary: ReturnType<typeof computeCameraSpecsSummary>, metrics: AstroAdvisorMetrics) {
  const decLabel = `${metrics.targetDecDeg >= 0 ? '+' : ''}${metrics.targetDecDeg}°`;
  const iso = metrics.effectiveBortle <= 3.5 ? 'ISO 1600' : metrics.effectiveBortle <= 5.5 ? 'ISO 800' : 'ISO 400 · Lọc UHC/L-eNhance';
  return makeAdvisorSpec(
    [
      `${metrics.windKmh >= 18 ? '45s' : '60s'} · Star Tracker`, `${input.targetName ?? 'Mục tiêu sâu'} (δ ${decLabel}) · Không tracker: NPF ${metrics.adjustedShutterSeconds}s`,
      `f/${Math.max(1.8, aperture).toFixed(1)}`, `Khép 1/3 stop cho sao góc ảnh sắc nét (${focalMm}mm)`,
      iso, `Bortle hiệu dụng ${metrics.effectiveBortle} · Chụp 30–60 frame để stack`,
      '4300K', 'Tái tạo chuẩn dải H-alpha hồng tím',
    ],
    [
      'Cân cực Bắc Polaris chuẩn xác',
      'Chụp thêm 15 Dark & 20 Flat frames',
      input.dewRisk ? 'Bật Dew Heater chống đọng sương' : metrics.windKmh >= 18 ? `Treo vật nặng giảm rung gió ${metrics.windKmh} km/h` : 'Tắt chống rung IBIS trên chân máy',
    ],
    gearSummary,
    metrics
  );
}

function buildMeteorSetup(input: AdvisorInput, focalMm: number, aperture: number, gearSummary: ReturnType<typeof computeCameraSpecsSummary>, metrics: AstroAdvisorMetrics) {
  const shutterSec = Math.min(15, Math.max(4, Math.round(metrics.adjustedShutterSeconds)));
  const iso = metrics.effectiveBortle <= 4.5 ? 'ISO 6400' : metrics.effectiveBortle <= 6.5 ? 'ISO 3200' : 'ISO 1600';
  return makeAdvisorSpec(
    [
      `${shutterSec}s · Interval 1s`, `Chụp liên tục trên ${focalMm}mm · NPF ${metrics.adjustedShutterSeconds}s`,
      `f/${aperture.toFixed(1)}`, 'Mở tối đa để bắt vệt sao băng mờ nhanh',
      iso, `Bortle hiệu dụng ${metrics.effectiveBortle} · Ưu tiên bắt vệt sao băng tức thời`,
      '4100K', 'Giữ màu vệt ion xanh ngọc tự nhiên',
    ],
    [
      'Hướng tâm ngắm cách Radiant 40°',
      'Bật Intervalometer chụp liên tục (nghỉ 1s)',
      input.dewRisk ? 'Bật Dew Heater tránh mờ sương' : metrics.windKmh >= 18 ? `Hạ thấp tripod · gió ${metrics.windKmh} km/h` : 'Dùng nguồn dự phòng Dummy Battery',
    ],
    gearSummary,
    metrics
  );
}

function buildMoonOrCloudSetup(mode: 'moon' | 'cloudSea', gearSummary: ReturnType<typeof computeCameraSpecsSummary>, metrics: AstroAdvisorMetrics) {
  if (mode === 'moon') {
    const { moonIllum } = metrics;
    const shutter = moonIllum >= 75 ? '1/320s · Looney 11' : moonIllum >= 35 ? '1/160s · Bán nguyệt' : '1/60s · Trăng lưỡi liềm';
    return makeAdvisorSpec(
      [
        shutter, `Pha Trăng ${moonIllum}% · Chống nhòe di chuyển`,
        moonIllum >= 35 ? 'f/8.0' : 'f/5.6', 'Điểm ngọt sắc nét cho miệng núi lửa',
        moonIllum >= 75 ? 'ISO 100' : moonIllum >= 35 ? 'ISO 200' : 'ISO 400', 'Dải tương phản động cao, giữ chi tiết vùng sáng',
        '5200K', 'Màu bề mặt xám bạc trung tính',
      ],
      ['Tắt chống rung trên tripod', 'Dùng màn trập điện tử hoàn toàn', 'Chụp 20 tấm lấy nét chuẩn rồi stack'],
      gearSummary,
      metrics
    );
  }
  const isCalm = metrics.windKmh < 12;
  return makeAdvisorSpec(
    [
      isCalm ? '1/4s – 2s · ND Filter' : '1/125s · Bracketing ±2EV',
      isCalm ? `Gió nhẹ ${metrics.windKmh} km/h · Làm mượt sóng mây` : `Gió ${metrics.windKmh} km/h · Giữ chi tiết bình minh`,
      'f/8.0 – f/11', 'Nét sâu toàn cảnh núi & thung lũng',
      'ISO 100 – 200', 'Sạch nhiễu tuyệt đối khi kéo hậu kỳ',
      '5500K', 'Tôn sắc vàng cam tia nắng đầu ngày',
    ],
    ['Gắn kính lọc GND / CPL giữ chi tiết trời', 'Quay Timelapse 2s/khung mây trôi', 'Lau khô thấu kính trước lúc bình minh'],
    gearSummary,
    metrics
  );
}

function buildMilkyWaySetup(input: AdvisorInput, focalMm: number, aperture: number, gearSummary: ReturnType<typeof computeCameraSpecsSummary>, metrics: AstroAdvisorMetrics) {
  const { adjustedShutterSeconds, rule500Seconds, effectiveBortle, targetDecDeg, moonIllum, moonAboveHorizon, windKmh, windPenaltyPct } = metrics;
  const decLabel = `${targetDecDeg >= 0 ? '+' : ''}${targetDecDeg}°`;
  const iso = effectiveBortle <= 3.2 ? 'ISO 3200 – 6400' : effectiveBortle <= 5.0 ? 'ISO 1600 – 3200' : effectiveBortle <= 6.8 ? 'ISO 800 – 1600' : 'ISO 400 – 800';
  const moonNote = moonAboveHorizon && moonIllum >= 20 ? ` · Trăng ${moonIllum}% trên trời` : '';
  return makeAdvisorSpec(
    [
      `${Math.round(adjustedShutterSeconds)}s · NPF ${adjustedShutterSeconds}s / 500 (${rule500Seconds}s)`,
      `${focalMm}mm · ${input.gear?.cameraName ?? 'Full-Frame'} · δ ${decLabel}${windPenaltyPct > 0 ? ` · Giảm ${windPenaltyPct}% gió` : ''}`,
      `f/${aperture.toFixed(1)} – f/2.8`, 'Mở khẩu lớn thu tối đa ánh sáng sao',
      iso, `Bortle hiệu dụng ${effectiveBortle}${moonNote} · ${effectiveBortle > 5.0 ? 'Gợi ý stack 15–25 tấm giảm nhiễu' : 'Ít nhiễu vùng tối'}`,
      effectiveBortle <= 4.0 ? '3900K' : effectiveBortle <= 6.0 ? '3700K' : '3500K', 'Tái tạo nền trời đêm xanh sâu tự nhiên',
    ],
    [
      'Tắt chống rung ống kính & thân máy',
      'Lấy nét tay MF vào sao sáng nhất (Zoom 10x)',
      input.dewRisk ? 'Quấn dây sưởi Dew Heater tránh sương' : windKmh >= 15 ? `Hạ thấp tripod · tránh rung gió ${windKmh} km/h` : 'Hẹn giờ 2s / dây bấm mềm khi chụp',
    ],
    gearSummary,
    metrics
  );
}

export function computeAstroAdvisor(input: AdvisorInput) {
  const focalMm = input.focalLengthMm || input.gear?.focalLengthMm || 14;
  const aperture = input.gear?.aperture || 1.8;
  const gearInput: CameraGearInput = input.gear
    ? { ...input.gear, focalLengthMm: focalMm }
    : { cameraName: 'Sony A7 IV', sensorType: input.device === 'phone' ? 'phone' : 'fullFrame', megapixels: input.device === 'phone' ? 48 : 33, lensName: `${focalMm}mm f/${aperture}`, focalLengthMm: focalMm, aperture };
  const gearSummary = computeCameraSpecsSummary(gearInput, input.targetDecDeg ?? -29.0);
  const metrics = computeEnvironmentMetrics(input, gearSummary);

  if (input.device === 'phone' || input.gear?.sensorType === 'phone') return buildPhoneSetup(input, aperture, gearSummary, metrics);
  if (input.mode === 'nebula') return buildNebulaSetup(input, focalMm, aperture, gearSummary, metrics);
  if (input.mode === 'meteor') return buildMeteorSetup(input, focalMm, aperture, gearSummary, metrics);
  if (input.mode === 'moon' || input.mode === 'cloudSea') return buildMoonOrCloudSetup(input.mode, gearSummary, metrics);
  return buildMilkyWaySetup(input, focalMm, aperture, gearSummary, metrics);
}
