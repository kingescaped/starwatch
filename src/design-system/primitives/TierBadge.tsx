import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { TierEmblem } from '../icons/TierEmblem';
import { useTheme } from '../theme/ThemeContext';
import { getTierBadgePalette, TierBadgePalette, TierBadgeVariant } from '../tokens/colors';
import { FONT_FAMILIES } from '../tokens/typography';

export type TierBadgeSize = 'xs' | 'sm' | 'md';

interface TierBadgeProps {
  variant: TierBadgeVariant;
  label?: string;
  size?: TierBadgeSize;
  animated?: boolean;
}

const DEFAULT_LABELS: Record<TierBadgeVariant, string> = { free: 'FREE', pro: 'PRO', expedition: 'EXPEDITION', admin: 'ADMIN' };
const SIZE_SPECS: Record<TierBadgeSize, { px: number; py: number; icon: number; font: number; gap: number }> = {
  xs: { px: 7, py: 2.5, icon: 10, font: 9.5, gap: 4 },
  sm: { px: 9, py: 3.5, icon: 12, font: 10.5, gap: 5 },
  md: { px: 12, py: 5, icon: 14, font: 11.5, gap: 6 },
};
const SPARKLES: Record<TierBadgeVariant, { top?: number; bottom?: number; left?: number; right?: number; size: number; delay: number }[]> = {
  free: [],
  pro: [{ top: 1.5, right: 5, size: 7, delay: 200 }],
  expedition: [
    { top: 1.5, right: 6, size: 8, delay: 0 },
    { bottom: 1.5, left: 16, size: 6.5, delay: 480 },
    { top: 2, right: 26, size: 6, delay: 960 },
  ],
  admin: [
    { top: 1.5, right: 6, size: 7.5, delay: 120 },
    { bottom: 1.5, left: 16, size: 6, delay: 760 },
  ],
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

function buildShimmerSequence(variant: TierBadgeVariant, anim: Animated.Value, useNativeDriver: boolean) {
  if (variant === 'expedition') {
    return Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 760, easing: Easing.inOut(Easing.quad), useNativeDriver }),
      Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver }),
      Animated.timing(anim, { toValue: 1, duration: 560, easing: Easing.out(Easing.quad), useNativeDriver }),
      Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver }),
      Animated.delay(980),
    ]);
  }
  const sweepMs = variant === 'admin' ? 950 : 1050;
  const pauseMs = variant === 'admin' ? 1850 : 2150;
  return Animated.sequence([
    Animated.timing(anim, { toValue: 1, duration: sweepMs, easing: Easing.inOut(Easing.quad), useNativeDriver }),
    Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver }),
    Animated.delay(pauseMs),
  ]);
}

function useTierBadgeMotion(variant: TierBadgeVariant, enabled: boolean) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef([new Animated.Value(0.4), new Animated.Value(0.4), new Animated.Value(0.4)]).current;

  useEffect(() => {
    if (!enabled) {
      shimmerAnim.setValue(0);
      sparkleAnims.forEach((a) => a.setValue(0.65));
      return;
    }
    const useNativeDriver = Platform.OS !== 'web';
    const shimmerLoop = Animated.loop(buildShimmerSequence(variant, shimmerAnim, useNativeDriver));
    shimmerLoop.start();
    const sparkleLoops = SPARKLES[variant].map((item, idx) => {
      const target = sparkleAnims[idx];
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(item.delay),
          Animated.timing(target, { toValue: 1, duration: 680, easing: Easing.out(Easing.quad), useNativeDriver }),
          Animated.timing(target, { toValue: 0.18, duration: 720, easing: Easing.in(Easing.quad), useNativeDriver }),
          Animated.delay(Math.max(0, 1400 - item.delay)),
        ])
      );
      loop.start();
      return loop;
    });
    return () => {
      shimmerLoop.stop();
      sparkleLoops.forEach((loop) => loop.stop());
    };
  }, [enabled, variant, shimmerAnim, sparkleAnims]);

  return { shimmerAnim, sparkleAnims };
}

function getBadgeGlowStyle(variant: TierBadgeVariant, palette: TierBadgePalette): ViewStyle | undefined {
  return Platform.select<ViewStyle>({
    web: { boxShadow: palette.webGlow } as ViewStyle,
    default: {
      shadowColor: palette.glowColor,
      shadowOffset: { width: 0, height: variant === 'expedition' ? 2 : 1 },
      shadowOpacity: variant === 'free' ? 0.15 : variant === 'expedition' ? 0.52 : 0.36,
      shadowRadius: variant === 'expedition' ? 8 : 5,
      elevation: variant === 'expedition' ? 5 : variant === 'free' ? 1 : 3,
    },
  });
}

function ShimmerSweep({ anim, badgeWidth, beamColor }: { anim: Animated.Value; badgeWidth: number; beamColor: string }) {
  const clearStop = beamColor.replace(/,\s*[\d.]+\)$/, ', 0)');
  const shimmerX = anim.interpolate({ inputRange: [0, 1], outputRange: [-42, badgeWidth + 24] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: -10, bottom: -10, width: 28, transform: [{ translateX: shimmerX }, { rotate: '22deg' }] }}>
      <LinearGradient colors={[clearStop, beamColor, clearStop]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1 }} />
    </Animated.View>
  );
}

function SparkleStar({ color, size, anim, style }: { color: string; size: number; anim: Animated.Value; style: ViewStyle }) {
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.15] });
  return (
    <Animated.View pointerEvents="none" style={[style, { position: 'absolute', opacity: anim, transform: [{ scale }] }]}>
      <Svg width={size} height={size} viewBox="0 0 16 16">
        <Path d="M8 0 L9.7 6.3 L16 8 L9.7 9.7 L8 16 L6.3 9.7 L0 8 L6.3 6.3 Z" fill={color} />
      </Svg>
    </Animated.View>
  );
}

export function TierBadge({ variant, label, size = 'sm', animated = true }: TierBadgeProps) {
  const { mode } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const palette = getTierBadgePalette(variant, mode);
  const spec = SIZE_SPECS[size];
  const [badgeWidth, setBadgeWidth] = useState(92);
  const shouldAnimate = animated && !reducedMotion && variant !== 'free';
  const { shimmerAnim, sparkleAnims } = useTierBadgeMotion(variant, shouldAnimate);
  const isHighTier = variant === 'expedition' || variant === 'admin';

  return (
    <LinearGradient colors={palette.borderGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[getBadgeGlowStyle(variant, palette), { borderRadius: 999, padding: isHighTier ? 1.5 : 1, alignSelf: 'flex-start' }]}>
      <LinearGradient
        colors={palette.bgGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        onLayout={(e) => setBadgeWidth(e.nativeEvent.layout.width)}
        style={{ borderRadius: 999, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', gap: spec.gap, paddingHorizontal: spec.px, paddingVertical: spec.py }}
      >
        {shouldAnimate ? <ShimmerSweep anim={shimmerAnim} badgeWidth={badgeWidth} beamColor={palette.shimmerBeam} /> : null}
        {SPARKLES[variant].map((item, idx) => (
          <SparkleStar
            key={`${variant}-sp-${idx}`}
            color={palette.sparkleColor}
            size={size === 'xs' ? Math.max(5, item.size - 1.5) : item.size}
            anim={sparkleAnims[idx]}
            style={{ top: item.top, bottom: item.bottom, left: item.left, right: item.right }}
          />
        ))}
        <TierEmblem variant={variant} size={spec.icon} palette={palette} />
        <Text numberOfLines={1} style={{ color: palette.text, fontSize: spec.font, lineHeight: Math.round(spec.font * 1.25), letterSpacing: isHighTier ? (size === 'md' ? 1.25 : 1.0) : 0.6, fontFamily: FONT_FAMILIES.monoBold }}>
          {label ?? DEFAULT_LABELS[variant]}
        </Text>
      </LinearGradient>
    </LinearGradient>
  );
}
