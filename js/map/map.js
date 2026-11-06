import { DEG2RAD } from '../astro/time.js';
import { CARTO_CONFIG } from '../config/carto.js';
import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { escapeHTML, getBortleColorInfo, getSpotKey } from '../core/utils.js';
import { leafletMap, setLeafletMap } from '../map/context.js';
import { VIETNAM_LIGHT_DOMES } from '../map/light-domes.js';
import { drawMapCanvasOverlays } from '../map/overlays.js';

export { leafletMap, VIETNAM_LIGHT_DOMES };

/**
 * Leaflet map, basemaps, markers and Bortle estimation.
 */

export let baseTileLayer = null;
export let referenceLabelLayer = null;
export let activeSpotMarker = null;
export let spotClusterMarkers = [];
export let mapResizeObserver = null;
export let mapResizeFrame = null;
export let mapWasMobileViewport = window.matchMedia('(max-width: 639px)').matches;

export function estimateBortleAtCoord(lat, lon) {
  let bortle = 2.4; // Base natural rural/mountain sky
  for (const dome of VIETNAM_LIGHT_DOMES) {
    const dLat = (lat - dome.lat) * 111.32;
    const dLon = (lon - dome.lon) * 111.32 * Math.cos(lat * DEG2RAD);
    const distKm = Math.sqrt(dLat * dLat + dLon * dLon);
    if (distKm < dome.radiusKm * 2.5) {
      const contribution = (dome.maxBortle - 2.2) * Math.exp(-(distKm * distKm) / (2 * (dome.radiusKm * 0.55) ** 2));
      bortle = Math.max(bortle, 2.4 + contribution);
    }
  }
  return Number(Math.min(9.0, Math.max(2.0, bortle)).toFixed(1));
}

export function syncLeafletMapSize() {
  if (!leafletMap) return;
  const container = leafletMap.getContainer();
  const size = leafletMap.getSize();
  const isMobileViewport = window.matchMedia('(max-width: 639px)').matches;

  if (size.x !== container.clientWidth || size.y !== container.clientHeight) {
    leafletMap.invalidateSize({ pan: false, debounceMoveend: true });
  }

  if (isMobileViewport && !mapWasMobileViewport && state.activeSpot &&
      !leafletMap.getBounds().contains([state.activeSpot.lat, state.activeSpot.lon])) {
    leafletMap.panTo([state.activeSpot.lat, state.activeSpot.lon], { animate: false });
  }
  mapWasMobileViewport = isMobileViewport;
  drawMapCanvasOverlays();
}

export function initVietnamMap() {
  const isMobileViewport = window.matchMedia('(max-width: 639px)').matches;
  setLeafletMap(L.map('vietnamLeafletMap', {
    center: isMobileViewport && state.activeSpot
      ? [state.activeSpot.lat, state.activeSpot.lon]
      : [16.6, 106.4],
    zoom: 6,
    minZoom: 5,
    maxZoom: 17,
    zoomControl: true
  }));
  leafletMap.attributionControl.addAttribution(
    'Địa danh &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
  );

  const overlayCanvasPane = leafletMap.createPane('mapOverlayCanvasPane');
  overlayCanvasPane.style.zIndex = '350';
  overlayCanvasPane.style.pointerEvents = 'none';
  overlayCanvasPane.style.width = '100%';
  overlayCanvasPane.style.height = '100%';
  overlayCanvasPane.appendChild(document.getElementById('mapOverlayCanvas'));
  const referenceLabelsPane = leafletMap.createPane('mapReferenceLabelsPane');
  referenceLabelsPane.style.zIndex = '450';

  setMapBaseTile('satellite');

  // Sync custom canvas overlay whenever map moves or zooms
  leafletMap.on('move zoom viewreset resize', () => {
    drawMapCanvasOverlays();
  });
  leafletMap.on('moveend', renderAllSpotMarkersOnMap);

  if ('ResizeObserver' in window) {
    mapResizeObserver = new ResizeObserver(() => {
      if (mapResizeFrame !== null) cancelAnimationFrame(mapResizeFrame);
      mapResizeFrame = requestAnimationFrame(() => {
        mapResizeFrame = null;
        syncLeafletMapSize();
      });
    });
    mapResizeObserver.observe(leafletMap.getContainer());
  }

  // Click anywhere on Vietnam map to inspect custom location & fetch live Open-Meteo forecast
  leafletMap.on('click', (e) => {
    const lat = Number(e.latlng.lat.toFixed(4));
    const lon = Number(e.latlng.lng.toFixed(4));
    const estBortle = estimateBortleAtCoord(lat, lon);
    // Estimate terrain elevation if inland mountain vs coast
    const estElevation = estimateTerrainElevation(lat, lon);

    const customSpot = {
      id: `map-pin-${lat}-${lon}`,
      name: `Đang tìm địa danh (${lat}, ${lon})`,
      shortName: 'Điểm Tùy Chọn',
      region: lat > 19.5 ? 'Miền Bắc' : (lat > 11.5 ? 'Miền Trung & Tây Nguyên' : 'Miền Nam'),
      province: 'Đang tra cứu',
      lat,
      lon,
      elevation: estElevation,
      bortle: estBortle,
      tags: ['Tọa độ tùy chỉnh', `Bortle ${estBortle}`],
      desc: `Điểm ghim trực tiếp · ${lat}, ${lon} · Độ cao ước tính ~${estElevation}m · Ô nhiễm sáng cấp ${estBortle}.`
    };

    emit('spot:select', { spot: customSpot, flyMap: false });
    emit('spot:reverse-geocode', { spot: customSpot });
  });

  renderAllSpotMarkersOnMap();
  setTimeout(syncLeafletMapSize, 250);
}

export function estimateTerrainElevation(lat, lon) {
  // Realistic elevation approximation for Northern Highlands & Central Highlands vs Deltas
  if (lat > 21.0 && lon < 105.0) return Math.round(950 + Math.abs(Math.sin(lat * 15 + lon * 12)) * 1100);
  if (lat > 21.8 && lon > 105.0 && lon < 106.8) return Math.round(550 + Math.abs(Math.cos(lat * 10)) * 650);
  if (lat >= 11.5 && lat <= 15.5 && lon >= 107.2 && lon <= 108.8) return Math.round(780 + Math.abs(Math.sin(lat * 9)) * 600);
  return Math.round(35 + Math.abs(Math.sin(lat * 8 + lon * 8)) * 180);
}

export function setMapBaseTile(mode) {
  if (!leafletMap) return;
  if (baseTileLayer) {
    leafletMap.removeLayer(baseTileLayer);
    baseTileLayer = null;
  }
  if (referenceLabelLayer) {
    leafletMap.removeLayer(referenceLabelLayer);
    referenceLabelLayer = null;
  }
  CARTO_CONFIG.currentStyle = mode;

  const sandboxNotice = document.getElementById('cartoSandboxNotice');
  if (sandboxNotice) sandboxNotice.classList.add('hidden');

  const attachTileTelemetry = (layer) => {
    if (!layer) return;
    layer.on('tileload', () => {
      CARTO_CONFIG.tilesLoadedCount += 1;
      const lbl = document.getElementById('cartoTileCountLabel');
      const modalLbl = document.getElementById('modalCartoTileCounter');
      if (lbl) lbl.textContent = String(CARTO_CONFIG.tilesLoadedCount);
      if (modalLbl) modalLbl.textContent = CARTO_CONFIG.tilesLoadedCount;
    });
  };

  if (mode === 'astro_dark') {
    // 100% Watermark-Free Dark Matter GIS using OSM Standard Tiles + Astro Dark CSS Filter
    baseTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      keepBuffer: 0,
      className: 'astro-dark-tiles',
      attribution: '&copy; OpenStreetMap contributors · Astro Dark GIS'
    });
  } else if (mode === 'satellite') {
    // Esri World Imagery + Hybrid Place Labels
    baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      keepBuffer: 0,
      attribution: 'Tiles &copy; Esri World Imagery'
    });
    referenceLabelLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      keepBuffer: 0,
      opacity: 1,
      pane: 'mapReferenceLabelsPane'
    });
  } else if (mode === 'esri_dark') {
    // Esri World Dark Gray Canvas + Reference Labels
    baseTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      keepBuffer: 0,
      attribution: 'Tiles &copy; Esri Dark Gray GIS'
    });
    referenceLabelLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      keepBuffer: 0,
      opacity: 1,
      pane: 'mapReferenceLabelsPane'
    });
  } else if (mode === 'topo') {
    baseTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      keepBuffer: 0,
      attribution: '&copy; OpenTopoMap (CC-BY-SA)'
    });
  } else {
    // Carto API Mode (with automatic Sandbox Watermark Guard)
    if (CARTO_CONFIG.isSandboxedPreview) {
      // Inside preview sandbox (*.googleusercontent.com), CartoCDN returns HTTP 200 "API KEY REQUIRED" watermark images
      // if the temporary sandbox domain isn't whitelisted. Render clean Dark Matter GIS tiles while keeping Carto config active.
      baseTileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        keepBuffer: 0,
        className: 'astro-dark-tiles',
        attribution: `&copy; OpenStreetMap &copy; CARTO (API Key: ${CARTO_CONFIG.getMaskedKey()} · Sandbox Guard)`
      });
      if (sandboxNotice) sandboxNotice.classList.remove('hidden');
    } else {
      const cartoUrl = CARTO_CONFIG.getTileUrl(mode);
      baseTileLayer = L.tileLayer(cartoUrl, {
        subdomains: 'abcd',
        maxZoom: 19,
        keepBuffer: 0,
        referrerPolicy: 'no-referrer',
        attribution: `&copy; OpenStreetMap &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a> (API Key: ${CARTO_CONFIG.getMaskedKey()})`
      });
    }
  }

  attachTileTelemetry(baseTileLayer);
  baseTileLayer.addTo(leafletMap);
  if (referenceLabelLayer) {
    referenceLabelLayer.addTo(leafletMap);
  }
  updateCartoTelemetryUI();
}

export function updateCartoTelemetryUI() {
  const masked = CARTO_CONFIG.getMaskedKey();
  const settingsStatus = document.getElementById('settingsCartoStatusLabel');
  const tileCounter = document.getElementById('cartoTileCountLabel');
  const modalTileCounter = document.getElementById('modalCartoTileCounter');
  const endpointPreview = document.getElementById('cartoEndpointPreview');

  if (settingsStatus) settingsStatus.textContent = `CARTO API: ${masked}`;
  if (tileCounter) tileCounter.textContent = String(CARTO_CONFIG.tilesLoadedCount);
  if (modalTileCounter) modalTileCounter.textContent = String(CARTO_CONFIG.tilesLoadedCount);
  if (endpointPreview) {
    endpointPreview.textContent = CARTO_CONFIG.getTileUrl(CARTO_CONFIG.currentStyle);
  }
}

export function renderAllSpotMarkersOnMap() {
  if (!leafletMap) return;
  spotClusterMarkers.forEach(m => leafletMap.removeLayer(m));
  spotClusterMarkers = [];

  const spotsByKey = new Map();
  [...state.spots, ...state.favoriteSpots, ...(state.activeSpot ? [state.activeSpot] : [])]
    .forEach(spot => spotsByKey.set(getSpotKey(spot), spot));
  const spotsToRender = [...spotsByKey.values()];
  const visibleBounds = leafletMap.getBounds();

  spotsToRender.forEach(spot => {
    if (!visibleBounds.contains([spot.lat, spot.lon])) return;
    const isSelected = state.activeSpot && state.activeSpot.id === spot.id;
    const iconHtml = `
      <div class="relative flex items-center justify-center">
        ${isSelected ? '<span class="absolute w-7 h-7 rounded-full bg-violet-500/50 pulse-ring"></span>' : ''}
        <div class="w-3.5 h-3.5 rounded-full ${isSelected ? 'bg-violet-400 ring-2 ring-white scale-125' : 'bg-cyan-400/90 hover:bg-violet-400'} border border-slate-950 shadow-md transition"></div>
      </div>
    `;
    const customIcon = L.divIcon({
      html: iconHtml,
      className: 'custom-spot-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([spot.lat, spot.lon], { icon: customIcon }).addTo(leafletMap);
    const bortleInfo = getBortleColorInfo(spot.bortle);
    marker.bindTooltip(
      `<div class="text-xs font-bold">${escapeHTML(spot.shortName || spot.name)}</div><div class="text-[10px] text-slate-300"><span class="${bortleInfo.textTierClass} font-mono font-semibold">Bortle ${escapeHTML(spot.bortle)}</span> · ${escapeHTML(spot.elevation)}m</div>`,
      { direction: 'top', offset: [0, -8] }
    );
    marker.on('click', (ev) => {
      L.DomEvent.stopPropagation(ev);
      emit('spot:select', { spot, flyMap: true });
    });
    spotClusterMarkers.push(marker);
  });
}
