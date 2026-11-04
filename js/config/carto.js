/**
 * Carto basemap configuration and API key handling.
 */

export const DEFAULT_CARTO_API_KEY = 'cb1_501v_1_e33dc217369ec4a4d4697d9d';
export const CARTO_CONFIG = {
  apiKey: localStorage.getItem('skyradar_carto_api_key') || DEFAULT_CARTO_API_KEY,
  currentStyle: 'satellite',
  tilesLoadedCount: 0,
  isSandboxedPreview: (
    window.location.hostname.includes('googleusercontent.com') ||
    window.location.hostname.includes('scf.usercontent.goog') ||
    window.location.protocol === 'blob:' ||
    window.location.protocol === 'about:' ||
    window.location.hostname === ''
  ),
  getTileUrl(style) {
    const keyParam = `api_key=${encodeURIComponent(this.apiKey)}&key=${encodeURIComponent(this.apiKey)}`;
    switch (style) {
      case 'carto_nolabels':
        return `https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png?${keyParam}`;
      case 'carto_voyager':
        return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?${keyParam}`;
      case 'carto_dark':
      default:
        return `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?${keyParam}`;
    }
  },
  getMaskedKey() {
    if (!this.apiKey || this.apiKey.length < 12) return this.apiKey || 'Chưa cấu hình';
    return `${this.apiKey.slice(0, 10)}...${this.apiKey.slice(-4)}`;
  }
};
