import React from 'react';
import { Platform, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { SkyThreeCanvas } from './SkyThreeCanvas';

interface SkyDomeCanvasProps {
  height?: number;
  fullscreen?: boolean;
}

export function SkyDomeCanvas({ height = 215, fullscreen = false }: SkyDomeCanvasProps) {
  const { mode, colors } = useTheme();
  const { skyViewMode, skyZoom, skyRotationOffset, selectedTarget, currentForecast } = useAppState();

  if (Platform.OS === 'web' && skyViewMode !== 'dome2d') {
    return <SkyThreeCanvas mode={skyViewMode} height={height} />;
  }

  const shiftX = Math.sin((skyRotationOffset * Math.PI) / 180) * 32;
  const bg = mode === 'red' ? '#090101' : mode === 'light' ? '#F0F6FF' : '#050A17';
  const mwColorStart = mode === 'red' ? '#EF4444' : '#38BDF8';
  const mwColorEnd = mode === 'red' ? '#991B1B' : '#818CF8';
  const horizonColor = mode === 'red' ? '#EF4444' : colors.accentCyan;

  const modeBadgeLabel =
    skyViewMode === 'dome2d'
      ? '2D VÒM TRỜI · FOV 110°'
      : skyViewMode === 'sphere3d'
      ? '3D QUẢ CẦU · 360°'
      : '3D MẶT ĐẤT · FOV 68°';

  return (
    <View
      style={{
        height,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        backgroundColor: bg,
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 560 240" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={`mwBand-${mode}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={mwColorStart} stopOpacity={0.12} />
            <Stop offset="50%" stopColor={mwColorEnd} stopOpacity={0.34} />
            <Stop offset="100%" stopColor={mwColorStart} stopOpacity={0.12} />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={560} height={240} fill={bg} />

        {/* Subtle dome wireframe */}
        <Circle
          cx={280}
          cy={148}
          r={125 * skyZoom}
          stroke={colors.borderSubtle}
          strokeWidth={0.8}
          strokeDasharray="3 4"
          fill="none"
        />
        <Circle
          cx={280}
          cy={148}
          r={78 * skyZoom}
          stroke={colors.borderSubtle}
          strokeWidth={0.8}
          strokeDasharray="3 4"
          fill="none"
        />

        {/* Diagonal Milky Way band */}
        <Path
          d={`M${95 + shiftX} 215 Q ${285 + shiftX} 110 ${475 + shiftX} 22`}
          stroke={`url(#mwBand-${mode})`}
          strokeWidth={46 * Math.min(1.4, skyZoom)}
          strokeLinecap="round"
          fill="none"
        />

        {/* Scorpius constellation geometry */}
        <Path
          d={`M${155 + shiftX} 62 L${182 + shiftX} 92 L${222 + shiftX} 86 L${155 + shiftX} 62 M${222 + shiftX} 86 L${262 + shiftX} 122 L${312 + shiftX} 102 L${352 + shiftX} 128`}
          stroke={colors.accentViolet}
          strokeWidth={1.1}
          opacity={0.75}
          fill="none"
        />

        {/* Stars */}
        {[
          [120, 48, 1.8],
          [190, 40, 1.3],
          [242, 65, 1.5],
          [340, 46, 1.6],
          [420, 92, 1.4],
          [475, 134, 1.8],
          [88, 130, 1.4],
          [208, 136, 1.2],
        ].map(([cx, cy, r], i) => (
          <Circle
            key={i}
            cx={cx + shiftX * 0.5}
            cy={cy}
            r={r}
            fill={colors.textPrimary}
            opacity={0.75}
          />
        ))}

        {/* Antares */}
        <Circle cx={246 + shiftX} cy={88} r={3.5} fill={colors.accentAmber} />
        <SvgText x={212 + shiftX} y={82} fill={colors.accentAmber} fontSize={10} fontWeight="600">
          Antares
        </SvgText>

        {/* Locked target glow + crosshair */}
        <Circle cx={322 + shiftX} cy={92} r={16} fill={colors.accentPurple} opacity={0.28} />
        <Circle
          cx={322 + shiftX}
          cy={92}
          r={10}
          stroke={colors.accentCyan}
          strokeWidth={1.4}
          fill={colors.accentCyanBg}
        />
        <Circle cx={322 + shiftX} cy={92} r={3} fill="#FFFFFF" />
        <Line
          x1={322 + shiftX}
          y1={92}
          x2={280}
          y2={190}
          stroke={colors.accentViolet}
          strokeWidth={1.3}
          strokeDasharray="4 4"
        />
        <SvgText x={338 + shiftX} y={96} fill={colors.textPrimary} fontSize={10} fontWeight="700">
          {selectedTarget.shortName === 'Tâm Ngân Hà' ? 'Sgr A*' : selectedTarget.shortName} +{selectedTarget.altitude}°
        </SvgText>

        {/* Saturn with ring */}
        <Ellipse
          cx={415 + shiftX}
          cy={68}
          rx={10}
          ry={4}
          stroke={colors.accentAmber}
          strokeWidth={1.6}
          fill="none"
        />
        <Circle cx={415 + shiftX} cy={68} r={4} fill={colors.accentAmber} />
        <SvgText x={432 + shiftX} y={66} fill={colors.accentAmber} fontSize={10} fontWeight="600">
          Sao Thổ
        </SvgText>

        {/* Moon crescent */}
        <Circle cx={154 + shiftX * 0.6} cy={104} r={8} stroke={colors.textSecondary} strokeWidth={1.4} fill="none" />
        <Path
          d={`M${154 + shiftX * 0.6} 96 A 8 8 0 0 1 ${154 + shiftX * 0.6} 112 A 5 8 0 0 0 ${154 + shiftX * 0.6} 96 Z`}
          fill={colors.textPrimary}
        />
        <SvgText x={115 + shiftX * 0.6} y={132} fill={colors.textSecondary} fontSize={10}>
          Trăng 18%
        </SvgText>

        {/* Horizon ring & cardinal points */}
        <Ellipse
          cx={280}
          cy={190}
          rx={245}
          ry={32}
          stroke={horizonColor}
          strokeWidth={1.4}
          fill="none"
          opacity={0.85}
        />
        <Ellipse
          cx={280}
          cy={190}
          rx={150}
          ry={20}
          stroke={colors.borderSubtle}
          strokeWidth={0.9}
          fill="none"
        />
        <Line x1={35} y1={190} x2={525} y2={190} stroke={colors.borderSubtle} strokeWidth={0.8} />
        <Line x1={280} y1={158} x2={280} y2={222} stroke={colors.borderSubtle} strokeWidth={0.8} />

        {/* West / North / East markers */}
        <Circle cx={35} cy={190} r={4} fill={colors.accentAmber} />
        <SvgText x={25} y={175} fill={colors.accentAmber} fontSize={10} fontWeight="700">
          TÂY
        </SvgText>
        <Circle cx={280} cy={158} r={3.5} fill={colors.accentRose} />
        <SvgText x={262} y={148} fill={colors.accentRose} fontSize={10} fontWeight="700">
          BẮC 0°
        </SvgText>
        <Circle cx={525} cy={190} r={4} fill={colors.accentEmerald} />
        <SvgText x={508} y={175} fill={colors.accentEmerald} fontSize={10} fontWeight="700">
          ĐÔNG
        </SvgText>
      </Svg>

      {/* Top Overlay Badges */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          right: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: colors.glass,
            borderWidth: 1,
            borderColor: colors.accentEmeraldBorder,
          }}
        >
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.accentEmerald }} />
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.accentEmerald }}>
            {modeBadgeLabel}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: colors.accentAmberBg,
            borderWidth: 1,
            borderColor: colors.accentAmberBorder,
          }}
        >
          <AppIcon name="crown" size={11} color={colors.accentAmber} />
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoBold, color: colors.accentAmber }}>
            PRO 3D
          </Text>
        </View>
      </View>

      {fullscreen ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 14,
            top: 46,
            padding: 10,
            borderRadius: 12,
            backgroundColor: colors.glass,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            gap: 2,
          }}
        >
          <Text style={{ fontSize: 9, fontFamily: FONT_FAMILIES.monoMedium, color: colors.textMuted }}>
            MỤC TIÊU ĐANG KHÓA
          </Text>
          <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
            {selectedTarget.name}
          </Text>
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.accentEmerald }}>
            Alt +{currentForecast.targetAlt}° · Az {selectedTarget.azimuthLabel}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
