import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { GeocodedPlace, searchRemotePlaces } from '../../services/locationClient';
import { useAppState } from '../../state/AppStateContext';

interface SpotSearchResultsProps {
  query: string;
  onSelectPlace: (place: GeocodedPlace) => void;
  onGpsLocated: () => void;
}

export function SpotSearchResults({ query, onSelectPlace, onGpsLocated }: SpotSearchResultsProps) {
  const { colors } = useTheme();
  const { locatingGps, gpsError, clearGpsError, locateCurrentPosition } = useAppState();
  const [results, setResults] = useState<GeocodedPlace[]>([]);
  const [searching, setSearching] = useState(false);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(() => {
      searchRemotePlaces(trimmed, controller.signal)
        .then((items) => {
          if (!controller.signal.aborted) setResults(items);
        })
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  const handleUseGps = async () => {
    const ok = await locateCurrentPosition();
    if (ok) onGpsLocated();
  };

  return (
    <View style={{ gap: 10 }}>
      <ActionButton
        label={locatingGps ? 'Đang xác định vị trí GPS...' : 'Lấy vị trí hiện tại (GPS)'}
        variant="primary"
        fullWidth
        disabled={locatingGps}
        leftIcon={<AppIcon name="locate" size={15} color={colors.buttonPrimaryText} />}
        onPress={handleUseGps}
      />

      {gpsError ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            paddingHorizontal: 12,
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

      {trimmed.length >= 2 && (searching || results.length > 0) ? (
        <View
          style={{
            padding: 12,
            borderRadius: 14,
            backgroundColor: colors.cardInner,
            borderWidth: 1,
            borderColor: colors.accentVioletBorder,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentViolet }}>
              {searching ? 'Đang tìm địa điểm mở rộng...' : `Kết quả mở rộng (${results.length})`}
            </Text>
            <StatusPill label="Bản đồ & Tọa độ" tone="violet" small />
          </View>

          {results.map((place) => (
            <Pressable
              key={place.id}
              onPress={() => onSelectPlace(place)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                paddingHorizontal: 11,
                paddingVertical: 9,
                borderRadius: 12,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                opacity: pressed ? 0.82 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
                  {place.name}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                  {place.province} · {place.lat.toFixed(4)}, {place.lng.toFixed(4)}
                  {place.elevation > 0 ? ` · ${place.elevation} m` : ''}
                </Text>
              </View>
              <StatusPill label={place.source === 'coords' ? 'GPS' : 'Chọn'} tone="cyan" small />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
