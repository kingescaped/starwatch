import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { ModalShell } from './ModalShell';

const LANDSCAPE_TAGS = ['Biển mây', 'Ngân Hà', 'Ráng chiều', 'Đồi núi', 'Ven biển'];

interface ContributeOverlayProps {
  isMobileView?: boolean;
}

export function ContributeOverlay({ isMobileView = false }: ContributeOverlayProps) {
  const { colors } = useTheme();
  const { addSpot, selectedSpot, closeOverlay, closeMobileSubScreen, setMobileTab, showToast } =
    useAppState();

  const [name, setName] = useState('');
  const [coords, setCoords] = useState(`${selectedSpot.lat}, ${selectedSpot.lng}`);
  const [elevation, setElevation] = useState(`${selectedSpot.elevation} m`);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Biển mây', 'Ngân Hà']);
  const [safetyNote, setSafetyNote] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const cleanName = name.trim() || 'Đỉnh Lảo Thẩn · Y Tý';
    const [latStr, lngStr] = coords.split(',').map((s) => s.trim());
    const lat = Number.parseFloat(latStr) || 22.6134;
    const lng = Number.parseFloat(lngStr) || 103.6215;
    const elev = Number.parseInt(elevation.replace(/[^\d]/g, ''), 10) || 1865;

    addSpot({
      name: cleanName,
      lat,
      lng,
      elevation: elev,
      tags: selectedTags,
      safetyNote:
        safetyNote.trim() || 'Đường bê tông dốc nhẹ, xe máy/SUV vào được, có sóng 4G Viettel.',
    });

    if (isMobileView) {
      closeMobileSubScreen();
      setMobileTab('observe');
    } else {
      closeOverlay();
    }
  };

  return (
    <ModalShell
      title={isMobileView ? 'Đóng Góp Điểm Mới' : 'Đóng Góp Điểm Săn Ảnh Mới'}
      subtitle={
        isMobileView
          ? 'Lưu vào danh bạ cộng đồng StarWatch'
          : 'Chia sẻ điểm trời tối & săn mây cho cộng đồng StarWatch Việt Nam'
      }
      width={MODAL_WIDTHS.contribute}
      onClose={closeOverlay}
      backLabel={isMobileView ? 'Địa điểm' : undefined}
      onBack={isMobileView ? closeMobileSubScreen : undefined}
      isMobileView={isMobileView}
    >
      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
          Tên địa điểm săn ảnh *
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="VD: Đỉnh Lảo Thẩn, Y Tý, Lào Cai..."
          placeholderTextColor={colors.textMuted}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 11,
            borderRadius: 12,
            backgroundColor: colors.inputBg,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            fontSize: 13,
            fontFamily: FONT_FAMILIES.sansRegular,
            color: colors.textPrimary,
          }}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
          Tọa độ GPS (Vĩ độ, Kinh độ)
        </Text>
        <View style={{ flexDirection: isMobileView ? 'column' : 'row', gap: 10 }}>
          <TextInput
            value={coords}
            onChangeText={setCoords}
            placeholder="21.2981, 104.4652"
            placeholderTextColor={colors.textMuted}
            style={{
              flex: isMobileView ? undefined : 1,
              paddingHorizontal: 14,
              paddingVertical: 11,
              borderRadius: 12,
              backgroundColor: colors.inputBg,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
              fontSize: 13,
              fontFamily: FONT_FAMILIES.monoMedium,
              color: colors.textPrimary,
            }}
          />
          <ActionButton
            label="⊙ Lấy tọa độ từ bản đồ"
            variant="secondary"
            onPress={() => {
              setCoords(`${selectedSpot.lat}, ${selectedSpot.lng}`);
              showToast('Đã đồng bộ tọa độ từ ghim bản đồ GIS hiện tại.', 'info');
            }}
          />
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
          Độ cao so với mực nước biển (m)
        </Text>
        <TextInput
          value={elevation}
          onChangeText={setElevation}
          placeholder="1,865 m"
          placeholderTextColor={colors.textMuted}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 11,
            borderRadius: 12,
            backgroundColor: colors.inputBg,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            fontSize: 13,
            fontFamily: FONT_FAMILIES.monoMedium,
            color: colors.textPrimary,
          }}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
          Đặc trưng cảnh quan (chọn nhiều)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {LANDSCAPE_TAGS.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <StatusPill
                key={tag}
                label={tag}
                tone={active ? 'cyan' : 'neutral'}
                onPress={() => toggleTag(tag)}
              />
            );
          })}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
          Ghi chú an toàn & đường tiếp cận
        </Text>
        <TextInput
          value={safetyNote}
          onChangeText={setSafetyNote}
          placeholder="Đường bê tông dốc nhẹ, xe máy/SUV vào được, có sóng 4G Viettel..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={{
            paddingHorizontal: 14,
            paddingVertical: 11,
            borderRadius: 12,
            backgroundColor: colors.inputBg,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            fontSize: 13,
            fontFamily: FONT_FAMILIES.sansRegular,
            color: colors.textPrimary,
            minHeight: 54,
          }}
        />
      </View>

      <Pressable
        onPress={() => showToast('Đã gắn ảnh hiện trường mẫu (JPG · 2.8 MB).', 'info')}
        style={{
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.borderStrong,
          borderRadius: 14,
          padding: 16,
          alignItems: 'center',
          gap: 4,
          backgroundColor: colors.cardInner,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AppIcon name="upload" size={14} color={colors.accentCyan} />
          <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.accentCyan }}>
            Kéo thả hoặc chọn ảnh hiện trường (JPG/PNG · tối đa 10MB)
          </Text>
        </View>
        <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>
          Gợi ý: ảnh góc rộng thấy đường chân trời Đông/Nam
        </Text>
      </Pressable>

      <ActionButton label="Gửi đóng góp" variant="primary" fullWidth onPress={handleSubmit} />
    </ModalShell>
  );
}
