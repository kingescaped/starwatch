import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, LayoutRectangle, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { getCloudCellTone, getDewDeltaTone, ThemeColors, ThemeMode } from '../../design-system/tokens/colors';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { SurfaceCard } from '../../design-system/primitives/SurfaceCard';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { countDewAlertHours } from '../../data/forecast';
import { HourlyForecast } from '../../state/types';
import { useAppState } from '../../state/AppStateContext';
import { useResponsive } from '../../hooks/useResponsive';

const ROW_HEIGHT = 38;
const CELL_GAP = 6;
const CELL_BASE = { height: ROW_HEIGHT, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const };
const isReducedMotion = () =>
  Platform.OS === 'web' && typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export function CloudDewMatrixCard() {
  const { mode, colors } = useTheme();
  const { isMobile } = useResponsive();
  const { hourIndex, setHourIndex, hourlyForecast, settings, selectedSpot, setGuideTab, openOverlay, setMobileTab } = useAppState();
  const [frameReady, setFrameReady] = useState(false);
  const colLayoutsRef = useRef<Record<number, { x: number; width: number }>>({});
  const hasMeasuredRef = useRef(false);
  const gridWidthRef = useRef<number | null>(null);
  const snapOnResizeRef = useRef(false);
  const frameX = useRef(new Animated.Value(0)).current;
  const frameW = useRef(new Animated.Value(0)).current;

  const springFrameTo = useCallback(
    (x: number, width: number, instant = false) => {
      if (instant || isReducedMotion()) {
        frameX.setValue(x);
        frameW.setValue(width);
        return;
      }
      const cfg = { damping: 20, stiffness: 260, mass: 0.72, useNativeDriver: false };
      Animated.parallel([Animated.spring(frameX, { toValue: x, ...cfg }), Animated.spring(frameW, { toValue: width, ...cfg })]).start();
    },
    [frameX, frameW]
  );

  useEffect(() => {
    const target = colLayoutsRef.current[hourIndex];
    if (target && hasMeasuredRef.current) springFrameTo(target.x, target.width);
  }, [hourIndex, springFrameTo]);

  const handleColLayout = (idx: number, { x, width }: LayoutRectangle) => {
    if (width <= 0) return;
    colLayoutsRef.current[idx] = { x, width };
    if (idx !== hourIndex) return;
    if (!hasMeasuredRef.current || snapOnResizeRef.current) {
      hasMeasuredRef.current = true;
      snapOnResizeRef.current = false;
      springFrameTo(x, width, true);
      if (!frameReady) setFrameReady(true);
    } else {
      springFrameTo(x, width);
    }
  };

  const dewStats = countDewAlertHours(hourlyForecast, settings.dewThreshold);
  const firstAlertHour = dewStats.hours[0]?.hour ?? '00:00';
  const lastAlertHour = dewStats.hours[dewStats.hours.length - 1]?.hour ?? '06:00';
  const handleOpenDewGuide = () => {
    setGuideTab('dew');
    if (isMobile) setMobileTab('guide');
    else openOverlay('guide');
  };

  const labelRows = [
    { title: 'Giờ địa phương', subtitle: `GMT+7 · ${selectedSpot.name.replace('Đỉnh ', '')}`, bold: true },
    { title: 'Mây tầng cao (%)', subtitle: '> 6 km · Ti tầng' },
    { title: 'Mây tầng trung (%)', subtitle: '2–6 km · Trung tích' },
    { title: 'Mây tầng thấp (%)', subtitle: '< 2 km · Biển mây' },
    { title: 'Nhiệt / Sương', subtitle: '°C / °C' },
    { title: 'Chênh lệch ΔT', subtitle: `Cảnh báo ≤ ${settings.dewThreshold}°C` },
  ];

  const hourlyColumns = (
    <View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (gridWidthRef.current !== null && Math.abs(gridWidthRef.current - w) > 0.5) snapOnResizeRef.current = true;
        gridWidthRef.current = w;
      }}
      style={{ flexDirection: 'row', position: 'relative', flex: isMobile ? undefined : 1, paddingVertical: 5, paddingHorizontal: isMobile ? 4 : 3, gap: isMobile ? 4 : 3 }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: frameX,
          width: frameW,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: colors.accentCyan,
          backgroundColor: colors.accentCyanBg,
          shadowColor: colors.accentCyan,
          shadowOpacity: 0.28,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 0 },
          elevation: 2,
          opacity: frameReady ? 1 : 0,
        }}
      />
      {hourlyForecast.map((item, idx) => (
        <HourColumn
          key={item.hour}
          item={item}
          active={idx === hourIndex}
          isMobile={isMobile}
          mode={mode}
          colors={colors}
          dewThreshold={settings.dewThreshold}
          onSelect={() => setHourIndex(idx)}
          onLayout={(layout) => handleColLayout(idx, layout)}
        />
      ))}
    </View>
  );

  return (
    <SurfaceCard radius={20} style={{ padding: isMobile ? 14 : 20, gap: 12 }}>
      <View style={{ flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ gap: 2 }}>
          <Text style={{ fontSize: 17, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            Ma Trận Phân Tầng Mây & Điểm Sương
          </Text>
          <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            Dự báo theo giờ (18:00–06:00) · Mây Cao / Trung / Thấp & chênh lệch Nhiệt độ – Điểm Sương (ΔT)
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          <StatusPill label="Quang mây 0–20%" tone="emerald" dot small />
          <StatusPill label="Mây rải rác 25–55%" tone="cyan" dot small />
          <StatusPill label="Mây nhiều 60–80%" tone="amber" dot small />
          <StatusPill label="Mây đặc 85–100%" tone="rose" dot small />
        </View>
      </View>

      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: colors.accentRoseBg,
          borderWidth: 1,
          borderColor: colors.accentRoseBorder,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <AppIcon name="alert" size={14} color={colors.accentRose} />
          <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansMedium, color: colors.accentRose, flexShrink: 1 }}>
            Cảnh báo Đọng Sương Lens — Bật Dew Heater (ΔT ≤ {settings.dewThreshold}°C từ {firstAlertHour} đến {lastAlertHour} · Thấp nhất {dewStats.minDelta}°C lúc {dewStats.minHour})
          </Text>
        </View>
        <Pressable onPress={handleOpenDewGuide}>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentRose }}>
            Xem hướng dẫn chống sương →
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: isMobile ? 108 : 132, paddingRight: 8, paddingVertical: 5, borderRightWidth: 1, borderRightColor: colors.borderSubtle, gap: CELL_GAP }}>
          {labelRows.map((row) => (
            <View key={row.title} style={{ height: ROW_HEIGHT, justifyContent: 'center' }}>
              <Text numberOfLines={1} style={{ fontSize: isMobile ? 10.5 : 11, fontFamily: row.bold ? FONT_FAMILIES.sansSemiBold : FONT_FAMILIES.sansMedium, color: colors.textPrimary }}>
                {row.title}
              </Text>
              <Text numberOfLines={1} style={{ fontSize: 9, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
                {row.subtitle}
              </Text>
            </View>
          ))}
        </View>

        {isMobile ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingLeft: 6 }}>
            {hourlyColumns}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, paddingLeft: 8 }}>{hourlyColumns}</View>
        )}
      </View>
    </SurfaceCard>
  );
}

interface HourColumnProps {
  item: HourlyForecast;
  active: boolean;
  isMobile: boolean;
  mode: ThemeMode;
  colors: ThemeColors;
  dewThreshold: number;
  onSelect: () => void;
  onLayout: (layout: LayoutRectangle) => void;
}

function HourColumn({ item, active, isMobile, mode, colors, dewThreshold, onSelect, onLayout }: HourColumnProps) {
  const clouds = [item.highCloud, item.midCloud, item.lowCloud].map((val) => ({ val, tone: getCloudCellTone(val, mode) }));
  const dewTone = getDewDeltaTone(item.deltaT, dewThreshold, mode);
  const dewText = item.deltaT <= dewThreshold ? `${item.deltaT}°!` : `${item.deltaT}°`;

  return (
    <View
      onLayout={(e) => onLayout(e.nativeEvent.layout)}
      style={{ width: isMobile ? 60 : undefined, flex: isMobile ? undefined : 1, paddingHorizontal: isMobile ? 4 : 3, gap: CELL_GAP }}
    >
      <Pressable
        onPress={onSelect}
        style={[CELL_BASE, { backgroundColor: active ? colors.pillActiveBg : colors.cardInner, borderWidth: 1, borderColor: active ? 'transparent' : colors.borderSubtle }]}
      >
        <Text style={{ fontSize: 11, fontFamily: active ? FONT_FAMILIES.monoBold : FONT_FAMILIES.monoMedium, color: active ? colors.textPrimary : colors.textSecondary }}>
          {item.hour}
        </Text>
      </Pressable>
      {clouds.map((c, idx) => (
        <Pressable
          key={idx}
          onPress={onSelect}
          style={[CELL_BASE, { backgroundColor: c.tone.bg, borderWidth: 1, borderColor: active ? 'transparent' : c.tone.border }]}
        >
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoBold, color: c.tone.text }}>{c.val}%</Text>
        </Pressable>
      ))}
      <Pressable
        onPress={onSelect}
        style={[CELL_BASE, { backgroundColor: colors.cardInner, borderWidth: 1, borderColor: active ? 'transparent' : colors.borderSubtle }]}
      >
        <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textSecondary }}>
          {item.tempC}°/{item.dewC}°
        </Text>
      </Pressable>
      <Pressable
        onPress={onSelect}
        style={[CELL_BASE, { backgroundColor: dewTone.bg, borderWidth: 1, borderColor: active ? 'transparent' : dewTone.border }]}
      >
        <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoBold, color: dewTone.text }}>{dewText}</Text>
      </Pressable>
    </View>
  );
}
