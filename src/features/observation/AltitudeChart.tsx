import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { useAppState } from '../../state/AppStateContext';
import { buildAreaPath, buildSmoothPath, mapXToHourIndex } from './altitudeChartMath';

const SVG_W = 460;
const SVG_H = 136;
const PLOT_LEFT = 36;
const PLOT_RIGHT = 444;
const PLOT_TOP = 26;
const PLOT_BOTTOM = 108;

export function AltitudeChart() {
  const { colors } = useTheme();
  const { hourIndex, setHourIndex, selectedTarget, hourlyForecast } = useAppState();
  const [chartWidth, setChartWidth] = useState(440);
  const widthRef = useRef(440);
  const startXRef = useRef(0);

  const spanX = PLOT_RIGHT - PLOT_LEFT;
  const spanY = PLOT_BOTTOM - PLOT_TOP;
  const toX = (i: number) => PLOT_LEFT + (i / Math.max(1, hourlyForecast.length - 1)) * spanX;
  const toY = (alt: number) => PLOT_BOTTOM - (Math.max(0, Math.min(90, alt)) / 90) * spanY;

  const targetPoints = useMemo(
    () => hourlyForecast.map((pt, i) => ({ x: toX(i), y: toY(pt.targetAlt) })),
    [hourlyForecast]
  );
  const moonPoints = useMemo(
    () => hourlyForecast.map((pt, i) => ({ x: toX(i), y: toY(pt.moonAlt) })),
    [hourlyForecast]
  );

  const targetCurve = useMemo(() => buildSmoothPath(targetPoints), [targetPoints]);
  const targetArea = useMemo(() => buildAreaPath(targetPoints, PLOT_BOTTOM), [targetPoints]);
  const moonCurve = useMemo(() => buildSmoothPath(moonPoints), [moonPoints]);

  const scrubToX = (x: number) => {
    const idx = mapXToHourIndex(
      x,
      widthRef.current,
      PLOT_LEFT / SVG_W,
      PLOT_RIGHT / SVG_W,
      hourlyForecast.length
    );
    setHourIndex(idx);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const lx = evt.nativeEvent.locationX;
        startXRef.current = lx;
        scrubToX(lx);
      },
      onPanResponderMove: (_evt, gesture) => {
        scrubToX(startXRef.current + gesture.dx);
      },
    })
  ).current;

  const activePt = hourlyForecast[hourIndex] ?? hourlyForecast[3];
  const activeX = toX(hourIndex);
  const activeY = toY(activePt.targetAlt);
  const pillHalfW = 21;
  const pillCenterX = Math.max(PLOT_LEFT + pillHalfW, Math.min(PLOT_RIGHT - pillHalfW, activeX));
  const moonLabel = activePt.moonAlt >= 0 ? `+${activePt.moonAlt}°` : `${activePt.moonAlt}°`;
  const targetLabel = activePt.targetAlt >= 0 ? `+${activePt.targetAlt}°` : `${activePt.targetAlt}°`;

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            fontSize: 10,
            fontFamily: FONT_FAMILIES.sansSemiBold,
            color: colors.textSecondary,
            letterSpacing: 0.5,
          }}
        >
          BIỂU ĐỒ ĐỘ CAO 24H (0°–90°)
        </Text>
        <Text
          style={{
            fontSize: 10,
            fontFamily: FONT_FAMILIES.sansMedium,
            color: colors.accentCyan,
          }}
        >
          ⇆ Kéo hoặc vuốt để mô phỏng
        </Text>
      </View>

      <View
        style={{
          borderRadius: 14,
          backgroundColor: colors.cardInner,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          paddingTop: 10,
          paddingBottom: 6,
          paddingHorizontal: 10,
          gap: 6,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoMedium, color: colors.accentCyan }}>
              ● {selectedTarget.shortName}: {targetLabel}
            </Text>
            <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoRegular, color: colors.accentViolet }}>
              ┄ Trăng: {moonLabel}
            </Text>
          </View>
          <Text style={{ fontSize: 10, fontFamily: FONT_FAMILIES.monoBold, color: colors.textPrimary }}>
            {activePt.hour} GMT+7
          </Text>
        </View>

        <View
          {...panResponder.panHandlers}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0) {
              widthRef.current = w;
              if (w !== chartWidth) setChartWidth(w);
            }
          }}
          style={[
            { width: '100%', height: 136 },
            Platform.OS === 'web'
              ? ({ cursor: 'ew-resize', userSelect: 'none', touchAction: 'none' } as never)
              : null,
          ]}
        >
          <Svg pointerEvents="none" width="100%" height={136} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
            <Defs>
              <LinearGradient id="altAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor={colors.accentCyan} stopOpacity={0.34} />
                <Stop offset="100%" stopColor={colors.accentCyan} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>

            {[0, 30, 60, 90].map((deg) => {
              const y = toY(deg);
              return (
                <React.Fragment key={deg}>
                  <Line
                    x1={PLOT_LEFT}
                    y1={y}
                    x2={PLOT_RIGHT}
                    y2={y}
                    stroke={colors.borderSubtle}
                    strokeWidth={0.8}
                    strokeDasharray={deg === 0 ? undefined : '2 3'}
                  />
                  <SvgText x={28} y={y + 3} textAnchor="end" fill={colors.textMuted} fontSize={8.5}>
                    {deg}°
                  </SvgText>
                </React.Fragment>
              );
            })}

            <Path d={targetArea} fill="url(#altAreaGrad)" />
            <Path d={moonCurve} stroke={colors.accentViolet} strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
            <Path d={targetCurve} stroke={colors.accentCyan} strokeWidth={2.2} fill="none" />

            <Line
              x1={activeX}
              y1={19}
              x2={activeX}
              y2={PLOT_BOTTOM}
              stroke={colors.accentCyan}
              strokeWidth={1.2}
              strokeDasharray="2 2"
            />
            <Rect
              x={pillCenterX - pillHalfW}
              y={2}
              width={pillHalfW * 2}
              height={15}
              rx={7.5}
              fill={colors.buttonPrimaryBg}
            />
            <SvgText
              x={pillCenterX}
              y={12}
              textAnchor="middle"
              fill={colors.buttonPrimaryText}
              fontSize={8.5}
              fontWeight="700"
            >
              {activePt.hour}
            </SvgText>

            <Circle cx={activeX} cy={activeY} r={7.5} fill={colors.accentCyan} opacity={0.25} />
            <Circle cx={activeX} cy={activeY} r={4.2} fill="#FFFFFF" stroke={colors.accentCyan} strokeWidth={2} />

            {[
              { idx: 0, label: '18:00' },
              { idx: 3, label: '21:00' },
              { idx: 6, label: '00:00' },
              { idx: 9, label: '03:00' },
              { idx: 12, label: '06:00' },
            ].map((t) => (
              <SvgText
                key={t.label}
                x={toX(t.idx)}
                y={SVG_H - 6}
                textAnchor="middle"
                fill={t.idx === hourIndex ? colors.accentCyan : colors.textMuted}
                fontSize={9.5}
                fontWeight={t.idx === hourIndex ? '700' : '400'}
              >
                {t.label}
              </SvgText>
            ))}
          </Svg>
        </View>
      </View>
    </View>
  );
}
