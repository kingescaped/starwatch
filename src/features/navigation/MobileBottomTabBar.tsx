import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { AppIcon, IconName } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { MobileTab } from '../../state/types';

const MOBILE_TABS: { id: MobileTab; label: string; icon: IconName }[] = [
  { id: 'observe', label: 'Quan sát', icon: 'map' },
  { id: 'spots', label: 'Địa điểm', icon: 'map-pin' },
  { id: 'calendar', label: 'Lịch trời', icon: 'calendar' },
  { id: 'guide', label: 'Hướng dẫn', icon: 'book-open' },
  { id: 'account', label: 'Tài khoản', icon: 'user' },
];

export function MobileBottomTabBar() {
  const { colors, isLight, isRed } = useTheme();
  const { mobileTab, setMobileTab } = useAppState();
  const [trackWidth, setTrackWidth] = useState(356);

  const activeIndex = Math.max(0, MOBILE_TABS.findIndex((t) => t.id === mobileTab));
  const slotWidth = trackWidth / MOBILE_TABS.length;

  const slideX = useRef(new Animated.Value(activeIndex * slotWidth)).current;
  const bounceScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(slideX, {
      toValue: activeIndex * slotWidth,
      damping: 17,
      stiffness: 220,
      mass: 0.72,
      useNativeDriver: true,
    }).start();

    bounceScale.setValue(0.92);
    Animated.spring(bounceScale, {
      toValue: 1,
      damping: 12,
      stiffness: 260,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, slotWidth, slideX, bounceScale]);

  const dockBg = isLight
    ? 'rgba(255, 255, 255, 0.76)'
    : isRed
    ? 'rgba(26, 4, 6, 0.80)'
    : 'rgba(11, 18, 36, 0.74)';

  const specularBorder = isLight
    ? 'rgba(255, 255, 255, 0.92)'
    : isRed
    ? 'rgba(248, 113, 113, 0.36)'
    : 'rgba(255, 255, 255, 0.20)';

  const webGlass =
    Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(28px) saturate(200%)',
          WebkitBackdropFilter: 'blur(28px) saturate(200%)',
        } as never)
      : null;

  return (
    <View
      style={[
        {
          height: 62,
          borderRadius: 999,
          padding: 5,
          backgroundColor: dockBg,
          borderWidth: 1,
          borderColor: specularBorder,
          shadowColor: '#000',
          shadowOpacity: isLight ? 0.16 : 0.55,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 10 },
          justifyContent: 'center',
        },
        webGlass,
      ]}
    >
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setTrackWidth(w);
        }}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Sliding Liquid Glass luminous capsule for the active tab */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: slotWidth,
            borderRadius: 999,
            backgroundColor: colors.accentCyanBg,
            borderWidth: 1,
            borderColor: colors.accentCyanBorder,
            shadowColor: colors.accentCyan,
            shadowOpacity: 0.45,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
            alignItems: 'center',
            transform: [{ translateX: slideX }],
          }}
        >
          <View
            style={{
              width: 26,
              height: 2.5,
              borderRadius: 999,
              marginTop: 2,
              backgroundColor: colors.accentCyan,
            }}
          />
        </Animated.View>

        {MOBILE_TABS.map((tab) => {
          const active = mobileTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setMobileTab(tab.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => ({
                flex: 1,
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                opacity: pressed ? 0.78 : 1,
              })}
            >
              <Animated.View
                style={{
                  transform: [{ scale: active ? bounceScale : 1 }],
                }}
              >
                <AppIcon
                  name={tab.icon}
                  size={19}
                  color={active ? colors.accentCyan : colors.textSecondary}
                />
              </Animated.View>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 10,
                  fontFamily: active ? FONT_FAMILIES.sansSemiBold : FONT_FAMILIES.sansMedium,
                  color: active ? colors.accentCyan : colors.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
