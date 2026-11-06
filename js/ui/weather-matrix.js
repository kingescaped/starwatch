import { computePhotographyScores } from '../astro/scoring.js';
import { getCurrentVietnamDateTime } from '../astro/time.js';
import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { iconMarkup, renderIcons } from './icons.js';

/**
 * Weather timeline matrix, forecast tabs and matrix helpers.
 */

export let matrixHourRefreshTimer = null;

export function renderForecastDayTabs() {
  const container = document.getElementById('forecastDayTabs');
  if (!state.weatherData || !state.weatherData.dates.length) return;

  const dayNamesVN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  container.innerHTML = state.weatherData.dates.map((dateStr, idx) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dayLabel = idx === 0 ? 'Hôm nay' : dayNamesVN[dt.getDay()];
    const isActive = dateStr === state.selectedDateStr;

    return `
      <button
        data-date-str="${dateStr}"
        class="forecast-day-tab px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition ${
          isActive
            ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/25'
            : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-white'
        }"
      >
        <span class="font-bold">${dayLabel}</span> · <span class="font-mono">${d}/${m}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.forecast-day-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedDateStr = btn.getAttribute('data-date-str');
      document.getElementById('datePickerInput').value = state.selectedDateStr;
      renderForecastDayTabs();
      emit('app:refresh');
    });
  });
}

export function cloudCellColorClass(pct) {
  if (pct <= 22) return 'bg-emerald-500/20 text-emerald-300';
  if (pct <= 55) return 'bg-sky-500/25 text-sky-200';
  if (pct <= 80) return 'bg-amber-500/25 text-amber-200';
  return 'bg-rose-500/30 text-rose-200 font-bold';
}

export function isWeatherMatrixHourPast(hour) {
  const currentVietnamDateTime = getCurrentVietnamDateTime();
  if (state.selectedDateStr < currentVietnamDateTime.dateStr) return true;
  return state.selectedDateStr === currentVietnamDateTime.dateStr &&
    hour < Math.floor(currentVietnamDateTime.minutes / 60);
}

export function scheduleMatrixHourRefresh() {
  clearTimeout(matrixHourRefreshTimer);
  const now = new Date();
  const currentVietnamDateTime = getCurrentVietnamDateTime();
  const currentMinute = currentVietnamDateTime.minutes % 60;
  const delayToNextHour = (60 - currentMinute) * 60000 -
    now.getUTCSeconds() * 1000 -
    now.getUTCMilliseconds() +
    50;
  matrixHourRefreshTimer = setTimeout(() => {
    renderWeatherMatrixTable();
    scheduleMatrixHourRefresh();
  }, Math.max(50, delayToNextHour));
}

export function scrollToWeatherMatrix() {
  const section = document.getElementById('weatherMatrixSection');
  if (!section) return;
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  section.scrollIntoView({ behavior, block: 'start' });
}

export function revealSelectedMatrixHour() {
  const scroller = document.getElementById('weatherMatrixScroll');
  const hourCell = document.querySelector(`#weatherMatrixBody th[data-hour-col="${Math.floor(state.selectedMinutes / 60)}"]`);
  const rowLabel = scroller && scroller.querySelector('.matrix-row-label');
  if (!scroller || !hourCell || !rowLabel) return;

  const scrollerRect = scroller.getBoundingClientRect();
  const cellRect = hourCell.getBoundingClientRect();
  const labelWidth = rowLabel.getBoundingClientRect().width;
  const visibleLeft = scrollerRect.left + labelWidth;
  const visibleRight = scrollerRect.right;
  if (cellRect.left >= visibleLeft && cellRect.right <= visibleRight) return;

  const visibleCenter = (visibleLeft + visibleRight) / 2;
  const cellCenter = (cellRect.left + cellRect.right) / 2;
  scroller.scrollLeft += cellCenter - visibleCenter;
}

export function scoreCellColorClass(score) {
  if (score >= 78) return 'bg-violet-500/30 text-violet-200 font-bold';
  if (score >= 55) return 'bg-emerald-500/20 text-emerald-300';
  if (score >= 35) return 'bg-amber-500/20 text-amber-300';
  return 'bg-slate-900 text-slate-500';
}

export function renderWeatherMatrixTable() {
  const tbody = document.getElementById('weatherMatrixBody');
  if (!state.weatherData || !state.activeSpot) return;

  const dayHours = state.weatherData.byDate[state.selectedDateStr] || state.weatherData.byDate[state.weatherData.dates[0]] || [];
  const activeHour = Math.floor(state.selectedMinutes / 60);

  // Compute hourly photography scores for the 24 columns
  const hourlyScores = dayHours.map(hw => computePhotographyScores(state.activeSpot, state.selectedDateStr, hw.hour * 60 + 30, hw));

  const buildRow = (labelHtml, renderCellFn) => `
    <tr class="hover:bg-slate-900/40 transition">
      <td class="matrix-row-label sticky left-0 z-10 px-3 py-2 font-sans font-semibold text-xs text-slate-200 border-r border-slate-800">
        ${labelHtml}
      </td>
      ${dayHours.map((hw, hIdx) => {
        const isSelectedCol = hIdx === activeHour;
        const isPastHour = isWeatherMatrixHourPast(hw.hour);
        return `<td data-hour-col="${hIdx}" class="matrix-hour-cell px-2 py-2 text-center cursor-pointer transition ${isPastHour ? 'matrix-past-hour' : ''} ${isSelectedCol ? 'ring-1 ring-inset ring-violet-400 bg-violet-500/10' : ''}">
          ${renderCellFn(hw, hourlyScores[hIdx], hIdx)}
        </td>`;
      }).join('')}
    </tr>
  `;

  tbody.innerHTML = [
    // Row 0: Hour Header
    `<tr class="bg-slate-900/90 text-slate-300">
      <th class="matrix-row-label sticky left-0 z-10 px-3 py-2 text-xs font-sans font-bold border-r border-slate-800">Giờ (GMT+7)</th>
      ${dayHours.map((hw, hIdx) => {
        const isSelectedCol = hIdx === activeHour;
        const isPastHour = isWeatherMatrixHourPast(hw.hour);
        return `<th data-hour-col="${hIdx}" class="matrix-hour-cell px-2 py-2 text-center cursor-pointer ${isPastHour ? 'matrix-past-hour' : isSelectedCol ? 'bg-violet-600 text-white font-bold' : 'hover:bg-slate-800'}">
          ${String(hw.hour).padStart(2, '0')}h
        </th>`;
      }).join('')}
    </tr>`,
    // Row 1: Milky Way / Astro Score
    buildRow(`${iconMarkup('milky-way', 'w-3 h-3 inline-block align-[-2px]')} Điểm Ngân Hà`, (hw, sc) => `<span class="px-1.5 py-0.5 rounded ${scoreCellColorClass(sc.mwScore)}">${sc.mwScore}</span>`),
    // Row 2: Cloud Sea Score
    buildRow(`${iconMarkup('cloud', 'w-3 h-3 inline-block align-[-2px]')} Điểm Săn Mây`, (hw, sc) => `<span class="px-1.5 py-0.5 rounded ${scoreCellColorClass(sc.cloudSeaScore)}">${sc.cloudSeaScore}</span>`),
    // Row 3: High Clouds (>6km)
    buildRow('Mây Cao (&gt;6km)', (hw) => `<span class="px-1.5 py-0.5 rounded ${cloudCellColorClass(hw.cloudHigh)}">${hw.cloudHigh}%</span>`),
    // Row 4: Mid Clouds (2-6km)
    buildRow('Mây Trung (2-6km)', (hw) => `<span class="px-1.5 py-0.5 rounded ${cloudCellColorClass(hw.cloudMid)}">${hw.cloudMid}%</span>`),
    // Row 5: Low Clouds (<2km)
    buildRow('Mây Thấp (&lt;2km)', (hw) => `<span class="px-1.5 py-0.5 rounded ${cloudCellColorClass(hw.cloudLow)}">${hw.cloudLow}%</span>`),
    // Row 6: Total Cloud Cover
    buildRow('Tổng Mây (%)', (hw) => `<span class="px-1.5 py-0.5 rounded ${cloudCellColorClass(hw.cloudTotal)}">${hw.cloudTotal}%</span>`),
    // Row 7: Temp vs Dew Point + Lens Condensation Warning
    buildRow('Nhiệt độ · Điểm sương', (hw, sc) => {
      const isDewRisk = sc.dewSpread <= 2.5;
      return `<div class="${isDewRisk ? 'text-rose-300 font-bold' : 'text-slate-300'}" title="Chênh lệch điểm sương: ${sc.dewSpread}°C">
        ${hw.temp}°/${Math.round(hw.dewPoint)}° ${isDewRisk ? iconMarkup('dew', 'w-3 h-3 inline-block align-[-2px]') : ''}
      </div>`;
    }),
    // Row 8: Relative Humidity & Wind Speed
    buildRow('Độ ẩm · Gió (km/h)', (hw) => `<span class="text-slate-400">${hw.humidity}% · ${hw.windKmh}</span>`)
  ].join('');
  renderIcons(tbody);

  // Click any hour column to sync the entire application to that hour
  tbody.querySelectorAll('.matrix-hour-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const h = parseInt(cell.getAttribute('data-hour-col'), 10);
      state.selectedMinutes = h * 60;
      document.getElementById('timeMinutesSlider').value = state.selectedMinutes;
      emit('app:refresh');
    });
  });
  revealSelectedMatrixHour();
}
