import { state } from '../core/state.js';
import { getSpotKey, showAppStatus } from '../core/utils.js';
import { renderSpotsDirectoryGrid } from '../ui/spots-directory.js';

/**
 * Favorite spots persistence and UI state.
 */

export const FAVORITE_SPOTS_STORAGE_KEY = 'starwatch_favorite_spots_v1';

export function loadFavoriteSpotsFromStorage() {
  try {
    const rawFavorites = localStorage.getItem(FAVORITE_SPOTS_STORAGE_KEY);
    const favorites = rawFavorites ? JSON.parse(rawFavorites) : [];
    if (!Array.isArray(favorites)) throw new Error('Saved favorites are not an array');
    state.favoriteSpots = favorites.filter(spot =>
      spot && Number.isFinite(Number(spot.lat)) && Number.isFinite(Number(spot.lon)) &&
      Number(spot.lat) >= -90 && Number(spot.lat) <= 90 &&
      Number(spot.lon) >= -180 && Number(spot.lon) <= 180 &&
      typeof spot.name === 'string'
    ).map(spot => ({ ...spot, lat: Number(spot.lat), lon: Number(spot.lon) }));
  } catch (error) {
    state.favoriteSpots = [];
    showAppStatus('Không đọc được danh sách yêu thích đã lưu trên thiết bị.', true);
  }
  document.getElementById('countFavoriteSpots').textContent = String(state.favoriteSpots.length);
}

export function persistFavoriteSpots() {
  try {
    localStorage.setItem(FAVORITE_SPOTS_STORAGE_KEY, JSON.stringify(state.favoriteSpots));
    document.getElementById('countFavoriteSpots').textContent = String(state.favoriteSpots.length);
    return true;
  } catch (error) {
    showAppStatus('Không thể lưu yêu thích. Hãy kiểm tra dung lượng lưu trữ của trình duyệt.', true);
    return false;
  }
}

export function updateFavoriteButton() {
  const button = document.getElementById('btnToggleFavoriteSpot');
  const icon = button.querySelector('svg, i');
  const isFavorite = state.activeSpot &&
    state.favoriteSpots.some(spot => getSpotKey(spot) === getSpotKey(state.activeSpot));
  button.setAttribute('aria-pressed', String(Boolean(isFavorite)));
  button.setAttribute('aria-label', isFavorite ? 'Bỏ địa điểm khỏi yêu thích' : 'Lưu địa điểm yêu thích');
  button.title = isFavorite ? 'Bỏ lưu địa điểm yêu thích' : 'Lưu địa điểm yêu thích trên thiết bị này';
  button.classList.toggle('bg-amber-500/30', Boolean(isFavorite));
  icon.setAttribute('fill', isFavorite ? 'currentColor' : 'none');
}

export function toggleActiveSpotFavorite() {
  if (!state.activeSpot) return;
  const spotKey = getSpotKey(state.activeSpot);
  const existingIndex = state.favoriteSpots.findIndex(spot => getSpotKey(spot) === spotKey);
  const previousFavorites = state.favoriteSpots;
  state.favoriteSpots = existingIndex >= 0
    ? state.favoriteSpots.filter((_, index) => index !== existingIndex)
    : [...state.favoriteSpots, { ...state.activeSpot, tags: [...(state.activeSpot.tags || [])] }];

  if (!persistFavoriteSpots()) {
    state.favoriteSpots = previousFavorites;
    return;
  }
  updateFavoriteButton();
  renderSpotsDirectoryGrid();
  showAppStatus(existingIndex >= 0 ? 'Đã bỏ địa điểm khỏi yêu thích.' : 'Đã lưu địa điểm vào danh sách yêu thích.');
}
