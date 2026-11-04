/**
 * Shared Leaflet map instance.
 * Kept in its own module so overlay renderers can read the map
 * without importing map.js (which would create an import cycle).
 */
export let leafletMap = null;

export function setLeafletMap(map) {
  leafletMap = map;
}
