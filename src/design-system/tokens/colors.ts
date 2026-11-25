export type ThemeMode = 'dark' | 'light' | 'red';

export interface ThemeColors {
  mode: ThemeMode;
  label: string;
  bg: string;
  bgElevated: string;
  card: string;
  cardInner: string;
  glass: string;
  headerBg: string;
  modalBg: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentCyan: string;
  accentCyanBg: string;
  accentCyanBorder: string;
  accentViolet: string;
  accentVioletBg: string;
  accentVioletBorder: string;
  accentPurple: string;
  accentAmber: string;
  accentAmberBg: string;
  accentAmberBorder: string;
  accentEmerald: string;
  accentEmeraldBg: string;
  accentEmeraldBorder: string;
  accentRose: string;
  accentRoseBg: string;
  accentRoseBorder: string;
  borderSubtle: string;
  borderStrong: string;
  ringTrack: string;
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryBorder: string;
  pillBg: string;
  pillActiveBg: string;
  heroGlowStart: string;
  heroGlowMid: string;
  heroGlowEnd: string;
}

export const THEMES: Record<ThemeMode, ThemeColors> = {
  dark: {
    mode: 'dark',
    label: 'Đêm',
    bg: '#05070D',
    bgElevated: '#090E1B',
    card: '#0C1428',
    cardInner: '#080E1D',
    glass: 'rgba(14, 24, 50, 0.82)',
    headerBg: 'rgba(5, 7, 13, 0.92)',
    modalBg: '#0C1324',
    inputBg: '#080D1A',
    textPrimary: '#F1F5FC',
    textSecondary: '#9BAAC0',
    textMuted: '#64748B',
    accentCyan: '#38BDF8',
    accentCyanBg: 'rgba(56, 189, 248, 0.12)',
    accentCyanBorder: 'rgba(56, 189, 248, 0.42)',
    accentViolet: '#818CF8',
    accentVioletBg: 'rgba(129, 140, 248, 0.14)',
    accentVioletBorder: 'rgba(129, 140, 248, 0.40)',
    accentPurple: '#A855F7',
    accentAmber: '#FBBF24',
    accentAmberBg: 'rgba(251, 191, 36, 0.12)',
    accentAmberBorder: 'rgba(251, 191, 36, 0.42)',
    accentEmerald: '#10B981',
    accentEmeraldBg: 'rgba(16, 185, 129, 0.12)',
    accentEmeraldBorder: 'rgba(16, 185, 129, 0.40)',
    accentRose: '#F43F5E',
    accentRoseBg: 'rgba(244, 63, 94, 0.12)',
    accentRoseBorder: 'rgba(244, 63, 94, 0.40)',
    borderSubtle: 'rgba(255, 255, 255, 0.10)',
    borderStrong: 'rgba(255, 255, 255, 0.18)',
    ringTrack: 'rgba(255, 255, 255, 0.08)',
    buttonPrimaryBg: '#38BDF8',
    buttonPrimaryText: '#05070D',
    buttonSecondaryBg: 'rgba(14, 29, 51, 0.9)',
    buttonSecondaryBorder: 'rgba(56, 189, 248, 0.35)',
    pillBg: 'rgba(255, 255, 255, 0.04)',
    pillActiveBg: 'rgba(56, 189, 248, 0.14)',
    heroGlowStart: '#060913',
    heroGlowMid: '#0B142B',
    heroGlowEnd: '#0D1330',
  },
  light: {
    mode: 'light',
    label: 'Ngày',
    bg: '#F1F5F9',
    bgElevated: '#E2E8F0',
    card: '#FFFFFF',
    cardInner: '#F8FAFC',
    glass: 'rgba(255, 255, 255, 0.92)',
    headerBg: 'rgba(255, 255, 255, 0.94)',
    modalBg: '#FFFFFF',
    inputBg: '#F8FAFC',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    accentCyan: '#0284C7',
    accentCyanBg: 'rgba(2, 132, 199, 0.10)',
    accentCyanBorder: 'rgba(2, 132, 199, 0.38)',
    accentViolet: '#6D28D9',
    accentVioletBg: 'rgba(109, 40, 217, 0.10)',
    accentVioletBorder: 'rgba(109, 40, 217, 0.35)',
    accentPurple: '#7C3AED',
    accentAmber: '#B45309',
    accentAmberBg: 'rgba(180, 83, 9, 0.10)',
    accentAmberBorder: 'rgba(180, 83, 9, 0.38)',
    accentEmerald: '#047857',
    accentEmeraldBg: 'rgba(4, 120, 87, 0.10)',
    accentEmeraldBorder: 'rgba(4, 120, 87, 0.38)',
    accentRose: '#B91C1C',
    accentRoseBg: 'rgba(185, 28, 28, 0.09)',
    accentRoseBorder: 'rgba(185, 28, 28, 0.38)',
    borderSubtle: 'rgba(148, 163, 184, 0.40)',
    borderStrong: 'rgba(100, 116, 139, 0.50)',
    ringTrack: 'rgba(148, 163, 184, 0.25)',
    buttonPrimaryBg: '#0284C7',
    buttonPrimaryText: '#FFFFFF',
    buttonSecondaryBg: '#F1F5F9',
    buttonSecondaryBorder: 'rgba(2, 132, 199, 0.35)',
    pillBg: 'rgba(15, 23, 42, 0.04)',
    pillActiveBg: 'rgba(2, 132, 199, 0.12)',
    heroGlowStart: '#EFF6FF',
    heroGlowMid: '#E0E7FF',
    heroGlowEnd: '#EDE9FE',
  },
  red: {
    mode: 'red',
    label: 'Đỏ',
    bg: '#050000',
    bgElevated: '#0C0102',
    card: '#180304',
    cardInner: '#110203',
    glass: 'rgba(32, 5, 7, 0.88)',
    headerBg: 'rgba(5, 0, 0, 0.95)',
    modalBg: '#160304',
    inputBg: '#0E0102',
    textPrimary: '#FF6B6B',
    textSecondary: '#DE4646',
    textMuted: '#993333',
    accentCyan: '#F43F5E',
    accentCyanBg: 'rgba(244, 63, 94, 0.14)',
    accentCyanBorder: 'rgba(244, 63, 94, 0.45)',
    accentViolet: '#F43F5E',
    accentVioletBg: 'rgba(244, 63, 94, 0.14)',
    accentVioletBorder: 'rgba(244, 63, 94, 0.42)',
    accentPurple: '#EF4444',
    accentAmber: '#F87171',
    accentAmberBg: 'rgba(248, 113, 113, 0.14)',
    accentAmberBorder: 'rgba(248, 113, 113, 0.40)',
    accentEmerald: '#F87171',
    accentEmeraldBg: 'rgba(248, 113, 113, 0.12)',
    accentEmeraldBorder: 'rgba(248, 113, 113, 0.38)',
    accentRose: '#EF4444',
    accentRoseBg: 'rgba(239, 68, 68, 0.16)',
    accentRoseBorder: 'rgba(239, 68, 68, 0.45)',
    borderSubtle: 'rgba(239, 68, 68, 0.25)',
    borderStrong: 'rgba(239, 68, 68, 0.45)',
    ringTrack: 'rgba(239, 68, 68, 0.14)',
    buttonPrimaryBg: '#EF4444',
    buttonPrimaryText: '#050000',
    buttonSecondaryBg: '#220507',
    buttonSecondaryBorder: 'rgba(239, 68, 68, 0.42)',
    pillBg: 'rgba(239, 68, 68, 0.08)',
    pillActiveBg: 'rgba(244, 63, 94, 0.22)',
    heroGlowStart: '#080000',
    heroGlowMid: '#190203',
    heroGlowEnd: '#220305',
  },
};

export interface CloudCellTone { bg: string; border: string; text: string; }

export function getCloudCellTone(percent: number, mode: ThemeMode): CloudCellTone {
  if (mode === 'red') {
    if (percent <= 20) return { bg: 'rgba(248, 113, 113, 0.10)', border: 'rgba(248, 113, 113, 0.25)', text: '#F87171' };
    if (percent <= 55) return { bg: 'rgba(244, 63, 94, 0.14)', border: 'rgba(244, 63, 94, 0.32)', text: '#FF6B6B' };
    if (percent <= 80) return { bg: 'rgba(239, 68, 68, 0.22)', border: 'rgba(239, 68, 68, 0.42)', text: '#FCA5A5' };
    return { bg: 'rgba(220, 38, 38, 0.30)', border: 'rgba(239, 68, 68, 0.55)', text: '#FECACA' };
  }
  if (mode === 'light') {
    if (percent <= 20) return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(4, 120, 87, 0.32)', text: '#047857' };
    if (percent <= 55) return { bg: 'rgba(2, 132, 199, 0.12)', border: 'rgba(2, 132, 199, 0.32)', text: '#0369A1' };
    if (percent <= 80) return { bg: 'rgba(217, 119, 6, 0.14)', border: 'rgba(180, 83, 9, 0.35)', text: '#B45309' };
    return { bg: 'rgba(220, 38, 38, 0.14)', border: 'rgba(185, 28, 28, 0.38)', text: '#B91C1C' };
  }
  if (percent <= 20) return { bg: 'rgba(16, 185, 129, 0.14)', border: 'rgba(16, 185, 129, 0.26)', text: '#34D399' };
  if (percent <= 55) return { bg: 'rgba(56, 189, 248, 0.14)', border: 'rgba(56, 189, 248, 0.28)', text: '#38BDF8' };
  if (percent <= 80) return { bg: 'rgba(245, 158, 11, 0.16)', border: 'rgba(245, 158, 11, 0.32)', text: '#FBBF24' };
  return { bg: 'rgba(244, 63, 94, 0.20)', border: 'rgba(244, 63, 94, 0.36)', text: '#FB7185' };
}

export function getDewDeltaTone(delta: number, threshold: number, mode: ThemeMode): CloudCellTone {
  const isAlert = delta <= threshold;
  if (mode === 'red') return isAlert ? { bg: 'rgba(239, 68, 68, 0.28)', border: 'rgba(239, 68, 68, 0.55)', text: '#FCA5A5' } : { bg: 'rgba(248, 113, 113, 0.10)', border: 'rgba(248, 113, 113, 0.25)', text: '#F87171' };
  if (mode === 'light') return isAlert ? { bg: 'rgba(220, 38, 38, 0.14)', border: 'rgba(185, 28, 28, 0.42)', text: '#B91C1C' } : { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(4, 120, 87, 0.30)', text: '#047857' };
  return isAlert ? { bg: 'rgba(244, 63, 94, 0.20)', border: 'rgba(244, 63, 94, 0.42)', text: '#FB7185' } : { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.26)', text: '#34D399' };
}

export type TierBadgeVariant = 'free' | 'pro' | 'expedition' | 'admin';

export interface TierBadgePalette {
  borderGradient: [string, string, string];
  bgGradient: [string, string, string];
  surfaceGradient: [string, string];
  surfaceBorder: string;
  text: string;
  subText: string;
  iconPrimary: string;
  iconSecondary: string;
  shimmerBeam: string;
  sparkleColor: string;
  glowColor: string;
  webGlow: string;
}

const TIER_BADGE_PALETTES: Record<ThemeMode, Record<TierBadgeVariant, TierBadgePalette>> = {
  dark: {
    free: {
      borderGradient: ['#475569', '#334155', '#64748B'], bgGradient: ['#0F172A', '#1E293B', '#0F172A'], surfaceGradient: ['#0F172A', '#162033'], surfaceBorder: 'rgba(148, 163, 184, 0.28)',
      text: '#CBD5E1', subText: '#94A3B8', iconPrimary: '#CBD5E1', iconSecondary: '#64748B', shimmerBeam: 'rgba(203, 213, 225, 0.16)', sparkleColor: '#94A3B8', glowColor: '#334155', webGlow: '0 0 8px rgba(100, 116, 139, 0.18)',
    },
    pro: {
      borderGradient: ['#F59E0B', '#FEF08A', '#D97706'], bgGradient: ['#2D1D06', '#452C0A', '#211404'], surfaceGradient: ['#221707', '#140E05'], surfaceBorder: 'rgba(245, 158, 11, 0.52)',
      text: '#FEF08A', subText: '#FDE68A', iconPrimary: '#FEF08A', iconSecondary: '#F59E0B', shimmerBeam: 'rgba(254, 240, 138, 0.50)', sparkleColor: '#FEF08A', glowColor: '#F59E0B', webGlow: '0 0 14px rgba(245, 158, 11, 0.36), 0 0 4px rgba(254, 240, 138, 0.25)',
    },
    expedition: {
      borderGradient: ['#38BDF8', '#C084FC', '#FDE047'], bgGradient: ['#130B3A', '#281466', '#0B2C4D'], surfaceGradient: ['#160E42', '#0B2442'], surfaceBorder: 'rgba(192, 132, 252, 0.65)',
      text: '#F8FAFC', subText: '#BAE6FD', iconPrimary: '#38BDF8', iconSecondary: '#FDE047', shimmerBeam: 'rgba(224, 242, 254, 0.64)', sparkleColor: '#E0F2FE', glowColor: '#A855F7', webGlow: '0 0 18px rgba(168, 85, 247, 0.45), 0 0 8px rgba(56, 189, 248, 0.35)',
    },
    admin: {
      borderGradient: ['#F43F5E', '#FDE047', '#FB7185'], bgGradient: ['#2A0814', '#420D20', '#19060E'], surfaceGradient: ['#280816', '#15060D'], surfaceBorder: 'rgba(244, 63, 94, 0.58)',
      text: '#FFF1F2', subText: '#FECDD3', iconPrimary: '#FDE047', iconSecondary: '#FB7185', shimmerBeam: 'rgba(254, 205, 211, 0.52)', sparkleColor: '#FDE047', glowColor: '#F43F5E', webGlow: '0 0 16px rgba(244, 63, 94, 0.42), 0 0 6px rgba(253, 224, 71, 0.28)',
    },
  },
  light: {
    free: {
      borderGradient: ['#94A3B8', '#CBD5E1', '#64748B'], bgGradient: ['#F8FAFC', '#E2E8F0', '#F1F5F9'], surfaceGradient: ['#FFFFFF', '#F8FAFC'], surfaceBorder: 'rgba(100, 116, 139, 0.35)',
      text: '#1E293B', subText: '#475569', iconPrimary: '#334155', iconSecondary: '#64748B', shimmerBeam: 'rgba(255, 255, 255, 0.45)', sparkleColor: '#64748B', glowColor: '#94A3B8', webGlow: '0 2px 6px rgba(15, 23, 42, 0.08)',
    },
    pro: {
      borderGradient: ['#D97706', '#F59E0B', '#B45309'], bgGradient: ['#FEF9C3', '#FDE68A', '#FCD34D'], surfaceGradient: ['#FFFBEB', '#FEF3C7'], surfaceBorder: 'rgba(217, 119, 6, 0.48)',
      text: '#451A03', subText: '#78350F', iconPrimary: '#B45309', iconSecondary: '#78350F', shimmerBeam: 'rgba(255, 255, 255, 0.78)', sparkleColor: '#B45309', glowColor: '#D97706', webGlow: '0 3px 12px rgba(217, 119, 6, 0.25)',
    },
    expedition: {
      borderGradient: ['#0284C7', '#7C3AED', '#D97706'], bgGradient: ['#DBEAFE', '#E9D5FF', '#FEF9C3'], surfaceGradient: ['#EFF6FF', '#F3E8FF'], surfaceBorder: 'rgba(124, 58, 237, 0.52)',
      text: '#1E1B4B', subText: '#3730A3', iconPrimary: '#0369A1', iconSecondary: '#B45309', shimmerBeam: 'rgba(255, 255, 255, 0.85)', sparkleColor: '#7C3AED', glowColor: '#7C3AED', webGlow: '0 4px 16px rgba(124, 58, 237, 0.28), 0 2px 6px rgba(2, 132, 199, 0.20)',
    },
    admin: {
      borderGradient: ['#E11D48', '#D97706', '#BE123C'], bgGradient: ['#FFE4E6', '#FECDD3', '#FEF3C7'], surfaceGradient: ['#FFF1F2', '#FFE4E6'], surfaceBorder: 'rgba(225, 29, 72, 0.48)',
      text: '#881337', subText: '#9F1239', iconPrimary: '#B45309', iconSecondary: '#BE123C', shimmerBeam: 'rgba(255, 255, 255, 0.78)', sparkleColor: '#D97706', glowColor: '#E11D48', webGlow: '0 3px 14px rgba(225, 29, 72, 0.24)',
    },
  },
  red: {
    free: {
      borderGradient: ['#7F1D1D', '#991B1B', '#7F1D1D'], bgGradient: ['#140203', '#1E0305', '#110203'], surfaceGradient: ['#140203', '#0C0102'], surfaceBorder: 'rgba(153, 27, 27, 0.45)',
      text: '#FCA5A5', subText: '#F87171', iconPrimary: '#F87171', iconSecondary: '#991B1B', shimmerBeam: 'rgba(239, 68, 68, 0.14)', sparkleColor: '#EF4444', glowColor: '#7F1D1D', webGlow: '0 0 6px rgba(127, 29, 29, 0.25)',
    },
    pro: {
      borderGradient: ['#B91C1C', '#EF4444', '#991B1B'], bgGradient: ['#280406', '#3B0709', '#1D0304'], surfaceGradient: ['#220406', '#120203'], surfaceBorder: 'rgba(239, 68, 68, 0.55)',
      text: '#FECACA', subText: '#FCA5A5', iconPrimary: '#FCA5A5', iconSecondary: '#EF4444', shimmerBeam: 'rgba(252, 165, 165, 0.34)', sparkleColor: '#FCA5A5', glowColor: '#EF4444', webGlow: '0 0 12px rgba(239, 68, 68, 0.36)',
    },
    expedition: {
      borderGradient: ['#EF4444', '#FCA5A5', '#F43F5E'], bgGradient: ['#2E0408', '#4C0811', '#220306'], surfaceGradient: ['#2B0409', '#170204'], surfaceBorder: 'rgba(244, 63, 94, 0.72)',
      text: '#FECACA', subText: '#FCA5A5', iconPrimary: '#FECACA', iconSecondary: '#F43F5E', shimmerBeam: 'rgba(254, 202, 202, 0.48)', sparkleColor: '#FECACA', glowColor: '#F43F5E', webGlow: '0 0 18px rgba(244, 63, 94, 0.52), 0 0 8px rgba(252, 165, 165, 0.30)',
    },
    admin: {
      borderGradient: ['#F43F5E', '#FECACA', '#EF4444'], bgGradient: ['#280406', '#450A0F', '#1A0204'], surfaceGradient: ['#28080C', '#140203'], surfaceBorder: 'rgba(252, 165, 165, 0.60)',
      text: '#FECACA', subText: '#FCA5A5', iconPrimary: '#FECACA', iconSecondary: '#EF4444', shimmerBeam: 'rgba(254, 202, 202, 0.44)', sparkleColor: '#FECACA', glowColor: '#EF4444', webGlow: '0 0 16px rgba(239, 68, 68, 0.48), 0 0 6px rgba(252, 165, 165, 0.28)',
    },
  },
};

export function getTierBadgePalette(variant: TierBadgeVariant, mode: ThemeMode): TierBadgePalette {
  return TIER_BADGE_PALETTES[mode][variant];
}

export interface GoogleBrandColors { blue: string; green: string; yellow: string; red: string; }

export function getGoogleBrandColors(mode: ThemeMode): GoogleBrandColors {
  return mode === 'red'
    ? { blue: '#F87171', green: '#EF4444', yellow: '#FCA5A5', red: '#DC2626' }
    : { blue: '#4285F4', green: '#34A853', yellow: '#FBBC05', red: '#EA4335' };
}
