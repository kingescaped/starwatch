import React, { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { ThemeMode } from '../../design-system/tokens/colors';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { StarWatchLogo } from '../../design-system/icons/StarWatchLogo';
import { AppIcon, IconName } from '../../design-system/icons/AppIcon';
import { TierBadge } from '../../design-system/primitives/TierBadge';
import { useAppState } from '../../state/AppStateContext';
import { OverlayId } from '../../state/types';
import { playUiSound } from '../../utils/soundEngine';

interface NavTabItem {
  id: OverlayId;
  label: string;
}

const NAV_TABS: NavTabItem[] = [
  { id: null, label: 'Bản đồ & Vòm trời' },
  { id: 'spots', label: 'Điểm săn ảnh' },
  { id: 'contribute', label: 'Đóng góp' },
  { id: 'calendar', label: 'Lịch thiên văn' },
  { id: 'guide', label: 'Hướng dẫn' },
];

const THEME_BUTTONS: { mode: ThemeMode; icon: IconName; label: string }[] = [
  { mode: 'light', icon: 'sun', label: 'Giao diện Ngày' },
  { mode: 'dark', icon: 'moon', label: 'Giao diện Đêm' },
  { mode: 'red', icon: 'eye', label: 'Giao diện Đỏ' },
];

const THEME_SLOT_STEP = 28 + 2;

export function DesktopHeader() {
  const { mode, setMode, colors } = useTheme();
  const { user, isAdmin, effectivePlan, activeOverlay, openOverlay, closeOverlay, settings, updateSettings, showToast } = useAppState();
  const activeThemeIdx = Math.max(0, THEME_BUTTONS.findIndex((item) => item.mode === mode));
  const themeSlideX = useRef(new Animated.Value(activeThemeIdx * THEME_SLOT_STEP)).current;
  const mountedThemeRef = useRef(false);

  useEffect(() => {
    const target = activeThemeIdx * THEME_SLOT_STEP;
    const reduced =
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!mountedThemeRef.current || reduced) {
      mountedThemeRef.current = true;
      themeSlideX.setValue(target);
      return;
    }
    Animated.spring(themeSlideX, {
      toValue: target,
      damping: 20,
      stiffness: 280,
      mass: 0.72,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [activeThemeIdx, themeSlideX]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openOverlay('spots');
      } else if (e.key === 'Escape') {
        closeOverlay();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openOverlay, closeOverlay]);

  const accountActive = activeOverlay === 'settings' || activeOverlay === 'account' || activeOverlay === 'about';

  return (
    <View
      style={[
        {
          backgroundColor: colors.headerBg,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
          paddingHorizontal: 28,
          height: 60,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        },
        Platform.OS === 'web'
          ? ({ backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)' } as never)
          : null,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Pressable onPress={closeOverlay} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <StarWatchLogo size={30} mode={mode} />
          <Text style={{ fontSize: 17, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary, letterSpacing: -0.3 }}>
            StarWatch
          </Text>
        </Pressable>

        <Pressable
          onPress={() => openOverlay('spots')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 240,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppIcon name="search" size={14} color={colors.textMuted} />
            <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
              Tìm điểm săn ảnh...
            </Text>
          </View>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textMuted }}>
            ⌘ K
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 22 }}>
        {NAV_TABS.map((tab) => {
          const isActive = activeOverlay === tab.id;
          return (
            <Pressable
              key={tab.label}
              onPress={() => (tab.id === null ? closeOverlay() : openOverlay(tab.id))}
              style={{
                paddingVertical: 18,
                borderBottomWidth: 2,
                borderBottomColor: isActive ? colors.accentCyan : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: isActive ? FONT_FAMILIES.sansSemiBold : FONT_FAMILIES.sansMedium,
                  color: isActive ? colors.accentCyan : colors.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable
          accessibilityLabel={settings.soundEnabled ? 'Tắt âm thanh giao diện' : 'Bật âm thanh giao diện'}
          onPress={() => {
            const next = !settings.soundEnabled;
            updateSettings({ soundEnabled: next });
            if (next) playUiSound('select');
            showToast(next ? 'Đã bật hiệu ứng âm thanh UI.' : 'Đã tắt hiệu ứng âm thanh UI.', 'info');
          }}
          style={({ pressed }) => ({
            width: 34,
            height: 34,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: settings.soundEnabled ? colors.accentCyanBorder : colors.borderSubtle,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <AppIcon
            name={settings.soundEnabled ? 'volume-2' : 'volume-x'}
            size={15}
            color={settings.soundEnabled ? colors.accentCyan : colors.textMuted}
          />
        </Pressable>

        <View
          style={{
            position: 'relative',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            padding: 3,
            borderRadius: 999,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 3,
              top: 3,
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: colors.pillActiveBg,
              borderWidth: 1,
              borderColor: colors.accentCyanBorder,
              transform: [{ translateX: themeSlideX }],
            }}
          />
          {THEME_BUTTONS.map((item) => {
            const active = mode === item.mode;
            return (
              <Pressable
                key={item.mode}
                accessibilityLabel={item.label}
                onPress={() => setMode(item.mode)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: 'transparent',
                }}
              >
                <AppIcon name={item.icon} size={14} color={active ? colors.accentCyan : colors.textSecondary} />
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => openOverlay('settings')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            paddingHorizontal: 13,
            paddingVertical: 7,
            borderRadius: 999,
            backgroundColor: accountActive ? colors.pillActiveBg : colors.card,
            borderWidth: 1,
            borderColor: accountActive ? colors.accentCyanBorder : colors.borderSubtle,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 999,
              backgroundColor: colors.accentCyanBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppIcon name="user" size={12} color={colors.accentCyan} />
          </View>
          <Text
            numberOfLines={1}
            style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary, maxWidth: 132 }}
          >
            {user?.displayName?.trim() || 'Tài khoản'}
          </Text>
          {user ? <TierBadge variant={isAdmin ? 'admin' : effectivePlan} size="xs" /> : null}
        </Pressable>
      </View>
    </View>
  );
}
