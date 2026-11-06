import { selectSpot, setMapSimulationPlayback, updateAllViews } from '../app/actions.js';
import { computeDailyEphemerisSummary } from '../astro/ephemeris.js';
import { getCurrentVietnamDateTime } from '../astro/time.js';
import { CARTO_CONFIG, DEFAULT_CARTO_API_KEY } from '../config/carto.js';
import { on } from '../core/events.js';
import { state } from '../core/state.js';
import { fetchNominatim, getBortleColorInfo, getSpotKey } from '../core/utils.js';
import { estimateBortleAtCoord, estimateTerrainElevation, renderAllSpotMarkersOnMap, setMapBaseTile, syncLeafletMapSize, updateCartoTelemetryUI } from '../map/map.js';
import { drawMapCanvasOverlays } from '../map/overlays.js';
import { toggleActiveSpotFavorite } from '../services/favorites.js';
import { requestCurrentLocation, reverseGeocodeSpot } from '../services/geocoding.js';
import { deleteSpotFromStorage, loadSpotsFromStorage } from '../services/spots-store.js';
import { fetchWeatherForActiveSpot } from '../services/weather.js';
import { renderAstroCalendarModal } from '../ui/astro-calendar.js';
import { renderCameraSetupGuide, scrollToCameraSetup } from '../ui/camera-guide.js';
import { iconMarkup, renderIcons } from '../ui/icons.js';
import { attachHoldToConfirm } from '../ui/hold-confirm.js';
import { drawTopDownSkyDome } from '../ui/sky-dome.js';
import { renderSpotsDirectoryGrid, resetDeleteSpotMode } from '../ui/spots-directory.js';
import { closeToolModal, openToolModal } from '../ui/tool-modal.js';
import { matrixHourRefreshTimer, renderForecastDayTabs, revealSelectedMatrixHour, scheduleMatrixHourRefresh, scrollToWeatherMatrix } from '../ui/weather-matrix.js';

/**
 * DOM event listeners and initialization wiring.
 */

let modalOverlays = [];
let backgroundScrollLocked = false;
let lockedScrollY = 0;
let pendingScrollAfterModalUnlock = null;
let modalObserver = null;

export function syncMobileNavIndicator() {
  const mobileNav = document.getElementById('mobileToolNav');
  if (!mobileNav) return;
  const isMobile = window.matchMedia('(max-width: 639.98px)').matches;
  let indicator = document.getElementById('mobileNavIndicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'mobileNavIndicator';
    indicator.className = 'mobile-nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    mobileNav.appendChild(indicator);
  }

  if (!isMobile) {
    indicator.style.opacity = '0';
    indicator.style.visibility = 'hidden';
    indicator.dataset.active = 'false';
    return;
  }

  const activeBtn = mobileNav.querySelector('button.is-nav-active');
  if (activeBtn) {
    const navRect = mobileNav.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const x = btnRect.left - navRect.left;
    const width = btnRect.width;

    if (indicator.dataset.active === 'true') {
      indicator.style.transform = `translateX(${x}px)`;
      indicator.style.width = `${width}px`;
    } else {
      indicator.style.transition = 'none';
      indicator.style.transform = `translateX(${x}px)`;
      indicator.style.width = `${width}px`;
      void indicator.offsetWidth;
      indicator.style.transition = '';
      indicator.dataset.active = 'true';
    }
    indicator.style.opacity = '1';
    indicator.style.visibility = 'visible';
  } else {
    indicator.dataset.active = 'false';
    indicator.style.opacity = '0';
    indicator.style.visibility = 'hidden';
  }
}

export function syncBackgroundScrollLock() {
  if (!modalOverlays.length) {
    modalOverlays = [...document.querySelectorAll('.tool-modal, div[id^="modal"].fixed')];
  }

  // Synchronize mobile bottom nav tab active indicators
  const navMap = [
    ['modalAstroCalendar', 'btnOpenAstroCalendarModal'],
    ['modalContributeSpot', 'btnOpenContributeModal'],
    ['modalSpotsDirectory', 'btnOpenSpotsDirectory'],
    ['modalUserGuide', 'btnOpenGuideModal'],
    ['modalSettings', 'btnOpenSettingsModal']
  ];
  navMap.forEach(([modalId, btnId]) => {
    const modalEl = document.getElementById(modalId);
    const btnEl = document.getElementById(btnId);
    if (modalEl && btnEl) {
      const isOpen = !modalEl.classList.contains('hidden');
      btnEl.classList.toggle('is-nav-active', isOpen);
      btnEl.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  });

  // Reset delete mode if spots directory is closed
  const spotsModal = document.getElementById('modalSpotsDirectory');
  if (spotsModal && spotsModal.classList.contains('hidden') && state.isDeleteSpotMode) {
    resetDeleteSpotMode();
  }

  syncMobileNavIndicator();

  const hasOpenModal = modalOverlays.some(modal => !modal.classList.contains('hidden'));
  if (hasOpenModal === backgroundScrollLocked) return;

  if (hasOpenModal) {
    lockedScrollY = window.scrollY;
    backgroundScrollLocked = true;
    document.documentElement.classList.add('modal-scroll-locked');
    document.body.classList.add('modal-scroll-locked');
    return;
  }

  backgroundScrollLocked = false;
  document.documentElement.classList.remove('modal-scroll-locked');
  document.body.classList.remove('modal-scroll-locked');

  if (pendingScrollAfterModalUnlock) {
    const scrollFn = pendingScrollAfterModalUnlock;
    pendingScrollAfterModalUnlock = null;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollFn();
      });
    });
    return;
  }

  window.scrollTo(0, lockedScrollY);
}

export function initEventListeners() {
   const activeSpotBar = document.getElementById('activeSpotBar');
   const activeSpotBarToggle = document.getElementById('activeSpotBarToggle');
   const spotBarMobileQuery = window.matchMedia('(max-width: 639px)');
   let activeSpotBarAnimation = null;

   const applySpotBarState = (isCollapsed) => {
     activeSpotBar.dataset.collapsed = String(isCollapsed);
     activeSpotBarToggle.setAttribute('aria-expanded', String(!isCollapsed));
     activeSpotBarToggle.setAttribute(
       'aria-label',
       isCollapsed ? 'Mở rộng thanh địa điểm' : 'Thu gọn thanh địa điểm'
     );
     activeSpotBarToggle.title = isCollapsed ? 'Mở rộng thanh địa điểm' : 'Thu gọn thanh địa điểm';
     activeSpotBarToggle.querySelector('.active-spot-toggle-collapse').classList.toggle('hidden', isCollapsed);
     activeSpotBarToggle.querySelector('.active-spot-toggle-expand').classList.toggle('hidden', !isCollapsed);
     activeSpotBar.querySelectorAll('.active-spot-bar-detail').forEach(detail => {
       detail.inert = isCollapsed;
     });
   };

   const setSpotBarCollapsed = (isCollapsed, { animate = true } = {}) => {
     const startHeight = activeSpotBar.getBoundingClientRect().height;
     if (activeSpotBarAnimation) {
       activeSpotBarAnimation.onfinish = null;
       activeSpotBarAnimation.cancel();
       activeSpotBarAnimation = null;
       activeSpotBar.style.removeProperty('height');
       activeSpotBar.style.removeProperty('box-sizing');
       activeSpotBar.style.removeProperty('overflow');
     }

     applySpotBarState(isCollapsed);

     if (!animate || spotBarMobileQuery.matches) return;
     if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

     const endHeight = activeSpotBar.getBoundingClientRect().height;
     if (Math.abs(startHeight - endHeight) < 1) return;

     activeSpotBar.style.boxSizing = 'border-box';
     activeSpotBar.style.overflow = 'hidden';
     activeSpotBarAnimation = activeSpotBar.animate(
       [{ height: `${startHeight}px` }, { height: `${endHeight}px` }],
       { duration: 180, easing: 'ease-out' }
     );
     activeSpotBarAnimation.onfinish = () => {
       activeSpotBarAnimation = null;
       activeSpotBar.style.removeProperty('height');
       activeSpotBar.style.removeProperty('box-sizing');
       activeSpotBar.style.removeProperty('overflow');
     };
   };

   activeSpotBarToggle.addEventListener('click', () => {
     setSpotBarCollapsed(activeSpotBar.dataset.collapsed !== 'true');
   });

   // Mobile starts compact; desktop keeps the full bar. Load/resize re-syncs after layout settles.
   let lastSpotBarMobile = null;
   const syncSpotBarForViewport = () => {
     const isMobile = spotBarMobileQuery.matches;
     if (isMobile === lastSpotBarMobile) return;
     lastSpotBarMobile = isMobile;
     setSpotBarCollapsed(isMobile, { animate: false });
   };
   syncSpotBarForViewport();
   window.addEventListener('load', syncSpotBarForViewport, { once: true });
   window.addEventListener('resize', syncSpotBarForViewport);
   spotBarMobileQuery.addEventListener('change', syncSpotBarForViewport);

   // Keep --chrome-h equal to the real sticky header + spot bar height so
   // scroll margins never drift when the bar collapses or the header wraps.
   const appChrome = document.getElementById('appChrome');
   if (appChrome) {
     let chromeHeightFrame = null;
     const syncChromeHeight = () => {
       chromeHeightFrame = null;
       const height = Math.round(appChrome.getBoundingClientRect().height);
       document.documentElement.style.setProperty('--chrome-h', `${height}px`);
     };
     const scheduleChromeHeightSync = () => {
       if (chromeHeightFrame !== null) return;
       chromeHeightFrame = window.requestAnimationFrame(syncChromeHeight);
     };
     syncChromeHeight();
     if ('ResizeObserver' in window) {
       new ResizeObserver(scheduleChromeHeightSync).observe(appChrome);
     }
     window.addEventListener('resize', scheduleChromeHeightSync);
   }

    // Mobile bottom nav placement: outside of app-chrome on mobile so it is not trapped
    // in the app-chrome stacking context, and inside header-frame on desktop.
    const mobileToolNav = document.getElementById('mobileToolNav');
    const headerFrame = document.querySelector('.header-frame');
    const syncNavPlacement = () => {
      if (!mobileToolNav) return;
      const isMobile = spotBarMobileQuery.matches;
      if (isMobile && mobileToolNav.parentElement !== document.body) {
        document.body.appendChild(mobileToolNav);
      } else if (!isMobile && headerFrame && mobileToolNav.parentElement !== headerFrame) {
        headerFrame.appendChild(mobileToolNav);
      }
      syncMobileNavIndicator();
    };
    syncNavPlacement();
    window.addEventListener('resize', syncNavPlacement);
    spotBarMobileQuery.addEventListener('change', syncNavPlacement);

    modalOverlays = [...document.querySelectorAll('.tool-modal, div[id^="modal"].fixed')];
    if (!modalObserver) {
      modalObserver = new MutationObserver(syncBackgroundScrollLock);
      modalOverlays.forEach(modal => modalObserver.observe(modal, {
        attributes: true,
        attributeFilter: ['class']
      }));
    }
    syncBackgroundScrollLock();

  // Date input default to today in Vietnam timezone
  const currentVietnamDateTime = getCurrentVietnamDateTime();
  state.selectedDateStr = currentVietnamDateTime.dateStr;
  state.selectedMinutes = currentVietnamDateTime.minutes;
  const dateInput = document.getElementById('datePickerInput');
  dateInput.value = state.selectedDateStr;
  scheduleMatrixHourRefresh();

  dateInput.addEventListener('change', (e) => {
    if (e.target.value) {
      state.selectedDateStr = e.target.value;
      renderForecastDayTabs();
      updateAllViews();
    }
  });

  // Time Minutes Slider (0..1439)
  const timeSlider = document.getElementById('timeMinutesSlider');
  timeSlider.value = state.selectedMinutes;
  timeSlider.addEventListener('input', (e) => {
    state.selectedMinutes = parseInt(e.target.value, 10);
    updateAllViews();
  });

  // Play / Pause Sky Dome & Azimuth Timeline Animation
  const btnPlayTimeline = document.getElementById('btnPlayTimeline');
  btnPlayTimeline.addEventListener('click', () => {
    setMapSimulationPlayback(!state.isPlayingTimeline);
  });

  document.getElementById('btnToggleFavoriteSpot').addEventListener('click', toggleActiveSpotFavorite);

  // Quick Astronomical Time Jump Buttons
  document.querySelectorAll('.time-jump-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const jumpType = btn.getAttribute('data-jump');
      if (!state.activeSpot) return;
      const eph = computeDailyEphemerisSummary(
        state.selectedDateStr,
        state.activeSpot.lat,
        state.activeSpot.lon,
        state.selectedTargetKey
      );

      if (jumpType === 'dawn') state.selectedMinutes = eph.sunriseMin;
      else if (jumpType === 'dusk') state.selectedMinutes = eph.sunsetMin;
      else if (jumpType === 'astro-dark') state.selectedMinutes = eph.astroDuskMin;
      else if (jumpType === 'galactic-peak') state.selectedMinutes = eph.targetPeakMin;
      else if (jumpType === 'now') {
        const currentVietnamDateTime = getCurrentVietnamDateTime();
        state.selectedDateStr = currentVietnamDateTime.dateStr;
        dateInput.value = state.selectedDateStr;
        state.selectedMinutes = currentVietnamDateTime.minutes;
      }

      timeSlider.value = state.selectedMinutes;
      renderForecastDayTabs();
      updateAllViews();
      if (jumpType === 'now') revealSelectedMatrixHour();
    });
  });

  // Celestial Target Selector
  document.getElementById('selectCelestialTarget').addEventListener('change', (e) => {
    state.selectedTargetKey = e.target.value;
    updateAllViews();
  });

  // Press and drag across the 24-hour elevation chart to scrub the selected time.
  const elevCanvas = document.getElementById('elevationChartCanvas');
  if (elevCanvas) {
    let isScrubbingElevationChart = false;
    const selectChartTime = (e) => {
      const rect = elevCanvas.getBoundingClientRect();
      const padL = 26;
      const padR = 10;
      const plotW = rect.width - padL - padR;
      if (plotW <= 0) return;
      const clickX = e.clientX - rect.left - padL;
      const ratio = Math.max(0, Math.min(1, clickX / plotW));
      const selectedMinutes = Math.round(ratio * 1439);
      if (selectedMinutes === state.selectedMinutes) return;
      state.selectedMinutes = selectedMinutes;
      timeSlider.value = state.selectedMinutes;
      updateAllViews();
    };

    elevCanvas.addEventListener('pointerdown', (e) => {
      if (!e.isPrimary || e.button !== 0) return;
      isScrubbingElevationChart = true;
      elevCanvas.setPointerCapture(e.pointerId);
      e.preventDefault();
      selectChartTime(e);
    });
    elevCanvas.addEventListener('pointermove', (e) => {
      if (isScrubbingElevationChart) selectChartTime(e);
    });
    const stopScrubbing = (e) => {
      isScrubbingElevationChart = false;
      if (elevCanvas.hasPointerCapture(e.pointerId)) elevCanvas.releasePointerCapture(e.pointerId);
    };
    elevCanvas.addEventListener('pointerup', stopScrubbing);
    elevCanvas.addEventListener('pointercancel', stopScrubbing);
  }

  // Map Overlay Toggle Buttons (Bortle, simulated clouds, Azimuth Vectors)
  const syncToggleBtnState = (btn, isActive) => {
    btn.setAttribute('aria-pressed', String(isActive));
    btn.classList.toggle('is-off', !isActive);
    btn.classList.toggle('opacity-40', !isActive);
  };

  document.getElementById('btnToggleBortleOverlay').addEventListener('click', (e) => {
    state.showBortleOverlay = !state.showBortleOverlay;
    syncToggleBtnState(e.currentTarget, state.showBortleOverlay);
    drawMapCanvasOverlays();
  });

  document.getElementById('btnToggleHimawariOverlay').addEventListener('click', (e) => {
    state.showHimawariOverlay = !state.showHimawariOverlay;
    syncToggleBtnState(e.currentTarget, state.showHimawariOverlay);
    drawMapCanvasOverlays();
  });

  document.getElementById('btnToggleAzimuthVectors').addEventListener('click', (e) => {
    state.showAzimuthVectors = !state.showAzimuthVectors;
    syncToggleBtnState(e.currentTarget, state.showAzimuthVectors);
    drawMapCanvasOverlays();
  });

  // Basemap Style Switcher Buttons
  document.querySelectorAll('.map-tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const styleMode = btn.getAttribute('data-map-tile');
      document.querySelectorAll('.map-tile-btn').forEach(b => {
        b.className = 'map-tile-btn px-2.5 py-1 rounded-lg text-slate-400 hover:text-white';
      });
      btn.className = 'map-tile-btn px-2.5 py-1 rounded-lg bg-violet-600 text-white font-medium is-active';
      setMapBaseTile(styleMode);
    });
  });

  // Dismiss Sandbox Guard Notice
  const btnDismissSandbox = document.getElementById('btnDismissSandboxNotice');
  if (btnDismissSandbox) {
    btnDismissSandbox.addEventListener('click', () => {
      document.getElementById('cartoSandboxNotice').classList.add('hidden');
    });
  }

  // Simulated Cloud Scrubber & Playback Loop
  const radarSlider = document.getElementById('sliderRadarFrame');
  const radarTimeLbl = document.getElementById('lblRadarFrameTime');
  const updateRadarLabel = (val) => {
    if (val === 0) radarTimeLbl.textContent = 'Mô phỏng · hiện tại';
    else if (val < 0) radarTimeLbl.textContent = `Mô phỏng · ${val} phút`;
    else radarTimeLbl.textContent = `Mô phỏng · +${val} phút`;
  };

  radarSlider.addEventListener('input', (e) => {
    state.radarFrameMinutes = parseInt(e.target.value, 10);
    updateRadarLabel(state.radarFrameMinutes);
    drawMapCanvasOverlays();
  });

  document.getElementById('btnPlayRadarLoop').addEventListener('click', () => {
    setMapSimulationPlayback(!state.isPlayingRadar);
  });

  // Region Filter Pills in Directory
  document.querySelectorAll('.region-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeRegionFilter = btn.getAttribute('data-region-filter');
      document.querySelectorAll('.region-filter-btn').forEach(b => {
        b.className = 'region-filter-btn px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/90 text-slate-300 hover:text-white transition';
      });
      btn.className = btn.getAttribute('data-region-filter') === 'favorites'
        ? 'region-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/25 text-amber-200 transition'
        : 'region-filter-btn px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 text-white transition';
      renderSpotsDirectoryGrid();
    });
  });

  // Carto Config Modal Controls
  const modalCarto = document.getElementById('modalCartoConfig');
  const inputCartoKey = document.getElementById('inputCartoApiKey');
  document.getElementById('btnOpenCartoConfigModal').addEventListener('click', () => {
    if (inputCartoKey) inputCartoKey.value = CARTO_CONFIG.apiKey;
    updateCartoTelemetryUI();
    modalCarto.classList.remove('hidden');
    modalCarto.classList.add('flex');
  });
  document.getElementById('btnCloseCartoModal').addEventListener('click', () => {
    modalCarto.classList.add('hidden');
    modalCarto.classList.remove('flex');
  });
  document.getElementById('btnResetDefaultCartoKey').addEventListener('click', () => {
    inputCartoKey.value = DEFAULT_CARTO_API_KEY;
  });
  document.getElementById('btnSaveCartoApiKey').addEventListener('click', () => {
    const keyVal = (inputCartoKey.value || '').trim() || DEFAULT_CARTO_API_KEY;
    CARTO_CONFIG.apiKey = keyVal;
    try {
      localStorage.setItem('skyradar_carto_api_key', keyVal);
    } catch (err) {}
    setMapBaseTile(CARTO_CONFIG.currentStyle);
    modalCarto.classList.add('hidden');
    modalCarto.classList.remove('flex');
  });

  // Search Input & Global Map Geocoding (OpenStreetMap Nominatim + Google Maps URL / Coords + Local Spots)
  const searchInput = document.getElementById('quickSpotSearchInput');
  const searchDropdown = document.getElementById('quickSearchDropdown');
  const searchPanel = document.getElementById('headerSearchPanel');
  const searchToggle = document.getElementById('btnToggleMobileSearch');
  const searchClose = document.getElementById('btnCloseMobileSearch');
  const searchMobileQuery = window.matchMedia('(max-width: 639px)');
  let geocodeDebounceTimer = null;
  let remoteSearchId = 0;

  const setMobileSearchOpen = (open, { focus = false } = {}) => {
    document.documentElement.classList.toggle('mobile-search-open', open);
    if (searchToggle) searchToggle.setAttribute('aria-expanded', String(open));

    if (open) {
      if (focus) requestAnimationFrame(() => searchInput.focus({ preventScroll: true }));
      return;
    }

    searchInput.blur();
    searchDropdown.classList.add('hidden');
  };

  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      const open = !document.documentElement.classList.contains('mobile-search-open');
      setMobileSearchOpen(open, { focus: open });
    });
  }

  if (searchClose) {
    searchClose.addEventListener('click', () => {
      setMobileSearchOpen(false);
    });
  }

  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setMobileSearchOpen(false);
    searchDropdown.classList.add('hidden');
    if (searchToggle) searchToggle.focus({ preventScroll: true });
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 1) {
      searchInput.dispatchEvent(new Event('input'));
    }
  });

  searchMobileQuery.addEventListener('change', (event) => {
    if (!event.matches) setMobileSearchOpen(false);
  });

  searchInput.addEventListener('input', (e) => {
    const rawQuery = e.target.value.trim();
    const q = rawQuery.toLowerCase();
    const requestId = ++remoteSearchId;
    if (!q) {
      searchDropdown.classList.add('hidden');
      return;
    }

    // 1. Check if user pasted a Google Maps URL (@lat,lon) or typed "lat, lon"
    const gmapsMatch = rawQuery.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const coordMatch = rawQuery.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
    const matches = state.spots.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.province.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q)
    );

    const renderSearchDropdownItems = (remotePlaces = [], isSearchingRemote = false) => {
      let html = '';

      if (gmapsMatch || coordMatch) {
        const lat = parseFloat(gmapsMatch ? gmapsMatch[1] : coordMatch[1]);
        const lon = parseFloat(gmapsMatch ? gmapsMatch[2] : coordMatch[3]);
        html += `
          <div data-custom-lat="${lat}" data-custom-lon="${lon}" data-custom-name="Tọa độ Bản đồ (${lat.toFixed(4)}, ${lon.toFixed(4)})" class="search-dropdown__coord-item">
            <span class="text-cyan-300 font-mono flex items-center gap-1.5 font-semibold text-xs">
              ${iconMarkup('map-pin', 'w-3.5 h-3.5 text-cyan-400 shrink-0')}
              Nhảy tới tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded font-semibold bg-violet-500/25 text-violet-200 border border-violet-500/40 shrink-0">Tải dự báo</span>
          </div>
        `;
      }

      if (matches.length > 0) {
        html += `<div class="search-dropdown__section text-violet-300">
          <span class="flex items-center gap-1.5">
            ${iconMarkup('map-pin', 'w-3 h-3 text-violet-400 shrink-0')}
            <span>Danh bạ Điểm Săn Ảnh StarWatch</span>
          </span>
          <span class="text-[10px] font-mono text-violet-400/90 font-normal">(${matches.length})</span>
        </div>`;
        html += matches.map(s => {
          const bortleInfo = getBortleColorInfo(s.bortle);
          return `
            <div data-spot-id="${s.id}" class="search-dropdown__item">
              <div class="search-dropdown__item-main">
                <div class="search-dropdown__item-title">
                  ${iconMarkup('sparkles', 'w-3.5 h-3.5 text-violet-400 shrink-0')}
                  <span class="truncate">${s.name}</span>
                </div>
                <div class="search-dropdown__item-subtitle">${s.region} · Độ cao ${s.elevation}m</div>
              </div>
              <div class="search-dropdown__item-meta">
                <span class="${bortleInfo.badgeClass} text-[10px] px-2 py-0.5 rounded">Bortle ${s.bortle}</span>
              </div>
            </div>
          `;
        }).join('');
      }

      html += `<div class="search-dropdown__section text-cyan-300">
        <span class="flex items-center gap-1.5">
          ${iconMarkup('globe', 'w-3 h-3 text-cyan-400 shrink-0')}
          <span>Kết quả Tìm kiếm Bản đồ mở rộng</span>
        </span>
        ${isSearchingRemote ? '<span class="inline-flex items-center gap-1 text-[10px] text-amber-400 font-normal"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span> Đang tìm...</span>' : ''}
      </div>`;

      if (remotePlaces.length > 0) {
        html += remotePlaces.map(p => {
          const estB = estimateBortleAtCoord(p.lat, p.lon);
          const estElev = estimateTerrainElevation(p.lat, p.lon);
          const bortleInfo = getBortleColorInfo(estB);
          return `
            <div
              data-custom-lat="${p.lat}"
              data-custom-lon="${p.lon}"
              data-custom-name="${p.shortTitle.replace(/"/g, '&quot;')}"
              data-custom-province="${p.regionLabel.replace(/"/g, '&quot;')}"
              class="search-dropdown__item"
            >
              <div class="search-dropdown__item-main">
                <div class="search-dropdown__item-title">
                  ${iconMarkup('map-pin', 'w-3.5 h-3.5 text-cyan-400 shrink-0')}
                  <span class="truncate">${p.shortTitle}</span>
                </div>
                <div class="search-dropdown__item-subtitle">${p.fullAddress}</div>
              </div>
              <div class="search-dropdown__item-meta">
                <span class="${bortleInfo.badgeClass} text-[10px] px-2 py-0.5 rounded">Bortle ~${estB}</span>
                <span class="search-dropdown__item-elev">~${estElev}m</span>
              </div>
            </div>
          `;
        }).join('');
      } else if (!isSearchingRemote) {
        html += `<div class="search-dropdown__empty">
          ${iconMarkup('search', 'w-3.5 h-3.5 text-slate-500 shrink-0')}
          <span>Nhập tên núi, đèo, hồ, địa danh hoặc dán link Google Maps để tra cứu.</span>
        </div>`;
      }

      searchDropdown.innerHTML = html;
      renderIcons(searchDropdown);
      searchDropdown.classList.remove('hidden');

      searchDropdown.querySelectorAll('[data-spot-id]').forEach(el => {
        el.addEventListener('click', () => {
          const spot = state.spots.find(s => s.id === el.getAttribute('data-spot-id'));
          if (spot) selectSpot(spot, true);
          searchDropdown.classList.add('hidden');
          searchInput.value = '';
          setMobileSearchOpen(false);
        });
      });

      searchDropdown.querySelectorAll('[data-custom-lat]').forEach(el => {
        el.addEventListener('click', () => {
          const lat = parseFloat(el.getAttribute('data-custom-lat'));
          const lon = parseFloat(el.getAttribute('data-custom-lon'));
          const placeName = el.getAttribute('data-custom-name') || `Điểm Bản đồ (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          const provLabel = el.getAttribute('data-custom-province') || 'Tìm kiếm Bản đồ';

          selectSpot({
            id: 'map-search-' + Date.now(),
            name: placeName,
            shortName: placeName.split(',')[0].slice(0, 22),
            region: lat > 19.5 ? 'Miền Bắc' : (lat > 11.5 ? 'Miền Trung & Tây Nguyên' : 'Miền Nam'),
            province: provLabel,
            lat,
            lon,
            elevation: estimateTerrainElevation(lat, lon),
            bortle: estimateBortleAtCoord(lat, lon),
            tags: ['Tìm kiếm mở rộng'],
            desc: `Địa điểm được định vị từ hệ thống bản đồ trực tuyến (${lat.toFixed(4)}, ${lon.toFixed(4)}).`
          }, true);
          searchDropdown.classList.add('hidden');
          searchInput.value = '';
          setMobileSearchOpen(false);
        });
      });
    };

    renderSearchDropdownItems([], rawQuery.length >= 2);

    clearTimeout(geocodeDebounceTimer);
    if (rawQuery.length >= 2 && !coordMatch && !gmapsMatch) {
      geocodeDebounceTimer = setTimeout(async () => {
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(rawQuery)}&countrycodes=vn&limit=6&accept-language=vi`;
          const res = await fetchNominatim(url, () => requestId === remoteSearchId);
          if (!res || requestId !== remoteSearchId) return;
          const data = await res.json();
          const parsed = (data || []).map(item => {
            const parts = (item.display_name || '').split(',').map(s => s.trim());
            return {
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              shortTitle: parts.slice(0, 2).join(', ') || rawQuery,
              regionLabel: parts.slice(1, 3).join(', ') || 'Việt Nam',
              fullAddress: item.display_name
            };
          });
          renderSearchDropdownItems(parsed, false);
        } catch (err) {
          if (requestId === remoteSearchId) renderSearchDropdownItems([], false);
        }
      }, 320);
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
      searchDropdown.classList.add('hidden');
    }

    if (document.documentElement.classList.contains('mobile-search-open')
      && !(searchPanel && searchPanel.contains(e.target))
      && !(searchToggle && searchToggle.contains(e.target))) {
      setMobileSearchOpen(false);
    }

    if (spotBarMobileQuery.matches
      && activeSpotBar.dataset.collapsed === 'false'
      && !activeSpotBar.contains(e.target)) {
      setSpotBarCollapsed(true, { animate: false });
    }
  });

  // Helper to cleanly switch or toggle tool modals with synchronized animations
  const toggleToolModal = (targetModal, onBeforeOpen) => {
    if (!targetModal) return;
    const isOpen = !targetModal.classList.contains('hidden');
    if (isOpen) {
      if (targetModal === modalSpots) resetDeleteSpotMode();
      closeToolModal(targetModal);
      syncBackgroundScrollLock();
      return;
    }
    modalOverlays.forEach(m => {
      if (m !== targetModal && !m.classList.contains('hidden')) {
        if (m === modalSpots) resetDeleteSpotMode();
        closeToolModal(m, { immediate: true });
      }
    });
    if (onBeforeOpen) onBeforeOpen();
    openToolModal(targetModal);
    syncBackgroundScrollLock();
  };

  // Curated & Community Spots Directory Modal ("Địa điểm")
  const modalSpots = document.getElementById('modalSpotsDirectory');
  const btnOpenSpots = document.getElementById('btnOpenSpotsDirectory');
  const btnCloseSpots = document.getElementById('btnCloseSpotsDirectoryModal');
  const btnToggleDelete = document.getElementById('btnToggleDeleteSpotMode');

  if (btnOpenSpots) {
    btnOpenSpots.addEventListener('click', () => {
      toggleToolModal(modalSpots, () => renderSpotsDirectoryGrid());
    });
  }
  if (btnCloseSpots) {
    btnCloseSpots.addEventListener('click', () => {
      resetDeleteSpotMode();
      closeToolModal(modalSpots);
    });
  }
  if (modalSpots) {
    modalSpots.addEventListener('click', (e) => {
      if (e.target === modalSpots) {
        resetDeleteSpotMode();
        closeToolModal(modalSpots);
      }
    });
  }
  if (btnToggleDelete) {
    btnToggleDelete.addEventListener('click', () => {
      state.isDeleteSpotMode = !state.isDeleteSpotMode;
      renderSpotsDirectoryGrid();
    });
  }

  // Jump to Camera Setup Guide section from Sticky Bar
  const btnJumpSetup = document.getElementById('btnJumpToCameraSetup');
  if (btnJumpSetup) {
    btnJumpSetup.addEventListener('click', () => {
      document.getElementById('cameraSetupSection').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Camera Setup Event & Gear Platform Switchers
  const setupEventSelect = document.getElementById('selectSetupEventType');
  if (setupEventSelect) {
    setupEventSelect.addEventListener('change', (e) => {
      state.selectedSetupEvent = e.target.value;
      renderCameraSetupGuide();
    });
  }

  document.querySelectorAll('.gear-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedGearMode = btn.getAttribute('data-gear-mode');
      document.querySelectorAll('.gear-tab-btn').forEach(b => {
        b.classList.remove('bg-violet-600', 'text-white', 'font-semibold');
        b.classList.add('text-slate-400', 'font-medium');
      });
      btn.classList.remove('text-slate-400', 'font-medium');
      btn.classList.add('bg-violet-600', 'text-white', 'font-semibold');
      renderCameraSetupGuide();
    });
  });

  // Astronomical Events Calendar Modal ("Sự kiện")
  const modalAstroCal = document.getElementById('modalAstroCalendar');
  const btnOpenAstroCal = document.getElementById('btnOpenAstroCalendarModal');
  if (btnOpenAstroCal) {
    btnOpenAstroCal.addEventListener('click', () => {
      toggleToolModal(modalAstroCal, () => renderAstroCalendarModal());
    });
  }
  const btnCloseAstroCal = document.getElementById('btnCloseAstroCalendarModal');
  if (btnCloseAstroCal) {
    btnCloseAstroCal.addEventListener('click', () => closeToolModal(modalAstroCal));
  }
  if (modalAstroCal) {
    modalAstroCal.addEventListener('click', (e) => {
      if (e.target === modalAstroCal) closeToolModal(modalAstroCal);
    });
  }
  document.querySelectorAll('.cal-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCalendarFilter = btn.getAttribute('data-cal-filter');
      document.querySelectorAll('.cal-filter-btn').forEach(b => {
        b.classList.remove('is-active', 'bg-violet-600', 'text-white', 'font-semibold');
        b.classList.add('bg-white/10', 'text-slate-300', 'font-medium');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active', 'bg-violet-600', 'text-white', 'font-semibold');
      btn.classList.remove('bg-white/10', 'text-slate-300', 'font-medium');
      btn.setAttribute('aria-pressed', 'true');
      renderAstroCalendarModal();
    });
  });

  // Liquid Glass User Guide Modal ("Hướng dẫn")
  const modalGuide = document.getElementById('modalUserGuide');
  const closeGuide = () => {
    closeToolModal(modalGuide);
  };
  const btnOpenGuide = document.getElementById('btnOpenGuideModal');
  if (btnOpenGuide) {
    btnOpenGuide.addEventListener('click', () => toggleToolModal(modalGuide));
  }
  const btnCloseGuide = document.getElementById('btnCloseGuideModal');
  if (btnCloseGuide) btnCloseGuide.addEventListener('click', closeGuide);
  const btnAckGuide = document.getElementById('btnAcknowledgeGuide');
  if (btnAckGuide) attachHoldToConfirm(btnAckGuide, { onComplete: closeGuide });
  if (modalGuide) {
    modalGuide.addEventListener('click', (e) => {
      if (e.target === modalGuide) closeGuide();
    });
  }

  // App Information Modal
  const modalAppInfo = document.getElementById('modalAppInfo');
  const closeAppInfo = () => {
    closeToolModal(modalAppInfo);
  };
  document.getElementById('btnOpenAppInfo').addEventListener('click', () => {
    openToolModal(modalAppInfo);
  });
  document.getElementById('btnCloseAppInfo').addEventListener('click', closeAppInfo);
  modalAppInfo.addEventListener('click', (event) => {
    if (event.target === modalAppInfo) closeAppInfo();
  });
  const emailCopyButton = document.getElementById('btnCopyAppEmail');
  const emailCopyToast = document.getElementById('appInfoToast');
  let emailCopyToastTimer;
  emailCopyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API is unavailable');
      await navigator.clipboard.writeText('kingescaped.dev@gmail.com');
      emailCopyToast.textContent = 'Đã sao chép email';
      emailCopyToast.classList.remove('hidden');
      clearTimeout(emailCopyToastTimer);
      emailCopyToastTimer = setTimeout(() => emailCopyToast.classList.add('hidden'), 1800);
    } catch (error) {
      emailCopyToast.textContent = 'Không thể sao chép email';
      emailCopyToast.classList.remove('hidden');
      clearTimeout(emailCopyToastTimer);
      emailCopyToastTimer = setTimeout(() => emailCopyToast.classList.add('hidden'), 2400);
    }
  });

  // Unified Settings Modal ("Cài đặt")
  const modalSettings = document.getElementById('modalSettings');
  const settingsCartoInput = document.getElementById('settingsCartoKeyInput');
  const btnOpenSettings = document.getElementById('btnOpenSettingsModal');
  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      toggleToolModal(modalSettings, () => {
        if (settingsCartoInput) settingsCartoInput.value = CARTO_CONFIG.apiKey;
        updateCartoTelemetryUI();
      });
    });
  }
  const btnCloseSettings = document.getElementById('btnCloseSettingsModal');
  if (btnCloseSettings) {
    btnCloseSettings.addEventListener('click', () => closeToolModal(modalSettings));
  }
  if (modalSettings) {
    modalSettings.addEventListener('click', (e) => {
      if (e.target === modalSettings) closeToolModal(modalSettings);
    });
  }
  document.getElementById('btnSettingsApplyCartoKey').addEventListener('click', () => {
    const newKey = (settingsCartoInput.value || '').trim() || DEFAULT_CARTO_API_KEY;
    CARTO_CONFIG.apiKey = newKey;
    try {
      localStorage.setItem('skyradar_carto_api_key', newKey);
    } catch (err) {}
    setMapBaseTile(CARTO_CONFIG.currentStyle);
  });

  // GPS Locate Button
  document.getElementById('btnUseMyGPS').addEventListener('click', () => {
    requestCurrentLocation();
  });

  // Refresh Weather Button
  document.getElementById('btnRefreshWeather').addEventListener('click', () => {
    fetchWeatherForActiveSpot();
  });

  // 3-Mode Theme Switcher inside Settings (Dark / Light / Red Night-Vision)
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-theme-mode');
      const htmlEl = document.documentElement;
      htmlEl.classList.remove('light-theme', 'red-vision-theme');
      htmlEl.classList.toggle('dark', mode !== 'light');
      if (mode === 'light') htmlEl.classList.add('light-theme');
      if (mode === 'red') htmlEl.classList.add('red-vision-theme');
      drawTopDownSkyDome();

      document.querySelectorAll('.theme-btn').forEach(b => {
        b.className = 'theme-btn p-3 rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:text-white font-semibold flex flex-col items-center gap-1.5 transition';
      });
      btn.className = 'theme-btn p-3 rounded-xl border border-violet-500 bg-violet-600/30 text-white font-semibold flex flex-col items-center gap-1.5 transition';
    });
  });

  // Contribute New Spot Modal ("Đóng góp")
  const modalContribute = document.getElementById('modalContributeSpot');
  const openContribute = () => {
    toggleToolModal(modalContribute, () => {
      if (state.activeSpot) {
        const latInput = document.getElementById('inputSpotLat');
        const lonInput = document.getElementById('inputSpotLon');
        const elevInput = document.getElementById('inputSpotElevation');
        const bortleInput = document.getElementById('inputSpotBortle');
        if (latInput && !latInput.value) latInput.value = state.activeSpot.lat;
        if (lonInput && !lonInput.value) lonInput.value = state.activeSpot.lon;
        if (elevInput && !elevInput.value) elevInput.value = state.activeSpot.elevation;
        if (bortleInput && !bortleInput.value) bortleInput.value = state.activeSpot.bortle;
      }
    });
  };
  const closeContribute = () => {
    closeToolModal(modalContribute);
  };

  document.getElementById('btnOpenContributeModal').addEventListener('click', openContribute);
  document.getElementById('btnCloseContributeModal').addEventListener('click', closeContribute);
  document.getElementById('btnCancelContribute').addEventListener('click', closeContribute);
  if (modalContribute) {
    modalContribute.addEventListener('click', (e) => {
      if (e.target === modalContribute) closeContribute();
    });
  }

  document.getElementById('formContributeSpot').addEventListener('submit', (e) => {
    e.preventDefault();
    const newSpot = {
      id: 'custom-' + Date.now(),
      name: document.getElementById('inputSpotName').value.trim(),
      shortName: document.getElementById('inputSpotName').value.trim().slice(0, 18),
      region: document.getElementById('inputSpotRegion').value,
      province: document.getElementById('inputSpotProvince').value.trim(),
      lat: parseFloat(document.getElementById('inputSpotLat').value),
      lon: parseFloat(document.getElementById('inputSpotLon').value),
      elevation: parseInt(document.getElementById('inputSpotElevation').value, 10) || 500,
      bortle: parseFloat(document.getElementById('inputSpotBortle').value) || 3.5,
      tags: ['Cộng đồng đóng góp'],
      desc: document.getElementById('inputSpotNotes').value.trim() || 'Địa điểm săn ảnh do người dùng đóng góp.'
    };

    try {
      const existingRaw = localStorage.getItem('skyradar_custom_spots_v1');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.push(newSpot);
      localStorage.setItem('skyradar_custom_spots_v1', JSON.stringify(existing));
    } catch (err) {}

    // Clear form inputs after user clicks save
    document.getElementById('formContributeSpot').reset();

    loadSpotsFromStorage();
    closeContribute();
    selectSpot(newSpot, true);
  });

  // Backend Architecture & API Code Modal
  const modalBackend = document.getElementById('modalBackendArchitecture');
  document.getElementById('btnOpenBackendModal').addEventListener('click', () => {
    modalBackend.classList.remove('hidden');
    modalBackend.classList.add('flex');
  });
  document.getElementById('btnCloseBackendModal').addEventListener('click', () => {
    modalBackend.classList.add('hidden');
    modalBackend.classList.remove('flex');
  });
  document.getElementById('btnCopyBackendCode').addEventListener('click', (e) => {
    const code = document.getElementById('backendCodeBlock').innerText;
    navigator.clipboard.writeText(code);
    e.target.textContent = '✓ Đã sao chép!';
    setTimeout(() => { e.target.textContent = 'Sao chép mã nguồn Backend'; }, 2000);
  });

  window.addEventListener('resize', () => {
    syncLeafletMapSize();
    drawTopDownSkyDome();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    if (state.isPlayingTimeline || state.isPlayingRadar) setMapSimulationPlayback(false);
  });

  window.addEventListener('pagehide', () => {
    clearTimeout(matrixHourRefreshTimer);
    if (state.isPlayingTimeline || state.isPlayingRadar) setMapSimulationPlayback(false);
  });
}

/**
 * Wire renderer/service intents to application actions.
 * Keeping this in one place lets modules stay independent of each other.
 */
export function initAppEvents() {
  on('app:refresh', () => {
    updateAllViews();
  });

  on('spot:select', (detail = {}) => {
    if (!detail.spot) return;
    const modalSpots = document.getElementById('modalSpotsDirectory');
    if (modalSpots && !modalSpots.classList.contains('hidden')) {
      closeToolModal(modalSpots);
    }
    selectSpot(detail.spot, Boolean(detail.flyMap));
    if (detail.scrollToMatrix) {
      pendingScrollAfterModalUnlock = () => scrollToWeatherMatrix();
      if (backgroundScrollLocked || document.body.classList.contains('modal-scroll-locked')) {
        syncBackgroundScrollLock();
      } else {
        pendingScrollAfterModalUnlock = null;
        scrollToWeatherMatrix();
      }
    }
    if (detail.scrollToCameraSetup) {
      pendingScrollAfterModalUnlock = () => scrollToCameraSetup();
      if (backgroundScrollLocked || document.body.classList.contains('modal-scroll-locked')) {
        syncBackgroundScrollLock();
      } else {
        pendingScrollAfterModalUnlock = null;
        scrollToCameraSetup();
      }
    }
  });

  on('spot:delete', ({ spot, spotKey }) => {
    const identifier = spot?.id || spotKey;
    const key = spotKey || (spot ? getSpotKey(spot) : null);
    deleteSpotFromStorage(identifier, key);
    renderAllSpotMarkersOnMap();
    renderSpotsDirectoryGrid();

    // If active / default spot was deleted or is no longer present in spots, load the first spot in the spots table
    const activeKey = state.activeSpot ? getSpotKey(state.activeSpot) : null;
    const isCurrentActiveDeleted =
      !state.activeSpot ||
      state.activeSpot.id === identifier ||
      (key && state.activeSpot.id === key) ||
      (activeKey && (activeKey === key || activeKey === identifier)) ||
      !state.spots.some(s => s.id === state.activeSpot.id || getSpotKey(s) === activeKey);

    if (isCurrentActiveDeleted) {
      if (state.spots.length > 0) {
        selectSpot(state.spots[0], true);
      } else {
        state.activeSpot = null;
      }
    }
  });

  on('ui:scroll-to-matrix', () => {
    pendingScrollAfterModalUnlock = () => scrollToWeatherMatrix();
    if (backgroundScrollLocked || document.body.classList.contains('modal-scroll-locked')) {
      syncBackgroundScrollLock();
    } else {
      pendingScrollAfterModalUnlock = null;
      scrollToWeatherMatrix();
    }
  });

  on('ui:scroll-to-camera-setup', () => {
    pendingScrollAfterModalUnlock = () => scrollToCameraSetup();
    if (backgroundScrollLocked || document.body.classList.contains('modal-scroll-locked')) {
      syncBackgroundScrollLock();
    } else {
      pendingScrollAfterModalUnlock = null;
      scrollToCameraSetup();
    }
  });

  on('spot:reverse-geocode', (detail = {}) => {
    if (detail.spot) reverseGeocodeSpot(detail.spot);
  });

  on('weather:updated', () => {
    renderForecastDayTabs();
    updateAllViews();
  });
}
