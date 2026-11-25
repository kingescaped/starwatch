import React from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import type { Spot } from '../../state/types';
import type { GeocodedPlace } from '../../services/locationClient';

interface MobileLocationDropdownProps {
  panelMode: 'saved' | 'search';
  dropdownAnim: Animated.Value;
  savedCount: number;
  selectedSpotId: string;
  localMatches: Spot[];
  remoteResults: GeocodedPlace[];
  trimmedQuery: string;
  searching: boolean;
  onClose: () => void;
  onOpenAllSpots: () => void;
  onSelectSpot: (spotId: string) => void;
  onSelectRemote: (place: GeocodedPlace) => void;
}

export function MobileLocationDropdown({
  panelMode,
  dropdownAnim,
  savedCount,
  selectedSpotId,
  localMatches,
  remoteResults,
  trimmedQuery,
  searching,
  onClose,
  onOpenAllSpots,
  onSelectSpot,
  onSelectRemote,
}: MobileLocationDropdownProps) {
  const { colors } = useTheme();

  return (
    <>
      <Pressable
        onPress={onClose}
        accessibilityLabel="Đóng danh sách nhanh"
        style={{ position: 'absolute', top: 62, left: 0, right: 0, height: 1200, zIndex: 70 }}
      />
      <Animated.View
        style={{
          position: 'absolute',
          top: 63,
          left: 16,
          right: 16,
          maxHeight: 360,
          borderRadius: 16,
          backgroundColor: colors.modalBg,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          padding: 12,
          gap: 8,
          zIndex: 80,
          shadowColor: colors.bg,
          shadowOpacity: 0.55,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          opacity: dropdownAnim,
          transform: [
            { translateY: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) },
            { scale: dropdownAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
            {panelMode === 'saved'
              ? `ĐỊA ĐIỂM ĐÃ LƯU (${savedCount})`
              : `KẾT QUẢ TÌM KIẾM (${localMatches.length + remoteResults.length})`}
          </Text>
          <Pressable onPress={onOpenAllSpots} hitSlop={6}>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentCyan }}>
              Mở danh sách đầy đủ →
            </Text>
          </Pressable>
        </View>

        <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ gap: 6 }} showsVerticalScrollIndicator={false}>
          {localMatches.map((spot) => {
            const active = spot.id === selectedSpotId;
            return (
              <Pressable
                key={spot.id}
                onPress={() => onSelectSpot(spot.id)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  paddingHorizontal: 11,
                  paddingVertical: 9,
                  borderRadius: 12,
                  backgroundColor: active ? colors.pillActiveBg : colors.cardInner,
                  borderWidth: 1,
                  borderColor: active ? colors.accentCyanBorder : colors.borderSubtle,
                  opacity: pressed ? 0.82 : 1,
                })}
              >
                <View style={{ flex: 1, gap: 1 }}>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
                    {spot.name}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                    {spot.province} · Bortle {spot.bortle.toFixed(1)}
                  </Text>
                </View>
                <StatusPill label={`${spot.overallScore}đ`} tone={active ? 'cyan' : 'neutral'} small mono />
              </Pressable>
            );
          })}

          {panelMode === 'search' && trimmedQuery.length >= 2 ? (
            <View style={{ gap: 6, marginTop: 4 }}>
              <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentViolet }}>
                {searching ? 'Đang tìm trên bản đồ mở rộng...' : `Địa danh & tọa độ (${remoteResults.length})`}
              </Text>
              {remoteResults.map((place) => (
                <Pressable
                  key={place.id}
                  onPress={() => onSelectRemote(place)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    paddingHorizontal: 11,
                    paddingVertical: 9,
                    borderRadius: 12,
                    backgroundColor: colors.cardInner,
                    borderWidth: 1,
                    borderColor: colors.accentVioletBorder,
                    opacity: pressed ? 0.82 : 1,
                  })}
                >
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
                      {place.name}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                      {place.province} · {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                    </Text>
                  </View>
                  <StatusPill label="Chọn" tone="violet" small />
                </Pressable>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </>
  );
}
