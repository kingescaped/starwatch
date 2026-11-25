import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../design-system/theme/ThemeContext';
import { FONT_FAMILIES } from '../../design-system/tokens/typography';
import { AppIcon } from '../../design-system/icons/AppIcon';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  width?: number;
  maxWidthPercent?: string;
  onClose: () => void;
  backLabel?: string;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  isMobileView?: boolean;
  children: React.ReactNode;
}

export function ModalShell({
  title,
  subtitle,
  width = 520,
  onClose,
  backLabel,
  onBack,
  headerRight,
  isMobileView = false,
  children,
}: ModalShellProps) {
  const { colors } = useTheme();
  const enterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    enterAnim.setValue(0);
    Animated.spring(enterAnim, {
      toValue: 1,
      damping: 20,
      stiffness: 230,
      mass: 0.75,
      useNativeDriver: true,
    }).start();
  }, [title, enterAnim]);

  if (isMobileView) {
    return (
      <View style={{ flex: 1, minHeight: 0, backgroundColor: colors.bg }}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 12,
            gap: 6,
            backgroundColor: colors.bg,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
          }}
        >
          {backLabel && onBack ? (
            <Pressable
              onPress={onBack}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' }}
            >
              <AppIcon name="chevron-left" size={16} color={colors.accentCyan} />
              <Text style={{ fontSize: 13, fontFamily: FONT_FAMILIES.sansMedium, color: colors.accentCyan }}>
                {backLabel}
              </Text>
            </Pressable>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontSize: 22, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
            {headerRight}
          </View>
        </View>

        <ScrollView
          style={{ flex: 1, minHeight: 0 }}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Platform.OS === 'web' ? ('calc(120px + var(--sab, 0px))' as never) : 120,
            gap: 14,
          }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Pressable
          accessibilityLabel="Đóng nền cửa sổ"
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(5, 7, 13, 0.74)',
          }}
        />
        <Animated.View
          style={{
            width: '100%',
            maxWidth: width,
            maxHeight: '88%',
            borderRadius: 24,
            backgroundColor: colors.modalBg,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            shadowColor: '#000',
            shadowOpacity: 0.65,
            shadowRadius: 48,
            shadowOffset: { width: 0, height: 24 },
            overflow: 'hidden',
            opacity: enterAnim,
            transform: [
              {
                scale: enterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          }}
        >
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 22,
              paddingBottom: 14,
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontSize: 19, fontFamily: FONT_FAMILIES.sansBold, color: colors.textPrimary }}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansRegular, color: colors.textSecondary }}>
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={onClose}
              accessibilityLabel="Đóng cửa sổ"
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                backgroundColor: colors.cardInner,
                borderWidth: 1,
                borderColor: colors.borderSubtle,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppIcon name="x" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, gap: 14 }}
            showsVerticalScrollIndicator={false}
          >
            {backLabel && onBack ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <Pressable
                  accessibilityLabel={`Quay lại ${backLabel}`}
                  onPress={onBack}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 11,
                    paddingVertical: 6,
                    borderRadius: 999,
                    backgroundColor: colors.cardInner,
                    borderWidth: 1,
                    borderColor: colors.borderSubtle,
                    opacity: pressed ? 0.78 : 1,
                  })}
                >
                  <AppIcon name="arrow-left" size={13} color={colors.textSecondary} />
                  <Text style={{ fontSize: 12, fontFamily: FONT_FAMILIES.sansMedium, color: colors.textSecondary }}>
                    {backLabel}
                  </Text>
                </Pressable>
                {headerRight}
              </View>
            ) : null}

            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
