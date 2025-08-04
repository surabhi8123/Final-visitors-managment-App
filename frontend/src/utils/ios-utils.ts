import { Platform, Dimensions } from 'react-native';

// iOS-specific constants and utilities
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// iOS device detection
export const isIPad = () => {
  const { width, height } = Dimensions.get('window');
  return isIOS && (width >= 768 || height >= 768);
};

export const isIPhone = isIOS && !isIPad();

// iOS-specific styling
export const iosStyles = {
  // Safe area handling for iOS devices with notch
  safeArea: {
    paddingTop: isIOS ? 0 : 0, // Let SafeAreaView handle this
    paddingBottom: isIOS ? 0 : 0,
  },
  
  // iOS-specific shadow styles (iOS uses shadowColor, shadowOffset, etc.)
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Android elevation
  },
  
  // iOS-specific button styles
  button: {
    borderRadius: 8,
    overflow: 'hidden' as const,
  },
  
  // iOS-specific input styles
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  
  // iOS-specific card styles
  card: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
};

// iOS-specific behavior helpers
export const iosHelpers = {
  // Keyboard avoiding behavior
  keyboardBehavior: isIOS ? 'padding' : 'height',
  
  // Keyboard vertical offset
  keyboardVerticalOffset: isIOS ? 0 : 20,
  
  // Scroll behavior
  scrollBehavior: 'handled' as const,
  
  // Touch feedback
  touchFeedback: isIOS ? 'opacity' : 'ripple',
};

// iOS-specific permissions handling
export const iosPermissions = {
  // Camera permission message
  cameraMessage: 'Please grant camera permission in Settings to take visitor photos.',
  
  // Photo library permission message
  photoLibraryMessage: 'Please grant photo library permission in Settings to select photos.',
  
  // Settings URL
  settingsURL: 'app-settings:',
};

// iOS-specific image picker options
export const iosImagePickerOptions = {
  // Higher quality for iOS devices
  quality: 0.9,
  
  // Full screen presentation for better UX
  presentationStyle: 'fullScreen' as const,
  
  // Disable EXIF for privacy
  exif: false,
  
  // Allow editing for better photo composition
  allowsEditing: true,
  
  // Aspect ratio for consistent photos
  aspect: [4, 3] as [number, number],
};

// iOS-specific network configuration
export const iosNetworkConfig = {
  // Allow insecure connections for development
  allowsArbitraryLoads: true,
  
  // Exception domains for local development
  exceptionDomains: [
    'localhost',
    '127.0.0.1',
    '192.168.1.19',
    '192.168.1.19',
  ],
};

// iOS-specific responsive design helpers
export const iosResponsive = {
  // iPhone-specific breakpoints
  isIPhoneSE: () => {
    const { width, height } = Dimensions.get('window');
    return isIPhone && (width === 375 || height === 375);
  },
  
  isIPhoneX: () => {
    const { width, height } = Dimensions.get('window');
    return isIPhone && (width === 375 || width === 414) && (height === 812 || height === 896);
  },
  
  // iPad-specific breakpoints
  isIPadPro: () => {
    const { width, height } = Dimensions.get('window');
    return isIPad() && (width >= 1024 || height >= 1024);
  },
  
  // Dynamic sizing based on device
  getResponsiveSize: (mobile: number, tablet: number) => {
    return isIPad() ? tablet : mobile;
  },
  
  // Safe area insets
  getSafeAreaInsets: () => {
    // This would typically use react-native-safe-area-context
    return {
      top: isIPhone ? 44 : 0,
      bottom: isIPhone ? 34 : 0,
      left: 0,
      right: 0,
    };
  },
};

// iOS-specific error handling
export const iosErrorHandling = {
  // Format error messages for iOS
  formatErrorMessage: (error: string) => {
    if (isIOS) {
      return error.replace('device settings', 'Settings');
    }
    return error;
  },
  
  // iOS-specific error actions
  getErrorActions: (errorType: string) => {
    if (isIOS) {
      return [
        { text: 'OK' },
        { 
          text: 'Settings', 
          onPress: () => {
            // Open iOS Settings
            const { Linking } = require('react-native');
            Linking.openURL('app-settings:');
          }
        }
      ];
    }
    return [{ text: 'OK' }];
  },
}; 