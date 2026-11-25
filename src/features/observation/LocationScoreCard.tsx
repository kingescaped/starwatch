import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { SurfaceCard } from '../../design-system/primitives/SurfaceCard';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { ScoreRing } from '../../design-system/primitives/ScoreRing';
import { AppIcon, IconName } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { useResponsive } from '../../hooks/useResponsive';

export function LocationScoreCard() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const {
    selectedSpot,
    toggleFavoriteSpot,
    openOverlay,
    openMobileSubScreen,
    setMobileTab,
    setGuideTab,
    settings,
  } = useAppState();

  const elevationDisplay =
    settings.unitSystem === 'metric'
      ? `${selectedSpot.elevation.toLocaleString('en-US')} m`
      : `${Math.round(selectedSpot.elevation * 3.28084).toLocaleString('en-US')} ft`;

  const handleOpenInspect = () => {
    if (isMobile) openMobileSubScreen('inspectCoords');
    else openOverlay('inspectCoords');
  };

  const handleOpenGuide = (tab: 'bortle' | 'dew') => {
    setGuideTab(tab);
    if (isMobile) setMobileTab('guide');
    else openOverlay('guide');
  };

  return (
    <SurfaceCard
      radius={20}
      style={{
        padding: isMobile ? 16 : 22,
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 18 : 24,
      }}
    >
      <View style={{ flex: isMobile ? undefined : 1.35, gap: 12 }}>
        {isMobile ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
              <Text
                style={{
                  fontSize: 22,
                  lineHeight: 27,
                  fontFamily: FONT_FAMILIES.sansSemiBold,
                  color: colors.textPrimary,
                  letterSpacing: -0.3,
                }}
              >
                {selectedSpot.name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  lineHeight: 18,
                  fontFamily: FONT_FAMILIES.sansRegular,
                  color: colors.textSecondary,
                }}
              >
                {selectedSpot.subtitle}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <StatusPill label="LIVE" tone="emerald" dot small mono />
              <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textPrimary }}>
                {selectedSpot.province}
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontFamily: FONT_FAMILIES.sansSemiBold,
                    color: colors.textSecondary,
                    letterSpacing: 0.7,
                  }}
                >
                  ĐỊA ĐIỂM ĐANG THEO DÕI
                </Text>
                <StatusPill label="LIVE" tone="emerald" dot small mono />
              </View>
              <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>
                {selectedSpot.region} · {selectedSpot.province}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <Text
                style={{
                  fontSize: 24,
                  fontFamily: FONT_FAMILIES.sansBold,
                  color: colors.textPrimary,
                  letterSpacing: -0.4,
                }}
              >
                {selectedSpot.name}
              </Text>
              <Text style={{ fontSize: 15, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                {selectedSpot.subtitle}
              </Text>
            </View>
          </>
        )}

        {isMobile ? (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <MobileInfoChip
                icon="map-pin"
                label={`${selectedSpot.lat.toFixed(4)}, ${selectedSpot.lng.toFixed(4)}`}
                tone="violet"
                onPress={handleOpenInspect}
              />
              <MobileInfoChip icon="mountain" label={elevationDisplay} tone="violet" />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <MobileInfoChip
                icon="moon"
                label={`Bortle ${selectedSpot.bortle}`}
                tone="emerald"
                onPress={() => handleOpenGuide('bortle')}
              />
              <MobileInfoChip
                icon="shield-check"
                label="An toàn sương"
                tone="emerald"
                onPress={() => handleOpenGuide('dew')}
              />
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <StatusPill
              label={`${selectedSpot.lat.toFixed(4)}, ${selectedSpot.lng.toFixed(4)}`}
              tone="neutral"
              mono
              leftIcon={<AppIcon name="locate" size={12} color={colors.accentViolet} />}
              onPress={handleOpenInspect}
            />
            <StatusPill
              label={elevationDisplay}
              tone="neutral"
              mono
              leftIcon={<AppIcon name="mountain" size={12} color={colors.accentViolet} />}
            />
            <StatusPill
              label={`Bortle ${selectedSpot.bortle}`}
              tone="emerald"
              mono
              leftIcon={<AppIcon name="moon" size={12} color={colors.accentEmerald} />}
              onPress={() => handleOpenGuide('bortle')}
            />
            <StatusPill
              label="An toàn sương"
              tone="emerald"
              leftIcon={<AppIcon name="shield-check" size={12} color={colors.accentEmerald} />}
              onPress={() => handleOpenGuide('dew')}
            />
          </View>
        )}

        {!isMobile ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 2,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: colors.accentCyan,
                }}
              />
              <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                {selectedSpot.statusText}
              </Text>
            </View>
            <Pressable onPress={() => toggleFavoriteSpot(selectedSpot.id)} style={{ padding: 4 }}>
              <AppIcon
                name="bookmark"
                size={16}
                color={selectedSpot.isFavorite ? colors.accentAmber : colors.textSecondary}
                fill={selectedSpot.isFavorite ? colors.accentAmber : 'none'}
              />
            </Pressable>
          </View>
        ) : null}
      </View>

      {!isMobile ? <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.borderSubtle }} /> : null}

      <View style={{ flex: isMobile ? undefined : 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', gap: 12 }}>
        <ScoreRing
          score={selectedSpot.milkyWayScore}
          label="Ngân Hà"
          color={colors.accentCyan}
          size={isMobile ? 84 : 96}
        />
        <ScoreRing
          score={selectedSpot.twilightScore}
          label="Ráng"
          color={colors.accentAmber}
          size={isMobile ? 84 : 96}
        />
        <ScoreRing
          score={selectedSpot.cloudSeaScore}
          label="Săn Mây"
          color={colors.accentViolet}
          size={isMobile ? 84 : 96}
        />
      </View>
    </SurfaceCard>
  );
}

function MobileInfoChip({
  icon,
  label,
  tone,
  onPress,
}: {
  icon: IconName;
  label: string;
  tone: 'violet' | 'emerald';
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const isViolet = tone === 'violet';
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={{
        flex: 1,
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 9,
        paddingVertical: 8,
        backgroundColor: isViolet ? colors.cardInner : colors.accentEmeraldBg,
        borderColor: isViolet ? colors.accentVioletBorder : colors.accentEmeraldBorder,
      }}
    >
      <AppIcon name={icon} size={14} color={isViolet ? colors.accentViolet : colors.accentEmerald} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
        style={{ flexShrink: 1, fontSize: 11, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textPrimary }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
