import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints
export const isTablet = width > 768;
export const isMobile = width < 768;
export const isSmallScreen = width < 375;
export const isLargeScreen = width > 1024;

// Screen dimensions
export const screenWidth = width;
export const screenHeight = height;

// Responsive sizing utilities
export const responsiveSize = {
  // Font sizes
  title: isTablet ? 32 : (isSmallScreen ? 20 : 24),
  subtitle: isTablet ? 18 : (isSmallScreen ? 14 : 16),
  body: isTablet ? 16 : (isSmallScreen ? 13 : 14),
  caption: isTablet ? 14 : (isSmallScreen ? 11 : 12),
  
  // Spacing - using flexible values
  padding: {
    small: isMobile ? 8 : 12,
    medium: isMobile ? 12 : 16,
    large: isMobile ? 16 : 20,
    xlarge: isMobile ? 24 : 32,
  },
  
  margin: {
    small: isMobile ? 4 : 6,
    medium: isMobile ? 8 : 10,
    large: isMobile ? 12 : 15,
    xlarge: isMobile ? 16 : 20,
  },
  
  // Component sizes - flexible and responsive
  buttonHeight: isSmallScreen ? 44 : (isMobile ? 48 : 56),
  inputHeight: isSmallScreen ? 48 : (isMobile ? 52 : 56),
  cardRadius: 12,
  photoSize: {
    small: Math.min(isTablet ? 60 : (isSmallScreen ? 44 : 50), width * 0.15),
    medium: Math.min(isTablet ? 200 : (isSmallScreen ? 160 : 180), width * 0.5),
    large: Math.min(isTablet ? 300 : (isSmallScreen ? 200 : 240), width * 0.8),
  },
};

// Line heights for better text readability
export const lineHeight = {
  title: isTablet ? 40 : (isSmallScreen ? 26 : 30),
  subtitle: isTablet ? 24 : (isSmallScreen ? 20 : 22),
  body: isTablet ? 22 : (isSmallScreen ? 18 : 20),
  caption: isTablet ? 20 : (isSmallScreen ? 16 : 18),
};

// Shadow styles for consistent elevation
export const shadows = {
  small: {
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  medium: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  large: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
};

// Container styles for consistent layout - flexible widths
export const containers = {
  main: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: responsiveSize.padding.large,
    maxWidth: '100%' as const,
    alignSelf: 'center' as const,
    width: '100%' as const,
    flex: 1,
  },
  card: {
    borderRadius: responsiveSize.cardRadius,
    overflow: 'hidden' as const,
    ...shadows.medium,
    width: '100%' as const,
  },
};

// Button styles for consistent touch targets - full width
export const buttons = {
  primary: {
    minHeight: responsiveSize.buttonHeight,
    width: '100%' as const,
    borderRadius: 8,
  },
  secondary: {
    minHeight: responsiveSize.buttonHeight,
    width: '100%' as const,
    borderRadius: 8,
  },
  content: {
    height: responsiveSize.buttonHeight,
  },
};

// Input styles for consistent form elements - full width
export const inputs = {
  text: {
    minHeight: responsiveSize.inputHeight,
    width: '100%' as const,
  },
  dense: isMobile,
};

// Flexible layout helpers
export const layout = {
  // Ensure content never exceeds screen width
  fullWidth: {
    width: '100%' as const,
    maxWidth: '100%' as const,
  },
  
  // Flexible container that adapts to screen size
  flexible: {
    flex: 1,
  },
  
  // Safe area for content
  safeArea: {
    paddingHorizontal: responsiveSize.padding.medium,
  },
  
  // Responsive grid - single column for mobile
  grid: {
    flexDirection: 'column' as const,
  },
  
  // Responsive row - stack vertically on mobile
  row: {
    flexDirection: 'column' as const,
  },
};

// Portrait orientation specific styles
export const portrait = {
  // Ensure proper scaling for portrait mode
  container: {
    flex: 1,
    width: '100%' as const,
    maxWidth: '100%' as const,
  },
  
  // Flexible content that adapts to portrait layout
  content: {
    flex: 1,
    width: '100%' as const,
    paddingHorizontal: responsiveSize.padding.medium,
  },
  
  // Full width elements for portrait
  fullWidth: {
    width: '100%' as const,
    maxWidth: '100%' as const,
  },
}; 