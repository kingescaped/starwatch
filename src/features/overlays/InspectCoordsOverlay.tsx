import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { useAppState } from '../../state/AppStateContext';
import { ModalShell } from './ModalShell';

interface InspectCoordsOverlayProps {
  isMobileView?: boolean;
}

export function InspectCoordsOverlay({ isMobileView = false }: InspectCoordsOverlayProps) {
  const { colors } = useTheme();
  const { inspectedCoords, selectedSpot, closeOverlay, closeMobileSubScreen, showToast } =
    useAppState();

  const handleConfirmSpot = () => {
    showToast(`Đã chọn tọa độ ${inspectedCoords.lat}°N, ${inspectedCoords.lng}°E làm điểm săn ảnh.`, 'success');
    if (isMobileView) closeMobileSubScreen();
    else closeOverlay();
  };

  return (
    <ModalShell
      title="Soi Tọa Độ Bản Đồ"
      subtitle="Ước tính Bortle & điều kiện bầu trời tức thời"
      width={MODAL_WIDTHS.compact}
      onClose={closeOverlay}
      backLabel={isMobileView ? 'Quan sát' : undefined}
      onBack={isMobileView ? closeMobileSubScreen : undefined}
      isMobileView={isMobileView}
    >
      <View style={{ gap: 4 }}>
        <Text style={{ fontSize: 15, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
          {inspectedCoords.name}
        </Text>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoMedium, color: colors.accentCyan }}>
          {inspectedCoords.lat.toFixed(4)}°N, {inspectedCoords.lng.toFixed(4)}°E · Độ cao{' '}
          {selectedSpot.elevation.toLocaleString('en-US')} m
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.cardInner,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
            Bortle
          </Text>
          <Text style={{ fontSize: 14, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentAmber }}>
            {inspectedCoords.bortle.toFixed(1)} · Tối
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.cardInner,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
            SQM
          </Text>
          <Text style={{ fontSize: 14, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentCyan }}>
            {inspectedCoords.sqm} mag
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            backgroundColor: colors.cardInner,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            gap: 4,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
            Mây phủ
          </Text>
          <Text style={{ fontSize: 14, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentEmerald }}>
            {inspectedCoords.cloud}%
          </Text>
        </View>
      </View>

      <ActionButton
        label="Chọn làm điểm săn ảnh"
        variant={isMobileView ? 'secondary' : 'primary'}
        fullWidth
        onPress={handleConfirmSpot}
      />
    </ModalShell>
  );
}
