import { getCelestialTargetPosition } from '../astro/ephemeris.js';
import { azimuthToCardinalVN, getMoonPosition, getSunPosition } from '../astro/sun-moon.js';
import { DEG2RAD, makeVietnamDate } from '../astro/time.js';
import { state } from '../core/state.js';
import { leafletMap } from '../map/context.js';
import { VIETNAM_LIGHT_DOMES } from '../map/light-domes.js';

/**
 * Custom canvas overlays for Bortle, clouds and azimuth vectors.
 */

export function drawMapCanvasOverlays() {
  if (!leafletMap) return;
  const canvas = document.getElementById('mapOverlayCanvas');
  const mapSize = leafletMap.getSize();
  const canvasPane = canvas.parentElement;
  canvasPane.style.width = `${mapSize.x}px`;
  canvasPane.style.height = `${mapSize.y}px`;
  const canvasOrigin = leafletMap.containerPointToLayerPoint([0, 0]);
  canvas.style.left = `${canvasOrigin.x}px`;
  canvas.style.top = `${canvasOrigin.y}px`;
  canvas.style.right = 'auto';
  canvas.style.bottom = 'auto';
  canvas.style.width = `${mapSize.x}px`;
  canvas.style.height = `${mapSize.y}px`;
  const rect = { width: mapSize.x, height: mapSize.y };
  const dpr = window.devicePixelRatio || 1;
  const mapPointToCanvas = (latLng) => {
    return leafletMap.latLngToContainerPoint(latLng);
  };
  const isVisible = (point, margin = 0) =>
    point.x + margin >= 0 &&
    point.y + margin >= 0 &&
    point.x - margin <= rect.width &&
    point.y - margin <= rect.height;

  const canvasWidth = Math.round(rect.width * dpr);
  const canvasHeight = Math.round(rect.height * dpr);
  if (canvas.width !== canvasWidth) canvas.width = canvasWidth;
  if (canvas.height !== canvasHeight) canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, rect.width, rect.height);

  // 1. VIIRS BORTLE LIGHT POLLUTION HEATMAP OVERLAY
  if (state.showBortleOverlay) {
    VIETNAM_LIGHT_DOMES.forEach(dome => {
      const pt = mapPointToCanvas([dome.lat, dome.lon]);
      // Convert km radius to pixel radius at current zoom
      const edgeLatLng = L.latLng(dome.lat + (dome.radiusKm / 111.32), dome.lon);
      const edgePt = mapPointToCanvas(edgeLatLng);
      const radiusPx = Math.max(12, Math.abs(pt.y - edgePt.y) * 1.45);
      if (!isVisible(pt, radiusPx)) return;

      const grad = ctx.createRadialGradient(pt.x, pt.y, 1, pt.x, pt.y, radiusPx);
      if (dome.maxBortle >= 8.5) {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.88)');
        grad.addColorStop(0.25, 'rgba(239, 68, 68, 0.76)');
        grad.addColorStop(0.55, 'rgba(245, 158, 11, 0.55)');
        grad.addColorStop(0.85, 'rgba(16, 185, 129, 0.26)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
        grad.addColorStop(0.4, 'rgba(245, 158, 11, 0.48)');
        grad.addColorStop(0.75, 'rgba(34, 197, 94, 0.24)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radiusPx, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 2. SIMULATED CLOUD AND CONVECTION OVERLAY
  if (state.showHimawariOverlay) {
    const frameShift = state.radarFrameMinutes / 60.0; // Convert -90 to +60 minutes to hours
    const cloudSystems = [
      { lat: 21.8, lon: 104.6 + frameShift * 0.28, rKm: 135, intensity: 0.45 },
      { lat: 19.2 + frameShift * 0.12, lon: 106.5 + frameShift * 0.32, rKm: 160, intensity: 0.62 },
      { lat: 15.8, lon: 108.4 + frameShift * 0.25, rKm: 145, intensity: 0.52 },
      { lat: 12.3 - frameShift * 0.1, lon: 108.1 + frameShift * 0.22, rKm: 120, intensity: 0.38 },
      { lat: 9.8, lon: 105.9 + frameShift * 0.30, rKm: 150, intensity: 0.58 }
    ];

    cloudSystems.forEach((sys, idx) => {
      const pt = mapPointToCanvas([sys.lat, sys.lon]);
      const edgePt = mapPointToCanvas([sys.lat + sys.rKm / 111.32, sys.lon]);
      const rPx = Math.max(24, Math.abs(pt.y - edgePt.y));
      if (!isVisible(pt, rPx)) return;

      const grad = ctx.createRadialGradient(pt.x, pt.y, rPx * 0.08, pt.x, pt.y, rPx);
      if (sys.intensity > 0.55) {
        grad.addColorStop(0, 'rgba(244, 63, 94, 0.84)');
        grad.addColorStop(0.35, 'rgba(16, 185, 129, 0.68)');
        grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.44)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      } else {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.72)');
        grad.addColorStop(0.6, 'rgba(148, 163, 184, 0.46)');
        grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, rPx, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate((idx - 2) * 0.12);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.8)';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.ellipse(0, 0, rPx * 0.82, rPx * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.ellipse(0, 0, rPx * 0.48, rPx * 0.34, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const driftPx = Math.max(12, rPx * 0.34);
      const driftY = (idx % 2 === 0 ? 1 : -1) * rPx * 0.08;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(2, 6, 23, 0.9)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(pt.x - driftPx * 0.55, pt.y + driftY);
      ctx.lineTo(pt.x + driftPx * 0.45, pt.y + driftY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pt.x + driftPx * 0.45, pt.y + driftY);
      ctx.lineTo(pt.x + driftPx * 0.15, pt.y + driftY - 4);
      ctx.lineTo(pt.x + driftPx * 0.15, pt.y + driftY + 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  // 3. CELESTIAL AZIMUTH VECTOR LINES FROM ACTIVE PIN
  if (state.showAzimuthVectors && state.activeSpot) {
    const spot = state.activeSpot;
    const origin = mapPointToCanvas([spot.lat, spot.lon]);
    const dt = makeVietnamDate(state.selectedDateStr, state.selectedMinutes);

    const sun = getSunPosition(dt, spot.lat, spot.lon);
    const moon = getMoonPosition(dt, spot.lat, spot.lon);
    const target = getCelestialTargetPosition(dt, spot.lat, spot.lon, state.selectedTargetKey);

    const rayLength = Math.min(rect.width, rect.height) * 0.36;

    // Draw subtle compass ring around active pin
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, rayLength, 0, Math.PI * 2);
    ctx.stroke();

    // Helper to draw an azimuth ray
    const drawAzimuthVector = (azDeg, altDeg, colorHex, labelText) => {
      const rad = (azDeg - 90) * DEG2RAD;
      const endX = origin.x + Math.cos(rad) * rayLength;
      const endY = origin.y + Math.sin(rad) * rayLength;

      ctx.save();
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = altDeg >= 0 ? 2.4 : 1.3;
      ctx.globalAlpha = 1;
      ctx.setLineDash(altDeg >= 0 ? [7, 4] : [3, 5]);
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // End badge
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.arc(endX, endY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur = 4;
      ctx.fillText(`${labelText} (${Math.round(azDeg)}°)`, endX + 8, endY + 4);
      ctx.restore();
    };

    drawAzimuthVector(sun.azimuth, sun.altitude, '#fbbf24', '☀️ Mặt Trời');
    drawAzimuthVector(moon.azimuth, moon.altitude, '#38bdf8', '🌙 Trăng');
    drawAzimuthVector(target.azimuth, target.altitude, '#e879f9', `✨ ${target.shortName}`);

    // Update floating legend values
    document.getElementById('mapLegendSunAz').textContent = `${Math.round(sun.azimuth)}° (${azimuthToCardinalVN(sun.azimuth)})`;
    document.getElementById('mapLegendMoonAz').textContent = `${Math.round(moon.azimuth)}° (${azimuthToCardinalVN(moon.azimuth)})`;
    document.getElementById('mapLegendTargetAz').textContent = `${Math.round(target.azimuth)}° (${azimuthToCardinalVN(target.azimuth)})`;
  }

  ctx.restore();
}
