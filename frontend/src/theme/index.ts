import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Device detection
export const isTablet = width > 768;
export const isSmallScreen = width < 375;
export const isMobile = width < 768;

// Color palette - Modern, elegant, minimalist
export const colors = {
  // Primary colors
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  
  // Secondary colors
  secondary: '#64748b',
  secondaryLight: '#94a3b8',
  secondaryDark: '#475569',
  
  // Neutral colors
  white: '#ffffff',
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Status colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  info: '#3b82f6',
  infoLight: '#60a5fa',
  
  // Background colors
  background: '#ffffff',
  surface: '#ffffff',
  surfaceVariant: '#f8fafc',
  
  // Text colors
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#64748b',
  textDisabled: '#94a3b8',
  
  // Border colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#cbd5e1',
};

// Typography system
const fontConfig = {
  displayLarge: {
    fontFamily: 'System',
    fontSize: isTablet ? 48 : 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: isTablet ? 56 : 40,
  },
  displayMedium: {
    fontFamily: 'System',
    fontSize: isTablet ? 36 : 28,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
    lineHeight: isTablet ? 44 : 36,
  },
  displaySmall: {
    fontFamily: 'System',
    fontSize: isTablet ? 24 : 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: isTablet ? 32 : 28,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontSize: isTablet ? 22 : 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: isTablet ? 28 : 24,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontSize: isTablet ? 20 : 16,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: isTablet ? 26 : 22,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontSize: isTablet ? 18 : 14,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: isTablet ? 24 : 20,
  },
  titleLarge: {
    fontFamily: 'System',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
    lineHeight: isTablet ? 22 : 20,
  },
  titleMedium: {
    fontFamily: 'System',
    fontSize: isTablet ? 14 : 13,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: isTablet ? 20 : 18,
  },
  titleSmall: {
    fontFamily: 'System',
    fontSize: isTablet ? 12 : 11,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: isTablet ? 18 : 16,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400' as const,
    letterSpacing: 0.5,
    lineHeight: isTablet ? 24 : 20,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontSize: isTablet ? 14 : 13,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: isTablet ? 20 : 18,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: isTablet ? 12 : 11,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: isTablet ? 18 : 16,
  },
  labelLarge: {
    fontFamily: 'System',
    fontSize: isTablet ? 14 : 13,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: isTablet ? 20 : 18,
  },
  labelMedium: {
    fontFamily: 'System',
    fontSize: isTablet ? 12 : 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: isTablet ? 18 : 16,
  },
  labelSmall: {
    fontFamily: 'System',
    fontSize: isTablet ? 10 : 9,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: isTablet ? 16 : 14,
  },
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius system
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadow system
export const shadows = {
  sm: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Create the theme
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    tertiary: colors.gray500,
    tertiaryContainer: colors.gray200,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    background: colors.background,
    error: colors.error,
    errorContainer: colors.errorLight,
    onPrimary: colors.white,
    onPrimaryContainer: colors.gray900,
    onSecondary: colors.white,
    onSecondaryContainer: colors.gray900,
    onTertiary: colors.white,
    onTertiaryContainer: colors.gray900,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onBackground: colors.textPrimary,
    onError: colors.white,
    onErrorContainer: colors.gray900,
    outline: colors.border,
    outlineVariant: colors.borderLight,
    shadow: colors.gray900,
    scrim: colors.gray900,
    inverseSurface: colors.gray900,
    inverseOnSurface: colors.white,
    inversePrimary: colors.primaryLight,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
};

// Component-specific styles
export const componentStyles = {
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  
  // Input styles
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  
  // Button styles
  button: {
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Header styles
  header: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
};

// Responsive utilities
export const responsive = {
  // Font sizes
  fontSize: {
    xs: isTablet ? 10 : 8,
    sm: isTablet ? 12 : 10,
    md: isTablet ? 14 : 12,
    lg: isTablet ? 16 : 14,
    xl: isTablet ? 18 : 16,
    xxl: isTablet ? 20 : 18,
    xxxl: isTablet ? 24 : 20,
  },
  
  // Spacing
  padding: {
    xs: isTablet ? spacing.xs : spacing.xs,
    sm: isTablet ? spacing.sm : spacing.xs,
    md: isTablet ? spacing.md : spacing.sm,
    lg: isTablet ? spacing.lg : spacing.md,
    xl: isTablet ? spacing.xl : spacing.lg,
  },
  
  // Component sizes
  buttonHeight: isTablet ? 56 : 48,
  inputHeight: isTablet ? 56 : 48,
  cardPadding: isTablet ? spacing.lg : spacing.md,
};

// Export responsive utilities from the dedicated file
export * from '../utils/responsive';

export default theme; 