/**
 * Minimal application event bus.
 * Renderers emit intent events; the app layer decides what to do.
 */
const bus = new EventTarget();

export function emit(name, detail) {
  bus.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on(name, handler) {
  bus.addEventListener(name, event => handler(event.detail));
}
