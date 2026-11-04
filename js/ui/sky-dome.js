import { getCelestialTargetPosition } from '../astro/ephemeris.js';
import { azimuthToCardinalVN, getMoonPosition, getSunPosition } from '../astro/sun-moon.js';
import { DEG2RAD, makeVietnamDate } from '../astro/time.js';
import { state } from '../core/state.js';
import { iconMarkup, renderIcons } from './icons.js';

const SKY_COLOR_TRANSITION_MS = 360;
let currentDomePalette = null;
let targetDomePalette = null;
let domePaletteTransition = null;
let domeColorFrameScheduled = false;

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function getBaseAtmospherePalette(sunAlt, isLightTheme) {
  if (isLightTheme) {
    if (sunAlt > 6) return { colors: ['#075985', '#38bdf8', '#e0f2fe'], middleStop: 0.65 };
    if (sunAlt > -6) return { colors: ['#7c2d12', '#fb923c', '#ffedd5'], middleStop: 0.65 };
    if (sunAlt > -18) return { colors: ['#312e81', '#a5b4fc', '#f5d0fe'], middleStop: 0.7 };
    return { colors: ['#334155', '#cbd5e1', '#f8fafc'], middleStop: 0.7 };
  }
  if (sunAlt > 6) return { colors: ['#0284c7', '#0369a1', '#1e293b'], middleStop: 0.65 };
  if (sunAlt > -6) return { colors: ['#1e1b4b', '#4c1d95', '#c2410c'], middleStop: 0.65 };
  if (sunAlt > -18) return { colors: ['#090d16', '#1e1b4b', '#311042'], middleStop: 0.7 };
  return { colors: ['#030712', '#090d1c', '#131c31'], middleStop: 0.7 };
}

function getDynamicCelestialDomePalette(sun, moon, target, isLightTheme) {
  const sunAlt = sun && sun.trueAltitude !== undefined ? sun.trueAltitude : (sun?.altitude ?? -90);
  const moonAlt = moon?.altitude ?? -90;
  const targetAlt = target?.altitude ?? -90;

  const baseAtmosphere = getBaseAtmospherePalette(sunAlt, isLightTheme);
  const baseZenith = baseAtmosphere.colors[0];
  const baseMid = baseAtmosphere.colors[1];
  const baseHorizon = baseAtmosphere.colors[2];

  // 1. Sun contribution (Vàng ấm rực rỡ / Cam giờ vàng / Xanh ban ngày)
  let wSun = 0;
  let sunColor = '#fbbf24';
  if (sunAlt > 0) {
    wSun = Math.max(0, Math.min(1, sunAlt / 90));
    if (sunAlt >= 16) {
      sunColor = isLightTheme ? '#0284c7' : '#38bdf8';
    } else {
      sunColor = mixHexColor('#f59e0b', '#38bdf8', sunAlt / 16);
    }
  } else if (sunAlt >= -12) {
    wSun = Math.max(0, (sunAlt + 12) / 12) * 0.4;
    sunColor = '#818cf8';
  }

  // 2. Moon contribution (Cyan xanh ngọc sáng rõ #38bdf8)
  let wMoon = 0;
  const moonColor = '#38bdf8';
  if (moonAlt > 0) {
    const illum = 0.35 + 0.65 * ((moon?.illuminationPct ?? 50) / 100);
    wMoon = Math.max(0, Math.min(1, moonAlt / 90)) * illum;
    if (wSun > 0.4) {
      wMoon *= (1 - 0.35 * wSun);
    }
  }

  // 3. Target contribution (Hồng tím neon #f472b6 nổi bật trên nền đêm)
  let wTarget = 0;
  const targetColor = '#f472b6';
  if (targetAlt > 0) {
    const nightFactor = sunAlt < 0 ? Math.min(1, (-sunAlt) / 10) : 0.12;
    wTarget = Math.max(0, Math.min(1, targetAlt / 90)) * nightFactor;
  }

  // Active celestial items
  const items = [
    { weight: wSun, color: sunColor },
    { weight: wMoon, color: moonColor },
    { weight: wTarget, color: targetColor }
  ].filter(it => it.weight > 0.001);

  if (items.length === 0) {
    return baseAtmosphere;
  }

  // Mix celestial colors in linear-light RGB space
  const totalWeight = items.reduce((acc, it) => acc + it.weight, 0);
  let sumR2 = 0;
  let sumG2 = 0;
  let sumB2 = 0;
  for (const it of items) {
    const val = Number.parseInt(it.color.slice(1), 16);
    const r = (val >> 16) & 0xff;
    const g = (val >> 8) & 0xff;
    const b = val & 0xff;
    sumR2 += it.weight * r * r;
    sumG2 += it.weight * g * g;
    sumB2 += it.weight * b * b;
  }

  const mixedR = Math.round(Math.sqrt(sumR2 / totalWeight)).toString(16).padStart(2, '0');
  const mixedG = Math.round(Math.sqrt(sumG2 / totalWeight)).toString(16).padStart(2, '0');
  const mixedB = Math.round(Math.sqrt(sumB2 / totalWeight)).toString(16).padStart(2, '0');
  const blendedCelestial = `#${mixedR}${mixedG}${mixedB}`;

  // Tăng cường độ màu rõ nét hơn theo độ cao
  const peakWeight = Math.min(1, Math.max(...items.map(it => it.weight)));
  const visualStrength = Math.min(1, Math.pow(peakWeight, 0.78) * 1.15 + totalWeight * 0.12);

  // Zenith (90°): Tô màu rực rỡ và nổi bật rõ ràng trên tâm vòm
  const zenithColor = mixHexColor(baseZenith, blendedCelestial, Math.min(0.92, visualStrength * 0.88));

  // Mid-sky (45°): Lan tỏa mượt mà thể hiện rõ chuyển động
  const midColor = mixHexColor(baseMid, blendedCelestial, Math.min(0.72, visualStrength * 0.5));

  // Horizon (0°): Giữ nguyên viền chân trời quen thuộc của hình nền cũ (ví dụ #131c31 ban đêm)
  const horizonColor = baseHorizon;

  return { colors: [zenithColor, midColor, horizonColor], middleStop: baseAtmosphere.middleStop || 0.65 };
}

function mixHexColor(from, to, amount) {
  const fromValue = Number.parseInt(from.slice(1), 16);
  const toValue = Number.parseInt(to.slice(1), 16);
  const channels = [16, 8, 0].map(shift => {
    const startLinear = ((fromValue >> shift) & 0xff) / 255;
    const endLinear = ((toValue >> shift) & 0xff) / 255;
    // Mix in linear-light space for perceptually smoother gradients
    const start = startLinear * startLinear;
    const end = endLinear * endLinear;
    const mixed = start + (end - start) * amount;
    return Math.round(Math.sqrt(Math.max(0, mixed)) * 255).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

function colorWithOpacity(colorHex, opacity) {
  const color = Number.parseInt(colorHex.slice(1), 16);
  const red = (color >> 16) & 0xff;
  const green = (color >> 8) & 0xff;
  const blue = color & 0xff;
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function createAltitudeGradient(ctx, colorHex, maxAltitude, altToY) {
  const gradient = ctx.createLinearGradient(0, altToY(Math.max(maxAltitude, -19.9)), 0, altToY(-20));
  gradient.addColorStop(0, colorWithOpacity(colorHex, 1));
  gradient.addColorStop(0.35, colorWithOpacity(colorHex, 0.72));
  gradient.addColorStop(1, colorWithOpacity(colorHex, 0.18));
  return gradient;
}

function mixDomePalette(from, to, amount) {
  return {
    colors: from.colors.map((color, index) => mixHexColor(color, to.colors[index], amount)),
    middleStop: from.middleStop + (to.middleStop - from.middleStop) * amount
  };
}

function areDomePalettesEqual(first, second) {
  return first && second &&
    first.middleStop === second.middleStop &&
    first.colors.every((color, index) => color === second.colors[index]);
}

function scheduleDomeColorFrame() {
  if (domeColorFrameScheduled || !domePaletteTransition) return;
  domeColorFrameScheduled = true;
  requestAnimationFrame(() => {
    domeColorFrameScheduled = false;
    if (!domePaletteTransition) return;

    const progress = Math.min(1, (performance.now() - domePaletteTransition.startedAt) / SKY_COLOR_TRANSITION_MS);
    const easedProgress = progress * progress * (3 - 2 * progress);
    currentDomePalette = mixDomePalette(domePaletteTransition.from, domePaletteTransition.to, easedProgress);
    if (progress === 1) {
      currentDomePalette = domePaletteTransition.to;
      domePaletteTransition = null;
    }

    paintDomeBackground(currentDomePalette);
    scheduleDomeColorFrame();
  });
}

function getCurrentDomePalette(targetPalette) {
  if (!currentDomePalette) {
    currentDomePalette = targetPalette;
    targetDomePalette = targetPalette;
  } else if (!areDomePalettesEqual(targetPalette, targetDomePalette)) {
    targetDomePalette = targetPalette;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      currentDomePalette = targetPalette;
      domePaletteTransition = null;
    } else {
      domePaletteTransition = {
        from: currentDomePalette,
        to: targetPalette,
        startedAt: performance.now()
      };
      scheduleDomeColorFrame();
    }
  }

  if (domePaletteTransition) scheduleDomeColorFrame();

  return currentDomePalette;
}

function getDomeColorAt(palette, position) {
  const colors = palette.colors;
  if (!colors || colors.length === 0) return '#000000';
  if (colors.length === 1) return colors[0];
  const mid = palette.middleStop ?? 0.5;
  if (position <= mid) {
    const t = smoothstep(0, mid, position);
    return mixHexColor(colors[0], colors[1], t);
  }
  const t = smoothstep(mid, 1, position);
  return mixHexColor(colors[1], colors[2], t);
}

function paintDomeBackground(palette) {
  const canvas = document.getElementById('skyDomeBackgroundCanvas');
  if (!canvas || !palette) return;

  const rect = canvas.getBoundingClientRect();
  const size = Math.min(rect.width, rect.height) || 320;
  const dpr = window.devicePixelRatio || 1;
  const pixelSize = Math.round(size * dpr);
  if (canvas.width !== pixelSize) canvas.width = pixelSize;
  if (canvas.height !== pixelSize) canvas.height = pixelSize;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  const center = size / 2;
  const maxRadius = center - 24;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, maxRadius);

  const DOME_GRADIENT_STEPS = 64;
  for (let index = 0; index <= DOME_GRADIENT_STEPS; index += 1) {
    const position = index / DOME_GRADIENT_STEPS;
    gradient.addColorStop(position, getDomeColorAt(palette, position));
  }

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, maxRadius, 0, Math.PI * 2);
  ctx.fill();
}

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
  const dynamicPalette = getDynamicCelestialDomePalette(sun, moon, target, isLightTheme);
  const domePalette = getCurrentDomePalette(dynamicPalette);

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
  ctx.strokeStyle = isLightTheme ? 'rgba(71, 85, 105, 0.48)' : 'rgba(148, 163, 184, 0.28)';
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

    ctx.fillStyle = isLightTheme ? 'rgba(71, 85, 105, 0.82)' : 'rgba(148, 163, 184, 0.6)';
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
  ctx.fillStyle = isLightTheme ? 'rgba(71, 85, 105, 0.72)' : 'rgba(226, 232, 240, 0.6)';
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
    const positions = [];
    let maxAltitude = 0;
    for (let m = 0; m <= 1440; m += 20) {
      const stepDt = makeVietnamDate(state.selectedDateStr, m);
      const pos = computeFn(stepDt);
      positions.push(pos);
      maxAltitude = Math.max(maxAltitude, pos.altitude);
    }

    if (maxAltitude > 0) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 1.4;

      for (let index = 1; index < positions.length; index += 1) {
        const previous = positions[index - 1];
        const current = positions[index];
        if (previous.altitude < 0 || current.altitude < 0) continue;

        const averageAltitude = (previous.altitude + current.altitude) / 2;
        const intensity = Math.max(0, Math.min(1, averageAltitude / maxAltitude));
        const opacity = 0.18 + (0.82 * intensity);
        const previousPoint = altAzToXY(previous.altitude, previous.azimuth);
        const currentPoint = altAzToXY(current.altitude, current.azimuth);

        ctx.beginPath();
        ctx.moveTo(previousPoint.x, previousPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.strokeStyle = colorWithOpacity(strokeColor, opacity);
        ctx.stroke();
      }

      ctx.restore();
    }
    return maxAltitude;
  };

  plotTrajectory(d => getSunPosition(d, spot.lat, spot.lon), '#f59e0b');
  plotTrajectory(d => getMoonPosition(d, spot.lat, spot.lon), '#38bdf8');
  plotTrajectory(
    d => getCelestialTargetPosition(d, spot.lat, spot.lon, state.selectedTargetKey),
    '#e879f9'
  );

  paintDomeBackground(domePalette);

  // 6. Draw Azimuth Ray & Current Body Marker for each Object
  const drawBodyOnDome = (pos, colorHex, iconName) => {
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

    // Subtle local glow around the sun and moon marker
    if (isAbove && (iconName === 'sun' || iconName === 'moon')) {
      const glowR = iconName === 'sun' ? 18 : 12;
      const glowGrad = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, glowR);
      glowGrad.addColorStop(0, colorWithOpacity(colorHex, iconName === 'sun' ? 0.4 : 0.25));
      glowGrad.addColorStop(1, colorWithOpacity(colorHex, 0));
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = colorHex;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isAbove ? 6.5 : 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(pt.x, pt.y - 11);
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (iconName === 'sun') {
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.moveTo(0, -6);
      ctx.lineTo(0, -4.5);
      ctx.moveTo(0, 6);
      ctx.lineTo(0, 4.5);
      ctx.moveTo(-6, 0);
      ctx.lineTo(-4.5, 0);
      ctx.moveTo(6, 0);
      ctx.lineTo(4.5, 0);
      ctx.moveTo(-4.2, -4.2);
      ctx.lineTo(-3.2, -3.2);
      ctx.moveTo(4.2, 4.2);
      ctx.lineTo(3.2, 3.2);
      ctx.moveTo(-4.2, 4.2);
      ctx.lineTo(-3.2, 3.2);
      ctx.moveTo(4.2, -4.2);
      ctx.lineTo(3.2, -3.2);
    } else if (iconName === 'moon') {
      ctx.restore();
      ctx.save();
      ctx.translate(pt.x - 6, pt.y - 17);
      ctx.scale(0.5, 0.5);
      ctx.strokeStyle = colorHex;
      ctx.lineWidth = 1.8;
      ctx.stroke(new Path2D('M19.5 15.2A8 8 0 0 1 8.8 4.5 8.5 8.5 0 1 0 19.5 15.2Z'));
      ctx.beginPath();
      ctx.arc(17.5, 5, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = colorHex;
      ctx.fill();
      ctx.beginPath();
    } else {
      ctx.moveTo(0, -6);
      ctx.lineTo(1.3, -1.3);
      ctx.lineTo(6, 0);
      ctx.lineTo(1.3, 1.3);
      ctx.lineTo(0, 6);
      ctx.lineTo(-1.3, 1.3);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-1.3, -1.3);
      ctx.closePath();
    }
    ctx.stroke();
    ctx.restore();
    ctx.restore();
  };

  drawBodyOnDome(sun, '#fbbf24', 'sun');
  drawBodyOnDome(moon, '#38bdf8', 'moon');
  drawBodyOnDome(target, '#e879f9', 'sparkles');

  ctx.restore();

  // Update Sky Dome Telemetry Badges
  document.getElementById('domeSunAltAz').textContent = `${sun.altitude >= 0 ? '+' : ''}${sun.altitude.toFixed(1)}° · ${Math.round(sun.azimuth)}°`;
  document.getElementById('domeSunStatus').textContent = sun.altitude >= 0 ? `Hướng ${azimuthToCardinalVN(sun.azimuth)} (Ban ngày)` : `Dưới chân trời (${azimuthToCardinalVN(sun.azimuth)})`;

  document.getElementById('domeMoonAltAz').textContent = `${moon.altitude >= 0 ? '+' : ''}${moon.altitude.toFixed(1)}° · ${Math.round(moon.azimuth)}°`;
  document.getElementById('domeMoonStatus').textContent = `Sáng ${moon.illuminationPct}% · ${moon.ageDays} ngày`;

  const domeTargetTitle = document.getElementById('domeTargetTitle');
  domeTargetTitle.innerHTML = `${iconMarkup('milky-way', 'w-3 h-3 inline-block align-[-2px]')} ${target.shortName}`;
  renderIcons(domeTargetTitle);
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
    darkBadge.innerHTML = `${iconMarkup('milky-way', 'w-3 h-3 inline-block align-[-2px]')} Đêm Thiên Văn (-18°)`;
    darkBadge.className = 'dome-darkness-badge text-[11px] font-mono px-2.5 py-1 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/30';
  } else if (sun.trueAltitude <= -6) {
    darkBadge.innerHTML = `${iconMarkup('twilight', 'w-3 h-3 inline-block align-[-2px]')} Chạng Vạng / Giờ Xanh`;
    darkBadge.className = 'dome-darkness-badge text-[11px] font-mono px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
  } else if (sun.trueAltitude <= 6) {
    darkBadge.innerHTML = `${iconMarkup('sunrise', 'w-3 h-3 inline-block align-[-2px]')} Giờ Vàng (Golden Hour)`;
    darkBadge.className = 'dome-darkness-badge text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30';
  } else {
    darkBadge.innerHTML = `${iconMarkup('sun', 'w-3 h-3 inline-block align-[-2px]')} Ban Ngày`;
    darkBadge.className = 'dome-darkness-badge text-[11px] font-mono px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30';
  }
  renderIcons(darkBadge);

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
    const points = [];
    let maxAltitude = -20;
    for (let m = 0; m <= 1440; m += 20) {
      const dt = makeVietnamDate(state.selectedDateStr, m);
      const pos = fn(dt);
      points.push({ minute: m, altitude: pos.altitude });
      maxAltitude = Math.max(maxAltitude, pos.altitude);
    }

    ctx.strokeStyle = createAltitudeGradient(ctx, colorHex, maxAltitude, altToY);
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    points.forEach(({ minute, altitude }, index) => {
      const x = minToX(minute);
      const y = altToY(altitude);
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
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
