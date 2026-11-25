import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { SurfaceCard } from '../../design-system/primitives/SurfaceCard';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { SegmentedControl } from '../../design-system/primitives/SegmentedControl';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { SkyViewMode } from '../../state/types';
import { useResponsive } from '../../hooks/useResponsive';
import { SkyDomeCanvas } from './SkyDomeCanvas';
import { AltitudeChart } from './AltitudeChart';

const VIEW_MODES: { id: SkyViewMode; label: string }[] = [
  { id: 'dome2d', label: 'Vòm 2D' },
  { id: 'ground3d', label: 'Mặt Đất 3D' },
  { id: 'sphere3d', label: 'Quả Cầu 3D' },
];

export function SkyDomeCard() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const {
    skyViewMode,
    setSkyViewMode,
    skyZoom,
    zoomSky,
    skyAutoRotate,
    toggleSkyAutoRotate,
    skyDragTool,
    setSkyDragTool,
    resetSkyView,
    currentForecast,
    dailyEvents,
    skyScene,
    selectedTarget,
    openOverlay,
    openMobileSubScreen,
  } = useAppState();

  const handleFullscreen = () => {
    if (isMobile) openMobileSubScreen('fullscreen3d');
    else openOverlay('fullscreen3d');
  };

  return (
    <SurfaceCard radius={20} style={{ padding: isMobile ? 14 : 18, gap: 12, flex: isMobile ? undefined : 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 16, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            Vòm Thiên Đỉnh 360° & Giả Lập 3D
          </Text>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            Vòm 2D dự phòng · Mặt Đất 3D · Quả Cầu Thiên Thể 360°
          </Text>
        </View>
        <StatusPill label={`${currentForecast.hour} GMT+7`} tone="cyan" small mono />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <SegmentedControl<SkyViewMode>
          fullWidth={false}
          compact
          tone="violet"
          value={skyViewMode}
          onChange={setSkyViewMode}
          options={VIEW_MODES.map((m) => ({ value: m.id, label: m.label }))}
        />

        {isMobile ? (
          <Pressable
            accessibilityLabel="Toàn màn hình 3D"
            onPress={handleFullscreen}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              backgroundColor: colors.inputBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="maximize" size={14} color={colors.accentViolet} />
          </Pressable>
        ) : (
          <StatusPill
            label="Toàn màn hình"
            tone="violet"
            small
            leftIcon={<AppIcon name="maximize" size={11} color={colors.accentViolet} />}
            onPress={handleFullscreen}
          />
        )}
      </View>

      <SkyDomeCanvas height={isMobile ? 195 : 210} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textSecondary }}>
          {skyViewMode === 'sphere3d' ? 'Góc nhìn vũ trụ' : 'Đứng nhìn mặt đất'} · {skyZoom.toFixed(1)}x
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {skyViewMode === 'sphere3d' ? (
            <StatusPill
              label="Di chuyển"
              tone={skyDragTool === 'pan' ? 'amber' : 'neutral'}
              small
              onPress={() => setSkyDragTool(skyDragTool === 'pan' ? 'rotate' : 'pan')}
            />
          ) : (
            <StatusPill
              label="Xoay"
              tone={skyAutoRotate ? 'amber' : 'neutral'}
              small
              onPress={toggleSkyAutoRotate}
            />
          )}
          {!isMobile ? <StatusPill label="Về tâm" tone="neutral" small onPress={resetSkyView} /> : null}
          {([
            { label: '−', delta: -0.2 },
            { label: '+', delta: 0.2 },
          ] as const).map((btn) => (
            <Pressable
              key={btn.label}
              onPress={() => zoomSky(btn.delta)}
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                backgroundColor: colors.inputBg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 13, color: colors.textPrimary, fontFamily: FONT_FAMILIES.monoBold }}>{btn.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: isMobile ? 6 : 8, alignItems: 'stretch' }}>
        {[
          {
            key: 'sun', flex: 0.95, label: '● Mặt Trời', labelColor: colors.accentAmber,
            value: currentForecast.sunAlt >= 0 ? `+${currentForecast.sunAlt}°` : `${currentForecast.sunAlt}°`,
            suffix: '', valueColor: colors.textPrimary, fontSize: isMobile ? 13 : 14, minScale: 0.8, featured: false,
          },
          {
            key: 'moon', flex: 1.38, label: '● Mặt Trăng', labelColor: colors.accentViolet,
            value: currentForecast.moonAlt >= 0 ? `+${currentForecast.moonAlt}°` : `${currentForecast.moonAlt}°`,
            suffix: ` · ${skyScene.moonIllum}%`, valueColor: colors.textPrimary,
            fontSize: isMobile ? 12.5 : 13.5, minScale: 0.78, featured: false,
          },
          {
            key: 'target', flex: 1.07, label: `● ${selectedTarget.shortName}`, labelColor: colors.accentCyan,
            value: currentForecast.targetAlt >= 0 ? `+${currentForecast.targetAlt}°` : `${currentForecast.targetAlt}°`,
            suffix: '', valueColor: colors.accentCyan, fontSize: isMobile ? 13 : 14, minScale: 0.8, featured: true,
          },
        ].map((box) => (
          <View
            key={box.key}
            style={{
              flex: box.flex,
              minWidth: 0,
              paddingHorizontal: isMobile ? 8 : 10,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: box.featured ? colors.accentCyanBg : colors.cardInner,
              borderWidth: 1,
              borderColor: box.featured ? colors.accentCyanBorder : colors.borderSubtle,
              justifyContent: 'space-between',
              gap: 4,
            }}
          >
            <Text numberOfLines={1} style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansMedium, color: box.labelColor }}>
              {box.label}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={box.minScale}
              style={{ fontSize: box.fontSize, lineHeight: 18, fontFamily: FONT_FAMILIES.monoBold, color: box.valueColor }}
            >
              {box.value}
              {box.suffix ? (
                <Text style={{ fontSize: isMobile ? 11 : 11.5, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textSecondary }}>
                  {box.suffix}
                </Text>
              ) : null}
            </Text>
          </View>
        ))}
      </View>

      <AltitudeChart />

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary, letterSpacing: 0.5 }}>
          LỊCH THIÊN VĂN TRONG NGÀY
        </Text>
        {dailyEvents.map((ev) => {
          const dotColor =
            ev.tone === 'amber'
              ? colors.accentAmber
              : ev.tone === 'violet'
              ? colors.accentViolet
              : colors.accentCyan;
          return (
            <View
              key={ev.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: colors.cardInner,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
                <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: dotColor }} />
                <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textPrimary }}>
                  {ev.label}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
                <Text numberOfLines={1} style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted, flexShrink: 1 }}>
                  {ev.subLabel}
                </Text>
                <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoBold, color: dotColor }}>
                  {ev.time}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </SurfaceCard>
  );
}
