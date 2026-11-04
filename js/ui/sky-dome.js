import { getCelestialTargetPosition } from '../astro/ephemeris.js';
import { azimuthToCardinalVN, getMoonPosition, getSunPosition } from '../astro/sun-moon.js';
import { DEG2RAD, makeVietnamDate } from '../astro/time.js';
import { state } from '../core/state.js';

/**
 * Top-down sky dome and 24-hour altitude chart.
 */

export function drawTopDownSkyDome() {
  const canvas = document.getElementById('skyDomeCanvas');
  if (!canvas || !state.activeSpot) return;

  const spot = state.activeSpot;
  const rect = canvas.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height) || 320;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);

  const cx = size / 2;
  const cy = size / 2;
  const maxR = (size / 2) - 24;

  const dt = makeVietnamDate(state.selectedDateStr, state.selectedMinutes);
  const sun = getSunPosition(dt, spot.lat, spot.lon);
  const moon = getMoonPosition(dt, spot.lat, spot.lon);
  const target = getCelestialTargetPosition(dt, spot.lat, spot.lon, state.selectedTargetKey);
  const isLightTheme = document.documentElement.classList.contains('light-theme');

  // Convert (Altitude 0..90, Azimuth 0..360 from North clockwise) to Polar (x, y)
  const altAzToXY = (altDeg, azDeg) => {
    const clampedAlt = Math.max(0, Math.min(90, altDeg));
    const r = ((90 - clampedAlt) / 90) * maxR;
    const rad = (azDeg - 90) * DEG2RAD;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  };

  // 1. Dynamic Sky Dome Background based on Sun Altitude
  const domeGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, maxR);
  if (sun.trueAltitude > 6) {
    // Daylight sky
    domeGrad.addColorStop(0, '#0284c7');
    domeGrad.addColorStop(0.7, '#0369a1');
    domeGrad.addColorStop(1, '#1e293b');
  } else if (sun.trueAltitude > -6) {
    // Golden hour / Civil twilight
    domeGrad.addColorStop(0, '#1e1b4b');
    domeGrad.addColorStop(0.65, '#4c1d95');
    domeGrad.addColorStop(1, '#c2410c');
  } else if (sun.trueAltitude > -18) {
    // Nautical / Astronomical twilight
    domeGrad.addColorStop(0, '#090d16');
    domeGrad.addColorStop(0.7, '#1e1b4b');
    domeGrad.addColorStop(1, '#311042');
  } else {
    // True Astronomical Night Sky
    domeGrad.addColorStop(0, '#030712');
    domeGrad.addColorStop(0.7, '#090d1c');
    domeGrad.addColorStop(1, '#131c31');
  }

  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.fill();

  // 2. If night or twilight, draw subtle Milky Way band arch across the dome
  if (sun.trueAltitude < -4 && target.altitude > -10) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
    ctx.clip();

    const gcPt = altAzToXY(Math.max(5, target.altitude), target.azimuth);
    const mwGrad = ctx.createRadialGradient(gcPt.x, gcPt.y, 4, gcPt.x, gcPt.y, maxR * 0.85);
    mwGrad.addColorStop(0, 'rgba(216, 180, 254, 0.24)');
    mwGrad.addColorStop(0.45, 'rgba(139, 92, 246, 0.11)');
    mwGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = mwGrad;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  // 3. Concentric Altitude Rings (0° Horizon, 30°, 60°, 90° Zenith)
  ctx.strokeStyle = isLightTheme ? 'rgba(203, 213, 225, 0.48)' : 'rgba(148, 163, 184, 0.28)';
  ctx.lineWidth = 1;

  // Outer 0° Horizon Ring
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.stroke();

  // 30° and 60° Dashed Rings
  ctx.setLineDash([4, 4]);
  [30, 60].forEach(altRing => {
    const r = ((90 - altRing) / 90) * maxR;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isLightTheme ? 'rgba(203, 213, 225, 0.82)' : 'rgba(148, 163, 184, 0.6)';
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillText(`${altRing}°`, cx + 4, cy - r + 10);
  });

  // Crosshairs (N-S, E-W)
  ctx.beginPath();
  ctx.moveTo(cx - maxR, cy);
  ctx.lineTo(cx + maxR, cy);
  ctx.moveTo(cx, cy - maxR);
  ctx.lineTo(cx, cy + maxR);
  ctx.stroke();
  ctx.setLineDash([]);

  // Zenith center dot
  ctx.fillStyle = 'rgba(226, 232, 240, 0.6)';
  ctx.beginPath();
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // 4. Cardinal Compass Labels around Outer Ring
  const cardinals = [
    { label: 'B', az: 0, color: '#f87171' },
    { label: 'ĐB', az: 45, color: '#94a3b8' },
    { label: 'Đ', az: 90, color: '#e2e8f0' },
    { label: 'ĐN', az: 135, color: '#94a3b8' },
    { label: 'N', az: 180, color: '#e2e8f0' },
    { label: 'TN', az: 225, color: '#94a3b8' },
    { label: 'T', az: 270, color: '#e2e8f0' },
    { label: 'TB', az: 315, color: '#94a3b8' }
  ];

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  cardinals.forEach(c => {
    const rad = (c.az - 90) * DEG2RAD;
    const lx = cx + (maxR + 13) * Math.cos(rad);
    const ly = cy + (maxR + 13) * Math.sin(rad);
    ctx.font = c.label.length === 1 ? '700 11px Inter, sans-serif' : '500 9px Inter, sans-serif';
    ctx.fillStyle = isLightTheme ? (c.label === 'B' ? '#dc2626' : '#334155') : c.color;
    ctx.fillText(c.label, lx, ly);
  });

  // 5. Plot 24-Hour Trajectory Paths for Sun, Moon, and Selected Celestial Target
  const plotTrajectory = (computeFn, strokeColor) => {
    ctx.save();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    let started = false;
    for (let m = 0; m <= 1440; m += 20) {
      const stepDt = makeVietnamDate(state.selectedDateStr, m);
      const pos = computeFn(stepDt);
      if (pos.altitude >= 0) {
        const pt = altAzToXY(pos.altitude, pos.azimuth);
        if (!started) {
          ctx.moveTo(pt.x, pt.y);
          started = true;
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  plotTrajectory(d => getSunPosition(d, spot.lat, spot.lon), '#f59e0b');
  plotTrajectory(d => getMoonPosition(d, spot.lat, spot.lon), '#38bdf8');
  plotTrajectory(d => getCelestialTargetPosition(d, spot.lat, spot.lon, state.selectedTargetKey), '#e879f9');

  // 6. Draw Azimuth Ray & Current Body Marker for each Object
  const drawBodyOnDome = (pos, colorHex, symbolStr) => {
    const isAbove = pos.altitude >= 0;
    const pt = altAzToXY(Math.max(0, pos.altitude), pos.azimuth);

    // Dashed azimuth line from center through body to horizon
    const horizonPt = altAzToXY(0, pos.azimuth);
    ctx.save();
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = isAbove ? 0.65 : 0.25;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(horizonPt.x, horizonPt.y);
    ctx.stroke();

    // Body Marker
    ctx.setLineDash([]);
    ctx.globalAlpha = isAbove ? 1.0 : 0.35;
    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isAbove ? 6.5 : 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '10px sans-serif';
    ctx.fillText(symbolStr, pt.x, pt.y - 11);
    ctx.restore();
  };

  drawBodyOnDome(sun, '#fbbf24', '☀️');
  drawBodyOnDome(moon, '#38bdf8', '🌙');
  drawBodyOnDome(target, '#e879f9', '✨');

  ctx.restore();

  // Update Sky Dome Telemetry Badges
  document.getElementById('domeSunAltAz').textContent = `${sun.altitude >= 0 ? '+' : ''}${sun.altitude.toFixed(1)}° · ${Math.round(sun.azimuth)}°`;
  document.getElementById('domeSunStatus').textContent = sun.altitude >= 0 ? `Hướng ${azimuthToCardinalVN(sun.azimuth)} (Ban ngày)` : `Dưới chân trời (${azimuthToCardinalVN(sun.azimuth)})`;

  document.getElementById('domeMoonAltAz').textContent = `${moon.altitude >= 0 ? '+' : ''}${moon.altitude.toFixed(1)}° · ${Math.round(moon.azimuth)}°`;
  document.getElementById('domeMoonStatus').textContent = `Sáng ${moon.illuminationPct}% · ${moon.ageDays} ngày`;

  document.getElementById('domeTargetTitle').textContent = `🌌 ${target.shortName}`;
  document.getElementById('domeTargetAltAz').textContent = `${target.altitude >= 0 ? '+' : ''}${target.altitude.toFixed(1)}° · ${Math.round(target.azimuth)}°`;
  const targetStatusEl = document.getElementById('domeTargetStatus');
  if (target.altitude >= 15 && sun.trueAltitude <= -12) {
    targetStatusEl.textContent = `Góc chụp tối ưu (${azimuthToCardinalVN(target.azimuth)})`;
    targetStatusEl.className = 'text-[10px] text-emerald-400 font-semibold';
  } else if (target.altitude >= 0) {
    targetStatusEl.textContent = `Trên chân trời (${azimuthToCardinalVN(target.azimuth)})`;
    targetStatusEl.className = 'text-[10px] text-amber-300';
  } else {
    targetStatusEl.textContent = 'Đang dưới chân trời';
    targetStatusEl.className = 'text-[10px] text-slate-500';
  }

  // Darkness Badge
  const darkBadge = document.getElementById('domeDarknessBadge');
  if (sun.trueAltitude <= -18) {
    darkBadge.textContent = '🌌 Đêm Thiên Văn (-18°)';
    darkBadge.className = 'text-[11px] font-mono px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30';
  } else if (sun.trueAltitude <= -6) {
    darkBadge.textContent = '🌆 Chạng Vạng / Giờ Xanh';
    darkBadge.className = 'text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
  } else if (sun.trueAltitude <= 6) {
    darkBadge.textContent = '🌅 Giờ Vàng (Golden Hour)';
    darkBadge.className = 'text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30';
  } else {
    darkBadge.textContent = '☀️ Ban Ngày';
    darkBadge.className = 'text-[11px] font-mono px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30';
  }

  draw24HourElevationChart();
}

/**
 * Draw 24-Hour Celestial Altitude Curve (Sun, Moon, Selected Deep Sky Object)
 */
export function draw24HourElevationChart() {
  const canvas = document.getElementById('elevationChartCanvas');
  if (!canvas || !state.activeSpot) return;

  const spot = state.activeSpot;
  const rect = canvas.getBoundingClientRect();
  const w = rect.width || 360;
  const h = rect.height || 96;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const padL = 26;
  const padR = 10;
  const padT = 10;
  const padB = 18;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const minToX = (m) => padL + (m / 1440) * plotW;
  const altToY = (alt) => {
    const clamped = Math.max(-20, Math.min(90, alt));
    return padT + ((90 - clamped) / 110) * plotH;
  };

  // Horizon line (0°)
  const yHorizon = altToY(0);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(padL, yHorizon);
  ctx.lineTo(w - padR, yHorizon);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  ctx.font = '500 9px "JetBrains Mono", monospace';
  ctx.fillText('0°', 4, yHorizon + 3);
  ctx.fillText('60°', 2, altToY(60) + 3);

  // Hour labels along bottom
  [0, 6, 12, 18, 24].forEach(hr => {
    const x = minToX(hr * 60);
    ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
    ctx.fillText(`${hr}h`, x - 7, h - 4);
  });

  const plotCurve = (fn, colorHex, lineWidth = 1.6) => {
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    for (let m = 0; m <= 1440; m += 20) {
      const dt = makeVietnamDate(state.selectedDateStr, m);
      const pos = fn(dt);
      const x = minToX(m);
      const y = altToY(pos.altitude);
      if (m === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  plotCurve(d => getSunPosition(d, spot.lat, spot.lon), '#fbbf24', 1.5);
  plotCurve(d => getMoonPosition(d, spot.lat, spot.lon), '#38bdf8', 1.5);
  plotCurve(d => getCelestialTargetPosition(d, spot.lat, spot.lon, state.selectedTargetKey), '#e879f9', 2.0);

  // Current selected time vertical indicator
  const curX = minToX(state.selectedMinutes);
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(curX, padT);
  ctx.lineTo(curX, h - padB);
  ctx.stroke();

  ctx.restore();
}
