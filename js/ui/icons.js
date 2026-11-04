const iconNames = new Set([
  'starwatch-mark', 'sparkles', 'search', 'locate-fixed', 'compass', 'calendar-heart',
  'map-pin-plus', 'book-open-check', 'settings', 'map-pin', 'camera', 'heart',
  'refresh-cw', 'chevron-up', 'chevron-down', 'calendar', 'play', 'pause',
  'telescope', 'map', 'lightbulb', 'satellite', 'shield-check', 'clock', 'layers',
  'aperture', 'smartphone', 'cpu', 'mountain-snow', 'x', 'server', 'key-round',
  'mail', 'send', 'palette', 'moon', 'sun', 'eye', 'milky-way', 'dew', 'globe',
  'sunrise', 'sunset', 'cloud', 'meteor', 'spiral-galaxy', 'diamond', 'full-moon',
  'target', 'mountain', 'arrow-right', 'warning', 'twilight'
]);

const svgNamespace = 'http://www.w3.org/2000/svg';
const spriteUrl = new URL('../../assets/icons/sprite.svg', import.meta.url).href;

function getIconHref(name) {
  if (!iconNames.has(name)) throw new RangeError(`Unknown StarWatch icon: ${name}`);
  return `${spriteUrl}#${name}`;
}

function renderIcon(element) {
  const name = element.getAttribute('data-icon');
  const href = getIconHref(name);
  const svg = element.namespaceURI === svgNamespace && element.localName === 'svg'
    ? element
    : document.createElementNS(svgNamespace, 'svg');

  if (svg !== element) {
    for (const attribute of element.attributes) {
      svg.setAttribute(attribute.name, attribute.value);
    }
    svg.setAttribute('aria-hidden', element.getAttribute('aria-hidden') || 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    const use = document.createElementNS(svgNamespace, 'use');
    svg.append(use);
    element.replaceWith(svg);
  }

  const use = svg.querySelector('use') || document.createElementNS(svgNamespace, 'use');
  use.setAttribute('href', href);
  if (!use.parentNode) svg.append(use);
}

export function renderIcons(root = document) {
  const elements = [];
  if (root instanceof Element && root.hasAttribute('data-icon')) elements.push(root);
  elements.push(...root.querySelectorAll('[data-icon]'));
  elements.forEach(renderIcon);
}

export function setIcon(element, name) {
  if (!element) throw new TypeError('An icon element is required');
  element.setAttribute('data-icon', name);
  renderIcon(element);
}

export function iconMarkup(name, className = '') {
  getIconHref(name);
  const classAttribute = className ? ` class="${className}"` : '';
  return `<i data-icon="${name}" aria-hidden="true"${classAttribute}></i>`;
}
