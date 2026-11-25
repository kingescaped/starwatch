import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { FONT_FAMILIES } from '../tokens/typography';
import { AppIcon, IconName } from '../icons/AppIcon';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastBannerProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

export function ToastBanner({ message, type, onDismiss }: ToastBannerProps) {
  const { colors } = useTheme();

  const config: Record<ToastType, { bg: string; border: string; text: string; icon: IconName }> = {
    success: {
      bg: colors.accentEmeraldBg,
      border: colors.accentEmeraldBorder,
      text: colors.accentEmerald,
      icon: 'check',
    },
    info: {
      bg: colors.accentCyanBg,
      border: colors.accentCyanBorder,
      text: colors.accentCyan,
      icon: 'info',
    },
    warning: {
      bg: colors.accentAmberBg,
      border: colors.accentAmberBorder,
      text: colors.accentAmber,
      icon: 'alert',
    },
    error: {
      bg: colors.accentRoseBg,
      border: colors.accentRoseBorder,
      text: colors.accentRose,
      icon: 'x',
    },
  };

  const c = config[type];

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 92,
        alignSelf: 'center',
        maxWidth: 460,
        zIndex: 90,
      }}
    >
      <Pressable
        onPress={onDismiss}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 14,
          paddingVertical: 11,
          borderRadius: 12,
          backgroundColor: colors.modalBg,
          borderWidth: 1,
          borderColor: c.border,
          shadowColor: '#000',
          shadowOpacity: 0.45,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            backgroundColor: c.bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon name={c.icon} size={13} color={c.text} />
        </View>
        <Text
          style={{
            fontSize: 12,
            fontFamily: FONT_FAMILIES.sansMedium,
            color: colors.textPrimary,
            flexShrink: 1,
          }}
        >
          {message}
        </Text>
      </Pressable>
    </View>
  );
}
