export interface ChartPoint {
  x: number;
  y: number;
}

export function buildSmoothPath(points: ChartPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function buildAreaPath(points: ChartPoint[], baselineY: number): string {
  if (points.length === 0) return '';
  const curve = buildSmoothPath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${curve} L${last.x.toFixed(1)} ${baselineY.toFixed(1)} L${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}

export function mapXToHourIndex(
  localX: number,
  containerWidth: number,
  plotLeftRatio: number,
  plotRightRatio: number,
  totalPoints: number
): number {
  if (containerWidth <= 0 || totalPoints <= 1) return 0;
  const startPx = containerWidth * plotLeftRatio;
  const endPx = containerWidth * plotRightRatio;
  const span = Math.max(1, endPx - startPx);
  const ratio = Math.max(0, Math.min(1, (localX - startPx) / span));
  return Math.round(ratio * (totalPoints - 1));
}
