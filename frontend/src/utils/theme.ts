import { MD3LightTheme } from 'react-native-paper';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Device detection
export const isTablet = width > 768;
export const isMobile = width < 768;
export const isSmallScreen = width < 375;
export const isLargeScreen = width > 1024;

// Modern Color Palette
export const colors = {
  // Primary colors - elegant blue
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  
  // Secondary colors - neutral grays
  secondary: '#64748b',
  secondaryLight: '#94a3b8',
  secondaryDark: '#475569',
  
  // Background colors
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceVariant: '#f1f5f9',
  
  // Text colors
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onBackground: '#1e293b',
  onSurface: '#1e293b',
  onSurfaceVariant: '#64748b',
  
  // Status colors
  success: '#10b981',
  successLight: '#34d399',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  error: '#ef4444',
  errorLight: '#f87171',
  info: '#3b82f6',
  infoLight: '#60a5fa',
  
  // Border and divider colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#e2e8f0',
  
  // Shadow colors
  shadow: '#000000',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

// Typography System
export const typography = {
  // Font sizes
  displayLarge: isTablet ? 48 : 32,
  displayMedium: isTablet ? 40 : 28,
  displaySmall: isTablet ? 32 : 24,
  
  headlineLarge: isTablet ? 28 : 22,
  headlineMedium: isTablet ? 24 : 20,
  headlineSmall: isTablet ? 20 : 18,
  
  titleLarge: isTablet ? 18 : 16,
  titleMedium: isTablet ? 16 : 14,
  titleSmall: isTablet ? 14 : 12,
  
  bodyLarge: isTablet ? 16 : 14,
  bodyMedium: isTablet ? 14 : 13,
  bodySmall: isTablet ? 12 : 11,
  
  labelLarge: isTablet ? 14 : 12,
  labelMedium: isTablet ? 12 : 11,
  labelSmall: isTablet ? 10 : 9,
  
  // Font weights
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  
  // Line heights
  lineHeight: {
    displayLarge: isTablet ? 56 : 40,
    displayMedium: isTablet ? 48 : 36,
    displaySmall: isTablet ? 40 : 32,
    
    headlineLarge: isTablet ? 36 : 28,
    headlineMedium: isTablet ? 32 : 26,
    headlineSmall: isTablet ? 28 : 24,
    
    titleLarge: isTablet ? 24 : 22,
    titleMedium: isTablet ? 22 : 20,
    titleSmall: isTablet ? 20 : 18,
    
    bodyLarge: isTablet ? 24 : 22,
    bodyMedium: isTablet ? 22 : 20,
    bodySmall: isTablet ? 20 : 18,
    
    labelLarge: isTablet ? 20 : 18,
    labelMedium: isTablet ? 18 : 16,
    labelSmall: isTablet ? 16 : 14,
  },
};

// Spacing System
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  
  // Responsive spacing
  padding: {
    xs: isMobile ? 4 : 6,
    sm: isMobile ? 8 : 12,
    md: isMobile ? 16 : 20,
    lg: isMobile ? 24 : 32,
    xl: isMobile ? 32 : 40,
  },
  
  margin: {
    xs: isMobile ? 4 : 6,
    sm: isMobile ? 8 : 10,
    md: isMobile ? 12 : 16,
    lg: isMobile ? 16 : 24,
    xl: isMobile ? 24 : 32,
  },
};

// Border Radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 50,
};

// Shadows
export const shadows = {
  none: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  sm: {
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  md: {
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lg: {
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  xl: {
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
};

// Component Sizes
export const sizes = {
  // Button heights
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  // Input heights
  inputHeight: {
    sm: 40,
    md: 48,
    lg: 56,
  },
  
  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Avatar sizes
  avatar: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    xxl: 80,
  },
  
  // Card sizes
  card: {
    minHeight: 80,
    maxWidth: isTablet ? 600 : '100%',
  },
};

// Animation
export const animation = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Create React Native Paper theme
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    tertiary: colors.info,
    tertiaryContainer: colors.infoLight,
    
    background: colors.background,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    
    onPrimary: colors.onPrimary,
    onPrimaryContainer: colors.onPrimary,
    onSecondary: colors.onSecondary,
    onSecondaryContainer: colors.onSecondary,
    onTertiary: colors.onPrimary,
    onTertiaryContainer: colors.onPrimary,
    
    onBackground: colors.onBackground,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    
    outline: colors.border,
    outlineVariant: colors.borderLight,
    
    error: colors.error,
    errorContainer: colors.errorLight,
    onError: colors.onPrimary,
    onErrorContainer: colors.onPrimary,
    
    surfaceDisabled: colors.surfaceVariant,
    onSurfaceDisabled: colors.onSurfaceVariant,
    
    backdrop: colors.overlay,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    // Customize fonts if needed
  },
  roundness: borderRadius.md,
};

// Layout helpers
export const layout = {
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Content styles
  content: {
    flex: 1,
    paddingHorizontal: spacing.padding.md,
    paddingVertical: spacing.padding.lg,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  
  // Row styles
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  // Column styles
  column: {
    flexDirection: 'column' as const,
  },
  
  // Center styles
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  // Space between
  spaceBetween: {
    justifyContent: 'space-between' as const,
  },
  
  // Responsive grid
  grid: {
    flexDirection: isMobile ? 'column' as const : 'row' as const,
    flexWrap: 'wrap' as const,
  },
  
  // Responsive column
  responsiveColumn: {
    flex: 1,
    marginHorizontal: isMobile ? 0 : spacing.sm,
  },
};

// Status indicators
export const status = {
  active: {
    backgroundColor: colors.successLight,
    color: colors.success,
    borderColor: colors.success,
  },
  inactive: {
    backgroundColor: colors.secondaryLight,
    color: colors.secondary,
    borderColor: colors.secondary,
  },
  pending: {
    backgroundColor: colors.warningLight,
    color: colors.warning,
    borderColor: colors.warning,
  },
  error: {
    backgroundColor: colors.errorLight,
    color: colors.error,
    borderColor: colors.error,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  sizes,
  animation,
  paperTheme,
  layout,
  status,
  isTablet,
  isMobile,
  isSmallScreen,
  isLargeScreen,
}; 