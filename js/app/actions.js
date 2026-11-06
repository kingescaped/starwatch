import { computeDailyEphemerisSummary } from '../astro/ephemeris.js';
import { computePhotographyScores } from '../astro/scoring.js';
import { formatHHMM } from '../astro/time.js';
import { state } from '../core/state.js';
import { getBortleColorInfo } from '../core/utils.js';
import { leafletMap, renderAllSpotMarkersOnMap } from '../map/map.js';
import { drawMapCanvasOverlays } from '../map/overlays.js';
import { updateFavoriteButton } from '../services/favorites.js';
import { fetchWeatherForActiveSpot } from '../services/weather.js';
import { iconMarkup, renderIcons, setIcon } from '../ui/icons.js';
import { renderCameraSetupGuide } from '../ui/camera-guide.js';
import { drawTopDownSkyDome } from '../ui/sky-dome.js';
import { renderSpotsDirectoryGrid } from '../ui/spots-directory.js';
import { renderWeatherMatrixTable } from '../ui/weather-matrix.js';

/**
 * Cross-cutting application actions (refresh, select spot, playback).
 */

export function updateAllViews() {
  const spot = state.activeSpot;
  if (!spot) return;

  // 1. Update Active Spot Header Info
  document.getElementById('activeSpotRegionBadge').textContent = `${spot.region} · ${spot.province}`;
  document.getElementById('activeSpotName').textContent = spot.name;
  document.getElementById('activeSpotDesc').textContent = spot.desc;
  document.getElementById('activeSpotCoords').textContent = `${spot.lat.toFixed(4)}, ${spot.lon.toFixed(4)}`;
  document.getElementById('activeSpotElevation').textContent = `${spot.elevation.toLocaleString()} m`;

  const bortleInfo = getBortleColorInfo(spot.bortle);
  const bortleEl = document.getElementById('activeSpotBortle');
  const bortleDot = document.getElementById('activeSpotBortleDot');
  if (bortleEl) {
    bortleEl.textContent = `Bortle ${spot.bortle} (${bortleInfo.name})`;
    bortleEl.className = `${bortleInfo.textTierClass} font-mono font-bold`;
  }
  if (bortleDot) {
    bortleDot.className = `w-2 h-2 rounded-full ${bortleInfo.dotClass}`;
  }

  // 2. Get current hour weather & compute Photography Scores
  const activeHour = Math.min(23, Math.floor(state.selectedMinutes / 60));
  const dayHours = (state.weatherData && state.weatherData.byDate[state.selectedDateStr]) || [];
  const currentHourWeather = dayHours[activeHour];

  const evalNow = computePhotographyScores(spot, state.selectedDateStr, state.selectedMinutes, currentHourWeather);

  // Update Dew Heater Warning Badge
  const dewEl = document.getElementById('activeDewStatus');
  if (evalNow.dewSpread <= 2.5) {
    dewEl.innerHTML = `${iconMarkup('dew', 'w-3 h-3 inline-block align-[-2px] mr-1')} Dễ đọng sương (Δ${evalNow.dewSpread}°C)`;
    dewEl.className = 'text-xs font-semibold text-rose-400 mt-0.5 block';
    renderIcons(dewEl);
  } else {
    dewEl.textContent = `An toàn sương (Δ${evalNow.dewSpread}°C)`;
    dewEl.className = 'text-xs font-semibold text-emerald-400 mt-0.5 block';
  }

  // Update 3 Score Cards
  document.getElementById('scoreMilkyWay').textContent = evalNow.mwScore;
  document.getElementById('barMilkyWay').style.width = `${evalNow.mwScore}%`;
  document.getElementById('badgeMilkyWay').textContent = evalNow.mwScore >= 75 ? 'Rất lý tưởng' : (evalNow.mwScore >= 50 ? 'Khá tốt' : 'Hạn chế');
  document.getElementById('reasonMilkyWay').textContent =
    `Mây ${currentHourWeather ? currentHourWeather.cloudTotal : 18}% · Trăng sáng ${evalNow.moon.illuminationPct}% (${evalNow.moon.altitude >= 0 ? 'Trên chân trời' : 'Đã lặn'}) · ${evalNow.target.shortName} ${evalNow.target.altitude.toFixed(0)}°`;

  document.getElementById('scoreAfterglow').textContent = evalNow.afterglowScore;
  document.getElementById('barAfterglow').style.width = `${evalNow.afterglowScore}%`;
  document.getElementById('badgeAfterglow').textContent = evalNow.afterglowScore >= 72 ? 'Ráng đẹp' : (evalNow.afterglowScore >= 50 ? 'Trung bình' : 'Ít ráng');
  document.getElementById('reasonAfterglow').textContent =
    `Mây cao/trung ${currentHourWeather ? Math.round((currentHourWeather.cloudHigh + currentHourWeather.cloudMid) / 2) : 42}% bắt sáng · Mây thấp ${currentHourWeather ? currentHourWeather.cloudLow : 20}%`;

  document.getElementById('scoreCloudSea').textContent = evalNow.cloudSeaScore;
  document.getElementById('barCloudSea').style.width = `${evalNow.cloudSeaScore}%`;
  document.getElementById('badgeCloudSea').textContent = evalNow.cloudSeaScore >= 75 ? 'Biển mây dày' : (evalNow.cloudSeaScore >= 50 ? 'Có mây luồn' : 'Xác suất thấp');
  document.getElementById('reasonCloudSea').textContent =
    `Đáy mây ~${evalNow.lclCloudBaseMeters}m vs Đỉnh ${spot.elevation}m · Gió ${currentHourWeather ? currentHourWeather.windKmh : 7}km/h · Ẩm ${currentHourWeather ? currentHourWeather.humidity : 88}%`;

  // 3. Update Daily Ephemeris Summary & Time Controller Bar
  const eph = computeDailyEphemerisSummary(state.selectedDateStr, spot.lat, spot.lon, state.selectedTargetKey);
  document.getElementById('lblSunriseQuick').textContent = formatHHMM(eph.sunriseMin);
  document.getElementById('lblSunsetQuick').textContent = formatHHMM(eph.sunsetMin);
  document.getElementById('lblAstroDarkQuick').textContent = formatHHMM(eph.astroDuskMin);
  document.getElementById('lblTargetPeakQuick').textContent = formatHHMM(eph.targetPeakMin);

  document.getElementById('lblCurrentTimeDisplay').textContent = `${formatHHMM(state.selectedMinutes)} GMT+7`;
  const skyPhaseLabel = document.getElementById('lblSkyPhaseDescription');
  skyPhaseLabel.textContent = `Mặt trời ${evalNow.sun.altitude.toFixed(1)}° · ${evalNow.moon.phaseName}`;
  skyPhaseLabel.title = skyPhaseLabel.textContent;

  document.getElementById('ephemerisDateLabel').textContent = state.selectedDateStr;
  document.getElementById('ephAstroDawn').textContent = formatHHMM(eph.astroDawnMin);
  document.getElementById('ephSunrise').textContent = formatHHMM(eph.sunriseMin);
  document.getElementById('ephSunset').textContent = formatHHMM(eph.sunsetMin);
  document.getElementById('ephAstroDusk').textContent = formatHHMM(eph.astroDuskMin);
  document.getElementById('ephMoonPhase').textContent = `${evalNow.moon.illuminationPct}% (${evalNow.moon.ageDays} ngày)`;
  document.getElementById('ephTargetRiseSet').textContent =
    `${formatHHMM(eph.targetRiseMin)} · ${formatHHMM(eph.targetPeakMin)} (${Math.round(eph.targetPeakAlt)}°) · ${formatHHMM(eph.targetSetMin)}`;

  // 4. Redraw Map Overlays, Top-Down Sky Dome, and Matrix Table
  drawMapCanvasOverlays();
  drawTopDownSkyDome();
  renderWeatherMatrixTable();
  renderCameraSetupGuide();
  renderSpotsDirectoryGrid();
}

export function selectSpot(spot, flyMap = true) {
  state.activeSpot = spot;
  updateFavoriteButton();
  renderAllSpotMarkersOnMap();
  renderSpotsDirectoryGrid();
  updateAllViews();
  if (flyMap && leafletMap) {
    leafletMap.flyTo([spot.lat, spot.lon], Math.max(leafletMap.getZoom(), 8), { duration: 0.9 });
  }
  fetchWeatherForActiveSpot();
}

export function setMapSimulationPlayback(isPlaying) {
  state.isPlayingTimeline = isPlaying;
  state.isPlayingRadar = isPlaying;
  clearInterval(state.timelineTimer);
  clearInterval(state.radarTimer);
  state.timelineTimer = null;
  state.radarTimer = null;

  const timelineIcon = document.getElementById('iconPlayTimeline');
  const radarIcon = document.getElementById('iconPlayRadar');
  const timelineButton = document.getElementById('btnPlayTimeline');
  const radarButton = document.getElementById('btnPlayRadarLoop');
  setIcon(timelineIcon, isPlaying ? 'pause' : 'play');
  setIcon(radarIcon, isPlaying ? 'pause' : 'play');
  timelineButton.setAttribute('aria-pressed', String(isPlaying));
  radarButton.setAttribute('aria-pressed', String(isPlaying));
  timelineButton.title = isPlaying ? 'Tạm dừng mô phỏng bản đồ và bầu trời' : 'Chạy mô phỏng thời gian, ánh sáng, mây và phương vị';
  radarButton.title = timelineButton.title;

  if (isPlaying) {
    state.showBortleOverlay = true;
    state.showHimawariOverlay = true;
    state.showAzimuthVectors = true;
    ['btnToggleBortleOverlay', 'btnToggleHimawariOverlay', 'btnToggleAzimuthVectors'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.classList.remove('opacity-40', 'is-off');
        btn.setAttribute('aria-pressed', 'true');
      }
    });

    const timeSlider = document.getElementById('timeMinutesSlider');
    const radarSlider = document.getElementById('sliderRadarFrame');
    const radarTimeLabel = document.getElementById('lblRadarFrameTime');
    state.timelineTimer = setInterval(() => {
      const speed = parseInt(document.getElementById('selectPlaybackSpeed').value, 10) || 60;
      state.selectedMinutes = (state.selectedMinutes + Math.max(2, Math.round(speed / 10))) % 1440;
      timeSlider.value = state.selectedMinutes;
      updateAllViews();
    }, 100);
    state.radarTimer = setInterval(() => {
      let nextFrame = state.radarFrameMinutes + 15;
      if (nextFrame > 60) nextFrame = -90;
      state.radarFrameMinutes = nextFrame;
      radarSlider.value = nextFrame;
      radarTimeLabel.textContent = nextFrame === 0
        ? 'Mô phỏng · hiện tại'
        : `Mô phỏng · ${nextFrame > 0 ? '+' : ''}${nextFrame} phút`;
      drawMapCanvasOverlays();
    }, 450);
    drawMapCanvasOverlays();
  }

}
