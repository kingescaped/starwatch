import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SurfaceCardProps extends ViewProps {
  variant?: 'card' | 'inner' | 'glass';
  radius?: number;
  borderColor?: string;
}

export function SurfaceCard({
  variant = 'card',
  radius = 20,
  borderColor,
  style,
  children,
  ...rest
}: SurfaceCardProps) {
  const { colors } = useTheme();
  const backgroundColor =
    variant === 'glass' ? colors.glass : variant === 'inner' ? colors.cardInner : colors.card;

  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius: radius,
          borderWidth: 1,
          borderColor: borderColor ?? colors.borderSubtle,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
