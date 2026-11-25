import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FONT_FAMILIES } from '../tokens/typography';

export type PillTone = 'neutral' | 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose';

interface StatusPillProps {
  label: string;
  tone?: PillTone;
  active?: boolean;
  dot?: boolean;
  mono?: boolean;
  leftIcon?: React.ReactNode;
  onPress?: () => void;
  small?: boolean;
}

export function StatusPill({
  label,
  tone = 'neutral',
  active = false,
  dot = false,
  mono = false,
  leftIcon,
  onPress,
  small = false,
}: StatusPillProps) {
  const { colors } = useTheme();

  const toneMap = {
    neutral: { bg: colors.pillBg, border: colors.borderSubtle, text: colors.textSecondary, dot: colors.textSecondary },
    cyan: { bg: colors.accentCyanBg, border: colors.accentCyanBorder, text: colors.accentCyan, dot: colors.accentCyan },
    violet: { bg: colors.accentVioletBg, border: colors.accentVioletBorder, text: colors.accentViolet, dot: colors.accentViolet },
    amber: { bg: colors.accentAmberBg, border: colors.accentAmberBorder, text: colors.accentAmber, dot: colors.accentAmber },
    emerald: { bg: colors.accentEmeraldBg, border: colors.accentEmeraldBorder, text: colors.accentEmerald, dot: colors.accentEmerald },
    rose: { bg: colors.accentRoseBg, border: colors.accentRoseBorder, text: colors.accentRose, dot: colors.accentRose },
  };

  const palette = active && tone === 'neutral' ? toneMap.cyan : toneMap[tone];
  const isLive = dot && label === 'LIVE';
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isLive) return;
    const useNative = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.35, duration: 900, useNativeDriver: useNative }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: useNative }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isLive, pulseAnim]);

  const animatePress = (toValue: number) => {
    Animated.spring(scaleAnim, {
      toValue,
      damping: 18,
      stiffness: 320,
      mass: 0.6,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const webTransition =
    Platform.OS === 'web'
      ? ({ transition: 'background-color 180ms ease, border-color 180ms ease, color 180ms ease' } as never)
      : undefined;

  const content = (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: small ? 9 : 11,
          paddingVertical: small ? 4 : 6,
          borderRadius: 999,
          backgroundColor: palette.bg,
          borderWidth: 1,
          borderColor: palette.border,
          transform: onPress ? [{ scale: scaleAnim }] : undefined,
        },
        webTransition,
      ]}
    >
      {dot ? (
        <Animated.View
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            backgroundColor: palette.dot,
            opacity: isLive ? pulseAnim : 1,
          }}
        />
      ) : null}
      {leftIcon}
      <Text
        numberOfLines={1}
        style={[
          {
            flexShrink: 1,
            color: palette.text,
            fontSize: small ? 11 : 12,
            fontFamily: mono ? FONT_FAMILIES.monoMedium : FONT_FAMILIES.sansMedium,
          },
          webTransition,
        ]}
      >
        {label}
      </Text>
    </Animated.View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animatePress(0.95)}
      onPressOut={() => animatePress(1)}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
    >
      {content}
    </Pressable>
  );
}
