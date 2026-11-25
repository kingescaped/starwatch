import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import {
  CAMERA_BODY_PRESETS,
  LENS_PRESETS,
  previewCameraGearLocally,
  SENSOR_LABELS,
  type CameraGearProfile,
} from '../../data/cameraCatalog';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { useAppState } from '../../state/AppStateContext';
import type { SensorType } from '../../state/types';
import { ModalShell } from './ModalShell';

interface CameraProfileOverlayProps {
  isMobileView?: boolean;
}

const SENSORS: SensorType[] = ['fullFrame', 'apsc', 'm43', 'phone'];

export function CameraProfileOverlay({ isMobileView = false }: CameraProfileOverlayProps) {
  const { colors } = useTheme();
  const { cameraGear, saveCameraGear, openOverlay, closeOverlay, closeMobileSubScreen } = useAppState();

  const [draft, setDraft] = useState<CameraGearProfile>(cameraGear);
  const [mpText, setMpText] = useState(String(cameraGear.megapixels));
  const [focalText, setFocalText] = useState(String(cameraGear.focalLengthMm));
  const [apertureText, setApertureText] = useState(String(cameraGear.aperture));
  const [saving, setSaving] = useState(false);

  const goBack = () => {
    if (isMobileView) closeMobileSubScreen();
    else openOverlay('settings');
  };

  const parsedGear: CameraGearProfile = {
    ...draft,
    megapixels: Math.max(8, Number(mpText) || draft.megapixels),
    focalLengthMm: Math.max(4, Number(focalText) || draft.focalLengthMm),
    aperture: Math.max(1.0, Number(apertureText) || draft.aperture),
  };
  const preview = previewCameraGearLocally(parsedGear);

  const handleSave = async () => {
    setSaving(true);
    await saveCameraGear(parsedGear);
    setSaving(false);
    goBack();
  };

  const inputStyle = {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 12,
    fontFamily: FONT_FAMILIES.monoMedium,
    color: colors.textPrimary,
  };

  return (
    <ModalShell
      title="Hồ Sơ Máy Ảnh & Ống Kính"
      subtitle="Chọn mẫu thiết bị có sẵn hoặc tự nhập thông số riêng rồi lưu"
      width={MODAL_WIDTHS.compact}
      onClose={closeOverlay}
      backLabel={isMobileView ? 'Tài khoản' : 'Cài đặt'}
      onBack={goBack}
      isMobileView={isMobileView}
    >
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
          1. Chọn nhanh hoặc nhập tên máy ảnh
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CAMERA_BODY_PRESETS.map((preset) => (
            <StatusPill
              key={preset.id}
              label={preset.name}
              tone={draft.cameraName === preset.name ? 'cyan' : 'neutral'}
              small
              onPress={() => {
                setDraft((prev) => ({
                  ...prev,
                  cameraName: preset.name,
                  sensorType: preset.sensorType,
                  megapixels: preset.megapixels,
                  dualIso: preset.dualIso,
                }));
                setMpText(String(preset.megapixels));
              }}
            />
          ))}
        </View>
        <TextInput
          value={draft.cameraName}
          onChangeText={(cameraName) => setDraft((prev) => ({ ...prev, cameraName }))}
          placeholder="Nhập tên máy ảnh (VD: Sony A7 IV, Canon R6 II...)"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
          2. Cảm biến & độ phân giải
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {SENSORS.map((sensor) => (
            <StatusPill
              key={sensor}
              label={SENSOR_LABELS[sensor]}
              tone={draft.sensorType === sensor ? 'violet' : 'neutral'}
              small
              onPress={() => setDraft((prev) => ({ ...prev, sensorType: sensor }))}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>Độ phân giải (MP)</Text>
            <TextInput value={mpText} onChangeText={setMpText} keyboardType="numeric" style={inputStyle} />
          </View>
          <View style={{ flex: 1.4, gap: 4 }}>
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>Chuẩn ISO khuyến nghị</Text>
            <TextInput
              value={draft.dualIso}
              onChangeText={(dualIso) => setDraft((prev) => ({ ...prev, dualIso }))}
              placeholder="Dual ISO 3200"
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
            />
          </View>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textSecondary }}>
          3. Chọn nhanh hoặc nhập ống kính
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {LENS_PRESETS.map((lens) => (
            <StatusPill
              key={lens.id}
              label={lens.name}
              tone={draft.lensName === lens.name ? 'cyan' : 'neutral'}
              small
              onPress={() => {
                setDraft((prev) => ({
                  ...prev,
                  lensName: lens.name,
                  focalLengthMm: lens.focalLengthMm,
                  aperture: lens.aperture,
                }));
                setFocalText(String(lens.focalLengthMm));
                setApertureText(String(lens.aperture));
              }}
            />
          ))}
        </View>
        <TextInput
          value={draft.lensName}
          onChangeText={(lensName) => setDraft((prev) => ({ ...prev, lensName }))}
          placeholder="Nhập tên ống kính (VD: Sigma 14mm f/1.4 Art)"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>Tiêu cự (mm)</Text>
            <TextInput value={focalText} onChangeText={setFocalText} keyboardType="numeric" style={inputStyle} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textMuted }}>Khẩu độ tối đa (f/)</Text>
            <TextInput value={apertureText} onChangeText={setApertureText} keyboardType="numeric" style={inputStyle} />
          </View>
        </View>
      </View>

      <View style={{ padding: 12, borderRadius: 14, backgroundColor: colors.accentCyanBg, borderWidth: 1, borderColor: colors.accentCyanBorder, gap: 4 }}>
        <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentCyan }}>
          XEM TRƯỚC TÍNH TOÁN NPF & QUY TẮC 500
        </Text>
        <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
          {preview.summaryTitle}
        </Text>
        <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.monoRegular, color: colors.textSecondary }}>
          {preview.summaryLine} · Quy tắc 500: {preview.rule500Seconds}s · Pixel {preview.pixelPitchUm}μm
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <ActionButton label="Hủy" variant="ghost" fullWidth onPress={goBack} />
        </View>
        <View style={{ flex: 1.5 }}>
          <ActionButton
            label={saving ? 'Đang lưu...' : 'Lưu hồ sơ máy ảnh'}
            variant="primary"
            fullWidth
            onPress={handleSave}
          />
        </View>
      </View>
    </ModalShell>
  );
}
