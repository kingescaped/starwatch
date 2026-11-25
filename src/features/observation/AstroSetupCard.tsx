import React from 'react';
import { Text, View } from 'react-native';
import type { AstroAdvisorMetrics } from '../../data/advisor';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { SurfaceCard } from '../../design-system/primitives/SurfaceCard';
import { StatusPill } from '../../design-system/primitives/StatusPill';
import { SegmentedControl } from '../../design-system/primitives/SegmentedControl';
import { useAppState } from '../../state/AppStateContext';
import { DeviceType, FocalLength, ShootingMode } from '../../state/types';
import { useResponsive } from '../../hooks/useResponsive';

const SHOOTING_MODES: { id: ShootingMode; label: string }[] = [
  { id: 'milkyWay', label: 'Dải Ngân Hà' },
  { id: 'nebula', label: 'Thiên Hà & Tinh Vân' },
  { id: 'meteor', label: 'Sao Băng' },
  { id: 'moon', label: 'Mặt Trăng' },
  { id: 'cloudSea', label: 'Biển Mây' },
];

const DEVICE_OPTIONS: { value: DeviceType; label: string }[] = [
  { value: 'camera', label: 'Máy ảnh' },
  { value: 'phone', label: 'Điện thoại' },
];

const STANDARD_FOCALS: FocalLength[] = ['14mm', '20mm', '24mm', '35mm'];

export function AstroSetupCard() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const {
    selectedSpot,
    cameraGear,
    shootingMode,
    setShootingMode,
    deviceType,
    setDeviceType,
    focalLength,
    setFocalLength,
    advisorSpec: spec,
    openOverlay,
    openMobileSubScreen,
  } = useAppState();

  const profileFocal = `${Math.round(cameraGear.focalLengthMm)}mm`;
  const focalChips = STANDARD_FOCALS.includes(profileFocal)
    ? STANDARD_FOCALS.map((fl) => ({ value: fl, label: fl }))
    : [{ value: profileFocal, label: `${profileFocal} · Hồ sơ` }, ...STANDARD_FOCALS.map((fl) => ({ value: fl, label: fl }))];

  const handleOpenCameraProfile = () => {
    if (isMobile) openMobileSubScreen('cameraProfile');
    else openOverlay('cameraProfile');
  };

  return (
    <SurfaceCard radius={20} style={{ padding: isMobile ? 14 : 20, gap: 14 }}>
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 17, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
              Hướng Dẫn Setup Chụp Thiên Văn
            </Text>
            <StatusPill
              label={`${selectedSpot.name.replace('Đỉnh ', '')} · Bortle ${selectedSpot.bortle} · ${selectedSpot.elevation.toLocaleString('en-US')}m`}
              tone="emerald"
              dot
              small
              mono
            />
          </View>
          <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
            Thuật toán NPF (δ) · Tự chỉnh theo Bortle, Pha Trăng & Tốc độ gió
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {SHOOTING_MODES.map((m) => (
            <StatusPill
              key={m.id}
              label={m.label}
              tone={shootingMode === m.id ? 'cyan' : 'neutral'}
              small
              onPress={() => setShootingMode(m.id)}
            />
          ))}
        </View>
      </View>

      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <SegmentedControl<DeviceType>
          fullWidth={false}
          compact
          tone="cyan"
          value={deviceType}
          onChange={setDeviceType}
          options={DEVICE_OPTIONS}
        />

        {deviceType === 'camera' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textMuted }}>
              Tiêu cự:
            </Text>
            {focalChips.map((chip) => (
              <StatusPill
                key={chip.value}
                label={chip.label}
                tone={focalLength === chip.value ? 'cyan' : 'neutral'}
                small
                mono
                onPress={() => setFocalLength(chip.value)}
              />
            ))}
          </View>
        ) : null}
      </View>

      <AdvisorTelemetryBar
        cameraLabel={`${cameraGear.cameraName} · ${cameraGear.lensName} · Đổi`}
        onPressGear={handleOpenCameraProfile}
        metrics={spec.metrics}
      />

      <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
        <AdvisorBox
          title={spec.shutterTitle}
          value={spec.shutterValue}
          hint={spec.shutterHint}
          accent={colors.accentCyan}
          borderColor={colors.borderSubtle}
          isMobile={isMobile}
        />
        <AdvisorBox
          title={spec.apertureTitle}
          value={spec.apertureValue}
          hint={spec.apertureHint}
          accent={colors.accentViolet}
          borderColor={colors.borderSubtle}
          isMobile={isMobile}
        />
        <AdvisorBox
          title={spec.isoTitle}
          value={spec.isoValue}
          hint={spec.isoHint}
          accent={colors.accentEmerald}
          borderColor={colors.borderSubtle}
          isMobile={isMobile}
        />
        <AdvisorBox
          title={spec.wbTitle}
          value={spec.wbValue}
          hint={spec.wbHint}
          accent={colors.accentAmber}
          borderColor={colors.accentAmberBorder}
          isMobile={isMobile}
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingTop: 2 }}>
        {spec.checklist.map((item) => (
          <Text key={item} style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansMedium, color: colors.accentEmerald }}>
            ✓ {item}
          </Text>
        ))}
      </View>
    </SurfaceCard>
  );
}

function AdvisorTelemetryBar({
  cameraLabel,
  onPressGear,
  metrics,
}: {
  cameraLabel: string;
  onPressGear: () => void;
  metrics?: AstroAdvisorMetrics;
}) {
  const decLabel = metrics ? `${metrics.targetDecDeg >= 0 ? '+' : ''}${metrics.targetDecDeg}°` : '0°';
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
      <StatusPill label={cameraLabel} tone="violet" small onPress={onPressGear} />
      {metrics ? (
        <>
          <StatusPill label={`NPF (δ ${decLabel}) ${metrics.adjustedShutterSeconds}s`} tone="cyan" small mono />
          <StatusPill label={`Bortle hiệu dụng ${metrics.effectiveBortle.toFixed(1)}`} tone="amber" small mono />
          <StatusPill
            label={`Trăng ${metrics.moonIllum}% ${metrics.moonAboveHorizon ? '↑' : '(lặn)'}`}
            tone={metrics.moonAboveHorizon && metrics.moonIllum >= 30 ? 'amber' : 'neutral'}
            small
            mono
          />
          <StatusPill
            label={`Gió ${metrics.windKmh} km/h${metrics.windPenaltyPct > 0 ? ` (-${metrics.windPenaltyPct}%)` : ''}`}
            tone={metrics.windPenaltyPct > 0 ? 'rose' : 'emerald'}
            small
            mono
          />
        </>
      ) : null}
    </View>
  );
}

function AdvisorBox({
  title,
  value,
  hint,
  accent,
  borderColor,
  isMobile,
}: {
  title: string;
  value: string;
  hint: string;
  accent: string;
  borderColor: string;
  isMobile: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: isMobile ? undefined : 1,
        padding: 14,
        borderRadius: 14,
        backgroundColor: colors.cardInner,
        borderWidth: 1,
        borderColor,
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textMuted, letterSpacing: 0.5 }}>
        {title}
      </Text>
      <Text style={{ fontSize: 16, fontFamily: FONT_FAMILIES.monoBold, color: accent }}>
        {value}
      </Text>
      <Text style={{ fontSize: 11, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
        {hint}
      </Text>
    </View>
  );
}
