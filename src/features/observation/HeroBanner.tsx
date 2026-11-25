import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { AppIcon } from '../../design-system/icons/AppIcon';

export function HeroBanner() {
  const { colors } = useTheme();
  const orbitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [orbitAnim]);

  const spin = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{ overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: colors.borderSubtle }}>
      <LinearGradient
        colors={[colors.heroGlowStart, colors.heroGlowMid, colors.heroGlowEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
        style={{
          paddingHorizontal: 48,
          paddingVertical: 26,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 118,
        }}
      >
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 140,
            top: -45,
            opacity: 0.38,
            transform: [{ rotate: spin }],
          }}
        >
          <Svg width={280} height={220} viewBox="0 0 280 220">
            <Circle
              cx={140}
              cy={110}
              r={58}
              stroke={colors.accentCyan}
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="none"
            />
            <Circle
              cx={140}
              cy={110}
              r={96}
              stroke={colors.accentViolet}
              strokeWidth={0.9}
              fill="none"
            />
            <Circle cx={182} cy={70} r={3} fill={colors.accentCyan} />
            <Circle cx={72} cy={144} r={2.5} fill={colors.accentAmber} />
          </Svg>
        </Animated.View>

        <View style={{ gap: 4 }}>
          <Text
            style={{
              fontSize: 32,
              lineHeight: 38,
              fontFamily: FONT_FAMILIES.sansBold,
              color: colors.textPrimary,
              letterSpacing: -0.6,
            }}
          >
            Chạm vào Vũ Trụ
          </Text>
          <Text
            style={{
              fontSize: 13,
              lineHeight: 19,
              fontFamily: FONT_FAMILIES.sansRegular,
              color: colors.textSecondary,
            }}
          >
            Bắt trọn Khoảnh Khắc Bầu Trời
          </Text>
        </View>

        <StatusPill
          label="MỘT ĐÊM ĐẸP ĐỂ NGƯỚC NHÌN"
          tone="cyan"
          leftIcon={<AppIcon name="sparkles" size={13} color={colors.accentCyan} />}
        />
      </LinearGradient>
    </View>
  );
}
