import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { ThemeColors, ThemeMode } from '../../design-system/tokens/colors';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { MODAL_WIDTHS } from '../../design-system/tokens/spacing';
import { SegmentedControl, SegmentedTone } from '../../design-system/primitives/SegmentedControl';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { TierBadge } from '../../design-system/primitives/TierBadge';
import { ActionButton } from '../../design-system/primitives/ActionButton';
import { NeonShimmerButton } from '../../design-system/primitives/NeonShimmerButton';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { formatPlanExpiryLabel } from '../../utils/accessPolicy';
import { ModalShell } from './ModalShell';

interface SettingsOverlayProps {
  isMobileView?: boolean;
}

const DEW_STEPS = [1.5, 2.0, 2.5, 3.0, 3.5];

function SwitchSettingCard({
  title,
  subtitle,
  value,
  onValueChange,
  trackColor,
  thumbColor,
  colors,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  trackColor: string;
  thumbColor: string;
  colors: ThemeColors;
}) {
  return (
    <View style={[styles.rowCard, { backgroundColor: colors.cardInner, borderColor: colors.borderSubtle }]}>
      <View style={styles.switchTextWrap}>
        <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.switchSub, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.ringTrack, true: trackColor }} thumbColor={thumbColor} />
    </View>
  );
}

function SegmentField<T extends string>({
  label,
  value,
  onChange,
  options,
  tone,
  colors,
}: {
  label: string;
  value: T;
  onChange: (val: T) => void;
  options: { value: T; label: string }[];
  tone?: SegmentedTone;
  colors: ThemeColors;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <SegmentedControl<T> tone={tone} value={value} onChange={onChange} options={options} />
    </View>
  );
}

export function SettingsOverlay({ isMobileView = false }: SettingsOverlayProps) {
  const { mode, setMode, colors } = useTheme();
  const { user, isAdmin, effectivePlan, settings, updateSettings, openOverlay, closeOverlay, openMobileSubScreen, showToast } = useAppState();
  const thumbColor = mode === 'light' ? colors.card : colors.textPrimary;
  const initials = user?.displayName
    ? user.displayName.split(' ').filter(Boolean).slice(-2).map((s) => s[0].toUpperCase()).join('')
    : '?';

  return (
    <ModalShell
      title="Tài Khoản & Cài Đặt"
      subtitle={isMobileView ? 'Hồ sơ săn ảnh, đơn vị đo & cảnh báo trời quang' : 'Hồ sơ săn ảnh, đơn vị đo, lớp bản đồ & thiết bị'}
      width={MODAL_WIDTHS.compact}
      onClose={closeOverlay}
      isMobileView={isMobileView}
    >
      <Pressable
        onPress={() => (isMobileView ? openMobileSubScreen('account') : openOverlay('account'))}
        accessibilityLabel={user ? 'Chỉnh sửa thông tin tài khoản và gói dịch vụ' : 'Đăng nhập hoặc đăng ký tài khoản'}
        style={({ pressed }) => [styles.accountCard, { backgroundColor: colors.accentCyanBg, borderColor: colors.accentCyanBorder, opacity: pressed ? 0.85 : 1 }]}
      >
        <View style={styles.accountLeft}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.card, borderColor: colors.accentCyanBorder }]}>
            <Text style={[styles.avatarText, { color: colors.accentCyan }]}>{initials}</Text>
          </View>
          <View style={styles.accountMeta}>
            <Text numberOfLines={1} style={[styles.accountName, { color: colors.textPrimary }]}>{user ? user.displayName : 'Đăng nhập / Đăng ký'}</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.accountSub,
                {
                  color: user && isAdmin ? colors.accentAmber : colors.textSecondary,
                  fontFamily: user && isAdmin ? FONT_FAMILIES.sansSemiBold : FONT_FAMILIES.sansRegular,
                },
              ]}
            >
              {user ? formatPlanExpiryLabel(user) : 'Đồng bộ hồ sơ & gói dịch vụ'}
            </Text>
            {isMobileView && user ? (
              <View style={styles.mobileBadgeRow}>
                {isAdmin ? <TierBadge variant="admin" size="xs" /> : null}
                <TierBadge variant={effectivePlan} size="xs" />
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.accountRight}>
          {user ? (
            !isMobileView ? (
              <View style={styles.badgeGroup}>
                {isAdmin ? <TierBadge variant="admin" size="xs" /> : null}
                <TierBadge variant={effectivePlan} size={isAdmin ? 'xs' : 'sm'} />
              </View>
            ) : null
          ) : (
            <StatusPill label="KHÁCH" tone="neutral" small mono />
          )}
          <AppIcon name="chevron-right" size={16} color={colors.textSecondary} />
        </View>
      </Pressable>

      <SegmentField<ThemeMode> label="Tùy chỉnh giao diện" tone="solid" value={mode} onChange={setMode} colors={colors} options={[{ value: 'dark', label: 'Đêm' }, { value: 'light', label: 'Ngày' }, { value: 'red', label: 'Đỏ' }]} />
      <SegmentField label="Đơn vị đo lường" value={settings.unitSystem} onChange={(unitSystem) => updateSettings({ unitSystem })} colors={colors} options={[{ value: 'metric', label: '°C · km/h · m' }, { value: 'imperial', label: '°F · mph · ft' }]} />
      <SegmentField label="Lớp bản đồ mặc định" value={settings.defaultMapLayer} onChange={(defaultMapLayer) => updateSettings({ defaultMapLayer })} colors={colors} options={[{ value: 'bortle', label: 'Ô nhiễm Bortle' }, { value: 'cloud', label: 'Mây mô phỏng' }]} />

      <View style={styles.cameraGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Hồ sơ Máy ảnh & Ống kính đã lưu</Text>
        <Pressable
          onPress={() => (isMobileView ? openMobileSubScreen('cameraProfile') : openOverlay('cameraProfile'))}
          accessibilityLabel="Chọn hoặc nhập hồ sơ máy ảnh và ống kính"
          style={({ pressed }) => [styles.cameraCard, { backgroundColor: colors.cardInner, borderColor: colors.borderSubtle, opacity: pressed ? 0.85 : 1 }]}
        >
          <View style={styles.accountMeta}>
            <Text numberOfLines={1} style={[styles.cameraTitle, { color: colors.textPrimary }]}>{settings.cameraProfile}</Text>
            <Text numberOfLines={1} style={[styles.cameraSpecs, { color: colors.textMuted }]}>{settings.cameraSpecs}</Text>
          </View>
          <Text style={[styles.cameraAction, { color: colors.accentCyan }]}>Đổi ▾</Text>
        </Pressable>
      </View>

      <View style={[styles.boxCard, { backgroundColor: colors.accentRoseBg, borderColor: colors.accentRoseBorder }]}>
        <View style={styles.betweenRow}>
          <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Ngưỡng cảnh báo Đọng Sương</Text>
          <Text style={[styles.dewValue, { color: colors.accentRose }]}>{settings.dewThreshold.toFixed(1)}°C</Text>
        </View>
        <SegmentedControl
          tone="rose"
          compact
          mono
          value={String(settings.dewThreshold)}
          onChange={(val) => updateSettings({ dewThreshold: Number(val) })}
          options={DEW_STEPS.map((step) => ({ value: String(step), label: `${step.toFixed(1)}°` }))}
        />
      </View>

      <SwitchSettingCard title="Tự động lưu Offline (Field Cache)" subtitle="Tải trước 48h & bản đồ yêu thích · Đã lưu 24 MB" value={settings.offlineCacheEnabled} onValueChange={(offlineCacheEnabled) => updateSettings({ offlineCacheEnabled })} trackColor={colors.accentEmerald} thumbColor={thumbColor} colors={colors} />
      <SegmentField label="Vị trí khi mở ứng dụng" value={settings.startupLocation} onChange={(startupLocation) => updateSettings({ startupLocation })} colors={colors} options={[{ value: 'gps', label: 'GPS hiện tại' }, { value: 'nearestFavorite', label: 'Điểm yêu thích gần nhất' }]} />
      <SegmentField label="Chuẩn La bàn & Vòm 360°" value={settings.compassReference} onChange={(compassReference) => updateSettings({ compassReference })} colors={colors} options={[{ value: 'trueNorth', label: 'Bắc Thực (True North)' }, { value: 'magnetic', label: 'Bắc Từ (Magnetic)' }]} />

      <View style={[styles.boxCard, { backgroundColor: colors.cardInner, borderColor: colors.borderSubtle }]}>
        <View style={styles.betweenRow}>
          <View style={styles.switchTextWrap}>
            <Text style={[styles.switchTitle, { color: colors.textPrimary }]}>Thông báo Trời Quang (Clear-Sky)</Text>
            <Text style={[styles.switchSub, { color: colors.textMuted }]}>Báo khi điểm Ngân Hà ≥ 80 & mây &lt; 20%</Text>
          </View>
          <Switch value={settings.clearSkyAlertsEnabled} onValueChange={(clearSkyAlertsEnabled) => updateSettings({ clearSkyAlertsEnabled })} trackColor={{ false: colors.ringTrack, true: colors.accentEmerald }} thumbColor={thumbColor} />
        </View>
        <View style={styles.pillWrap}>
          <StatusPill label="✦ Ngân Hà (≥ 80)" tone="cyan" small />
          <StatusPill label="☁ Săn Mây (≥ 85)" tone="violet" small />
          <StatusPill label="☄ Mưa Sao Băng lớn" tone="amber" small />
        </View>
      </View>

      <SwitchSettingCard title="Hiệu ứng âm thanh UI" subtitle="Phản hồi âm thanh tinh tế khi chạm nút, chuyển tab & kéo biểu đồ" value={settings.soundEnabled} onValueChange={(soundEnabled) => updateSettings({ soundEnabled })} trackColor={colors.accentCyan} thumbColor={thumbColor} colors={colors} />

      <ActionButton label="Lưu cài đặt hệ thống" variant="primary" fullWidth onPress={() => { showToast('Đã lưu cài đặt hệ thống & đồng bộ đám mây thành công!', 'success'); if (!isMobileView) closeOverlay(); }} />
      <NeonShimmerButton label="Thông tin ứng dụng" onPress={() => (isMobileView ? openMobileSubScreen('about') : openOverlay('about'))} />
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  accountCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 16, borderWidth: 1 },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  avatarCircle: { width: 40, height: 40, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 13, fontFamily: FONT_FAMILIES.monoBold },
  accountMeta: { gap: 2, flex: 1, minWidth: 0 },
  accountName: { fontSize: 14, fontFamily: FONT_FAMILIES.sansBold },
  accountSub: { fontSize: 11.5, fontFamily: FONT_FAMILIES.sansRegular },
  accountRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' },
  mobileBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 4 },
  fieldGroup: { gap: 6 },
  cameraGroup: { gap: 8 },
  fieldLabel: { fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold },
  cameraCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, borderWidth: 1 },
  cameraTitle: { fontSize: 13, fontFamily: FONT_FAMILIES.sansBold },
  cameraSpecs: { fontSize: 11, fontFamily: FONT_FAMILIES.monoRegular },
  cameraAction: { fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold },
  boxCard: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 10 },
  rowCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 14, borderWidth: 1, gap: 10 },
  betweenRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  switchTextWrap: { flex: 1, gap: 2 },
  switchTitle: { fontSize: 12, fontFamily: FONT_FAMILIES.sansSemiBold },
  switchSub: { fontSize: 10, fontFamily: FONT_FAMILIES.sansRegular },
  dewValue: { fontSize: 13, fontFamily: FONT_FAMILIES.monoBold },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
