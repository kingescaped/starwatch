/**
 * Reusable press-and-hold confirmation gesture.
 *
 * The gesture is purely presentational: this module toggles two state
 * classes and the `.hold-confirm` CSS component (assets/css/components.css)
 * paints the colour sweep with the `hold-confirm-sweep` animation.
 *
 * - `.is-holding`  added while the pointer/key is held down.
 * - `.is-complete` added once the hold reaches `--hold-confirm-duration`.
 *
 * Colours and duration stay in CSS, so the same gesture can be reused on any
 * element by overriding `--hold-confirm-color`, `--hold-confirm-duration` and
 * `--hold-confirm-glow`.
 *
 * Tool views keep their DOM while hidden, so `openToolModal()` /
 * `closeToolModal()` call `resetHoldConfirmWithin()` to drop any leftover
 * `.is-complete` state (otherwise the view would reopen with a stale filled
 * button that refuses new holds).
 */

const HOLDING_CLASS = 'is-holding';
const COMPLETE_CLASS = 'is-complete';
const DEFAULT_DURATION_MS = 1100;

/** Reset callbacks keyed by element, used to release a gesture from outside. */
const resetters = new WeakMap();

export function resetHoldConfirm(element) {
  resetters.get(element)?.();
}

/**
 * Release every press-and-hold control inside a tool view. Tool views keep
 * their DOM while hidden, so a completed hold would otherwise stay green
 * (and refuses new holds) the next time the view opens.
 */
export function resetHoldConfirmWithin(root) {
  root?.querySelectorAll?.('.hold-confirm').forEach(resetHoldConfirm);
}

function readHoldDuration(element) {
  const raw = getComputedStyle(element).getPropertyValue('--hold-confirm-duration').trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_DURATION_MS;
  if (raw.endsWith('ms')) return value;
  if (raw.endsWith('s')) return value * 1000;
  return value;
}

/**
 * Swallow the click that follows a completed hold so it cannot bubble to the
 * parent card (which would select the spot right after deleting it).
 */
function swallowNextClick() {
  const swallow = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  document.addEventListener('click', swallow, true);
  window.setTimeout(() => document.removeEventListener('click', swallow, true), 500);
}

/**
 * @param {HTMLElement | null} element
 * @param {{ onComplete?: (element: HTMLElement) => void }} [options]
 * @returns {() => void} Detach function.
 */
export function attachHoldToConfirm(element, { onComplete } = {}) {
  if (!element) return () => {};

  let timer = null;
  let pressing = false;

  const releaseWindowGuards = () => {
    window.removeEventListener('pointerup', cancel, true);
    window.removeEventListener('pointercancel', cancel, true);
  };

  const resetState = () => {
    pressing = false;
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
    element.classList.remove(HOLDING_CLASS);
    element.removeAttribute('aria-busy');
  };

  function cancel() {
    releaseWindowGuards();
    resetState();
  }

  const reset = () => {
    cancel();
    element.classList.remove(COMPLETE_CLASS);
  };
  const complete = () => {
    releaseWindowGuards();
    pressing = false;
    timer = null;
    element.classList.remove(HOLDING_CLASS);
    element.classList.add(COMPLETE_CLASS);
    element.removeAttribute('aria-busy');
    swallowNextClick();
    onComplete?.(element);
  };

  const start = (event) => {
    if (element.disabled) return;
    if (event.type === 'pointerdown' && event.button !== 0) return;
    if (pressing || element.classList.contains(COMPLETE_CLASS)) return;

    pressing = true;
    element.classList.add(HOLDING_CLASS);
    element.setAttribute('aria-busy', 'true');
    window.addEventListener('pointerup', cancel, true);
    window.addEventListener('pointercancel', cancel, true);
    timer = window.setTimeout(complete, readHoldDuration(element));
  };

  const onKeyDown = (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    event.preventDefault();
    if (event.repeat) return;
    start(event);
  };

  const onKeyUp = (event) => {
    if (event.key !== ' ' && event.key !== 'Enter') return;
    if (pressing) cancel();
  };

  const stopClick = (event) => {
    event.stopPropagation();
  };

  const preventContextMenu = (event) => {
    event.preventDefault();
  };

  element.addEventListener('pointerdown', start);
  element.addEventListener('pointerup', cancel);
  element.addEventListener('pointerleave', cancel);
  element.addEventListener('pointercancel', cancel);
  element.addEventListener('keydown', onKeyDown);
  element.addEventListener('keyup', onKeyUp);
  element.addEventListener('blur', cancel);
  element.addEventListener('click', stopClick);
  element.addEventListener('contextmenu', preventContextMenu);

  resetters.set(element, reset);

  return () => {
    reset();
    resetters.delete(element);
    element.removeEventListener('pointerdown', start);
    element.removeEventListener('pointerup', cancel);
    element.removeEventListener('pointerleave', cancel);
    element.removeEventListener('pointercancel', cancel);
    element.removeEventListener('keydown', onKeyDown);
    element.removeEventListener('keyup', onKeyUp);
    element.removeEventListener('blur', cancel);
    element.removeEventListener('click', stopClick);
    element.removeEventListener('contextmenu', preventContextMenu);
  };
}
