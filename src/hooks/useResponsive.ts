import { useWindowDimensions } from 'react-native';
import { BREAKPOINTS } from '../design-system/tokens/spacing';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isMobile = width <= BREAKPOINTS.mobileMax;
  const isTablet = width >= BREAKPOINTS.tabletMin && width < BREAKPOINTS.desktopMin;
  const isDesktop = width >= BREAKPOINTS.desktopMin;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
  };
}
