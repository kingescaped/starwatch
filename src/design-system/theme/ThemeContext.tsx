import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { THEMES, ThemeColors, ThemeMode } from '../tokens/colors';
import { playUiSound } from '../../utils/soundEngine';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  colors: ThemeColors;
  isDark: boolean;
  isLight: boolean;
  isRed: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    playUiSound('theme');
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setMode,
      colors: THEMES[mode],
      isDark: mode === 'dark',
      isLight: mode === 'light',
      isRed: mode === 'red',
    }),
    [mode, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
