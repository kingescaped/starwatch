import React, { useId } from 'react';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Polygon, Stop } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { getTierBadgePalette, TierBadgePalette, TierBadgeVariant } from '../tokens/colors';

interface TierEmblemProps {
  variant: TierBadgeVariant;
  size?: number;
  palette?: TierBadgePalette;
}

function renderFreeOrPro(variant: 'free' | 'pro', gradId: string, palette: TierBadgePalette) {
  if (variant === 'free') {
    return (
      <>
        <Path d="M12 2.5 L14.3 9.7 L21.5 12 L14.3 14.3 L12 21.5 L9.7 14.3 L2.5 12 L9.7 9.7 Z" fill="none" stroke={`url(#${gradId})`} strokeWidth={1.8} strokeLinejoin="round" />
        <Circle cx={12} cy={12} r={1.25} fill={palette.iconPrimary} />
      </>
    );
  }
  return (
    <>
      <Path d="M3.5 18.2 L4.8 8.4 L9.2 12.6 L12 5.6 L14.8 12.6 L19.2 8.4 L20.5 18.2 Z" fill={`url(#${gradId})`} stroke={palette.iconSecondary} strokeWidth={0.9} strokeLinejoin="round" />
      <Path d="M4.6 20.4 H19.4" stroke={`url(#${gradId})`} strokeWidth={1.8} strokeLinecap="round" />
      <Circle cx={12} cy={3.9} r={1.55} fill={palette.iconPrimary} />
      <Circle cx={4.6} cy={7.1} r={1.05} fill={palette.iconPrimary} />
      <Circle cx={19.4} cy={7.1} r={1.05} fill={palette.iconPrimary} />
    </>
  );
}

function renderPrestigeShape(variant: 'expedition' | 'admin', gradId: string, palette: TierBadgePalette) {
  if (variant === 'expedition') {
    return (
      <>
        <Polygon points="12,1.6 22.2,12 12,22.4 1.8,12" fill={palette.bgGradient[1]} stroke={`url(#${gradId})`} strokeWidth={1.7} strokeLinejoin="round" />
        <Path d="M12 1.6 L15.6 12 L12 22.4 M12 1.6 L8.4 12 L12 22.4 M1.8 12 H22.2" fill="none" stroke={`url(#${gradId})`} strokeWidth={0.85} opacity={0.75} />
        <Path d="M12 5.4 L13.7 10.3 L18.6 12 L13.7 13.7 L12 18.6 L10.3 13.7 L5.4 12 L10.3 10.3 Z" fill={palette.sparkleColor} />
        <Circle cx={3.6} cy={4.2} r={1.25} fill={palette.iconPrimary} />
        <Circle cx={20.4} cy={19.8} r={1.25} fill={palette.iconSecondary} />
      </>
    );
  }
  return (
    <>
      <Polygon points="12,1.8 20.6,5.2 19.6,13.8 12,22.2 4.4,13.8 3.4,5.2" fill={palette.bgGradient[1]} stroke={`url(#${gradId})`} strokeWidth={1.75} strokeLinejoin="round" />
      <Path d="M7.4 14.6 L8.3 9.2 L10.6 11.4 L12 7 L13.4 11.4 L15.7 9.2 L16.6 14.6 Z" fill={`url(#${gradId})`} />
      <Circle cx={12} cy={17.2} r={1.2} fill={palette.iconPrimary} />
    </>
  );
}

export function TierEmblem({ variant, size = 14, palette: customPalette }: TierEmblemProps) {
  const { mode } = useTheme();
  const rawId = useId();
  const palette = customPalette ?? getTierBadgePalette(variant, mode);
  const gradId = `tier-${variant}-${size}-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const stops =
    variant === 'expedition'
      ? [
          { offset: '0%', color: palette.iconPrimary },
          { offset: '50%', color: palette.borderGradient[1] },
          { offset: '100%', color: palette.iconSecondary },
        ]
      : [
          { offset: '0%', color: palette.iconPrimary },
          { offset: '100%', color: palette.iconSecondary },
        ];

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <SvgGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          {stops.map((s) => (
            <Stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </SvgGradient>
      </Defs>
      {variant === 'free' || variant === 'pro'
        ? renderFreeOrPro(variant, gradId, palette)
        : renderPrestigeShape(variant, gradId, palette)}
    </Svg>
  );
}
