import React from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { MobileBottomTabBar } from '../navigation/MobileBottomTabBar';
import { LocationScoreCard } from '../observation/LocationScoreCard';
import { TimeControlBar } from '../observation/TimeControlBar';
import { GisMapCard } from '../observation/GisMapCard';
import { SkyDomeCard } from '../observation/SkyDomeCard';
import { CloudDewMatrixCard } from '../observation/CloudDewMatrixCard';
import { AstroSetupCard } from '../observation/AstroSetupCard';
import { TonightSummaryCard } from '../observation/TonightSummaryCard';
import { SpotsOverlay } from '../overlays/SpotsOverlay';
import { ContributeOverlay } from '../overlays/ContributeOverlay';
import { CalendarOverlay } from '../overlays/CalendarOverlay';
import { GuideOverlay } from '../overlays/GuideOverlay';
import { SettingsOverlay } from '../overlays/SettingsOverlay';
import { AboutOverlay } from '../overlays/AboutOverlay';
import { AccountOverlay } from '../overlays/AccountOverlay';
import { CameraProfileOverlay } from '../overlays/CameraProfileOverlay';
import { TargetPickerOverlay } from '../overlays/TargetPickerOverlay';
import { InspectCoordsOverlay } from '../overlays/InspectCoordsOverlay';
import { GoldenWindowOverlay } from '../overlays/GoldenWindowOverlay';
import { FullscreenSkyOverlay } from '../overlays/FullscreenSkyOverlay';

export function MobileShell() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    mobileTab,
    setMobileTab,
    mobileSubScreen,
    selectedSpot,
    locatingGps,
    gpsError,
    clearGpsError,
    locateCurrentPosition,
  } = useAppState();

  const renderMainBody = () => {
    if (mobileSubScreen === 'contribute') return <ContributeOverlay isMobileView />;
    if (mobileSubScreen === 'about') return <AboutOverlay isMobileView />;
    if (mobileSubScreen === 'account') return <AccountOverlay isMobileView />;
    if (mobileSubScreen === 'cameraProfile') return <CameraProfileOverlay isMobileView />;
    if (mobileSubScreen === 'targetPicker') return <TargetPickerOverlay isMobileView />;
    if (mobileSubScreen === 'inspectCoords') return <InspectCoordsOverlay isMobileView />;
    if (mobileSubScreen === 'goldenWindow') return <GoldenWindowOverlay isMobileView />;
    if (mobileSubScreen === 'fullscreen3d') return <FullscreenSkyOverlay isMobileView />;

    if (mobileTab === 'spots') return <SpotsOverlay isMobileView />;
    if (mobileTab === 'calendar') return <CalendarOverlay isMobileView />;
    if (mobileTab === 'guide') return <GuideOverlay isMobileView />;
    if (mobileTab === 'account') return <SettingsOverlay isMobileView />;

    return (
      <View style={{ flex: 1, minHeight: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: colors.bg,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
          }}
        >
          <Pressable
            onPress={() => setMobileTab('spots')}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 14,
              paddingVertical: 11,
              borderRadius: 999,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
              <AppIcon name="map-pin" size={14} color={colors.accentCyan} />
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 13,
                  fontFamily: FONT_FAMILIES.sansSemiBold,
                  color: colors.textPrimary,
                  flexShrink: 1,
                }}
              >
                {selectedSpot.name} · Bortle {selectedSpot.bortle}
              </Text>
            </View>
            <AppIcon name="chevron-down" size={15} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={() => { void locateCurrentPosition(); }}
            disabled={locatingGps}
            accessibilityLabel="Lấy vị trí hiện tại"
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: locatingGps ? colors.pillActiveBg : colors.card,
              borderWidth: 1,
              borderColor: locatingGps ? colors.accentCyanBorder : colors.borderSubtle,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <AppIcon name="locate" size={16} color={colors.accentCyan} />
          </Pressable>

          <Pressable
            onPress={() => setMobileTab('spots')}
            accessibilityLabel="Tìm địa điểm"
            style={({ pressed }) => ({
              width: 42,
              height: 42,
              borderRadius: 999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <AppIcon name="search" size={16} color={colors.accentCyan} />
          </Pressable>
        </View>

        {gpsError ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              marginHorizontal: 16,
              marginTop: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: colors.accentRoseBg,
              borderWidth: 1,
              borderColor: colors.accentRoseBorder,
            }}
          >
            <Text style={{ flex: 1, fontSize: 12, fontFamily: FONT_FAMILIES.sansMedium, color: colors.accentRose }}>
              {gpsError}
            </Text>
            <Pressable onPress={clearGpsError} hitSlop={8}>
              <AppIcon name="x" size={14} color={colors.accentRose} />
            </Pressable>
          </View>
        ) : null}

        <ScrollView
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 140, gap: 14 }}
          showsVerticalScrollIndicator={false}
        >
          <LocationScoreCard />
          <GisMapCard />
          <TimeControlBar />
          <SkyDomeCard />
          <CloudDewMatrixCard />
          <AstroSetupCard />
        </ScrollView>
      </View>
    );
  };

  const webSafeTop =
    Platform.OS === 'web'
      ? ({ paddingTop: 'env(safe-area-inset-top, 0px)' } as never)
      : { paddingTop: insets.top };

  const webSafeBottom =
    Platform.OS === 'web'
      ? ({ bottom: 'max(10px, env(safe-area-inset-bottom, 0px))' } as never)
      : { bottom: Math.max(10, insets.bottom) };

  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, webSafeTop]}>
      <View style={{ flex: 1 }}>{renderMainBody()}</View>

      <View
        pointerEvents="box-none"
        style={[
          {
            position: 'absolute',
            left: 12,
            right: 12,
            gap: 8,
          },
          webSafeBottom,
        ]}
      >
        {mobileTab === 'observe' && !mobileSubScreen ? (
          <TonightSummaryCard variant="mobileCollapsible" />
        ) : null}
        <MobileBottomTabBar />
      </View>
    </View>
  );
}
