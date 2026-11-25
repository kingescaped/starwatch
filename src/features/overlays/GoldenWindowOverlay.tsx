import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { useAppState } from '../../state/AppStateContext';
import { ModalShell } from './ModalShell';

interface GoldenWindowOverlayProps {
  isMobileView?: boolean;
}

export function GoldenWindowOverlay({ isMobileView = false }: GoldenWindowOverlayProps) {
  const { colors } = useTheme();
  const { selectedSpot, goldenWindows, closeOverlay, closeMobileSubScreen, setMobileTab, openOverlay, setHourIndex, showToast } =
    useAppState();

  const handleScheduleGear = () => {
    setHourIndex(6);
    showToast('Đã đồng bộ timeline tới 00:00 (cửa sổ chụp Ngân Hà tốt nhất).', 'success');
    if (isMobileView) {
      closeMobileSubScreen();
      setMobileTab('observe');
    } else {
      closeOverlay();
    }
  };

  const handleViewCalendar = () => {
    if (isMobileView) {
      closeMobileSubScreen();
      setMobileTab('calendar');
    } else {
      openOverlay('calendar');
    }
  };

  return (
    <ModalShell
      title="Khung Giờ Vàng Đêm Nay"
      subtitle={`${selectedSpot.name} · Bortle ${selectedSpot.bortle} · Trăng lặn 20:15 · Trời quang ${selectedSpot.overallScore}%`}
      width={MODAL_WIDTHS.goldenWindow}
      onClose={closeOverlay}
      backLabel={isMobileView ? 'Lịch trời' : undefined}
      onBack={isMobileView ? closeMobileSubScreen : undefined}
      isMobileView={isMobileView}
    >
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: colors.accentCyanBg,
          borderWidth: 1,
          borderColor: colors.accentCyanBorder,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentCyan }}>
            CỬA SỔ ĐẸP NHẤT · NGÂN HÀ SGR A*
          </Text>
          <Text style={{ fontSize: 19, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>
            23:30 – 02:30 (3 giờ liên tục)
          </Text>
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            Mây 4% · Trăng 0% · Độ cao lõi +38° Nam
          </Text>
        </View>
        <StatusPill label="94/100" tone="emerald" mono />
      </View>

      <View style={{ gap: 8 }}>
        {goldenWindows.map((win) => {
          const toneColor =
            win.tone === 'amber'
              ? colors.accentAmber
              : win.tone === 'cyan'
              ? colors.accentCyan
              : win.tone === 'violet'
              ? colors.accentViolet
              : colors.accentEmerald;
          return (
            <View
              key={win.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 13,
                borderRadius: 14,
                backgroundColor: colors.cardInner,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                gap: 10,
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
                  {win.title}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                  {win.subtitle}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoMedium, color: toneColor }}>
                  {win.timeRange}
                </Text>
                <StatusPill label={`${win.score}`} tone={win.tone} small mono />
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <ActionButton label="Lên lịch & Thông số máy" variant="primary" fullWidth onPress={handleScheduleGear} />
        </View>
        <View style={{ flex: 1 }}>
          <ActionButton label="Xem dự báo chi tiết →" variant="secondary" fullWidth onPress={handleViewCalendar} />
        </View>
      </View>
    </ModalShell>
  );
}
