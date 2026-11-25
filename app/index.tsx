import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../src/design-system/theme/ThemeContext';
import { useResponsive } from '../src/hooks/useResponsive';
import { DesktopShell } from '../src/features/shells/DesktopShell';
import { MobileShell } from '../src/features/shells/MobileShell';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {isMobile ? <MobileShell /> : <DesktopShell />}
    </View>
  );
}
