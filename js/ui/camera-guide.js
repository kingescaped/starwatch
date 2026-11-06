import { computePhotographyScores } from '../astro/scoring.js';
import { state } from '../core/state.js';
import { getBortleColorInfo } from '../core/utils.js';
import { buildCameraProfiles } from '../data/camera-profiles.js';
import { iconMarkup, renderIcons } from './icons.js';

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
    sceneIcon: selectedGroup.icon,
    ...spec
  };
}

export function renderCameraSetupGuide() {
  const container = document.getElementById('cameraSetupContentContainer');
  if (!container || !state.activeSpot) return;

  const spot = state.activeSpot;
  const badgeEl = document.getElementById('setupActiveSpotBadge');
  if (badgeEl) {
    badgeEl.textContent = `${spot.shortName || spot.name} · Bortle ${spot.bortle} · Độ cao ${spot.elevation}m`;
  }

  const activeHour = Math.min(23, Math.floor(state.selectedMinutes / 60));
  const dayHours = (state.weatherData && state.weatherData.byDate[state.selectedDateStr]) || [];
  const currentHourWeather = dayHours[activeHour];
  const evalNow = computePhotographyScores(spot, state.selectedDateStr, state.selectedMinutes, currentHourWeather);

  const rec = computeCameraSetupRecommendation(spot, state.selectedSetupEvent, state.selectedGearMode, evalNow);
  const bortleInfo = getBortleColorInfo(spot.bortle);

  container.innerHTML = `
    <div class="bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/90">
        <div>
          <span class="text-[11px] font-semibold text-fuchsia-300 uppercase tracking-wider">${iconMarkup(rec.sceneIcon, 'w-3.5 h-3.5 inline-block align-[-3px]')} ${rec.sceneTitle}</span>
          <h4 class="text-sm sm:text-base font-extrabold text-white mt-0.5">${rec.gearTitle}</h4>
        </div>
        <div class="flex items-center gap-2 text-[11px] font-mono">
          <span class="bortle-pill--tier-${bortleInfo.level} px-2.5 py-1 rounded-lg border font-semibold">
            Bầu trời: Bortle ${spot.bortle}
          </span>
          <span class="px-2.5 py-1 rounded-lg ${evalNow.dewSpread <= 2.5 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}">
            ${evalNow.dewSpread <= 2.5 ? `${iconMarkup('dew', 'w-3 h-3 inline-block align-[-2px]')} Cần bật sưởi Lens` : 'Lens khô ráo'}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        <div class="bg-slate-950/80 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 flex flex-col justify-start gap-1 min-w-0 h-full">
          <div class="subcard-heading text-[10px] text-cyan-400">1. Ống Kính &amp; Tiêu Cự Đề Xuất</div>
          <div class="font-semibold text-white leading-relaxed mt-0.5">${rec.lens}</div>
        </div>
        <div class="bg-slate-950/80 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 flex flex-col justify-start gap-1 min-w-0 h-full">
          <div class="subcard-heading text-[10px] text-amber-400">2. Khẩu Độ &amp; Định Dạng</div>
          <div class="font-semibold text-white leading-relaxed mt-0.5">${rec.aperture}</div>
        </div>
        <div class="bg-slate-950/80 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 flex flex-col justify-start gap-1 min-w-0 h-full">
          <div class="subcard-heading text-[10px] text-emerald-400">3. Tốc Độ Phơi Sáng (Shutter)</div>
          <div class="font-semibold text-white leading-relaxed mt-0.5">${rec.shutter}</div>
        </div>
        <div class="bg-slate-950/80 p-3 sm:p-3.5 rounded-xl border border-slate-800/90 flex flex-col justify-start gap-1 min-w-0 h-full">
          <div class="subcard-heading text-[10px] text-fuchsia-400">4. Độ Nhạy Sáng ISO (Theo Bortle ${spot.bortle})</div>
          <div class="font-semibold text-white leading-relaxed mt-0.5">${rec.iso}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 mt-2.5 sm:mt-3 text-xs">
        <div class="bg-slate-950/60 p-3 sm:p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/90 flex items-center justify-center shrink-0 text-cyan-400">
            ${iconMarkup('target', 'w-4 h-4')}
          </div>
          <div class="min-w-0">
            <div class="font-bold text-slate-200 mb-0.5">Lấy Nét (Focus) &amp; Cân Bằng Trắng (WB):</div>
            <p class="text-slate-400 leading-relaxed text-[11px] sm:text-xs">${rec.wbFocus}</p>
          </div>
        </div>
        <div class="bg-slate-950/60 p-3 sm:p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/90 flex items-center justify-center shrink-0 text-violet-400">
            ${iconMarkup('telescope', 'w-4 h-4')}
          </div>
          <div class="min-w-0">
            <div class="font-bold text-slate-200 mb-0.5">Chân Máy (Tripod) &amp; Lưu Ý Tại ${spot.shortName || spot.name}:</div>
            <p class="text-slate-400 leading-relaxed text-[11px] sm:text-xs">${rec.tripodNotes}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  renderIcons(container);
}

export function scrollToCameraSetup() {
  const section = document.getElementById('cameraSetupSection');
  if (!section) return;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  section.scrollIntoView({ behavior, block: 'start' });
  section.classList.remove('camera-setup-highlight');
  void section.offsetWidth;
  section.classList.add('camera-setup-highlight');
}
