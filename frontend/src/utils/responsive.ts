import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Device detection
export const isTablet = width > 768;
export const isSmallScreen = width < 375;
export const isMobile = width < 768;
export const isLargeScreen = width > 1024;

// Screen dimensions
export const screenWidth = width;
export const screenHeight = height;

// Responsive scaling
export const scale = (size: number) => {
  const newSize = size * (width / 375); // Base on iPhone 8 width
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive font sizes
export const responsiveFontSize = {
  xs: scale(10),
  sm: scale(12),
  md: scale(14),
  lg: scale(16),
  xl: scale(18),
  xxl: scale(20),
  xxxl: scale(24),
};

// Responsive spacing
export const responsiveSpacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
  xxxl: scale(64),
};

// Responsive padding
export const responsivePadding = {
  xs: responsiveSpacing.xs,
  sm: responsiveSpacing.sm,
  md: responsiveSpacing.md,
  lg: responsiveSpacing.lg,
  xl: responsiveSpacing.xl,
};

// Responsive margins
export const responsiveMargin = {
  xs: responsiveSpacing.xs,
  sm: responsiveSpacing.sm,
  md: responsiveSpacing.md,
  lg: responsiveSpacing.lg,
  xl: responsiveSpacing.xl,
};

// Responsive component sizes
export const responsiveSizes = {
  buttonHeight: isTablet ? 56 : 48,
  inputHeight: isTablet ? 56 : 48,
  cardPadding: isTablet ? responsiveSpacing.lg : responsiveSpacing.md,
  avatarSize: isTablet ? 48 : 40,
  iconSize: isTablet ? 24 : 20,
};

// Responsive layout helpers
export const responsiveLayout = {
  // Grid columns
  getColumns: (minWidth: number = 300) => {
    return Math.floor(width / minWidth);
  },
  
  // Flexible width
  getFlexibleWidth: (percentage: number) => {
    return (width * percentage) / 100;
  },
  
  // Aspect ratio
  getAspectRatio: (ratio: number) => {
    return width / ratio;
  },
  
  // Safe area adjustments
  getSafePadding: (basePadding: number) => {
    return isSmallScreen ? basePadding * 0.8 : basePadding;
  },
};

// Responsive breakpoints
export const breakpoints = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
  large: 1200,
};

// Responsive media queries (for conditional styling)
export const mediaQuery = {
  mobile: width <= breakpoints.mobile,
  tablet: width > breakpoints.mobile && width <= breakpoints.tablet,
  desktop: width > breakpoints.tablet && width <= breakpoints.desktop,
  large: width > breakpoints.desktop,
};

// Responsive text scaling
export const getResponsiveTextSize = (baseSize: number) => {
  if (isSmallScreen) return baseSize * 0.9;
  if (isTablet) return baseSize * 1.1;
  if (isLargeScreen) return baseSize * 1.2;
  return baseSize;
};

// Responsive spacing scaling
export const getResponsiveSpacing = (baseSpacing: number) => {
  if (isSmallScreen) return baseSpacing * 0.8;
  if (isTablet) return baseSpacing * 1.1;
  if (isLargeScreen) return baseSpacing * 1.2;
  return baseSpacing;
};

// Responsive layout patterns
export const layoutPatterns = {
  // Single column layout
  singleColumn: {
    flexDirection: 'column' as const,
    width: '100%',
  },
  
  // Two column layout (tablet)
  twoColumn: {
    flexDirection: isTablet ? 'row' as const : 'column' as const,
    flexWrap: 'wrap' as const,
  },
  
  // Grid layout
  grid: (columns: number = 2) => ({
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  }),
  
  // Responsive card layout
  card: {
    width: isTablet ? '48%' : '100%',
    marginBottom: responsiveSpacing.md,
  },
  
  // Responsive input layout
  input: {
    width: isTablet ? '48%' : '100%',
    marginBottom: responsiveSpacing.sm,
  },
  
  // Responsive button layout
  button: {
    width: isTablet ? 'auto' : '100%',
    marginBottom: responsiveSpacing.sm,
  },
};

export default {
  isTablet,
  isSmallScreen,
  isMobile,
  isLargeScreen,
  screenWidth,
  screenHeight,
  scale,
  responsiveFontSize,
  responsiveSpacing,
  responsivePadding,
  responsiveMargin,
  responsiveSizes,
  responsiveLayout,
  breakpoints,
  mediaQuery,
  getResponsiveTextSize,
  getResponsiveSpacing,
  layoutPatterns,
}; 