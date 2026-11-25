import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { useAppState } from '../../state/AppStateContext';
import { computeRayDestination, FALLBACK_LIGHT_DOMES, getBortleMarkerColor, MAP_TILE_LAYERS } from './gisMapTileConfig';

interface GisMapCanvasProps {
  height?: number;
  fill?: boolean;
  compact?: boolean;
}

function ensureMapStylesInjected() {
  if (typeof document === 'undefined' || document.getElementById('sw-leaflet-css')) return;
  const style = document.createElement('style');
  style.id = 'sw-leaflet-css';
  style.textContent = `
    .sw-map-container .leaflet-container { background: #05070d; font-family: inherit; }
    .sw-map-red .leaflet-tile-pane { filter: sepia(100%) hue-rotate(305deg) saturate(260%) brightness(0.75); }
    .sw-map-marker { display:flex; align-items:center; justify-content:center; }
    .sw-map-dot { width:12px; height:12px; border-radius:999px; border:2px solid #fff; transition: transform .2s ease; }
    .sw-map-marker.is-active .sw-map-dot { width:16px; height:16px; box-shadow: 0 0 0 6px rgba(56,189,248,0.28), 0 0 14px #38bdf8; }
    .sw-map-pill { background: rgba(12,20,40,0.88); color:#f1f5fc; border:1px solid rgba(56,189,248,0.45); border-radius:999px; padding:2px 8px; font-size:10px; font-weight:600; box-shadow:0 4px 12px rgba(0,0,0,0.35); }
    .sw-map-pill::before { display:none; }
  `;
  document.head.appendChild(style);
}

export function GisMapCanvas({ height = 390, fill = false, compact = false }: GisMapCanvasProps) {
  const { mode, colors } = useTheme();
  const {
    basemap,
    spots,
    selectedSpot,
    selectSpot,
    selectedTarget,
    showLightPollution,
    showCloudLayer,
    showAzimuthRays,
    lightDomes,
    cloudSystems,
    skyScene,
    inspectMapPoint,
    locateCurrentPosition,
    locatingGps,
    openOverlay,
    openMobileSubScreen,
  } = useAppState();

  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    ensureMapStylesInjected();
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current, {
      center: [selectedSpot.lat, selectedSpot.lng],
      zoom: 6,
      minZoom: 4,
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });
    tileGroupRef.current = L.layerGroup().addTo(map);
    overlayGroupRef.current = L.layerGroup().addTo(map);
    map.on('click', (e: L.LeafletMouseEvent) => {
      inspectMapPoint({ lat: e.latlng.lat, lng: e.latlng.lng });
      if (compact) openMobileSubScreen('inspectCoords');
      else openOverlay('inspectCoords');
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const isDynamic = selectedSpot.id === 'gps-current' || selectedSpot.id.startsWith('search-');
    map.flyTo([selectedSpot.lat, selectedSpot.lng], Math.max(map.getZoom(), isDynamic ? 9 : 6), {
      duration: 0.65,
    });
  }, [selectedSpot.id, selectedSpot.lat, selectedSpot.lng]);

  useEffect(() => {
    const group = tileGroupRef.current;
    if (!group) return;
    group.clearLayers();
    const spec = MAP_TILE_LAYERS[basemap];
    L.tileLayer(spec.primaryUrl, { maxZoom: spec.maxZoom }).addTo(group);
    if (spec.overlayUrl) L.tileLayer(spec.overlayUrl, { maxZoom: spec.maxZoom }).addTo(group);
  }, [basemap]);

  useEffect(() => {
    const group = overlayGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (showLightPollution) {
      const domes = lightDomes.length ? lightDomes : FALLBACK_LIGHT_DOMES;
      for (const d of domes) {
        const c = d.maxBortle >= 8.5 ? '#F43F5E' : d.maxBortle >= 7.5 ? '#F97316' : '#FBBF24';
        L.circle([d.lat, d.lng], { radius: d.radiusKm * 1000, color: c, weight: 1, fillColor: c, fillOpacity: d.maxBortle >= 8.5 ? 0.3 : 0.2 }).addTo(group);
      }
    }

    if (showCloudLayer) {
      const clouds = cloudSystems.length ? cloudSystems : [
        { id: 'c1', label: 'Mây mô phỏng · Vịnh Bắc Bộ 38%', lat: 20.4, lng: 107.6, radiusKm: 135, opacity: 0.28 },
        { id: 'c2', label: 'Mây Biển Đông 26%', lat: 14.8, lng: 109.1, radiusKm: 140, opacity: 0.22 },
      ];
      for (const cl of clouds) {
        L.circle([cl.lat, cl.lng], { radius: cl.radiusKm * 1000, color: '#38BDF8', weight: 1, dashArray: '5 4', fillColor: '#38BDF8', fillOpacity: cl.opacity })
          .bindTooltip(cl.label, { className: 'sw-map-pill', direction: 'center' })
          .addTo(group);
      }
    }

    if (showAzimuthRays) {
      const origin: [number, number] = [selectedSpot.lat, selectedSpot.lng];
      const sunEnd = computeRayDestination(selectedSpot.lat, selectedSpot.lng, skyScene.sunAz, 190);
      const moonEnd = computeRayDestination(selectedSpot.lat, selectedSpot.lng, skyScene.moonAz, 190);
      const targetEnd = computeRayDestination(selectedSpot.lat, selectedSpot.lng, skyScene.targetAz, 210);
      L.polyline([origin, sunEnd], { color: '#FBBF24', weight: 1.8, dashArray: '5 4' }).bindTooltip(`● Mặt Trời · ${skyScene.sunAzLabel}`, { permanent: !compact, className: 'sw-map-pill', direction: 'left' }).addTo(group);
      L.polyline([origin, moonEnd], { color: '#818CF8', weight: 1.8, dashArray: '5 4' }).bindTooltip(`● Mặt Trăng · ${skyScene.moonAzLabel}`, { permanent: !compact, className: 'sw-map-pill', direction: 'left' }).addTo(group);
      L.polyline([origin, targetEnd], { color: '#38BDF8', weight: 2.5 }).bindTooltip(`● ${selectedTarget.shortName} · ${skyScene.targetAzLabel}`, { permanent: true, className: 'sw-map-pill', direction: 'right' }).addTo(group);
    }

    for (const spot of spots) {
      const isSelected = spot.id === selectedSpot.id;
      const color = getBortleMarkerColor(spot.bortle);
      const icon = L.divIcon({
        className: `sw-map-marker ${isSelected ? 'is-active' : ''}`,
        html: `<div class="sw-map-dot" style="background:${isSelected ? '#38BDF8' : color}"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const marker = L.marker([spot.lat, spot.lng], { icon, title: spot.name }).addTo(group);
      if (isSelected) {
        marker.bindTooltip(`${spot.name} B${spot.bortle}`, { permanent: true, className: 'sw-map-pill', direction: 'top', offset: [0, -10] });
      }
      marker.on('click', (ev) => {
        L.DomEvent.stopPropagation(ev);
        selectSpot(spot.id);
      });
    }
  }, [spots, selectedSpot, selectedTarget, showLightPollution, showCloudLayer, showAzimuthRays, lightDomes, cloudSystems, skyScene, compact, selectSpot]);

  return (
    <View
      style={{
        flex: fill ? 1 : undefined,
        minHeight: fill ? 500 : undefined,
        height: fill ? undefined : height,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        backgroundColor: '#05070d',
      }}
    >
      <div
        ref={hostRef}
        className={`sw-map-container ${mode === 'red' ? 'sw-map-red' : ''}`}
        style={{ width: '100%', height: '100%' }}
      />

      <View
        style={{
          position: 'absolute',
          left: 10,
          bottom: 10,
          borderRadius: 12,
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          overflow: 'hidden',
          zIndex: 500,
        }}
      >
        <Pressable onPress={() => mapRef.current?.zoomIn()} style={{ paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
          <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>+</Text>
        </Pressable>
        <Pressable onPress={() => mapRef.current?.zoomOut()} style={{ paddingHorizontal: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
          <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>−</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Căn giữa điểm đang chọn"
          onPress={() => mapRef.current?.setView([selectedSpot.lat, selectedSpot.lng], 6, { animate: true })}
          style={{ paddingHorizontal: 9, paddingVertical: 7, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}
        >
          <AppIcon name="crosshair" size={13} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          accessibilityLabel="Vị trí hiện tại (GPS)"
          disabled={locatingGps}
          onPress={() => { void locateCurrentPosition(); }}
          style={{ paddingHorizontal: 9, paddingVertical: 7, alignItems: 'center', backgroundColor: locatingGps ? colors.pillActiveBg : 'transparent' }}
        >
          <AppIcon name="locate" size={13} color={colors.accentCyan} />
        </Pressable>
      </View>
    </View>
  );
}
