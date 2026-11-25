import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { FONT_FAMILIES } from '../tokens/typography';
import { ANIMATIONS } from '../tokens/animations';

interface ScoreRingProps {
  score: number;
  label: string;
  color: string;
  size?: number;
}

export function ScoreRing({ score, label, color, size = 92 }: ScoreRingProps) {
  const { colors } = useTheme();
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    const start = Date.now();
    const duration = ANIMATIONS.scoreRingMs;
    let rafId = 0;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(score * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    setDisplayScore(0);
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [score]);

  const strokeWidth = 5.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, displayScore));
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.borderStrong}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: size >= 90 ? 23 : 21,
              lineHeight: size >= 90 ? 27 : 25,
              fontFamily: FONT_FAMILIES.sansMedium,
              color: colors.textPrimary,
            }}
          >
            {displayScore}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontFamily: FONT_FAMILIES.monoRegular,
              color: colors.textSecondary,
            }}
          >
            / 100
          </Text>
        </View>
      </View>
      <Text
        style={{
          fontSize: 13,
          fontFamily: FONT_FAMILIES.sansSemiBold,
          color: colors.textPrimary,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
