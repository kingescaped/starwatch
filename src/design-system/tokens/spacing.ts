export const SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  12: 48,
} as const;

export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 999,
} as const;

export const BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  desktopMin: 1024,
  maxContentWidth: 1344,
} as const;

export const MODAL_WIDTHS = {
  compact: 440,
  goldenWindow: 520,
  contribute: 640,
  wide: 740,
  calendar: 780,
} as const;
