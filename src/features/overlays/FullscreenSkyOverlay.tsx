import React from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { TierBadge } from '../../design-system/primitives/TierBadge';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { SkyDomeCanvas } from '../observation/SkyDomeCanvas';

interface FullscreenSkyOverlayProps {
  isMobileView?: boolean;
}

export function FullscreenSkyOverlay({ isMobileView = false }: FullscreenSkyOverlayProps) {
  const { colors } = useTheme();
  const {
    selectedSpot,
    selectedTarget,
    currentForecast,
    skyViewMode,
    setSkyViewMode,
    skyAutoRotate,
    toggleSkyAutoRotate,
    skyZoom,
    zoomSky,
    resetSkyView,
    closeOverlay,
    closeMobileSubScreen,
  } = useAppState();

  const handleExit = () => {
    if (isMobileView) closeMobileSubScreen();
    else closeOverlay();
  };

  const mobileHeader = isMobileView ? (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 10,
        backgroundColor: colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSubtle,
        gap: 6,
      }}
    >
      <Pressable
        onPress={handleExit}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' }}
      >
        <AppIcon name="chevron-left" size={16} color={colors.accentCyan} />
        <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansMedium, color: colors.accentCyan }}>
          Quan sát
        </Text>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <Text style={{ fontSize: 17, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            {selectedSpot.name} · 3D
          </Text>
          <TierBadge variant="pro" label="PRO 3D" size="xs" />
        </View>
        <StatusPill label="✕ Thoát" tone="rose" small onPress={handleExit} />
      </View>
    </View>
  ) : null;

  const innerContent = (
    <View
      style={{
        flex: isMobileView ? undefined : 1,
        backgroundColor: colors.modalBg,
        padding: isMobileView ? 16 : 22,
        paddingBottom: isMobileView ? 110 : 22,
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: isMobileView ? 'column' : 'row',
          alignItems: isMobileView ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <View style={{ gap: 3 }}>
          {!isMobileView ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: 19, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
                {`Giả Lập Vòm Trời 3D · ${selectedSpot.name} ${selectedSpot.subtitle}`}
              </Text>
              <TierBadge variant="pro" label="PRO 3D" size="xs" />
            </View>
          ) : null}
          <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textSecondary }}>
            Mục tiêu: {selectedTarget.name} · {currentForecast.hour} GMT+7 · {currentForecast.phaseLabel} {currentForecast.sunAlt}°
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <StatusPill
            label="Mặt Đất 3D"
            tone={skyViewMode === 'ground3d' ? 'emerald' : 'neutral'}
            small
            onPress={() => setSkyViewMode('ground3d')}
          />
          <StatusPill
            label="Quả Cầu 3D"
            tone={skyViewMode === 'sphere3d' ? 'cyan' : 'neutral'}
            small
            onPress={() => setSkyViewMode('sphere3d')}
          />
          <StatusPill
            label={isMobileView ? 'Xoay' : 'Xoay 360°'}
            tone={skyAutoRotate ? 'amber' : 'neutral'}
            small
            onPress={toggleSkyAutoRotate}
          />
          <StatusPill label="Về tâm" tone="cyan" small onPress={resetSkyView} />
          {!isMobileView ? (
            <StatusPill label="✕ Thoát" tone="rose" small onPress={handleExit} />
          ) : null}
        </View>
      </View>

      <View style={{ position: 'relative' }}>
        <SkyDomeCanvas height={isMobileView ? 420 : 500} fullscreen />
        <View
          style={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            borderRadius: 12,
            backgroundColor: colors.glass,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            overflow: 'hidden',
            alignItems: 'center',
          }}
        >
          <Pressable onPress={() => zoomSky(0.2)} style={{ padding: 8 }}>
            <AppIcon name="plus" size={14} color={colors.textPrimary} />
          </Pressable>
          <Text
            style={{
              fontSize: 10,
              fontFamily: FONT_FAMILIES.monoBold,
              color: colors.accentCyan,
              paddingHorizontal: 6,
              paddingVertical: 4,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            {skyZoom.toFixed(1)}x
          </Text>
          <Pressable onPress={() => zoomSky(-0.2)} style={{ padding: 8 }}>
            <Text style={{ fontSize: 14, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>−</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (isMobileView) {
    return (
      <View style={{ flex: 1, minHeight: 0, backgroundColor: colors.bg }}>
        {mobileHeader}
        <ScrollView style={{ flex: 1, minHeight: 0 }} showsVerticalScrollIndicator={false}>
          {innerContent}
        </ScrollView>
      </View>
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={closeOverlay}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(5, 7, 13, 0.86)',
          padding: 28,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 1260,
            borderRadius: 24,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.borderStrong,
          }}
        >
          {innerContent}
        </View>
      </View>
    </Modal>
  );
}
