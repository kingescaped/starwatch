import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { ThemeMode } from '../tokens/colors';

interface StarWatchLogoProps {
  size?: number;
  mode?: ThemeMode;
}

export function StarWatchLogo({ size = 34, mode = 'dark' }: StarWatchLogoProps) {
  const isRed = mode === 'red';
  const startColor = isRed ? '#EF4444' : '#6366F1';
  const midColor = isRed ? '#DC2626' : '#A855F7';
  const endColor = isRed ? '#991B1B' : '#06B6D4';

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id={`swFull-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={startColor} />
          <Stop offset="52%" stopColor={midColor} />
          <Stop offset="100%" stopColor={endColor} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={64} height={64} rx={16} fill={`url(#swFull-${mode})`} />
      <Path
        d="M32 14.5 C34 25.5 38.5 30 49.5 32 C38.5 34 34 38.5 32 49.5 C30 38.5 25.5 34 14.5 32 C25.5 30 30 25.5 32 14.5 Z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={3.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={48.5} cy={17.5} r={2.8} fill="#FFFFFF" />
      <Circle cx={16.5} cy={47.5} r={2.3} fill="#FFFFFF" opacity={0.92} />
    </Svg>
  );
}
