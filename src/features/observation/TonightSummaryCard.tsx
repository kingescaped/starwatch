import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { BREAKPOINTS } from '../../design-system/tokens/spacing';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { playUiSound } from '../../utils/soundEngine';

interface TonightSummaryCardProps {
  variant?: 'desktopDock' | 'mobileCollapsible';
}

export function TonightSummaryCard({ variant = 'desktopDock' }: TonightSummaryCardProps) {
  const { colors, isLight, isRed } = useTheme();
  const { hourIndex, setHourIndex, hourlyForecast, tonightSlots, showToast } = useAppState();
  const [expanded, setExpanded] = useState(false);
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: expanded ? 1 : 0,
      damping: 18,
      stiffness: 220,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [expanded, expandAnim]);

  const currentHourPrefix = (hourlyForecast[hourIndex]?.hour ?? '').slice(0, 2);

  const handleSelectSlot = (time: string, label: string) => {
    const hourPrefix = time.slice(0, 2);
    const idx = hourlyForecast.findIndex((h) => h.hour.startsWith(hourPrefix));
    if (idx >= 0) setHourIndex(idx);
    playUiSound('select');
    showToast(`Đã nhảy tới mốc ${time} · ${label}`, 'info');
  };

  const glassBg = isLight
    ? 'rgba(255, 255, 255, 0.80)'
    : isRed
    ? 'rgba(30, 4, 6, 0.82)'
    : 'rgba(13, 22, 44, 0.78)';
  const glassWebStyle =
    Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(24px) saturate(190%)',
          WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        } as never)
      : null;

  if (variant === 'mobileCollapsible') {
    return (
      <View
        style={[
          {
            backgroundColor: glassBg,
            borderRadius: expanded ? 22 : 999,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            paddingHorizontal: 14,
            paddingVertical: expanded ? 10 : 8,
            gap: expanded ? 8 : 0,
            shadowColor: '#000',
            shadowOpacity: isLight ? 0.14 : 0.45,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
          },
          glassWebStyle,
        ]}
      >
        <Pressable
          onPress={() => {
            setExpanded((v) => !v);
            playUiSound('tap');
          }}
          accessibilityLabel={expanded ? 'Thu gọn Đêm nay có gì' : 'Mở Đêm nay có gì'}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 }}>
            <AppIcon name="sparkles" size={13} color={colors.accentCyan} />
            <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
              {expanded ? 'Đêm nay có gì?' : 'Đêm nay'}
            </Text>
            {!expanded ? (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor: colors.accentCyanBg,
                  borderWidth: 1,
                  borderColor: colors.accentCyanBorder,
                }}
              >
                <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentCyan }}>
                  00:00 · 94 Đẹp nhất
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentCyan }}>
              {expanded ? 'Thu gọn' : 'Xem'}
            </Text>
            <AppIcon
              name={expanded ? 'chevron-down' : 'chevron-up'}
              size={14}
              color={colors.accentCyan}
            />
          </View>
        </Pressable>

        {expanded ? (
          <Animated.View
            style={{
              opacity: expandAnim,
              transform: [
                {
                  translateY: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                  }),
                },
              ],
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            >
              {tonightSlots.map((slot) => {
                const toneColor =
                  slot.tone === 'amber'
                    ? colors.accentAmber
                    : slot.tone === 'cyan'
                    ? colors.accentCyan
                    : colors.accentViolet;
                const isSelected = slot.time.startsWith(currentHourPrefix);
                const highlighted = isSelected || slot.featured;
                return (
                  <Pressable
                    key={slot.time}
                    onPress={() => handleSelectSlot(slot.time, slot.label)}
                    style={({ pressed }) => ({
                      width: 88,
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: 14,
                      backgroundColor: highlighted ? colors.accentCyanBg : colors.cardInner,
                      borderWidth: 1,
                      borderColor: isSelected
                        ? colors.accentCyan
                        : slot.featured
                        ? colors.accentCyanBorder
                        : colors.borderSubtle,
                      gap: 2,
                      opacity: pressed ? 0.82 : 1,
                    })}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textMuted }}>
                        {slot.time}
                      </Text>
                      <AppIcon name={slot.icon} size={11} color={toneColor} />
                    </View>
                    <Text style={{ fontSize: 16, fontFamily: FONT_FAMILIES.monoBold, color: toneColor }}>
                      {slot.score}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>
                      {slot.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          backgroundColor: colors.headerBg,
          borderTopWidth: 1,
          borderTopColor: colors.borderSubtle,
          paddingVertical: 10,
        },
        glassWebStyle,
      ]}
    >
      <View
        style={{
          width: '100%',
          maxWidth: BREAKPOINTS.maxContentWidth + 96,
          alignSelf: 'center',
          paddingHorizontal: 48,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <View style={{ minWidth: 132, gap: 2 }}>
          <Text style={{ fontSize: 14, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            Đêm nay có gì?
          </Text>
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            Theo giờ địa phương · Mô phỏng
          </Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
          {tonightSlots.map((slot) => {
            const toneColor =
              slot.tone === 'amber'
                ? colors.accentAmber
                : slot.tone === 'cyan'
                ? colors.accentCyan
                : colors.accentViolet;
            const isSelected = slot.time.startsWith(currentHourPrefix);
            const highlighted = isSelected || slot.featured;
            return (
              <Pressable
                key={slot.time}
                onPress={() => handleSelectSlot(slot.time, slot.label)}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingHorizontal: 11,
                  paddingVertical: 7,
                  borderRadius: 12,
                  backgroundColor: highlighted ? colors.accentCyanBg : colors.card,
                  borderWidth: 1,
                  borderColor: isSelected
                    ? colors.accentCyan
                    : slot.featured
                    ? colors.accentCyanBorder
                    : colors.borderSubtle,
                  gap: 2,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textMuted }}>
                    {slot.time}
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>
                    {slot.label}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <AppIcon name={slot.icon} size={13} color={toneColor} />
                  <Text style={{ fontSize: 17, fontFamily: FONT_FAMILIES.monoBold, color: toneColor }}>
                    {slot.score}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
