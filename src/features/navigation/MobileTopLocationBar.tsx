import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { filterSpots } from '../../data/spots';
import { GeocodedPlace, searchRemotePlaces } from '../../services/locationClient';
import { useAppState } from '../../state/AppStateContext';
import { MobileLocationDropdown } from './MobileLocationDropdown';

type PanelMode = 'closed' | 'saved' | 'search';

export function MobileTopLocationBar() {
  const { colors } = useTheme();
  const { spots, selectedSpot, selectSpot, selectGeocodedPlace, setMobileTab, locatingGps, locateCurrentPosition } =
    useAppState();

  const [panelMode, setPanelMode] = useState<PanelMode>('closed');
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState<GeocodedPlace[]>([]);
  const [searching, setSearching] = useState(false);

  const searchBarAnim = useRef(new Animated.Value(0)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<React.ComponentRef<typeof TextInput> | null>(null);
  const useNative = Platform.OS !== 'web';

  const savedSpots = spots.filter(
    (s) => s.savedSizeMb !== null || s.isFavorite || s.id === 'gps-current' || s.id.startsWith('search-')
  );
  const trimmed = query.trim();
  const localMatches = trimmed ? filterSpots(spots, trimmed, 'all').slice(0, 6) : savedSpots;

  useEffect(() => {
    if (panelMode !== 'search' || trimmed.length < 2) {
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
  }, [panelMode, trimmed]);

  const animateDropdown = (toVal: number, onDone?: () => void) => {
    Animated.spring(dropdownAnim, { toValue: toVal, damping: 16, stiffness: 260, mass: 0.68, useNativeDriver: useNative }).start(onDone);
  };

  const openSavedPicker = () => {
    if (panelMode === 'saved') {
      animateDropdown(0, () => setPanelMode('closed'));
      return;
    }
    searchBarAnim.setValue(0);
    dropdownAnim.setValue(0);
    setPanelMode('saved');
    animateDropdown(1);
  };

  const openSearchBar = () => {
    searchBarAnim.setValue(0);
    dropdownAnim.setValue(0);
    setPanelMode('search');
    Animated.parallel([
      Animated.spring(searchBarAnim, { toValue: 1, damping: 14, stiffness: 320, mass: 0.65, useNativeDriver: useNative }),
      Animated.spring(dropdownAnim, { toValue: 1, damping: 16, stiffness: 260, mass: 0.68, useNativeDriver: useNative }),
    ]).start();
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  const closeWithBounce = (clearQuery = false) => {
    inputRef.current?.blur();
    Animated.parallel([
      Animated.timing(searchBarAnim, { toValue: 0, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: useNative }),
      Animated.timing(dropdownAnim, { toValue: 0, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: useNative }),
    ]).start(() => {
      setPanelMode('closed');
      if (clearQuery) setQuery('');
    });
  };

  const handlePickSpot = (spotId: string) => {
    selectSpot(spotId);
    closeWithBounce(panelMode === 'search');
  };

  const handlePickRemote = async (place: GeocodedPlace) => {
    await selectGeocodedPlace(place);
    closeWithBounce(true);
  };

  return (
    <View style={{ position: 'relative', zIndex: 60 }}>
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: colors.bg,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
        }}
      >
        <View style={{ position: 'relative', minHeight: 42, justifyContent: 'center' }}>
          <Animated.View
            pointerEvents={panelMode === 'search' ? 'none' : 'auto'}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              opacity: searchBarAnim.interpolate({ inputRange: [0, 0.65], outputRange: [1, 0], extrapolate: 'clamp' }),
              transform: [{ scale: searchBarAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.94] }) }],
            }}
          >
            <Pressable
              onPress={openSavedPicker}
              accessibilityLabel="Chọn nhanh địa điểm đã lưu"
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
                borderColor: panelMode === 'saved' ? colors.accentCyanBorder : colors.borderSubtle,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
                <AppIcon name="map-pin" size={14} color={colors.accentCyan} />
                <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary, flexShrink: 1 }}>
                  {selectedSpot.name} · Bortle {selectedSpot.bortle}
                </Text>
              </View>
              <AppIcon name={panelMode === 'saved' ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textSecondary} />
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
              onPress={openSearchBar}
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
          </Animated.View>

          {panelMode === 'search' ? (
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 14,
                borderRadius: 999,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.accentCyanBorder,
                opacity: searchBarAnim,
                transform: [
                  { scale: searchBarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }) },
                  { translateX: searchBarAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) },
                ],
              }}
            >
              <AppIcon name="search" size={16} color={colors.accentCyan} />
              <TextInput
                ref={inputRef}
                value={query}
                onChangeText={setQuery}
                placeholder="Tìm địa điểm, tỉnh thành, GPS..."
                placeholderTextColor={colors.textMuted}
                style={{ flex: 1, fontSize: 16, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textPrimary, paddingVertical: 1 }}
              />
              <Pressable onPress={() => closeWithBounce(true)} accessibilityLabel="Đóng tìm kiếm" hitSlop={8}>
                <AppIcon name="x" size={16} color={colors.textSecondary} />
              </Pressable>
            </Animated.View>
          ) : null}
        </View>
      </View>

      {panelMode !== 'closed' ? (
        <MobileLocationDropdown
          panelMode={panelMode}
          dropdownAnim={dropdownAnim}
          savedCount={savedSpots.length}
          selectedSpotId={selectedSpot.id}
          localMatches={localMatches}
          remoteResults={remoteResults}
          trimmedQuery={trimmed}
          searching={searching}
          onClose={() => closeWithBounce(panelMode === 'search')}
          onOpenAllSpots={() => { closeWithBounce(false); setMobileTab('spots'); }}
          onSelectSpot={handlePickSpot}
          onSelectRemote={(place) => { void handlePickRemote(place); }}
        />
      ) : null}
    </View>
  );
}
