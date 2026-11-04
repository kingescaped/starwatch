/**
 * Shared DOM, escaping and Nominatim request helpers.
 */

export let appStatusToastTimer = null;

export let nominatimRequestQueue = Promise.resolve();
export let nominatimLastRequestAt = 0;

export function showAppStatus(message, isError = false) {
  const toast = document.getElementById('appStatusToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.toggle('border-rose-400/40', isError);
  toast.classList.toggle('text-rose-100', isError);
  toast.classList.toggle('border-cyan-400/30', !isError);
  toast.classList.toggle('text-cyan-100', !isError);
  toast.classList.remove('hidden');
  clearTimeout(appStatusToastTimer);
  appStatusToastTimer = setTimeout(() => toast.classList.add('hidden'), isError ? 4500 : 2800);
}

export function fetchNominatim(url, shouldSend = () => true) {
  const request = nominatimRequestQueue.then(async () => {
    if (!shouldSend()) return null;
    const delayMs = Math.max(0, 1100 - (Date.now() - nominatimLastRequestAt));
    if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
    if (!shouldSend()) return null;
    nominatimLastRequestAt = Date.now();
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Nominatim request failed (${response.status})`);
    return response;
  });
  nominatimRequestQueue = request.then(() => undefined, () => undefined);
  return request;
}

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

export function getSpotKey(spot) {
  return `${Number(spot.lat).toFixed(4)},${Number(spot.lon).toFixed(4)}`;
}
