import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { escapeHTML, getBortleColorInfo, getSpotKey } from '../core/utils.js';
import { iconMarkup, renderIcons } from './icons.js';
import { attachHoldToConfirm } from './hold-confirm.js';

/**
 * Curated spots directory grid renderer.
 */

export function resetDeleteSpotMode() {
  if (state.isDeleteSpotMode) {
    state.isDeleteSpotMode = false;
    const btnToggleDelete = document.getElementById('btnToggleDeleteSpotMode');
    const labelDelete = document.getElementById('labelDeleteSpotMode');
    const hintText = document.getElementById('spotsSubbarHintText');
    if (btnToggleDelete) {
      btnToggleDelete.className = 'px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer';
    }
    if (labelDelete) labelDelete.textContent = 'Xoá địa điểm';
    if (hintText) hintText.textContent = 'Chọn địa điểm để xem dự báo & cập nhật thông số chụp';
  }
}

export function renderSpotsDirectoryGrid() {
  const container = document.getElementById('spotsGridContainer');
  if (!container) return;

  const filtered = state.activeRegionFilter === 'favorites'
    ? state.favoriteSpots
    : state.activeRegionFilter === 'all'
      ? state.spots
      : state.spots.filter(spot => spot.region === state.activeRegionFilter);

  // Sync Delete Mode Toggle Button UI in header
  const btnToggleDelete = document.getElementById('btnToggleDeleteSpotMode');
  const labelDelete = document.getElementById('labelDeleteSpotMode');
  const hintText = document.getElementById('spotsSubbarHintText');

  if (btnToggleDelete) {
    if (state.isDeleteSpotMode) {
      btnToggleDelete.className = 'px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 shadow-md shadow-rose-600/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer is-active';
      if (labelDelete) labelDelete.textContent = 'Hoàn tất xoá';
      if (hintText) hintText.textContent = 'Chế độ xoá đang bật: Nhấn giữ nút "Xoá" đỏ trên thẻ để loại bỏ địa điểm';
    } else {
      btnToggleDelete.className = 'px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer';
      if (labelDelete) labelDelete.textContent = 'Xoá địa điểm';
      if (hintText) hintText.textContent = 'Chọn địa điểm để xem dự báo & cập nhật thông số chụp';
    }
  }

  if (filtered.length === 0) {
    const isFav = state.activeRegionFilter === 'favorites';
    container.innerHTML = `
      <div class="col-span-full rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        <p class="mb-2 font-medium text-slate-300">
          ${isFav ? 'Chưa có địa điểm yêu thích nào.' : 'Không tìm thấy địa điểm nào trong mục này.'}
        </p>
        <p class="text-xs text-slate-400">
          ${isFav ? 'Chọn một điểm trên bản đồ hoặc danh bạ rồi bấm biểu tượng trái tim để lưu.' : 'Tất cả địa điểm trong danh mục có thể đã bị xoá.'}
        </p>
      </div>
    `;
    return;
  }

  const isDeleteMode = Boolean(state.isDeleteSpotMode);

  container.innerHTML = filtered.map(spot => {
    const isSelected = state.activeSpot && state.activeSpot.id === spot.id;
    const bortleInfo = getBortleColorInfo(spot.bortle);
    const spotKey = getSpotKey(spot);

    return `
      <div
        data-spot-key="${spotKey}"
        class="spot-card-item glass-card rounded-2xl p-4 cursor-pointer transition border ${
          isSelected
            ? 'border-violet-500 ring-1 ring-violet-500/50 bg-violet-950/25'
            : isDeleteMode
              ? 'border-slate-800 hover:border-rose-500/60 hover:bg-rose-950/10'
              : 'border-slate-800/90 hover:border-slate-600 hover:bg-slate-800/30'
        } flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between gap-1 text-[10px] font-mono">
            <span class="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300">${escapeHTML(spot.province || spot.region)}</span>
            <span class="bortle-badge bortle-badge--tier-${bortleInfo.level} px-2 py-0.5 rounded-md text-[10px]">Bortle ${escapeHTML(spot.bortle)}</span>
          </div>
          <h4 class="text-sm font-bold text-white mt-2.5 line-clamp-1">${escapeHTML(spot.name)}</h4>
          <p class="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">${escapeHTML(spot.desc || '')}</p>
        </div>

        <div class="spot-card-actions flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-800/80 text-[11px]">
          <span class="font-mono text-amber-300 flex items-center gap-1">
            ${iconMarkup('mountain', 'w-3 h-3 text-amber-400')}
            <span>${escapeHTML(spot.elevation)}m</span>
          </span>

          ${isDeleteMode ? `
            <button
              type="button"
              data-action="delete-spot"
              data-spot-key="${spotKey}"
              class="btn-delete-spot-action hold-confirm"
              title="Nhấn giữ để xoá ${escapeHTML(spot.name)}"
              aria-label="Nhấn giữ để xoá ${escapeHTML(spot.name)}"
            >
              ${iconMarkup('trash-2', 'w-3.5 h-3.5')}
              <span>Xoá</span>
            </button>
          ` : `
            <span class="spot-card-forecast text-violet-300 font-semibold flex items-center gap-1 hover:text-violet-200 transition">
              <span>Xem dự báo</span>
              ${iconMarkup('arrow-right', 'w-3 h-3')}
            </span>
          `}
        </div>
      </div>
    `;
  }).join('');

  renderIcons(container);

  container.querySelectorAll('.btn-delete-spot-action').forEach(button => {
    const spotKey = button.getAttribute('data-spot-key');
    attachHoldToConfirm(button, {
      onComplete: () => {
        const found = [...state.spots, ...state.favoriteSpots].find(spot => getSpotKey(spot) === spotKey);
        if (found) emit('spot:delete', { spot: found, spotKey });
      }
    });
  });

  container.querySelectorAll('.spot-card-item').forEach(card => {
    card.addEventListener('click', (event) => {
      const spotKey = card.getAttribute('data-spot-key');
      const found = [...state.spots, ...state.favoriteSpots].find(spot => getSpotKey(spot) === spotKey);
      if (!found) return;

      // Deletion only happens through the press-and-hold button.
      if (event.target.closest('.btn-delete-spot-action') || state.isDeleteSpotMode) {
        event.stopPropagation();
        return;
      }

      emit('spot:select', { spot: found, flyMap: true, scrollToMatrix: true });
    });
  });
}
