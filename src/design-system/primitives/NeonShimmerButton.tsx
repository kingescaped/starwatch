import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { FONT_FAMILIES } from '../tokens/typography';
import { AppIcon } from '../icons/AppIcon';

interface NeonShimmerButtonProps {
  label: string;
  onPress: () => void;
}

export function NeonShimmerButton({ label, onPress }: NeonShimmerButtonProps) {
  const { colors } = useTheme();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const sheenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const reduced =
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const useNative = Platform.OS !== 'web';
    const borderLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: useNative,
      })
    );
    const sheenLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(1400),
        Animated.timing(sheenAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: useNative,
        }),
        Animated.timing(sheenAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: useNative,
        }),
      ])
    );

    borderLoop.start();
    sheenLoop.start();
    return () => {
      borderLoop.stop();
      sheenLoop.stop();
    };
  }, [spinAnim, sheenAnim]);

  const rotateDeg = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sheenTranslateX = sheenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 420],
  });

  const subtleShadow =
    Platform.OS === 'web'
      ? ({ boxShadow: `0 0 14px ${colors.accentCyanBg}, 0 0 22px ${colors.accentVioletBg}` } as never)
      : {
          shadowColor: colors.accentCyan,
          shadowOpacity: 0.22,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
        };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          borderRadius: 14,
          padding: 1.5,
          overflow: 'hidden',
          position: 'relative',
          opacity: pressed ? 0.85 : 1,
        },
        subtleShadow,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: 560,
          height: 560,
          top: '50%',
          left: '50%',
          marginLeft: -280,
          marginTop: -280,
          transform: [{ rotate: rotateDeg }],
        }}
      >
        <LinearGradient
          colors={[colors.accentCyan, colors.accentViolet, colors.accentPurple, colors.accentCyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <View
        style={{
          borderRadius: 12.5,
          backgroundColor: colors.cardInner,
          paddingHorizontal: 15,
          paddingVertical: 11,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -12,
            bottom: -12,
            width: 56,
            backgroundColor: colors.accentCyanBg,
            opacity: 0.55,
            transform: [{ translateX: sheenTranslateX }, { skewX: '-22deg' }],
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AppIcon name="sparkles" size={15} color={colors.accentCyan} />
          <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
            {label}
          </Text>
        </View>
        <AppIcon name="chevron-right" size={15} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}
