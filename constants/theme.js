import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Colors
export const COLORS = {
  // Primary colors
  primary: '#085cf4',
  primaryLight: '#3d7df6',
  primaryDark: '#0544c7',

  // Secondary colors
  secondary: '#ff6b35',
  secondaryLight: '#ff8a5c',
  secondaryDark: '#e55a2b',

  // Background colors
  background: '#f8fafc',
  white: '#ffffff',
  card: '#ffffff',

  // Text colors
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  textLight: '#a0aec0',

  // Status colors
  success: '#48bb78',
  warning: '#ed8936',
  error: '#f56565',
  info: '#4299e1',

  // Gray scale
  gray50: '#f7fafc',
  gray100: '#edf2f7',
  gray200: '#e2e8f0',
  gray300: '#cbd5e0',
  gray400: '#a0aec0',
  gray500: '#718096',
  gray600: '#4a5568',
  gray700: '#2d3748',
  gray800: '#1a202c',
  gray900: '#171923',

  // Border colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
};

// Typography
export const FONT = {
  regular: 'DMRegular',
  medium: 'DMMedium',
  bold: 'DMBold',

  // Text scale aliases used across the app
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
};

// Shared sizing tokens
export const SIZES = {
  // Legacy values kept for backwards compatibility
  base: 8,
  font: 14,
  padding: 24,

  // Display typography scale (existing usage in the codebase)
  largeTitle: 40,
  h1: 30,
  h2: 22,
  h3: 16,
  h4: 14,
  body1: 30,
  body2: 22,
  body3: 16,
  body4: 14,
  body5: 12,

  // Device dimensions
  width,
  height,

  // Modern spacing / sizing aliases referenced throughout the UI layer
  xs: 4,
  sm: 8,
  small: 14,
  md: 16,
  medium: 16,
  lg: 24,
  large: 18,
  xl: 32,
  xLarge: 20,
  xxl: 48,
  xxLarge: 24,
  xxxl: 64,
  xxxLarge: 32,

  // Border radii
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },

  // Gap helpers retained for components that use the nested object
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
};

// Shadows
export const SHADOWS = {
  light: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 7,
  },
  dark: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.41,
    shadowRadius: 9.11,
    elevation: 14,
  },
  lg: {
    shadowColor: COLORS.shadowDark,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20,
  },
};

// Standalone spacing helpers (provides both shorthand and descriptive aliases)
export const SPACING = {
  xs: 4,
  sm: 8,
  small: 8,
  md: 16,
  medium: 16,
  lg: 24,
  large: 24,
  xl: 32,
  xLarge: 32,
  xxl: 48,
  xxLarge: 48,
  xxxl: 64,
  xxxLarge: 64,
};

// Animation
export const ANIMATION = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export default { COLORS, FONT, SIZES, SHADOWS, SPACING, ANIMATION };
