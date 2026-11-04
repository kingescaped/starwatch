import { formatHHMM } from '../astro/time.js';
import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { ASTRO_CALENDAR_EVENTS } from '../data/calendar.js';
import { iconMarkup, renderIcons } from './icons.js';

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
      <div class="p-4 rounded-2xl bg-slate-950/65 border border-white/15 flex flex-col justify-between gap-3 hover:border-violet-400/50 transition">
        <div>
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${ev.badgeColor}">
              ${iconMarkup(ev.badgeIcon, 'w-3 h-3 inline-block align-[-2px]')} ${ev.badge}
            </span>
            <span class="font-mono text-[11px] text-cyan-300 font-semibold">
              ${iconMarkup('calendar', 'w-3 h-3 inline-block align-[-2px]')} ${dd}/${mm}/${yyyy} · ${iconMarkup('clock', 'w-3 h-3 inline-block align-[-2px]')} ${timeStr} GMT+7
            </span>
          </div>
          <h4 class="text-sm font-bold text-white mt-2">${ev.title}</h4>
          <p class="text-[11px] text-slate-300 mt-1 leading-relaxed">${ev.desc}</p>
        </div>

        <div class="pt-2.5 border-t border-white/10">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            ${iconMarkup('map-pin', 'w-3 h-3 inline-block align-[-2px]')} Địa điểm dự báo lý tưởng nhất (Nhấp để xem &amp; nạp Setup chụp):
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${recSpots.map(sp => `
              <button
                data-cal-spot="${sp.id}"
                data-cal-date="${dateStr}"
                data-cal-min="${ev.timeMinutes}"
                data-cal-target="${ev.targetKey}"
                data-cal-setup="${ev.setupEvent}"
                class="cal-jump-spot-btn px-2.5 py-1 rounded-lg bg-violet-600/25 hover:bg-violet-600 text-violet-200 hover:text-white border border-violet-500/35 text-[11px] font-medium transition flex items-center gap-1"
              >
                <span>${sp.shortName || sp.name}</span>
                <span class="text-[9px] font-mono opacity-80">(B${sp.bortle})</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
  renderIcons(grid);

  grid.querySelectorAll('.cal-jump-spot-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const spotId = btn.getAttribute('data-cal-spot');
      const dateStr = btn.getAttribute('data-cal-date');
      const minVal = parseInt(btn.getAttribute('data-cal-min'), 10);
      const targetKey = btn.getAttribute('data-cal-target');
      const setupEvent = btn.getAttribute('data-cal-setup');

      const foundSpot = state.spots.find(s => s.id === spotId);
      if (dateStr) {
        state.selectedDateStr = dateStr;
        document.getElementById('datePickerInput').value = dateStr;
      }
      if (!isNaN(minVal)) {
        state.selectedMinutes = minVal;
        document.getElementById('timeMinutesSlider').value = minVal;
      }
      if (targetKey) {
        state.selectedTargetKey = targetKey;
        document.getElementById('selectCelestialTarget').value = targetKey;
      }
      if (setupEvent) {
        state.selectedSetupEvent = setupEvent;
        const setupSelect = document.getElementById('selectSetupEventType');
        if (setupSelect) setupSelect.value = setupEvent;
      }

      // Close modal and fly to spot
      const modalCal = document.getElementById('modalAstroCalendar');
      modalCal.classList.add('hidden');
      modalCal.classList.remove('flex');

      if (foundSpot) {
        emit('spot:select', { spot: foundSpot, flyMap: true, scrollToMatrix: true });
      } else {
        emit('app:refresh');
        emit('ui:scroll-to-matrix');
      }
    });
  });
}
