import { computePhotographyScores } from '../astro/scoring.js';
import { state } from '../core/state.js';
import { buildCameraProfiles } from '../data/camera-profiles.js';

/**
 * Camera setup advisor and its renderer.
 */

export function computeCameraSetupRecommendation(spot, eventType, gearMode, evalNow) {
  const bortle = spot ? spot.bortle : 3.5;
  const isDarkSky = bortle <= 3.6;
  const isDewRisk = evalNow && evalNow.dewSpread <= 2.5;

  // Dynamic ISO scaling based on Bortle Light Pollution
  const ffIsoMilkyWay = bortle <= 2.8 ? '3200 – 6400' : (bortle <= 4.0 ? '2500 – 4000' : '1250 – 2000 (Tránh cháy sáng đèn đô thị)');
  const phoneIsoMilkyWay = bortle <= 3.2 ? '1600 – 3200' : (bortle <= 4.5 ? '800 – 1600' : '400 – 800');

  const profiles = buildCameraProfiles({
    isDarkSky,
    isDewRisk,
    ffIsoMilkyWay,
    phoneIsoMilkyWay
  });

  const selectedGroup = profiles[eventType] || profiles.milkyway;
  const spec = selectedGroup[gearMode] || selectedGroup.fullframe;
  return {
    sceneTitle: selectedGroup.title,
    ...spec
  };
}

export function renderCameraSetupGuide() {
  const container = document.getElementById('cameraSetupContentContainer');
  if (!container || !state.activeSpot) return;

  const spot = state.activeSpot;
  const badgeEl = document.getElementById('setupActiveSpotBadge');
  if (badgeEl) {
    badgeEl.textContent = `📍 ${spot.shortName || spot.name} · Bortle ${spot.bortle} · Độ cao ${spot.elevation}m`;
  }

  const activeHour = Math.min(23, Math.floor(state.selectedMinutes / 60));
  const dayHours = (state.weatherData && state.weatherData.byDate[state.selectedDateStr]) || [];
  const currentHourWeather = dayHours[activeHour];
  const evalNow = computePhotographyScores(spot, state.selectedDateStr, state.selectedMinutes, currentHourWeather);

  const rec = computeCameraSetupRecommendation(spot, state.selectedSetupEvent, state.selectedGearMode, evalNow);

  container.innerHTML = `
    <div class="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/90">
        <div>
          <span class="text-[11px] font-semibold text-fuchsia-300 uppercase tracking-wider">${rec.sceneTitle}</span>
          <h4 class="text-sm sm:text-base font-extrabold text-white mt-0.5">${rec.gearTitle}</h4>
        </div>
        <div class="flex items-center gap-2 text-[11px] font-mono">
          <span class="px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/30">
            Bầu trời: Bortle ${spot.bortle}
          </span>
          <span class="px-2.5 py-1 rounded-lg ${evalNow.dewSpread <= 2.5 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}">
            ${evalNow.dewSpread <= 2.5 ? '💧 Cần bật sưởi Lens' : '✓ Lens khô ráo'}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 mb-1">1. Ống Kính &amp; Tiêu Cự Đề Xuất</div>
          <div class="font-semibold text-white leading-relaxed">${rec.lens}</div>
        </div>
        <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1">2. Khẩu Độ &amp; Định Dạng</div>
          <div class="font-semibold text-white leading-relaxed">${rec.aperture}</div>
        </div>
        <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">3. Tốc Độ Phơi Sáng (Shutter)</div>
          <div class="font-semibold text-white leading-relaxed">${rec.shutter}</div>
        </div>
        <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800/90">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-fuchsia-400 mb-1">4. Độ Nhạy Sáng ISO (Theo Bortle ${spot.bortle})</div>
          <div class="font-semibold text-white leading-relaxed">${rec.iso}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
        <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
          <span class="text-base">🎯</span>
          <div>
            <div class="font-bold text-slate-200 mb-0.5">Lấy Nét (Focus) &amp; Cân Bằng Trắng (WB):</div>
            <p class="text-slate-400 leading-relaxed">${rec.wbFocus}</p>
          </div>
        </div>
        <div class="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
          <span class="text-base">🔭</span>
          <div>
            <div class="font-bold text-slate-200 mb-0.5">Chân Máy (Tripod) &amp; Lưu Ý Tại ${spot.shortName || spot.name}:</div>
            <p class="text-slate-400 leading-relaxed">${rec.tripodNotes}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}
