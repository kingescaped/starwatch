import type { SensorType } from '../state/types';

export interface CameraBodyPreset {
  id: string;
  name: string;
  sensorType: SensorType;
  megapixels: number;
  dualIso: string;
}

export interface LensPreset {
  id: string;
  name: string;
  focalLengthMm: number;
  aperture: number;
}

export interface CameraGearProfile {
  cameraName: string;
  sensorType: SensorType;
  megapixels: number;
  dualIso: string;
  lensName: string;
  focalLengthMm: number;
  aperture: number;
}

export const SENSOR_LABELS: Record<SensorType, string> = {
  fullFrame: 'Full-Frame',
  apsc: 'APS-C',
  m43: 'Micro 4/3',
  phone: 'Điện thoại',
};

export const CAMERA_BODY_PRESETS: CameraBodyPreset[] = [
  { id: 'sony-a7iv', name: 'Sony A7 IV', sensorType: 'fullFrame', megapixels: 33, dualIso: 'Dual ISO 3200' },
  { id: 'sony-a7s3', name: 'Sony A7S III', sensorType: 'fullFrame', megapixels: 12, dualIso: 'Dual ISO 12800' },
  { id: 'canon-r5', name: 'Canon EOS R5', sensorType: 'fullFrame', megapixels: 45, dualIso: 'ISO 3200' },
  { id: 'nikon-z8', name: 'Nikon Z8', sensorType: 'fullFrame', megapixels: 45.7, dualIso: 'Dual ISO 3200' },
  { id: 'fuji-xt5', name: 'Fujifilm X-T5', sensorType: 'apsc', megapixels: 40, dualIso: 'ISO 1600' },
  { id: 'iphone-16pro', name: 'iPhone 16 Pro Max', sensorType: 'phone', megapixels: 48, dualIso: 'Astro Stacking' },
];

export const LENS_PRESETS: LensPreset[] = [
  { id: 'fe-14-18', name: 'FE 14mm f/1.8 GM', focalLengthMm: 14, aperture: 1.8 },
  { id: 'sigma-14-14', name: 'Sigma 14mm f/1.4 Art', focalLengthMm: 14, aperture: 1.4 },
  { id: 'fe-20-18', name: 'FE 20mm f/1.8 G', focalLengthMm: 20, aperture: 1.8 },
  { id: 'rf-15-35', name: 'RF 15-35mm f/2.8L', focalLengthMm: 15, aperture: 2.8 },
  { id: 'fe-24-14', name: 'FE 24mm f/1.4 GM', focalLengthMm: 24, aperture: 1.4 },
  { id: 'xf-16-14', name: 'XF 16mm f/1.4 R', focalLengthMm: 16, aperture: 1.4 },
  { id: 'phone-24-178', name: 'Ống chính 24mm f/1.78', focalLengthMm: 24, aperture: 1.78 },
];

export const DEFAULT_CAMERA_GEAR: CameraGearProfile = {
  cameraName: 'Sony A7 IV',
  sensorType: 'fullFrame',
  megapixels: 33,
  dualIso: 'Dual ISO 3200',
  lensName: 'FE 14mm f/1.8 GM',
  focalLengthMm: 14,
  aperture: 1.8,
};

export function previewCameraGearLocally(gear: CameraGearProfile, targetDecDeg = 0) {
  const widthMm = gear.sensorType === 'fullFrame' ? 36 : gear.sensorType === 'apsc' ? 23.5 : gear.sensorType === 'm43' ? 17.3 : 7.2;
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
  return {
    pixelPitchUm,
    npfSeconds,
    rule500Seconds,
    summaryTitle: `${gear.cameraName.trim()} · ${gear.lensName.trim()}`,
    summaryLine: `${SENSOR_LABELS[gear.sensorType]} · NPF ${npfSeconds}s · ${gear.dualIso.trim() || 'ISO 3200'}`,
  };
}
