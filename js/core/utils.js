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

/**
 * Dynamic Bortle Scale color palette helper (Tier 1 to 5).
 * Tier 1 (1.0 - 3.0): Emerald / Green (Rất tối)
 * Tier 2 (3.1 - 4.2): Lime / Light Green (Tối)
 * Tier 3 (4.3 - 5.5): Yellow (Trung bình)
 * Tier 4 (5.6 - 7.0): Orange (Sáng)
 * Tier 5 (7.1 - 9.0): Red (Sáng rực)
 */
export function getBortleColorInfo(bortleValue) {
  const b = parseFloat(bortleValue) || 3.5;
  if (b <= 3.0) {
    return {
      level: 1,
      name: 'Rất tối',
      textColor: '#34d399',
      textClass: 'text-emerald-400',
      badgeClass: 'bortle-badge bortle-badge--tier-1',
      pillClass: 'bortle-pill--tier-1',
      dotClass: 'bortle-dot--tier-1',
      textTierClass: 'bortle-text--tier-1'
    };
  }
  if (b <= 4.2) {
    return {
      level: 2,
      name: 'Tối',
      textColor: '#a3e635',
      textClass: 'text-lime-400',
      badgeClass: 'bortle-badge bortle-badge--tier-2',
      pillClass: 'bortle-pill--tier-2',
      dotClass: 'bortle-dot--tier-2',
      textTierClass: 'bortle-text--tier-2'
    };
  }
  if (b <= 5.5) {
    return {
      level: 3,
      name: 'Trung bình',
      textColor: '#facc15',
      textClass: 'text-yellow-400',
      badgeClass: 'bortle-badge bortle-badge--tier-3',
      pillClass: 'bortle-pill--tier-3',
      dotClass: 'bortle-dot--tier-3',
      textTierClass: 'bortle-text--tier-3'
    };
  }
  if (b <= 7.0) {
    return {
      level: 4,
      name: 'Sáng',
      textColor: '#fb923c',
      textClass: 'text-orange-400',
      badgeClass: 'bortle-badge bortle-badge--tier-4',
      pillClass: 'bortle-pill--tier-4',
      dotClass: 'bortle-dot--tier-4',
      textTierClass: 'bortle-text--tier-4'
    };
  }
  return {
    level: 5,
    name: 'Sáng rực',
    textColor: '#f87171',
    textClass: 'text-red-400',
    badgeClass: 'bortle-badge bortle-badge--tier-5',
    pillClass: 'bortle-pill--tier-5',
    dotClass: 'bortle-dot--tier-5',
    textTierClass: 'bortle-text--tier-5'
  };
}
