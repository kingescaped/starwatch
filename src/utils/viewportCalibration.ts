export function isIosPlatform(userAgent: string, platform: string, maxTouchPoints: number): boolean {
  return /iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function computeCalibratedAppHeight(
  innerHeight: number,
  screenHeight: number,
  screenWidth: number,
  isIosStandalone: boolean,
  isPortrait = true
): number {
  if (!isIosStandalone || innerHeight <= 0) return innerHeight;
  const targetScreenH = isPortrait
    ? Math.max(screenHeight, screenWidth)
    : Math.min(screenHeight, screenWidth);
  const diff = targetScreenH - innerHeight;
  if (diff > 0 && diff <= 110) return targetScreenH;
  return innerHeight;
}

export function isVirtualKeyboardOpen(appHeight: number, visualViewportHeight: number): boolean {
  return appHeight > 0 && visualViewportHeight > 0 && appHeight - visualViewportHeight > 120;
}

function probeSafeAreaTopPx(): number {
  if (typeof document === 'undefined' || typeof window === 'undefined') return 0;
  const docEl = document.documentElement;
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top, 0px);';
  docEl.appendChild(probe);
  const satPx = Number.parseFloat(window.getComputedStyle(probe).paddingTop) || 0;
  docEl.removeChild(probe);
  return satPx;
}

function checkIsIosStandalone(satPx: number): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  const ios = isIosPlatform(nav.userAgent || '', nav.platform || '', nav.maxTouchPoints || 0);
  const standalone =
    nav.standalone === true ||
    Boolean(window.matchMedia?.('(display-mode: standalone)').matches);
  return ios && standalone && satPx > 0;
}

function syncCssViewportMetrics(iosStandalone: boolean): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const docEl = document.documentElement;
  const innerH = window.innerHeight || 0;
  const isPortrait = (window.innerWidth || 0) <= innerH;
  const orientation = isPortrait ? 'portrait' : 'landscape';
  const orientationChanged = Boolean(docEl.dataset.swOrientation && docEl.dataset.swOrientation !== orientation);
  docEl.dataset.swOrientation = orientation;

  const vvH = window.visualViewport?.height || innerH;
  const scr = window.screen;
  const nextAppH = computeCalibratedAppHeight(innerH, scr?.height || innerH, scr?.width || innerH, iosStandalone, isPortrait);
  const prevAppH = Number.parseFloat(docEl.style.getPropertyValue('--app-height')) || nextAppH;
  const baselineAppH = orientationChanged ? nextAppH : Math.max(prevAppH, nextAppH);
  const keyboardOpen = !orientationChanged && isVirtualKeyboardOpen(baselineAppH, vvH);

  docEl.classList.toggle('keyboard-open', keyboardOpen);
  if (!keyboardOpen && nextAppH > 0) docEl.style.setProperty('--app-height', `${nextAppH}px`);
  if (vvH > 0) docEl.style.setProperty('--visual-vh', `${Math.round(vvH)}px`);
}

function ensureSweepLayer(id: 'ios-blur-cover' | 'ios-blur-panel'): HTMLDivElement {
  let node = document.getElementById(id) as HTMLDivElement | null;
  if (!node) {
    node = document.createElement('div');
    node.id = id;
    node.setAttribute('aria-hidden', 'true');
    document.body.appendChild(node);
  }
  node.style.display = 'block';
  return node;
}

export function triggerIosTopBlurSweep(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (!document.documentElement.classList.contains('ios-standalone')) return;
  const cover = ensureSweepLayer('ios-blur-cover');
  const panel = ensureSweepLayer('ios-blur-panel');

  window.requestAnimationFrame(() => {
    cover.style.opacity = '0.99';
    panel.style.opacity = '0.99';
    window.requestAnimationFrame(() => {
      cover.remove();
      panel.remove();
    });
  });
}

function unregisterDevServiceWorkers(): void {
  const devFlag = typeof __DEV__ !== 'undefined' && __DEV__;
  if (!devFlag || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) void reg.unregister();
  }).catch(() => {});
}

export function initViewportCalibration(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  unregisterDevServiceWorkers();

  const docEl = document.documentElement;
  let iosStandalone = docEl.classList.contains('ios-standalone') || checkIsIosStandalone(probeSafeAreaTopPx());
  if (iosStandalone) docEl.classList.add('ios-standalone');

  const recalibrate = () => {
    if (!iosStandalone) {
      iosStandalone = checkIsIosStandalone(probeSafeAreaTopPx());
      if (iosStandalone) docEl.classList.add('ios-standalone');
    }
    syncCssViewportMetrics(iosStandalone);
  };
  const settleScroll = () => { recalibrate(); if (iosStandalone) window.scrollTo(0, 0); };
  const onForeground = () => { settleScroll(); triggerIosTopBlurSweep(); };
  const onVisibility = () => { if (document.visibilityState === 'visible') onForeground(); };

  recalibrate();
  if (document.readyState === 'complete') triggerIosTopBlurSweep();
  else window.addEventListener('load', triggerIosTopBlurSweep, { once: true });

  const sweepTimer = window.setTimeout(triggerIosTopBlurSweep, 1450);
  window.addEventListener('resize', recalibrate);
  window.addEventListener('orientationchange', settleScroll);
  window.addEventListener('pageshow', onForeground);
  window.addEventListener('focusout', settleScroll);
  document.addEventListener('visibilitychange', onVisibility);
  window.visualViewport?.addEventListener('resize', recalibrate);

  return () => {
    window.clearTimeout(sweepTimer);
    window.removeEventListener('load', triggerIosTopBlurSweep);
    window.removeEventListener('resize', recalibrate);
    window.removeEventListener('orientationchange', settleScroll);
    window.removeEventListener('pageshow', onForeground);
    window.removeEventListener('focusout', settleScroll);
    document.removeEventListener('visibilitychange', onVisibility);
    window.visualViewport?.removeEventListener('resize', recalibrate);
  };
}
