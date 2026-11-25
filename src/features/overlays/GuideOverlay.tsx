import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { HoldToConfirmButton } from '../../design-system/primitives/HoldToConfirmButton';
import { useAppState } from '../../state/AppStateContext';
import { GuideTab } from '../../state/types';
import { ModalShell } from './ModalShell';

const GUIDE_TABS: { id: GuideTab; label: string }[] = [
  { id: 'formulas', label: 'Công thức điểm' },
  { id: 'clouds', label: 'Phân tầng mây' },
  { id: 'dew', label: 'Đọng sương Lens' },
  { id: 'bortle', label: 'Thang đo Bortle 1–9' },
];

interface GuideOverlayProps {
  isMobileView?: boolean;
}

export function GuideOverlay({ isMobileView = false }: GuideOverlayProps) {
  const { colors } = useTheme();
  const { guideTab, setGuideTab, selectedSpot, closeOverlay, setMobileTab, showToast } =
    useAppState();

  const handleConfirmed = () => {
    showToast('Đã xác nhận hướng dẫn quan sát & thang Bortle!', 'success');
    if (isMobileView) setMobileTab('observe');
    else closeOverlay();
  };

  return (
    <ModalShell
      title={isMobileView ? 'Hướng Dẫn & Bortle 1–9' : 'Hướng Dẫn Sử Dụng & Thang Đo Bortle'}
      subtitle={
        isMobileView
          ? 'Công thức điểm chụp & so sánh ô nhiễm sáng · Nhấn giữ nút dưới để đóng'
          : 'Giải thích công thức điểm chụp, tầng mây & cảnh báo đọng sương · Nhấn giữ nút dưới để đóng'
      }
      width={MODAL_WIDTHS.wide}
      onClose={closeOverlay}
      isMobileView={isMobileView}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {GUIDE_TABS.map((t) => (
          <StatusPill
            key={t.id}
            label={t.label}
            tone={guideTab === t.id ? 'cyan' : 'neutral'}
            onPress={() => setGuideTab(t.id)}
          />
        ))}
      </View>

      <View style={{ flexDirection: isMobileView ? 'column' : 'row', gap: 10 }}>
        <GuideFormulaCard
          title={`Điểm Ngân Hà (${selectedSpot.milkyWayScore})`}
          description="45% Mây thấp/cao + 30% Trăng & độ tối Bortle + 25% Độ cao Sgr A*"
          accent={colors.accentCyan}
          bg={colors.accentCyanBg}
          border={guideTab === 'formulas' ? colors.accentCyanBorder : colors.borderSubtle}
          isMobileView={isMobileView}
        />
        <GuideFormulaCard
          title={`Điểm Ráng Chiều (${selectedSpot.twilightScore})`}
          description="Tối ưu mây tầng cao 30–60% phản xạ ánh nắng chân trời Tây"
          accent={colors.accentAmber}
          bg={colors.accentAmberBg}
          border={colors.accentAmberBorder}
          isMobileView={isMobileView}
        />
        <GuideFormulaCard
          title={`Điểm Săn Mây (${selectedSpot.cloudSeaScore})`}
          description="Mây thấp > 65% tại thung lũng + điểm đỉnh > 1,500m & gió < 12 km/h"
          accent={colors.accentViolet}
          bg={colors.accentVioletBg}
          border={colors.accentVioletBorder}
          isMobileView={isMobileView}
        />
      </View>

      <View style={{ flexDirection: isMobileView ? 'column' : 'row', gap: 10 }}>
        <View
          style={{
            flex: isMobileView ? undefined : 1,
            padding: 14,
            borderRadius: 14,
            backgroundColor: colors.cardInner,
            borderWidth: 1,
            borderColor: guideTab === 'clouds' ? colors.accentCyanBorder : colors.borderSubtle,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            Phân tầng mây (Cao / Trung / Thấp)
          </Text>
          <Text style={{ fontSize: 12, lineHeight: 18, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            Mây cao (&gt;6km) làm mờ sao; Mây thấp (&lt;2km) tạo biển mây đẹp khi đứng trên đỉnh núi cao.
          </Text>
        </View>

        <View
          style={{
            flex: isMobileView ? undefined : 1,
            padding: 14,
            borderRadius: 14,
            backgroundColor: colors.accentRoseBg,
            borderWidth: 1,
            borderColor: colors.accentRoseBorder,
            gap: 6,
          }}
        >
          <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.accentRose }}>
            ▲ Cảnh báo Đọng Sương Lens (ΔT ≤ 2.5°C)
          </Text>
          <Text style={{ fontSize: 12, lineHeight: 18, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            Khi chênh lệch Nhiệt độ – Điểm Sương ≤ 2.5°C, hơi nước ngưng tụ lên thấu kính — bật Dew Heater ngay.
          </Text>
        </View>
      </View>

      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: colors.cardInner,
          borderWidth: 1,
          borderColor: guideTab === 'bortle' ? colors.accentCyanBorder : colors.borderSubtle,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: isMobileView ? 'column' : 'row', alignItems: isMobileView ? 'flex-start' : 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            Thang đo ô nhiễm sáng Bortle (Class 1 – 9)
          </Text>
          <StatusPill
            label={`Đang so sánh: Class ${selectedSpot.bortle.toFixed(1)} (${selectedSpot.name})`}
            tone="emerald"
            small
            mono
          />
        </View>

        <View style={{ height: 14, justifyContent: 'center' }}>
          <LinearGradient
            colors={['#10B981', '#84CC16', '#FBBF24', '#F97316', '#F43F5E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: 8, borderRadius: 999 }}
          />
          <View
            style={{
              position: 'absolute',
              left: `${Math.min(92, Math.max(4, ((selectedSpot.bortle - 1) / 8) * 100))}%`,
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: '#FFFFFF',
              borderWidth: 3,
              borderColor: colors.accentEmerald,
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {(isMobileView
            ? ['1 · Tối', '3', '5 · TB', '7', '9 · Đô thị']
            : ['1 · Trời đen', '2', '3', '4 · Tà Xùa', '5', '6', '7', '8', '9 · Nội đô']
          ).map((mark) => (
            <Text key={mark} style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textMuted }}>
              {mark}
            </Text>
          ))}
        </View>
      </View>

      <HoldToConfirmButton
        label="Nhấn giữ 2 giây · Đã hiểu & Đóng hướng dẫn"
        onConfirmed={handleConfirmed}
      />
    </ModalShell>
  );
}

function GuideFormulaCard({
  title,
  description,
  accent,
  bg,
  border,
  isMobileView,
}: {
  title: string;
  description: string;
  accent: string;
  bg: string;
  border: string;
  isMobileView: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: isMobileView ? undefined : 1,
        padding: 14,
        borderRadius: 14,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: accent }}>
        {title}
      </Text>
      <Text style={{ fontSize: 11, lineHeight: 17, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
        {description}
      </Text>
    </View>
  );
}
