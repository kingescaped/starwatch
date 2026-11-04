/**
 * Global application state.
 */

export const state = {
  spots: [],
  favoriteSpots: [],
  activeSpot: null,
  selectedDateStr: '',      // YYYY-MM-DD in Asia/Bangkok
  selectedMinutes: 1260,    // 21:00 default (0..1439)
  selectedTargetKey: 'galactic_center',
  activeRegionFilter: 'all',
  isPlayingTimeline: false,
  playbackSpeedMinPerSec: 60,
  timelineTimer: null,
  // Map & Overlays state
  showBortleOverlay: true,
  showHimawariOverlay: true,
  showAzimuthVectors: true,
  radarFrameMinutes: 0,     // -90 to +60 minutes
  isPlayingRadar: false,
  radarTimer: null,
  // Weather forecast data from Open-Meteo
  weatherData: null,
  activeForecastDayIndex: 0,
  // Camera Setup & Calendar state
  selectedGearMode: 'fullframe', // 'fullframe' | 'iphone18pro' | 'androidflagship'
  selectedSetupEvent: 'milkyway', // 'milkyway' | 'deepsky' | 'meteor' | 'moon' | 'cloudsea'
  activeCalendarFilter: 'all'
};
