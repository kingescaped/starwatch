import React from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { StarWatchLogo } from '../../design-system/icons/StarWatchLogo';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { AboutLegalSection } from './AboutLegalSection';
import { ModalShell } from './ModalShell';

interface AboutOverlayProps {
  isMobileView?: boolean;
}

export function AboutOverlay({ isMobileView = false }: AboutOverlayProps) {
  const { mode, colors } = useTheme();
  const { closeOverlay, openOverlay, closeMobileSubScreen } = useAppState();

  return (
    <ModalShell
      title="Thông Tin Ứng Dụng"
      subtitle="Phiên bản, tác giả & thông tin pháp lý StarWatch"
      width={MODAL_WIDTHS.compact}
      onClose={closeOverlay}
      backLabel={isMobileView ? 'Tài khoản' : 'Cài đặt'}
      onBack={isMobileView ? closeMobileSubScreen : () => openOverlay('settings')}
      headerRight={!isMobileView ? <StatusPill label="Phiên bản 1.2.0" tone="cyan" small mono /> : undefined}
      isMobileView={isMobileView}
    >

      <View
        style={{
          padding: 18,
          borderRadius: 18,
          backgroundColor: colors.cardInner,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          alignItems: 'center',
          gap: 10,
        }}
      >
        <StarWatchLogo size={48} mode={mode} />
        <View style={{ alignItems: 'center', gap: 2 }}>
          <Text style={{ fontSize: 18, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            StarWatch
          </Text>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            Chạm vào Vũ Trụ · Bắt trọn Khoảnh Khắc Bầu Trời
          </Text>
        </View>

        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 10,
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 999,
              backgroundColor: colors.accentCyanBg,
              borderWidth: 1,
              borderColor: colors.accentCyanBorder,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentCyan }}>
              QV
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
              Tác giả: Quang Vo
            </Text>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
              Creator & Lead Astronomy Dev
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() => Linking.openURL('mailto:kingescaped.dev@gmail.com')}
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppIcon name="mail" size={14} color={colors.accentRose} />
            <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
              Gmail:
            </Text>
          </View>
          <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textPrimary }}>
            kingescaped.dev@gmail.com
          </Text>
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL('https://t.me/kingescaped')}
          style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AppIcon name="send" size={14} color={colors.accentCyan} />
            <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
              Telegram:
            </Text>
          </View>
          <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textPrimary }}>
            @kingescaped
          </Text>
        </Pressable>
      </View>

      <AboutLegalSection />

      <Text
        style={{
          textAlign: 'center',
          fontSize: 11,
          fontFamily: FONT_FAMILIES.monoRegular,
          color: colors.textMuted,
          paddingTop: 4,
        }}
      >
        © StarWatch · LVQ Std
      </Text>
    </ModalShell>
  );
}
