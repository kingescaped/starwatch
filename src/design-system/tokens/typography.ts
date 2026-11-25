import { Platform } from 'react-native';

export const FONT_FAMILIES = {
  sansRegular: Platform.select({
    web: 'PlusJakartaSans_400Regular, "Plus Jakarta Sans", Inter, sans-serif',
    default: 'PlusJakartaSans_400Regular',
  }),
  sansMedium: Platform.select({
    web: 'PlusJakartaSans_500Medium, "Plus Jakarta Sans", Inter, sans-serif',
    default: 'PlusJakartaSans_500Medium',
  }),
  sansSemiBold: Platform.select({
    web: 'PlusJakartaSans_600SemiBold, "Plus Jakarta Sans", Inter, sans-serif',
    default: 'PlusJakartaSans_600SemiBold',
  }),
  sansBold: Platform.select({
    web: 'PlusJakartaSans_700Bold, "Plus Jakarta Sans", Inter, sans-serif',
    default: 'PlusJakartaSans_700Bold',
  }),
  monoRegular: Platform.select({
    web: 'JetBrainsMono_400Regular, "JetBrains Mono", monospace',
    default: 'JetBrainsMono_400Regular',
  }),
  monoMedium: Platform.select({
    web: 'JetBrainsMono_500Medium, "JetBrains Mono", monospace',
    default: 'JetBrainsMono_500Medium',
  }),
  monoBold: Platform.select({
    web: 'JetBrainsMono_700Bold, "JetBrains Mono", monospace',
    default: 'JetBrainsMono_700Bold',
  }),
};

export const TYPE_SCALE = {
  display: { fontSize: 32, lineHeight: 38 },
  h1: { fontSize: 20, lineHeight: 26 },
  h2: { fontSize: 16, lineHeight: 22 },
  h3: { fontSize: 14, lineHeight: 20 },
  body: { fontSize: 13, lineHeight: 19 },
  bodySmall: { fontSize: 12, lineHeight: 17 },
  caption: { fontSize: 11, lineHeight: 15 },
} as const;
