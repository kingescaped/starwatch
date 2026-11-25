import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { filterSpots } from '../../data/spots';
import { GeocodedPlace, searchRemotePlaces } from '../../services/locationClient';
import { useAppState } from '../../state/AppStateContext';

export function DesktopInlineSearch() {
  const { colors } = useTheme();
  const { spots, selectedSpot, selectSpot, selectGeocodedPlace, locateCurrentPosition, locatingGps, openOverlay } =
    useAppState();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [remoteResults, setRemoteResults] = useState<GeocodedPlace[]>([]);
  const [searching, setSearching] = useState(false);

  const inputRef = useRef<React.ComponentRef<typeof TextInput> | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && e.target instanceof Node && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!open || trimmed.length < 2) {
      setRemoteResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(() => {
      searchRemotePlaces(trimmed, controller.signal)
        .then((items) => { if (!controller.signal.aborted) setRemoteResults(items); })
        .catch(() => { if (!controller.signal.aborted) setRemoteResults([]); })
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 280);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  const trimmed = query.trim();
  const localMatches = trimmed
    ? filterSpots(spots, trimmed, 'all').slice(0, 6)
    : spots.filter((s) => s.savedSizeMb !== null || s.isFavorite).slice(0, 6);

  const handleSelectSpot = (spotId: string) => {
    selectSpot(spotId);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleSelectRemote = async (place: GeocodedPlace) => {
    await selectGeocodedPlace(place);
    setQuery(place.name);
    setOpen(false);
    inputRef.current?.blur();
  };

  const pillContent = (
    <View style={{ position: 'relative', zIndex: 100 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: 248,
          height: 36,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: open ? colors.accentCyanBorder : colors.borderSubtle,
          gap: 8,
        }}
      >
        <AppIcon name="search" size={14} color={open ? colors.accentCyan : colors.textMuted} />
        <TextInput
          ref={inputRef}
          value={query}
          onFocus={() => setOpen(true)}
          onChangeText={(text) => {
            setQuery(text);
            if (!open) setOpen(true);
          }}
          placeholder="Tìm điểm, tỉnh thành, GPS..."
          placeholderTextColor={colors.textMuted}
          style={{
            flex: 1,
            fontSize: 12,
            fontFamily: FONT_FAMILIES.sansRegular,
            color: colors.textPrimary,
            paddingVertical: 2,
          }}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Xóa từ khóa">
            <AppIcon name="x" size={13} color={colors.textMuted} />
          </Pressable>
        ) : (
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textMuted }}>
            ⌘ K
          </Text>
        )}
      </View>

      {open ? (
        <View
          style={{
            position: 'absolute',
            top: 44,
            left: 0,
            width: 360,
            maxHeight: 420,
            borderRadius: 16,
            backgroundColor: colors.modalBg,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            padding: 12,
            gap: 10,
            zIndex: 1200,
            shadowColor: colors.bg,
            shadowOpacity: 0.45,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <Pressable
              disabled={locatingGps}
              onPress={async () => {
                const ok = await locateCurrentPosition();
                if (ok) setOpen(false);
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: colors.accentCyanBg,
                borderWidth: 1,
                borderColor: colors.accentCyanBorder,
                opacity: locatingGps ? 0.5 : pressed ? 0.8 : 1,
              })}
            >
              <AppIcon name="locate" size={13} color={colors.accentCyan} />
              <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentCyan }}>
                {locatingGps ? 'Đang định vị...' : 'Vị trí hiện tại (GPS)'}
              </Text>
            </Pressable>

            <Pressable onPress={() => { setOpen(false); openOverlay('spots'); }} hitSlop={6}>
              <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>
                Tất cả điểm →
              </Text>
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 330 }} contentContainerStyle={{ gap: 6 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textMuted, letterSpacing: 0.5 }}>
              {trimmed ? `ĐIỂM ĐÃ LƯU KHỚP (${localMatches.length})` : 'ĐIỂM ĐÃ LƯU & YÊU THÍCH'}
            </Text>
            {localMatches.map((spot) => {
              const active = spot.id === selectedSpot.id;
              return (
                <Pressable
                  key={spot.id}
                  onPress={() => handleSelectSpot(spot.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 11,
                    backgroundColor: active ? colors.pillActiveBg : colors.cardInner,
                    borderWidth: 1,
                    borderColor: active ? colors.accentCyanBorder : colors.borderSubtle,
                    opacity: pressed ? 0.82 : 1,
                  })}
                >
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text numberOfLines={1} style={{ fontSize: 12.5, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
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

            {trimmed.length >= 2 ? (
              <View style={{ gap: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentViolet, letterSpacing: 0.5 }}>
                  {searching ? 'ĐANG TÌM ĐỊA DANH MỞ RỘNG...' : `KẾT QUẢ BẢN ĐỒ (${remoteResults.length})`}
                </Text>
                {remoteResults.map((place) => (
                  <Pressable
                    key={place.id}
                    onPress={() => { void handleSelectRemote(place); }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderRadius: 11,
                      backgroundColor: colors.cardInner,
                      borderWidth: 1,
                      borderColor: colors.accentVioletBorder,
                      opacity: pressed ? 0.82 : 1,
                    })}
                  >
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text numberOfLines={1} style={{ fontSize: 12.5, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
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
        </View>
      ) : null}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <div ref={wrapRef} style={{ position: 'relative', zIndex: 100 }}>
        {pillContent}
      </div>
    );
  }
  return pillContent;
}
