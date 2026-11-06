import { formatHHMM } from '../astro/time.js';
import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { getBortleColorInfo } from '../core/utils.js';
import { ASTRO_CALENDAR_EVENTS } from '../data/calendar.js';
import { iconMarkup, renderIcons } from './icons.js';
import { closeToolModal } from './tool-modal.js';

/**
 * Astronomical events calendar modal renderer.
 */

export function renderAstroCalendarModal() {
  const grid = document.getElementById('astroCalendarEventsGrid');
  if (!grid) return;

  const baseDate = new Date();
  const filtered = state.activeCalendarFilter === 'all'
    ? ASTRO_CALENDAR_EVENTS
    : ASTRO_CALENDAR_EVENTS.filter(ev => ev.category === state.activeCalendarFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 px-4 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
        ${iconMarkup('calendar', 'w-8 h-8 text-slate-500 mb-1')}
        <div class="text-sm font-semibold text-slate-300">Không có sự kiện nào trong danh mục này</div>
        <p class="text-xs text-slate-500">Vui lòng chọn danh mục khác hoặc quay lại "Tất cả sự kiện".</p>
      </div>
    `;
    renderIcons(grid);
    return;
  }

  grid.innerHTML = filtered.map(ev => {
    const dt = new Date(baseDate.getTime() + ev.dateOffsetDays * 86400000);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const timeStr = formatHHMM(ev.timeMinutes);

    const recSpots = ev.recommendedSpotIds
      .map(id => state.spots.find(s => s.id === id))
      .filter(Boolean);

    return `
      <article class="astro-event-card p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-700/70 flex flex-col gap-3 hover:border-violet-400/50 transition shadow-lg">
        <div class="flex flex-col gap-1.5">
          <!-- Card Header: Category Badge + Astronomical Date & Time -->
          <div class="astro-event-card__header flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${ev.badgeColor} shrink-0">
              ${iconMarkup(ev.badgeIcon, 'w-3 h-3 shrink-0')}
              <span>${ev.badge}</span>
            </span>
            <span class="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-lg shrink-0">
              ${iconMarkup('calendar', 'w-3 h-3 text-cyan-400 shrink-0')}
              <span>${dd}/${mm}/${yyyy}</span>
              <span class="text-slate-500">·</span>
              ${iconMarkup('clock', 'w-3 h-3 text-cyan-400 shrink-0')}
              <span>${timeStr} GMT+7</span>
            </span>
          </div>

          <!-- Card Content: Title & Astronomical Description -->
          <h4 class="astro-event-card__title text-sm sm:text-base font-bold text-white leading-snug tracking-tight mt-1">${ev.title}</h4>
          <p class="astro-event-card__desc text-xs text-slate-300/90 leading-relaxed">${ev.desc}</p>
        </div>

        <!-- Recommended Spots Section: Auto-Layout Header + Spot Pills -->
        <div class="astro-event-card__spots pt-2.5 border-t border-slate-700/60 flex flex-col gap-2 mt-auto">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              ${iconMarkup('map-pin', 'w-3 h-3 text-cyan-400 shrink-0')}
              <span>Điểm Săn Ảnh Lý Tưởng</span>
            </span>
            <span class="text-[10px] text-cyan-300/90 font-medium">Chạm để nạp setup</span>
          </div>
          <div class="astro-event-card__spot-list flex flex-wrap gap-1.5 sm:gap-2">
            ${recSpots.map(sp => {
              const bortleInfo = getBortleColorInfo(sp.bortle);
              return `
                <button
                  data-cal-spot="${sp.id}"
                  data-cal-date="${dateStr}"
                  data-cal-min="${ev.timeMinutes}"
                  data-cal-target="${ev.targetKey}"
                  data-cal-setup="${ev.setupEvent}"
                  class="cal-jump-spot-btn inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-violet-600/30 text-slate-200 hover:text-white border border-slate-700/70 hover:border-violet-500/50 text-xs font-medium transition cursor-pointer"
                  title="Bay tới ${sp.name} &amp; nạp sẵn thông số chụp"
                >
                  <span class="truncate max-w-[130px] sm:max-w-none">${sp.shortName || sp.name}</span>
                  <span class="${bortleInfo.textTierClass} text-[10px] font-mono font-bold">(B${sp.bortle})</span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
      </article>
    `;
  }).join('');
  renderIcons(grid);

  grid.querySelectorAll('.cal-jump-spot-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const spotId = btn.getAttribute('data-cal-spot');
      const dateStr = btn.getAttribute('data-cal-date');
      const minVal = parseInt(btn.getAttribute('data-cal-min'), 10);
      const targetKey = btn.getAttribute('data-cal-target');
      const setupEvent = btn.getAttribute('data-cal-setup');

      const foundSpot = state.spots.find(s => s.id === spotId);
      if (dateStr) {
        state.selectedDateStr = dateStr;
        const dateInput = document.getElementById('datePickerInput');
        if (dateInput) dateInput.value = dateStr;
      }
      if (!isNaN(minVal)) {
        state.selectedMinutes = minVal;
        const timeSlider = document.getElementById('timeMinutesSlider');
        if (timeSlider) timeSlider.value = minVal;
      }
      if (targetKey) {
        state.selectedTargetKey = targetKey;
        const targetSelect = document.getElementById('selectCelestialTarget');
        if (targetSelect) targetSelect.value = targetKey;
      }
      if (setupEvent) {
        state.selectedSetupEvent = setupEvent;
        const setupSelect = document.getElementById('selectSetupEventType');
        if (setupSelect) setupSelect.value = setupEvent;
      }

      // Close modal immediately and navigate to Camera Setup Guide
      const modalCal = document.getElementById('modalAstroCalendar');
      if (modalCal) closeToolModal(modalCal, { immediate: true });

      if (foundSpot) {
        emit('spot:select', { spot: foundSpot, flyMap: true, scrollToCameraSetup: true });
      } else {
        emit('app:refresh');
        emit('ui:scroll-to-camera-setup');
      }
    });
  });
}
