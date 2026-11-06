import { state } from '../core/state.js';
import { DEFAULT_VIETNAM_SPOTS } from '../data/spots.js';
import { getSpotKey } from '../core/utils.js';

/**
 * Custom spot and curated spot persistence & deletion management.
 */

export function loadSpotsFromStorage() {
  try {
    const customRaw = localStorage.getItem('skyradar_custom_spots_v1');
    const customSpots = customRaw ? JSON.parse(customRaw) : [];

    const deletedRaw = localStorage.getItem('skyradar_deleted_spots_v1');
    const deletedList = deletedRaw ? JSON.parse(deletedRaw) : [];
    const deletedSet = new Set(deletedList);

    const merged = [...DEFAULT_VIETNAM_SPOTS, ...customSpots];
    state.spots = merged.filter(spot => {
      const key = getSpotKey(spot);
      return !deletedSet.has(spot.id) && !deletedSet.has(key);
    });
  } catch (e) {
    state.spots = [...DEFAULT_VIETNAM_SPOTS];
  }

  const countEl = document.getElementById('countAllSpots');
  if (countEl) countEl.textContent = state.spots.length;
}

export function deleteSpotFromStorage(spotIdentifier, spotKey = null) {
  try {
    const identifiers = [spotIdentifier, spotKey].filter(Boolean);

    // 1. Remove from custom spots if present
    const customRaw = localStorage.getItem('skyradar_custom_spots_v1');
    if (customRaw) {
      const customSpots = JSON.parse(customRaw);
      const remainingCustom = customSpots.filter(
        s => !identifiers.includes(s.id) && !identifiers.includes(getSpotKey(s))
      );
      localStorage.setItem('skyradar_custom_spots_v1', JSON.stringify(remainingCustom));
    }

    // 2. Track deleted spot identifier
    const deletedRaw = localStorage.getItem('skyradar_deleted_spots_v1');
    const deletedList = deletedRaw ? JSON.parse(deletedRaw) : [];
    identifiers.forEach(id => {
      if (!deletedList.includes(id)) {
        deletedList.push(id);
      }
    });
    localStorage.setItem('skyradar_deleted_spots_v1', JSON.stringify(deletedList));

    // 3. Remove from favorites if present
    const favRaw = localStorage.getItem('starwatch_favorite_spots_v1');
    if (favRaw) {
      const favs = JSON.parse(favRaw);
      const remainingFavs = favs.filter(
        s => !identifiers.includes(s.id) && !identifiers.includes(getSpotKey(s))
      );
      localStorage.setItem('starwatch_favorite_spots_v1', JSON.stringify(remainingFavs));
      state.favoriteSpots = remainingFavs;
      const favCount = document.getElementById('countFavoriteSpots');
      if (favCount) favCount.textContent = String(state.favoriteSpots.length);
    }

    // 4. Reload active spots
    loadSpotsFromStorage();
    return true;
  } catch (err) {
    console.error('Lỗi khi xoá địa điểm:', err);
    return false;
  }
}

export function restoreDefaultSpots() {
  try {
    localStorage.removeItem('skyradar_deleted_spots_v1');
    loadSpotsFromStorage();
  } catch (err) {
    console.error('Lỗi khi khôi phục địa điểm:', err);
  }
}
