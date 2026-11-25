import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { AppIcon } from '../../design-system/icons/AppIcon';
import { useAppState } from '../../state/AppStateContext';
import { getMapPalette, projectSpotToMap } from './gisMapHelpers';

interface GisMapCanvasProps {
  height?: number;
  fill?: boolean;
  compact?: boolean;
}

export function GisMapCanvas({ height = 390, fill = false, compact = false }: GisMapCanvasProps) {
  const { mode, colors } = useTheme();
  const {
    basemap,
    showLightPollution,
    showCloudLayer,
    showAzimuthRays,
    mapZoom,
    zoomMap,
    resetMap,
    selectedSpot,
    selectedTarget,
    inspectMapPoint,
    openOverlay,
    openMobileSubScreen,
  } = useAppState();

  const palette = getMapPalette(mode, basemap);
  const pin = projectSpotToMap(selectedSpot.lat, selectedSpot.lng);

  const targetRad = ((selectedTarget.azimuth - 90) * Math.PI) / 180;
  const targetEndX = Math.max(40, Math.min(560, pin.x + Math.cos(targetRad) * 185));
  const targetEndY = Math.max(36, Math.min(430, pin.y + Math.sin(targetRad) * 185));

  const sunEndX = Math.max(36, pin.x - 125);
  const sunEndY = Math.max(30, pin.y - 44);
  const moonEndX = Math.max(36, pin.x - 142);
  const moonEndY = Math.min(425, pin.y + 72);

  const labelLeftPct = Math.max(12, Math.min(58, (pin.x / 600) * 100 + 2));
  const labelTopPct = Math.max(compact ? 26 : 10, Math.min(82, (pin.y / 460) * 100 + (compact ? 7 : 2)));

  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.9] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  const handleInspectTap = () => {
    inspectMapPoint({ lat: selectedSpot.lat, lng: selectedSpot.lng });
    if (compact) openMobileSubScreen('inspectCoords');
    else openOverlay('inspectCoords');
  };

  return (
    <View
      style={{
        flex: fill ? 1 : undefined,
        minHeight: fill ? 500 : undefined,
        height: fill ? undefined : height,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        backgroundColor: palette.ocean,
      }}
    >
      <Pressable onPress={handleInspectTap} style={{ flex: 1 }}>
        <Svg width="100%" height="100%" viewBox="0 0 600 460" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <RadialGradient id="lpHanoi" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={palette.lpStrong} stopOpacity={0.75} />
              <Stop offset="100%" stopColor={palette.lpStrong} stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="lpHcm" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={palette.lpWarm} stopOpacity={0.68} />
              <Stop offset="100%" stopColor={palette.lpWarm} stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <Rect x={0} y={0} width={600} height={460} fill={palette.ocean} />

          {[90, 180, 270, 360].map((y) => (
            <Line key={`h-${y}`} x1={0} y1={y} x2={600} y2={y} stroke={palette.grid} strokeWidth={0.8} />
          ))}
          {[120, 240, 360, 480].map((x) => (
            <Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={460} stroke={palette.grid} strokeWidth={0.8} />
          ))}

          {/* Mainland Southeast Asia & Vietnam contour */}
          <Path
            d="M40 0 L280 0 L270 40 L315 68 L300 105 L258 130 L255 168 L288 206 L334 248 L372 300 L388 350 L358 392 L315 432 L268 456 L246 428 L262 388 L292 348 L280 288 L235 232 L195 178 L135 140 L75 120 L40 86 Z"
            fill={palette.landmass}
            stroke={palette.coastline}
            strokeWidth={1.2}
          />
          <Path
            d="M170 32 C215 20, 255 36, 268 74 C278 106, 250 128, 242 156 C234 182, 268 210, 304 248 C338 282, 362 320, 350 364 C338 400, 300 426, 272 434 C258 416, 276 380, 294 346 C306 318, 286 270, 248 226 C214 186, 178 148, 158 104 C146 72, 152 42, 170 32 Z"
            fill={palette.vietnam}
            stroke={palette.vietnamBorder}
            strokeWidth={1.4}
          />

          {basemap === 'topo' ? (
            <>
              <Ellipse cx={205} cy={86} rx={42} ry={24} stroke={palette.coastline} strokeWidth={0.9} fill="none" />
              <Ellipse cx={205} cy={86} rx={24} ry={14} stroke={palette.coastline} strokeWidth={0.9} fill="none" />
              <Ellipse cx={312} cy={320} rx={36} ry={28} stroke={palette.coastline} strokeWidth={0.9} fill="none" />
            </>
          ) : null}

          {showLightPollution ? (
            <>
              <Circle cx={246} cy={100} r={54} fill="url(#lpHanoi)" />
              <Circle cx={322} cy={246} r={36} fill="url(#lpHcm)" />
              <Circle cx={302} cy={384} r={50} fill="url(#lpHanoi)" />
            </>
          ) : null}

          {showCloudLayer ? (
            <>
              <Ellipse cx={455} cy={166} rx={92} ry={56} fill={palette.cloudFill} stroke={palette.cloudStroke} strokeWidth={1} />
              <Ellipse cx={422} cy={168} rx={24} ry={19} fill={palette.cloudCore} />
              <Ellipse cx={465} cy={334} rx={96} ry={48} fill={palette.cloudFill} stroke={palette.cloudStroke} strokeWidth={1} />
            </>
          ) : null}

          <SvgText x={190} y={58} fill={palette.cityLabel} fontSize={10} fontWeight="600">Sa Pa</SvgText>
          <SvgText x={252} y={104} fill={palette.cityLabel} fontSize={10} fontWeight="600">Hà Nội</SvgText>
          <SvgText x={265} y={198} fill={palette.cityLabel} fontSize={9}>Khe Sanh</SvgText>
          <SvgText x={324} y={246} fill={palette.cityLabel} fontSize={10}>Đà Nẵng</SvgText>
          <SvgText x={325} y={344} fill={palette.cityLabel} fontSize={10}>Đà Lạt</SvgText>
          <SvgText x={294} y={390} fill={palette.cityLabel} fontSize={10} fontWeight="600">TP.HCM</SvgText>

          {showAzimuthRays ? (
            <>
              <Line x1={pin.x} y1={pin.y} x2={sunEndX} y2={sunEndY} stroke={colors.accentAmber} strokeWidth={1.6} strokeDasharray="5 4" />
              <Circle cx={sunEndX} cy={sunEndY} r={4} fill={colors.accentAmber} />

              <Line x1={pin.x} y1={pin.y} x2={moonEndX} y2={moonEndY} stroke={colors.accentViolet} strokeWidth={1.6} strokeDasharray="5 4" />
              <Circle cx={moonEndX} cy={moonEndY} r={4} fill={colors.accentViolet} />

              <Line x1={pin.x} y1={pin.y} x2={targetEndX} y2={targetEndY} stroke={colors.accentCyan} strokeWidth={2} />
              <Circle cx={targetEndX} cy={targetEndY} r={4.5} fill={colors.accentCyan} />
            </>
          ) : null}

          <Circle cx={pin.x} cy={pin.y} r={14 * mapZoom} fill={colors.accentCyan} opacity={0.18} />
          <Circle cx={pin.x} cy={pin.y} r={7} fill={colors.accentCyan} opacity={0.35} />
          <Circle cx={pin.x} cy={pin.y} r={4.5} fill="#FFFFFF" stroke={colors.accentCyan} strokeWidth={2} />
        </Svg>
      </Pressable>

      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 10, right: 10, top: 10, bottom: 10 }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            left: `${(pin.x / 600) * 100}%`,
            top: `${(pin.y / 460) * 100}%`,
            width: 24,
            height: 24,
            marginLeft: -12,
            marginTop: -12,
            borderRadius: 999,
            borderWidth: 1.5,
            borderColor: colors.accentCyan,
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            left: `${labelLeftPct}%`,
            top: `${labelTopPct}%`,
            paddingHorizontal: 9,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: colors.glass,
            borderWidth: 1,
            borderColor: colors.accentCyanBorder,
          }}
        >
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansSemiBold, color: colors.textPrimary }}>
            {selectedSpot.name} <Text style={{ color: colors.accentCyan }}>B{selectedSpot.bortle}</Text>
          </Text>
        </View>

        {showAzimuthRays ? (
          <>
            <View
              style={{
                position: 'absolute',
                left: compact ? 10 : 44,
                top: 10,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: colors.glass,
                borderWidth: 1,
                borderColor: colors.accentAmberBorder,
              }}
            >
              <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.accentAmber }}>
                ● Mặt Trời · 294° WNW
              </Text>
            </View>
            {!compact ? (
              <View
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 176,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: colors.glass,
                  borderWidth: 1,
                  borderColor: colors.accentVioletBorder,
                }}
              >
                <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.accentViolet }}>
                  ● Mặt Trăng · 246° WSW
                </Text>
              </View>
            ) : null}
            {!compact ? (
              <View
                style={{
                  position: 'absolute',
                  left: '44%',
                  top: '70%',
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: colors.glass,
                  borderWidth: 1,
                  borderColor: colors.accentCyanBorder,
                }}
              >
                <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.accentCyan }}>
                  ● {selectedTarget.shortName} · {selectedTarget.azimuthLabel}
                </Text>
              </View>
            ) : null}
          </>
        ) : null}

        {showCloudLayer && !compact ? (
          <View
            style={{
              position: 'absolute',
              right: 22,
              top: 78,
              paddingHorizontal: 9,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: colors.glass,
              borderWidth: 1,
              borderColor: colors.accentCyanBorder,
            }}
          >
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.sansMedium, color: colors.accentCyan }}>
              ☁ Mây mô phỏng · Vịnh Bắc Bộ 38%
            </Text>
          </View>
        ) : null}
      </View>

      {!compact ? (
        <View
          style={{
            position: 'absolute',
            left: 12,
            top: 12,
            borderRadius: 10,
            backgroundColor: colors.glass,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            overflow: 'hidden',
          }}
        >
          <Pressable onPress={() => zoomMap(0.2)} style={{ padding: 7, alignItems: 'center' }}>
            <AppIcon name="plus" size={13} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            onPress={() => zoomMap(-0.2)}
            style={{
              padding: 7,
              alignItems: 'center',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>−</Text>
          </Pressable>
          <Pressable onPress={resetMap} style={{ padding: 7, alignItems: 'center' }}>
            <AppIcon name="locate" size={13} color={colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
