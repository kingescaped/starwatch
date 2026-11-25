import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { SurfaceCard } from '../../design-system/primitives/SurfaceCard';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { SegmentedControl } from '../../design-system/primitives/SegmentedControl';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { useResponsive } from '../../hooks/useResponsive';

const TIMELINE_TICKS = [
  { label: '17:38 Lặn', idx: 0 },
  { label: '19:00 Ráng', idx: 1 },
  { label: '21:00', idx: 3 },
  { label: '00:00', idx: 6 },
  { label: '01:30 Đỉnh', idx: 7 },
  { label: '04:36 Rạng', idx: 10 },
  { label: '05:54 Mọc', idx: 12 },
];

const MOBILE_TIMELINE_TICKS = [
  { label: '18:00', idx: 0 },
  { label: '21:00', idx: 3 },
  { label: '00:00', idx: 6 },
  { label: '03:00', idx: 9 },
  { label: '06:00', idx: 12 },
];

const QUICK_TIMES = [
  { label: '19:00 Ráng chiều', idx: 1 },
  { label: '21:00 Đêm thiên văn', idx: 3 },
  { label: '01:30 Đỉnh Ngân Hà', idx: 7 },
];

const SPEED_OPTIONS: { value: '10m' | '60m'; label: string }[] = [
  { value: '10m', label: '10 phút/giây' },
  { value: '60m', label: '60 phút/giây' },
];

export function TimeControlBar() {
  const { mode, colors } = useTheme();
  const { isMobile } = useResponsive();
  const {
    hourIndex,
    setHourIndex,
    hourlyForecast,
    currentForecast,
    isPlayingTime,
    togglePlayTime,
    playbackSpeed,
    setPlaybackSpeed,
    targets,
    selectedTarget,
    selectTarget,
    openOverlay,
    openMobileSubScreen,
  } = useAppState();

  const progressRatio = hourIndex / Math.max(1, hourlyForecast.length - 1);
  const thumbFill = mode === 'light' ? colors.card : colors.textPrimary;

  const handleOpenGolden = () => {
    if (isMobile) openMobileSubScreen('goldenWindow');
    else openOverlay('goldenWindow');
  };

  const handleOpenTargetPicker = () => {
    if (isMobile) openMobileSubScreen('targetPicker');
    else openOverlay('targetPicker');
  };

  return (
    <SurfaceCard radius={18} style={{ padding: isMobile ? 14 : 16, gap: 12 }}>
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 14,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable
            onPress={togglePlayTime}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.accentCyanBg,
              borderWidth: 1,
              borderColor: colors.accentCyanBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon
              name={isPlayingTime ? 'pause' : 'play'}
              size={15}
              color={colors.accentCyan}
              fill={colors.accentCyan}
            />
          </Pressable>

          <SegmentedControl<'10m' | '60m'>
            fullWidth={false}
            compact
            mono
            tone="cyan"
            value={playbackSpeed}
            onChange={setPlaybackSpeed}
            options={SPEED_OPTIONS}
          />
        </View>

        <View style={{ flex: isMobile ? undefined : 1, gap: 7 }}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.accentViolet }} />
              <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textPrimary }}>
                {currentForecast.hour} GMT+7 · {currentForecast.phaseLabel} {currentForecast.sunAlt}°
              </Text>
            </View>

            <StatusPill
              label="Khung giờ vàng: 22:30 - 02:15"
              tone="emerald"
              small
              mono
              leftIcon={<AppIcon name="sparkles" size={11} color={colors.accentEmerald} />}
              onPress={handleOpenGolden}
            />
          </View>

          <View style={{ height: 22, justifyContent: 'center' }}>
            <View style={{ height: 5, borderRadius: 999, backgroundColor: colors.ringTrack, overflow: 'hidden' }}>
              <LinearGradient
                colors={[colors.accentViolet, colors.accentCyan, colors.accentAmber]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${Math.max(4, Math.round(progressRatio * 100))}%`, height: '100%' }}
              />
            </View>

            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {hourlyForecast.map((item, idx) => {
                const isSelected = idx === hourIndex;
                return (
                  <Pressable
                    key={item.hour}
                    onPress={() => setHourIndex(idx)}
                    style={{ width: 18, height: 22, alignItems: 'center', justifyContent: 'center' }}
                  >
                    {isSelected ? (
                      <View
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                          backgroundColor: thumbFill,
                          borderWidth: 3,
                          borderColor: colors.accentCyan,
                        }}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
            {(isMobile ? MOBILE_TIMELINE_TICKS : TIMELINE_TICKS).map((tick) => {
              const active = hourIndex === tick.idx;
              return (
                <Pressable key={tick.label} onPress={() => setHourIndex(tick.idx)}>
                  <Text
                    style={{
                      fontSize: 10,
                      fontFamily: active ? FONT_FAMILIES.monoBold : FONT_FAMILIES.monoRegular,
                      color: active ? colors.accentCyan : colors.textMuted,
                    }}
                  >
                    {tick.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handleOpenTargetPicker}
          style={({ pressed }) => ({
            minWidth: isMobile ? undefined : 225,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            paddingHorizontal: 13,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: colors.inputBg,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <AppIcon name="sparkles" size={14} color={colors.accentCyan} />
            <View>
              <Text style={{ fontSize: 9, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textMuted, letterSpacing: 0.6 }}>
                MỤC TIÊU THIÊN THỂ
              </Text>
              <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
                {selectedTarget.name}
              </Text>
            </View>
          </View>
          <AppIcon name="chevron-down" size={15} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.borderSubtle,
          paddingTop: 10,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textMuted, marginRight: 4 }}>
            Danh mục mục tiêu:
          </Text>
          {targets.map((target) => (
            <StatusPill
              key={target.id}
              label={target.name}
              tone={target.id === selectedTarget.id ? 'cyan' : 'neutral'}
              dot
              small
              onPress={() => selectTarget(target.id)}
            />
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          {QUICK_TIMES.map((qt) => (
            <StatusPill
              key={qt.label}
              label={qt.label}
              tone={hourIndex === qt.idx ? 'cyan' : 'neutral'}
              small
              mono
              onPress={() => setHourIndex(qt.idx)}
            />
          ))}
        </View>
      </View>
    </SurfaceCard>
  );
}
