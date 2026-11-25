/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        'sans-medium': ['PlusJakartaSans_500Medium', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        'sans-bold': ['PlusJakartaSans_700Bold', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrainsMono_400Regular', 'JetBrains Mono', 'monospace'],
        'mono-medium': ['JetBrainsMono_500Medium', 'JetBrains Mono', 'monospace'],
        'mono-bold': ['JetBrainsMono_700Bold', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
