import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutRectangle, Platform, Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FONT_FAMILIES } from '../tokens/typography';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export type SegmentedTone = 'cyan' | 'solid' | 'violet' | 'rose';

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  fullWidth?: boolean;
  tone?: SegmentedTone;
  compact?: boolean;
  mono?: boolean;
}

const isReducedMotion = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fullWidth = true,
  tone = 'cyan',
  compact = false,
  mono = false,
}: SegmentedControlProps<T>) {
  const { mode, colors } = useTheme();
  const [ready, setReady] = useState(false);
  const layoutsRef = useRef<Partial<Record<string, { x: number; width: number }>>>({});
  const hasMeasuredRef = useRef(false);
  const trackWidthRef = useRef<number | null>(null);
  const snapOnResizeRef = useRef(false);
  const animX = useRef(new Animated.Value(0)).current;
  const animW = useRef(new Animated.Value(0)).current;

  const palette = {
    cyan: { bg: colors.accentCyanBg, border: colors.accentCyanBorder, text: colors.accentCyan },
    solid: { bg: colors.buttonPrimaryBg, border: colors.buttonPrimaryBg, text: colors.buttonPrimaryText },
    violet: {
      bg: colors.accentViolet,
      border: colors.accentViolet,
      text: mode === 'red' ? colors.buttonPrimaryText : mode === 'light' ? colors.card : colors.textPrimary,
    },
    rose: { bg: colors.accentRose, border: colors.accentRose, text: colors.buttonPrimaryText },
  }[tone];

  const springTo = useCallback(
    (x: number, width: number, instant = false) => {
      if (instant || isReducedMotion()) {
        animX.setValue(x);
        animW.setValue(width);
        return;
      }
      const cfg = { damping: 20, stiffness: 280, mass: 0.72, useNativeDriver: false };
      Animated.parallel([Animated.spring(animX, { toValue: x, ...cfg }), Animated.spring(animW, { toValue: width, ...cfg })]).start();
    },
    [animX, animW]
  );

  useEffect(() => {
    const target = layoutsRef.current[value];
    if (target && hasMeasuredRef.current) springTo(target.x, target.width);
  }, [value, springTo]);

  const handleOptionLayout = (optValue: T, { x, width }: LayoutRectangle) => {
    if (width <= 0) return;
    layoutsRef.current[optValue] = { x, width };
    if (optValue !== value) return;
    if (!hasMeasuredRef.current || snapOnResizeRef.current) {
      hasMeasuredRef.current = true;
      snapOnResizeRef.current = false;
      springTo(x, width, true);
      if (!ready) setReady(true);
    } else {
      springTo(x, width);
    }
  };

  const radiusInner = compact ? 7 : 9;
  const padV = compact ? 6 : 8;
  const padH = compact ? (fullWidth ? 4 : 10) : fullWidth ? 8 : 12;
  const webTransition = Platform.OS === 'web' ? ({ transition: 'color 180ms ease' } as never) : undefined;

  return (
    <View
      style={{
        padding: 3,
        borderRadius: compact ? 10 : 12,
        backgroundColor: colors.inputBg,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        width: fullWidth ? '100%' : undefined,
        alignSelf: fullWidth ? undefined : 'flex-start',
      }}
    >
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (trackWidthRef.current !== null && Math.abs(trackWidthRef.current - w) > 0.5) snapOnResizeRef.current = true;
          trackWidthRef.current = w;
        }}
        style={{ flexDirection: 'row', position: 'relative', width: fullWidth ? '100%' : undefined }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute', top: 0, bottom: 0, left: animX, width: animW,
            borderRadius: radiusInner, backgroundColor: palette.bg, borderWidth: 1, borderColor: palette.border,
            opacity: ready ? 1 : 0,
          }}
        />
        {options.map((opt) => {
          const active = opt.value === value;
          const family = mono
            ? active ? FONT_FAMILIES.monoBold : FONT_FAMILIES.monoMedium
            : active ? FONT_FAMILIES.sansSemiBold : FONT_FAMILIES.sansMedium;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              onLayout={(e) => handleOptionLayout(opt.value, e.nativeEvent.layout)}
              style={({ pressed }) => ({
                flex: fullWidth ? 1 : undefined,
                paddingVertical: padV, paddingHorizontal: padH, borderRadius: radiusInner,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: !ready && active ? palette.bg : 'transparent',
                borderWidth: 1, borderColor: !ready && active ? palette.border : 'transparent',
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text numberOfLines={1} style={[{ fontSize: compact ? 11 : 12, fontFamily: family, color: active ? palette.text : colors.textSecondary }, webTransition]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
