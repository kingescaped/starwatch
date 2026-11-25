export {
  computeAstroAdvisor,
  computeCameraSpecsSummary,
  type AdvisorInput,
  type AstroAdvisorMetrics,
  type CameraGearInput,
  type SensorType,
} from './astroAdvisor.ts';

export function computeSpotScores(
  bortle: number,
  elevation: number,
  avgCloudPct: number,
  lowCloudPct: number,
  highCloudPct: number,
  humidityPct: number,
  windKmh: number,
  targetPeakAlt: number,
  moonIllumPct: number
) {
  const moonPenalty = moonIllumPct * 0.22;
  const darkPenalty = Math.max(0, bortle - 1.5) * 4.2;
  const altBonus = Math.max(0, Math.min(18, (targetPeakAlt - 12) * 0.4));
  const milkyWayScore = clampScore(98 - avgCloudPct * 0.62 - darkPenalty - moonPenalty + altBonus);
  const twilightScore = clampScore(96 - Math.abs(highCloudPct - 40) * 1.15 - lowCloudPct * 0.32 - windKmh * 0.5);
  const cloudSeaScore = clampScore(
    Math.min(100, humidityPct * 0.64) +
      Math.min(20, lowCloudPct * 0.28) -
      Math.max(0, windKmh - 8) * 1.5 -
      Math.max(0, 1200 - elevation) * 0.018
  );
  const overallScore = clampScore(milkyWayScore * 0.65 + cloudSeaScore * 0.25 + twilightScore * 0.1);
  return { milkyWayScore, twilightScore, cloudSeaScore, overallScore };
}

function clampScore(v: number): number {
  return Math.round(Math.max(0, Math.min(100, v)));
}
