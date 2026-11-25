import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FONT_FAMILIES } from '../tokens/typography';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ActionButtonProps {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  compact?: boolean;
}

export function ActionButton({
  label,
  variant = 'primary',
  onPress,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  compact = false,
}: ActionButtonProps) {
  const { colors } = useTheme();

  const palette = {
    primary: {
      bg: colors.buttonPrimaryBg,
      border: colors.buttonPrimaryBg,
      text: colors.buttonPrimaryText,
    },
    secondary: {
      bg: colors.buttonSecondaryBg,
      border: colors.buttonSecondaryBorder,
      text: colors.accentCyan,
    },
    ghost: {
      bg: 'transparent',
      border: colors.borderSubtle,
      text: colors.textSecondary,
    },
    danger: {
      bg: colors.accentRoseBg,
      border: colors.accentRoseBorder,
      text: colors.accentRose,
    },
  }[variant];

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        width: fullWidth ? '100%' : undefined,
        paddingHorizontal: compact ? 12 : 16,
        paddingVertical: compact ? 8 : 11,
        borderRadius: 12,
        backgroundColor: palette.bg,
        borderWidth: 1,
        borderColor: palette.border,
        opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
      })}
    >
      {leftIcon ? <View>{leftIcon}</View> : null}
      <Text
        style={{
          color: palette.text,
          fontSize: compact ? 12 : 13,
          fontFamily: FONT_FAMILIES.sansSemiBold,
        }}
      >
        {label}
      </Text>
      {rightIcon ? <View>{rightIcon}</View> : null}
    </Pressable>
  );
}
