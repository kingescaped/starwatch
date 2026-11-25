import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { BREAKPOINTS } from '../../design-system/tokens/spacing';
import { useAppState } from '../../state/AppStateContext';
import { DesktopHeader } from '../navigation/DesktopHeader';
import { HeroBanner } from '../observation/HeroBanner';
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

export function DesktopShell() {
  const { colors } = useTheme();
  const { activeOverlay, gpsError, clearGpsError } = useAppState();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <DesktopHeader />

      {gpsError && activeOverlay !== 'spots' ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            maxWidth: BREAKPOINTS.maxContentWidth,
            width: '100%',
            alignSelf: 'center',
            marginTop: 10,
            paddingHorizontal: 14,
            paddingVertical: 9,
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
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroBanner />

        <View
          style={{
            width: '100%',
            maxWidth: BREAKPOINTS.maxContentWidth + 96,
            alignSelf: 'center',
            paddingHorizontal: 48,
            paddingTop: 20,
            gap: 18,
          }}
        >
          <LocationScoreCard />
          <TimeControlBar />

          <View style={{ flexDirection: 'row', alignItems: 'stretch', gap: 18 }}>
            <View style={{ flex: 1.1 }}>
              <GisMapCard />
            </View>
            <View style={{ flex: 0.95 }}>
              <SkyDomeCard />
            </View>
          </View>

          <CloudDewMatrixCard />
          <AstroSetupCard />
        </View>
      </ScrollView>

      <TonightSummaryCard variant="desktopDock" />

      {activeOverlay === 'spots' ? <SpotsOverlay /> : null}
      {activeOverlay === 'contribute' ? <ContributeOverlay /> : null}
      {activeOverlay === 'calendar' ? <CalendarOverlay /> : null}
      {activeOverlay === 'guide' ? <GuideOverlay /> : null}
      {activeOverlay === 'settings' ? <SettingsOverlay /> : null}
      {activeOverlay === 'about' ? <AboutOverlay /> : null}
      {activeOverlay === 'account' ? <AccountOverlay /> : null}
      {activeOverlay === 'cameraProfile' ? <CameraProfileOverlay /> : null}
      {activeOverlay === 'targetPicker' ? <TargetPickerOverlay /> : null}
      {activeOverlay === 'inspectCoords' ? <InspectCoordsOverlay /> : null}
      {activeOverlay === 'goldenWindow' ? <GoldenWindowOverlay /> : null}
      {activeOverlay === 'fullscreen3d' ? <FullscreenSkyOverlay /> : null}
    </View>
  );
}
