import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { useAppState } from '../../state/AppStateContext';
import { ModalShell } from './ModalShell';

interface TargetPickerOverlayProps {
  isMobileView?: boolean;
}

export function TargetPickerOverlay({ isMobileView = false }: TargetPickerOverlayProps) {
  const { colors } = useTheme();
  const { targets, selectedTarget, selectTarget, closeOverlay, closeMobileSubScreen } =
    useAppState();

  const handleChoose = (id: string) => {
    selectTarget(id);
    if (isMobileView) closeMobileSubScreen();
    else closeOverlay();
  };

  return (
    <ModalShell
      title="Chọn Mục Tiêu Thiên Thể"
      subtitle="Đồng bộ bản đồ phương vị & Vòm Thiên Đỉnh 360°"
      width={MODAL_WIDTHS.compact}
      onClose={closeOverlay}
      backLabel={isMobileView ? 'Quan sát' : undefined}
      onBack={isMobileView ? closeMobileSubScreen : undefined}
      isMobileView={isMobileView}
    >
      <View style={{ gap: 10 }}>
        {targets.map((target) => {
          const active = target.id === selectedTarget.id;
          return (
            <Pressable
              key={target.id}
              onPress={() => handleChoose(target.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: 14,
                backgroundColor: active ? colors.accentCyanBg : colors.cardInner,
                borderWidth: 1,
                borderColor: active ? colors.accentCyanBorder : colors.borderSubtle,
                gap: 10,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: FONT_FAMILIES.sansBold,
                    color: active ? colors.accentCyan : colors.textPrimary,
                  }}
                >
                  {target.name}
                </Text>
                <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textSecondary }}>
                  {target.description}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: FONT_FAMILIES.sansSemiBold,
                  color: active ? colors.accentCyan : colors.textSecondary,
                }}
              >
                {active ? 'Đang chọn' : target.rating}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ModalShell>
  );
}
