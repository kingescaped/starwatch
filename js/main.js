/**
 * Application entry point.
 * Loads the modules and wires the initial DOM state.
 */
import { initAppEvents, initEventListeners } from './app/events.js';
import { updateAllViews } from './app/actions.js';
import { state } from './core/state.js';
import { initVietnamMap } from './map/map.js';
import { loadFavoriteSpotsFromStorage, updateFavoriteButton } from './services/favorites.js';
import { initializeLocationConsent } from './services/geocoding.js';
import { loadSpotsFromStorage } from './services/spots-store.js';
import { fetchWeatherForActiveSpot } from './services/weather.js';
import { renderIcons } from './ui/icons.js';

window.addEventListener('DOMContentLoaded', () => {
  renderIcons();
  loadSpotsFromStorage();
  loadFavoriteSpotsFromStorage();
  state.activeSpot = state.spots.find(spot => spot.id === 'khe-sanh') || state.spots[0] || null;
  initAppEvents();
  initEventListeners();
  initVietnamMap();
  updateAllViews();
  fetchWeatherForActiveSpot();
  updateFavoriteButton();
  initializeLocationConsent();
});
