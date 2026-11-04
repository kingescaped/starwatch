import { state } from '../core/state.js';
import { DEFAULT_VIETNAM_SPOTS } from '../data/spots.js';

/**
 * Custom spot persistence.
 */

export function loadSpotsFromStorage() {
  try {
    const customRaw = localStorage.getItem('skyradar_custom_spots_v1');
    const customSpots = customRaw ? JSON.parse(customRaw) : [];
    state.spots = [...DEFAULT_VIETNAM_SPOTS, ...customSpots];
  } catch (e) {
    state.spots = [...DEFAULT_VIETNAM_SPOTS];
  }
  document.getElementById('countAllSpots').textContent = state.spots.length;
}
