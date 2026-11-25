import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { filterSpots } from '../../data/spots';
import { GeocodedPlace } from '../../services/locationClient';
import { useAppState } from '../../state/AppStateContext';
import { SpotFilter } from '../../state/types';
import { ModalShell } from './ModalShell';
import { SpotSearchResults } from './SpotSearchResults';

interface SpotsOverlayProps {
  isMobileView?: boolean;
}

export function SpotsOverlay({ isMobileView = false }: SpotsOverlayProps) {
  const { colors } = useTheme();
  const {
    spots,
    selectedSpot,
    selectSpot,
    toggleFavoriteSpot,
    spotSearch,
    setSpotSearch,
    spotFilter,
    setSpotFilter,
    selectGeocodedPlace,
    closeOverlay,
    openOverlay,
    setMobileTab,
    openMobileSubScreen,
  } = useAppState();

  const filtered = filterSpots(spots, spotSearch, spotFilter);
  const savedCount = spots.filter((s) => s.savedSizeMb !== null).length;
  const favCount = spots.filter((s) => s.isFavorite).length;

  const handleOpenContribute = () => {
    if (isMobileView) openMobileSubScreen('contribute');
    else openOverlay('contribute');
  };

  const handleChooseSpot = (spotId: string) => {
    selectSpot(spotId);
    if (isMobileView) setMobileTab('observe');
    else closeOverlay();
  };

  const handleSelectRemotePlace = async (place: GeocodedPlace) => {
    await selectGeocodedPlace(place);
    if (isMobileView) setMobileTab('observe');
    else closeOverlay();
  };

  const handleGpsLocated = () => {
    if (isMobileView) setMobileTab('observe');
    else closeOverlay();
  };

  return (
    <ModalShell
      title={isMobileView ? 'Điểm Săn Ảnh Vũ Trụ' : 'Điểm Săn Ảnh & Tìm Kiếm Địa Điểm'}
      subtitle={
        isMobileView
          ? `${spots.length} điểm hiện có · Tìm bất kỳ tỉnh thành / tọa độ GPS`
          : `${spots.length} điểm tuyển chọn + tìm kiếm mọi địa danh, núi & tọa độ GPS`
      }
      width={MODAL_WIDTHS.wide}
      onClose={closeOverlay}
      isMobileView={isMobileView}
    >
      {isMobileView ? (
        <ActionButton
          label="+ Đóng góp địa điểm mới"
          variant="secondary"
          fullWidth
          onPress={handleOpenContribute}
        />
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 9,
          borderRadius: 12,
          backgroundColor: colors.inputBg,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          gap: 8,
        }}
      >
        <AppIcon name="search" size={15} color={colors.textMuted} />
        <TextInput
          value={spotSearch}
          onChangeText={setSpotSearch}
          placeholder="Tìm địa điểm, tỉnh thành, đỉnh núi hoặc tọa độ GPS..."
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1,
            fontSize: isMobileView ? 16 : 13,
            fontFamily: FONT_FAMILIES.sansRegular,
            color: colors.textPrimary,
            paddingVertical: 2,
          }}
        />
        {spotSearch.trim() ? (
          <Pressable onPress={() => setSpotSearch('')} accessibilityLabel="Xóa từ khóa" hitSlop={8}>
            <AppIcon name="x" size={14} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <StatusPill label={`${filtered.length} điểm`} tone="cyan" small mono />
      </View>

      <SpotSearchResults
        query={spotSearch}
        onSelectPlace={handleSelectRemotePlace}
        onGpsLocated={handleGpsLocated}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {([
            { id: 'all', label: `Tất cả (${spots.length})`, tone: 'cyan' },
            { id: 'saved', label: `Đã lưu (${savedCount})`, tone: 'neutral' },
            { id: 'favorite', label: `★ Yêu thích (${favCount})`, tone: 'amber' },
          ] as { id: SpotFilter; label: string; tone: 'cyan' | 'neutral' | 'amber' }[]).map((tab) => (
            <StatusPill
              key={tab.id}
              label={tab.label}
              tone={spotFilter === tab.id ? tab.tone : 'neutral'}
              active={spotFilter === tab.id}
              onPress={() => setSpotFilter(tab.id)}
            />
          ))}
        </View>

        {!isMobileView ? (
          <ActionButton
            label="+ Đóng góp địa điểm mới"
            variant="secondary"
            compact
            onPress={handleOpenContribute}
          />
        ) : null}
      </View>

      <View style={{ gap: 10 }}>
        {filtered.map((spot) => {
          const isCurrent = spot.id === selectedSpot.id;
          return (
            <View
              key={spot.id}
              style={{
                padding: 14,
                borderRadius: 16,
                backgroundColor: colors.cardInner,
                borderWidth: 1,
                borderColor: isCurrent ? colors.accentCyanBorder : colors.borderSubtle,
                gap: 10,
              }}
            >
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 15, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
                    {spot.name}
                  </Text>
                  <StatusPill
                    label={`Class ${spot.bortle.toFixed(1)}`}
                    tone={spot.bortle <= 3.0 ? 'emerald' : 'amber'}
                    dot
                    small
                    mono
                  />
                  <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textMuted }}>
                    {spot.elevation.toLocaleString('en-US')} m
                  </Text>
                </View>

                <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                  {spot.province} · {spot.region}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {spot.savedSizeMb !== null ? (
                  <StatusPill
                    label={`Đã lưu (${spot.savedSizeMb} MB)`}
                    tone="cyan"
                    small
                    leftIcon={<AppIcon name="cloud-download" size={11} color={colors.accentCyan} />}
                  />
                ) : null}
                {spot.isFavorite ? (
                  <StatusPill label="★ Yêu thích" tone="amber" small />
                ) : null}
                {spot.tags.map((tag) => (
                  <StatusPill key={tag} label={tag} tone="violet" small />
                ))}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={{ fontSize: 18, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentCyan }}>
                    {spot.overallScore}
                  </Text>
                  <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
                    điểm bầu trời
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable
                    onPress={() => toggleFavoriteSpot(spot.id)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: spot.isFavorite ? colors.accentAmberBg : colors.card,
                      borderWidth: 1,
                      borderColor: spot.isFavorite ? colors.accentAmberBorder : colors.borderSubtle,
                    }}
                  >
                    <AppIcon
                      name="star"
                      size={14}
                      color={spot.isFavorite ? colors.accentAmber : colors.textSecondary}
                      fill={spot.isFavorite ? colors.accentAmber : 'none'}
                    />
                  </Pressable>
                  <ActionButton
                    label={isCurrent ? 'Đang chọn' : 'Chọn điểm này'}
                    variant={isCurrent ? 'primary' : 'secondary'}
                    compact
                    onPress={() => handleChooseSpot(spot.id)}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ModalShell>
  );
}
