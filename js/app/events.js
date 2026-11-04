import { selectSpot, setMapSimulationPlayback, updateAllViews } from '../app/actions.js';
import { computeDailyEphemerisSummary } from '../astro/ephemeris.js';
import { getCurrentVietnamDateTime } from '../astro/time.js';
import { CARTO_CONFIG, DEFAULT_CARTO_API_KEY } from '../config/carto.js';
import { on } from '../core/events.js';
import { state } from '../core/state.js';
import { fetchNominatim } from '../core/utils.js';
import { estimateBortleAtCoord, estimateTerrainElevation, setMapBaseTile, syncLeafletMapSize, updateCartoTelemetryUI } from '../map/map.js';
import { drawMapCanvasOverlays } from '../map/overlays.js';
import { toggleActiveSpotFavorite } from '../services/favorites.js';
import { requestCurrentLocation, reverseGeocodeSpot } from '../services/geocoding.js';
import { loadSpotsFromStorage } from '../services/spots-store.js';
import { fetchWeatherForActiveSpot } from '../services/weather.js';
import { renderAstroCalendarModal } from '../ui/astro-calendar.js';
import { renderCameraSetupGuide } from '../ui/camera-guide.js';
import { iconMarkup, renderIcons } from '../ui/icons.js';
import { drawTopDownSkyDome } from '../ui/sky-dome.js';
import { renderSpotsDirectoryGrid } from '../ui/spots-directory.js';
import { closeToolModal, openToolModal } from '../ui/tool-modal.js';
import { matrixHourRefreshTimer, renderForecastDayTabs, revealSelectedMatrixHour, scheduleMatrixHourRefresh, scrollToWeatherMatrix } from '../ui/weather-matrix.js';

/**
 * DOM event listeners and initialization wiring.
 */

export function initEventListeners() {
   const activeSpotBar = document.getElementById('activeSpotBar');
   const activeSpotBarToggle = document.getElementById('activeSpotBarToggle');
   let activeSpotBarAnimation = null;
   activeSpotBarToggle.addEventListener('click', () => {
     const startHeight = activeSpotBar.getBoundingClientRect().height;
     if (activeSpotBarAnimation) {
       activeSpotBarAnimation.onfinish = null;
       activeSpotBarAnimation.cancel();
       activeSpotBarAnimation = null;
       activeSpotBar.style.removeProperty('height');
       activeSpotBar.style.removeProperty('box-sizing');
       activeSpotBar.style.removeProperty('overflow');
     }

     const isCollapsed = activeSpotBar.dataset.collapsed !== 'true';
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
   });

   const modalOverlays = [...document.querySelectorAll('div[id^="modal"].fixed.inset-0')];
  let backgroundScrollLocked = false;
  let lockedScrollY = 0;

  const syncBackgroundScrollLock = () => {
    const hasOpenModal = modalOverlays.some(modal => !modal.classList.contains('hidden'));
    if (hasOpenModal === backgroundScrollLocked) return;

    if (hasOpenModal) {
      lockedScrollY = window.scrollY;
      backgroundScrollLocked = true;
      document.body.style.setProperty('--modal-scroll-lock-top', `-${lockedScrollY}px`);
      document.body.style.setProperty('--modal-scroll-lock-width', `${document.body.getBoundingClientRect().width}px`);
      document.documentElement.classList.add('modal-scroll-locked');
      document.body.classList.add('modal-scroll-locked');
      return;
    }

    backgroundScrollLocked = false;
    document.documentElement.classList.remove('modal-scroll-locked');
    document.body.classList.remove('modal-scroll-locked');
    document.body.style.removeProperty('--modal-scroll-lock-top');
    document.body.style.removeProperty('--modal-scroll-lock-width');
    window.scrollTo(0, lockedScrollY);
  };

  const modalObserver = new MutationObserver(syncBackgroundScrollLock);
  modalOverlays.forEach(modal => modalObserver.observe(modal, {
    attributes: true,
    attributeFilter: ['class']
  }));
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

  // Click on 24h Elevation Chart to jump to that hour/minute
  const elevCanvas = document.getElementById('elevationChartCanvas');
  if (elevCanvas) {
    elevCanvas.addEventListener('click', (e) => {
      const rect = elevCanvas.getBoundingClientRect();
      const padL = 26;
      const padR = 10;
      const plotW = rect.width - padL - padR;
      const clickX = e.clientX - rect.left - padL;
      const ratio = Math.max(0, Math.min(1, clickX / plotW));
      state.selectedMinutes = Math.round(ratio * 1439);
      timeSlider.value = state.selectedMinutes;
      updateAllViews();
    });
  }

  // Map Overlay Toggle Buttons (Bortle, simulated clouds, Azimuth Vectors)
  document.getElementById('btnToggleBortleOverlay').addEventListener('click', (e) => {
    state.showBortleOverlay = !state.showBortleOverlay;
    e.currentTarget.classList.toggle('opacity-40', !state.showBortleOverlay);
    drawMapCanvasOverlays();
  });

  document.getElementById('btnToggleHimawariOverlay').addEventListener('click', (e) => {
    state.showHimawariOverlay = !state.showHimawariOverlay;
    e.currentTarget.classList.toggle('opacity-40', !state.showHimawariOverlay);
    drawMapCanvasOverlays();
  });

  document.getElementById('btnToggleAzimuthVectors').addEventListener('click', (e) => {
    state.showAzimuthVectors = !state.showAzimuthVectors;
    e.currentTarget.classList.toggle('opacity-40', !state.showAzimuthVectors);
    drawMapCanvasOverlays();
  });

  // Basemap Style Switcher Buttons
  document.querySelectorAll('.map-tile-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const styleMode = btn.getAttribute('data-map-tile');
      document.querySelectorAll('.map-tile-btn').forEach(b => {
        b.className = 'map-tile-btn px-2.5 py-0.5 rounded text-slate-400 hover:text-white';
      });
      btn.className = 'map-tile-btn px-2.5 py-0.5 rounded bg-violet-600 text-white font-medium';
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
  let geocodeDebounceTimer = null;
  let remoteSearchId = 0;
  let searchFocusScrollY = null;

  const restoreSearchFocusScroll = () => {
    if (searchFocusScrollY === null || document.activeElement !== searchInput) return;
    window.scrollTo(0, searchFocusScrollY);
  };

  const captureSearchFocusScroll = () => {
    if (window.matchMedia('(max-width: 639px)').matches) {
      searchFocusScrollY = window.scrollY;
    }
  };

  searchInput.addEventListener('pointerdown', captureSearchFocusScroll);
  searchInput.addEventListener('touchstart', captureSearchFocusScroll, { passive: true });

  searchInput.addEventListener('focus', () => {
    if (!window.matchMedia('(max-width: 639px)').matches) return;
    if (searchFocusScrollY === null) searchFocusScrollY = window.scrollY;
    document.documentElement.classList.add('mobile-search-active');
    requestAnimationFrame(restoreSearchFocusScroll);
  });

  searchInput.addEventListener('blur', () => {
    document.documentElement.classList.remove('mobile-search-active');
    searchFocusScrollY = null;
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      requestAnimationFrame(restoreSearchFocusScroll);
    });
  }

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
          <div data-custom-lat="${lat}" data-custom-lon="${lon}" data-custom-name="Tọa độ Bản đồ (${lat.toFixed(4)}, ${lon.toFixed(4)})" class="p-2.5 hover:bg-violet-600/25 cursor-pointer flex items-center justify-between text-xs">
            <span class="text-cyan-300 font-mono">${iconMarkup('map-pin', 'w-3.5 h-3.5 inline-block align-[-3px]')} Nhảy tới tọa độ: ${lat.toFixed(4)}, ${lon.toFixed(4)}</span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-violet-500/30 text-violet-200">Tải dự báo</span>
          </div>
        `;
      }

      if (matches.length > 0) {
        html += `<div class="px-2.5 py-1 bg-slate-900/90 text-[10px] font-semibold uppercase tracking-wider text-violet-300">Danh bạ Điểm Săn Ảnh StarWatch</div>`;
        html += matches.map(s => `
          <div data-spot-id="${s.id}" class="p-2.5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs">
            <div>
              <div class="font-bold text-white">${s.name}</div>
              <div class="text-[10px] text-slate-400">${s.region} · Độ cao ${s.elevation}m</div>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">Bortle ${s.bortle}</span>
          </div>
        `).join('');
      }

      html += `<div class="px-2.5 py-1 bg-slate-900/90 text-[10px] font-semibold uppercase tracking-wider text-cyan-300 flex items-center justify-between">
        <span>${iconMarkup('globe', 'w-3.5 h-3.5 inline-block align-[-3px]')} Kết quả Tìm kiếm Bản đồ mở rộng</span>
        ${isSearchingRemote ? '<span class="animate-pulse text-amber-300">Đang tìm...</span>' : ''}
      </div>`;

      if (remotePlaces.length > 0) {
        html += remotePlaces.map(p => {
          const estB = estimateBortleAtCoord(p.lat, p.lon);
          const estElev = estimateTerrainElevation(p.lat, p.lon);
          return `
            <div
              data-custom-lat="${p.lat}"
              data-custom-lon="${p.lon}"
              data-custom-name="${p.shortTitle.replace(/"/g, '&quot;')}"
              data-custom-province="${p.regionLabel.replace(/"/g, '&quot;')}"
              class="p-2.5 hover:bg-cyan-500/20 cursor-pointer flex items-center justify-between gap-2 text-xs"
            >
              <div class="min-w-0">
                <div class="font-bold text-white truncate">${iconMarkup('map-pin', 'w-3.5 h-3.5 inline-block align-[-3px]')} ${p.shortTitle}</div>
                <div class="text-[10px] text-slate-300 truncate">${p.fullAddress}</div>
              </div>
              <div class="text-right shrink-0">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200 block">Bortle ~${estB}</span>
                <span class="text-[9px] font-mono text-amber-300">~${estElev}m</span>
              </div>
            </div>
          `;
        }).join('');
      } else if (!isSearchingRemote) {
        html += `<div class="p-2.5 text-[11px] text-slate-400">Nhập tên bất kỳ núi, đèo, hồ, xã/huyện hoặc dán link Google Maps để định vị.</div>`;
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
  });

  // Scroll to spots directory
  document.getElementById('btnOpenSpotsDirectory').addEventListener('click', () => {
    document.getElementById('spotsGridContainer').scrollIntoView({ behavior: 'smooth' });
  });

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
        b.className = 'gear-tab-btn px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition';
      });
      btn.className = 'gear-tab-btn px-3 py-1.5 rounded-lg font-semibold bg-violet-600 text-white flex items-center gap-1.5 transition';
      renderCameraSetupGuide();
    });
  });

  // Astronomical Events Calendar Modal
  const modalAstroCal = document.getElementById('modalAstroCalendar');
  document.getElementById('btnOpenAstroCalendarModal').addEventListener('click', () => {
    renderAstroCalendarModal();
    openToolModal(modalAstroCal);
  });
  document.getElementById('btnCloseAstroCalendarModal').addEventListener('click', () => {
    closeToolModal(modalAstroCal);
  });
  document.querySelectorAll('.cal-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCalendarFilter = btn.getAttribute('data-cal-filter');
      document.querySelectorAll('.cal-filter-btn').forEach(b => {
        b.className = 'cal-filter-btn px-3 py-1 rounded-xl text-xs font-medium bg-white/10 text-slate-300 hover:text-white transition';
      });
      btn.className = 'cal-filter-btn px-3 py-1 rounded-xl text-xs font-semibold bg-violet-600 text-white transition';
      renderAstroCalendarModal();
    });
  });

  // Liquid Glass User Guide Modal
  const modalGuide = document.getElementById('modalUserGuide');
  const closeGuide = () => {
    closeToolModal(modalGuide);
  };
  document.getElementById('btnOpenGuideModal').addEventListener('click', () => {
    openToolModal(modalGuide);
  });
  document.getElementById('btnCloseGuideModal').addEventListener('click', closeGuide);
  document.getElementById('btnAcknowledgeGuide').addEventListener('click', closeGuide);

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

  // Unified Settings Modal
  const modalSettings = document.getElementById('modalSettings');
  const settingsCartoInput = document.getElementById('settingsCartoKeyInput');
  document.getElementById('btnOpenSettingsModal').addEventListener('click', () => {
    if (settingsCartoInput) settingsCartoInput.value = CARTO_CONFIG.apiKey;
    updateCartoTelemetryUI();
    openToolModal(modalSettings);
  });
  document.getElementById('btnCloseSettingsModal').addEventListener('click', () => {
    closeToolModal(modalSettings);
  });
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

  // Contribute New Spot Modal
  const modalContribute = document.getElementById('modalContributeSpot');
  const openContribute = () => {
    if (state.activeSpot) {
      document.getElementById('inputSpotLat').value = state.activeSpot.lat;
      document.getElementById('inputSpotLon').value = state.activeSpot.lon;
      document.getElementById('inputSpotElevation').value = state.activeSpot.elevation;
      document.getElementById('inputSpotBortle').value = state.activeSpot.bortle;
    }
    openToolModal(modalContribute);
  };
  const closeContribute = () => {
    closeToolModal(modalContribute);
  };

  document.getElementById('btnOpenContributeModal').addEventListener('click', openContribute);
  document.getElementById('btnCloseContributeModal').addEventListener('click', closeContribute);
  document.getElementById('btnCancelContribute').addEventListener('click', closeContribute);

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
    selectSpot(detail.spot, Boolean(detail.flyMap));
    if (detail.scrollToMatrix) scrollToWeatherMatrix();
  });

  on('ui:scroll-to-matrix', () => {
    scrollToWeatherMatrix();
  });

  on('spot:reverse-geocode', (detail = {}) => {
    if (detail.spot) reverseGeocodeSpot(detail.spot);
  });

  on('weather:updated', () => {
    renderForecastDayTabs();
    updateAllViews();
  });
}
