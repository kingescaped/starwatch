import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { escapeHTML, getSpotKey } from '../core/utils.js';

/**
 * Curated spots directory grid renderer.
 */

export function renderSpotsDirectoryGrid() {
  const container = document.getElementById('spotsGridContainer');
  const filtered = state.activeRegionFilter === 'favorites'
    ? state.favoriteSpots
    : state.activeRegionFilter === 'all'
      ? state.spots
      : state.spots.filter(spot => spot.region === state.activeRegionFilter);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="col-span-full rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400">Chưa có địa điểm yêu thích. Chọn một điểm hoặc lấy GPS, rồi bấm biểu tượng trái tim để lưu.</div>';
    return;
  }

  container.innerHTML = filtered.map(spot => {
    const isSelected = state.activeSpot && state.activeSpot.id === spot.id;
    return `
      <div
        data-spot-key="${getSpotKey(spot)}"
        class="spot-card-item glass-card rounded-xl p-3.5 cursor-pointer transition border ${
          isSelected
            ? 'border-violet-500 ring-1 ring-violet-500/50 bg-violet-950/20'
            : 'border-slate-800 hover:border-slate-600'
        } flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between gap-1 text-[10px] font-mono">
            <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300">${escapeHTML(spot.province)}</span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Bortle ${escapeHTML(spot.bortle)}</span>
          </div>
          <h4 class="text-sm font-bold text-white mt-2 line-clamp-1">${escapeHTML(spot.name)}</h4>
          <p class="text-[11px] text-slate-400 mt-1 line-clamp-2">${escapeHTML(spot.desc)}</p>
        </div>
        <div class="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80 text-[11px]">
          <span class="font-mono text-amber-300">⛰ ${escapeHTML(spot.elevation)}m</span>
          <span class="text-violet-300 font-semibold flex items-center gap-1">
            Xem dự báo →
          </span>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.spot-card-item').forEach(card => {
    card.addEventListener('click', () => {
      const spotKey = card.getAttribute('data-spot-key');
      const found = [...state.spots, ...state.favoriteSpots].find(spot => getSpotKey(spot) === spotKey);
      if (found) {
        emit('spot:select', { spot: found, flyMap: true, scrollToMatrix: true });
      }
    });
  });
}
