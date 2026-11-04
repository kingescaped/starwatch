import { emit } from '../core/events.js';
import { state } from '../core/state.js';
import { fetchNominatim, getSpotKey, showAppStatus } from '../core/utils.js';
import { estimateBortleAtCoord, estimateTerrainElevation, renderAllSpotMarkersOnMap } from '../map/map.js';
import { persistFavoriteSpots } from '../services/favorites.js';
import { renderCameraSetupGuide } from '../ui/camera-guide.js';
import { renderSpotsDirectoryGrid } from '../ui/spots-directory.js';

/**
 * Reverse geocoding, GPS location and Nominatim helpers.
 */

export let latestReverseGeocodeRequest = 0;

export let locationRequestPending = false;

export function setCoordinateFallbackName(spot) {
  const isGpsLocation = spot.tags && spot.tags.includes('GPS hiện tại');
  const coordinates = `${Number(spot.lat).toFixed(4)}, ${Number(spot.lon).toFixed(4)}`;
  spot.name = isGpsLocation ? `Vị trí của tôi (${coordinates})` : `Tọa độ tùy chọn (${coordinates})`;
  spot.shortName = isGpsLocation ? 'Vị trí của tôi' : 'Điểm tùy chọn';
  spot.province = isGpsLocation ? 'GPS thiết bị' : 'Tọa độ bản đồ';
  spot.desc = `Không có tên địa danh · ${coordinates}.`;
  const favoriteIndex = state.favoriteSpots.findIndex(favorite => getSpotKey(favorite) === getSpotKey(spot));
  if (favoriteIndex >= 0) {
    state.favoriteSpots[favoriteIndex] = { ...spot };
    persistFavoriteSpots();
  }
  if (state.activeSpot !== spot) return;
  document.getElementById('activeSpotName').textContent = spot.name;
  document.getElementById('activeSpotRegionBadge').textContent = `${spot.region} · ${spot.province}`;
  document.getElementById('activeSpotDesc').textContent = spot.desc;
  renderAllSpotMarkersOnMap();
  renderSpotsDirectoryGrid();
  renderCameraSetupGuide();
}

export async function reverseGeocodeSpot(spot) {
  const requestId = ++latestReverseGeocodeRequest;
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(spot.lat)}&lon=${encodeURIComponent(spot.lon)}&zoom=10&addressdetails=1&accept-language=vi`;

  try {
    const response = await fetchNominatim(url, () => requestId === latestReverseGeocodeRequest);
    if (!response) return;
    const place = await response.json();
    if (requestId !== latestReverseGeocodeRequest) return;
    if (state.activeSpot !== spot) return;
    if (!place || !place.address) {
      setCoordinateFallbackName(spot);
      showAppStatus('Không tìm thấy tên địa danh; đang giữ tọa độ.', true);
      return;
    }

    const address = place.address;
    const locality = address.village || address.town || address.city ||
      address.municipality || address.hamlet || address.suburb ||
      address.county || address.state_district;
    const province = address.state || address.province || address.region || address.country;
    const locationName = [locality, province]
      .filter((part, index, parts) => part && parts.indexOf(part) === index)
      .join(', ') || (place.display_name || '').split(',').slice(0, 3).join(', ').trim();

    if (!locationName) {
      setCoordinateFallbackName(spot);
      showAppStatus('Không tìm thấy tên địa danh; đang giữ tọa độ.', true);
      return;
    }

    spot.name = locationName;
    spot.shortName = locality || locationName.split(',')[0];
    if (province) spot.province = province;
    spot.desc = `Vị trí ${locationName} · ${spot.lat.toFixed(4)}, ${spot.lon.toFixed(4)}.`;

    const favoriteIndex = state.favoriteSpots.findIndex(favorite => getSpotKey(favorite) === getSpotKey(spot));
    if (favoriteIndex >= 0) {
      state.favoriteSpots[favoriteIndex] = { ...spot };
      persistFavoriteSpots();
    }
    document.getElementById('activeSpotName').textContent = spot.name;
    document.getElementById('activeSpotRegionBadge').textContent = `${spot.region} · ${spot.province}`;
    document.getElementById('activeSpotDesc').textContent = spot.desc;
    renderAllSpotMarkersOnMap();
    renderSpotsDirectoryGrid();
    renderCameraSetupGuide();
  } catch (error) {
    if (requestId === latestReverseGeocodeRequest && state.activeSpot === spot) {
      setCoordinateFallbackName(spot);
      showAppStatus('Không tra cứu được địa danh. Đang giữ nguyên tọa độ.', true);
    }
  }
}

export function requestCurrentLocation() {
  if (locationRequestPending) return;
  if (!navigator.geolocation) {
    showAppStatus('Trình duyệt này không hỗ trợ định vị GPS.', true);
    return;
  }
  locationRequestPending = true;
  const gpsButton = document.getElementById('btnUseMyGPS');
  gpsButton.disabled = true;
  gpsButton.setAttribute('aria-busy', 'true');
  const finishLocationRequest = () => {
    locationRequestPending = false;
    gpsButton.disabled = false;
    gpsButton.removeAttribute('aria-busy');
  };
  try {
    navigator.geolocation.getCurrentPosition((position) => {
      finishLocationRequest();
      const lat = Number(position.coords.latitude.toFixed(4));
      const lon = Number(position.coords.longitude.toFixed(4));
      const spot = {
        id: `gps-${lat}-${lon}`,
        name: `Đang tìm địa danh (${lat}, ${lon})`,
        shortName: 'Vị trí của tôi',
        region: 'GPS hiện tại',
        province: 'Đang tra cứu',
        lat,
        lon,
        elevation: estimateTerrainElevation(lat, lon),
        bortle: estimateBortleAtCoord(lat, lon),
        tags: ['GPS hiện tại'],
        desc: `Vị trí GPS ${lat}, ${lon}.`
      };
      emit('spot:select', { spot, flyMap: true });
      reverseGeocodeSpot(spot);
    }, (error) => {
      finishLocationRequest();
      if (error.code === error.PERMISSION_DENIED) {
        showAppStatus('Quyền vị trí đang bị từ chối. Bạn có thể bật lại trong cài đặt trình duyệt.', true);
      } else if (error.code === error.TIMEOUT) {
        showAppStatus('Định vị quá thời gian chờ. Hãy thử lại khi tín hiệu GPS ổn định hơn.', true);
      } else {
        showAppStatus('Không lấy được vị trí. Hãy kiểm tra dịch vụ vị trí của thiết bị.', true);
      }
    }, {
      enableHighAccuracy: false,
      maximumAge: 60000,
      timeout: 12000
    });
  } catch (error) {
    finishLocationRequest();
    showAppStatus('Trình duyệt không thể bắt đầu định vị. Hãy thử lại từ nút GPS.', true);
  }
}

export async function initializeLocationConsent() {
  if (!navigator.geolocation) return;

  if (navigator.permissions && navigator.permissions.query) {
    let permission;
    try {
      permission = await navigator.permissions.query({ name: 'geolocation' });
    } catch (error) {
      showAppStatus('Không kiểm tra được trạng thái quyền GPS; trình duyệt sẽ xử lý yêu cầu vị trí.', true);
    }

    if (permission && permission.state === 'denied') {
      return;
    }
    if (permission && permission.state === 'granted') {
      requestCurrentLocation();
      return;
    }
  }

  requestCurrentLocation();
}
