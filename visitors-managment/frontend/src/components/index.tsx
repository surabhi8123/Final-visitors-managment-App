import React, { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text as RNText,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  Chip,
  Avatar,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { 
  colors, 
  spacing, 
  borderRadius, 
  shadows, 
  responsive, 
  componentStyles, 
  isMobile,
  isTablet,
  getResponsiveSpacing,
  getResponsiveTextSize,
  theme as appTheme,
} from '../theme';

// Export components
export { default as AuthGuard } from './AuthGuard';
export { LoadingView } from './LoadingView';

// Status Chip Component
export const StatusChip = ({
  status,
  isActive = false,
  size = 'medium'
}: {
  status: string;
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    if (isActive) return colors.success;
    return colors.gray500;
  };

  const getStatusBackground = () => {
    if (isActive) return colors.successLight + '20';
    return colors.gray100;
  };

  const getSize = () => {
    switch (size) {
      case 'small': return { fontSize: getResponsiveTextSize(responsive.fontSize.xs), padding: getResponsiveSpacing(spacing.xs) };
      case 'large': return { fontSize: getResponsiveTextSize(responsive.fontSize.md), padding: getResponsiveSpacing(spacing.sm) };
      default: return { fontSize: getResponsiveTextSize(responsive.fontSize.sm), padding: getResponsiveSpacing(spacing.xs) };
    }
  };

  return (
    <View style={[
      styles.statusChip,
      {
        backgroundColor: getStatusBackground(),
        borderColor: getStatusColor(),
        ...getSize(),
      }
    ]}>
      <RNText style={[
        styles.statusText,
        {
          color: getStatusColor(),
          fontSize: getSize().fontSize,
        }
      ]}>
        {status}
      </RNText>
    </View>
  );
};

// Visitor Card Component
export const VisitorCard = ({
  visitor,
  onCheckOut,
  onPress,
  showActions = true
}: {
  visitor: any;
  onCheckOut?: (id: string) => void;
  onPress?: () => void;
  showActions?: boolean;
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [photoError, setPhotoError] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getVisitorPhoto = () => {
    // Get the first photo from the visitor's photos array
    if (visitor.photos && visitor.photos.length > 0) {
      const photo = visitor.photos[0];
      // Return the image_url if available, otherwise construct the URL from image field
      if (photo.image_url) {
        return photo.image_url;
      } else if (photo.image) {
        // If image_url is not available, construct the full URL
        const baseUrl = 'http://localhost:8000'; // Match your backend URL
        return `${baseUrl}${photo.image}`;
      }
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getVisitorName = () => {
    return visitor.visitor_name || visitor.name || 'Unknown Visitor';
  };

  const getVisitorEmail = () => {
    return visitor.visitor_email || visitor.email || 'No email';
  };

  const getVisitorPhone = () => {
    return visitor.visitor_phone || visitor.phone || 'No phone';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.visitorCard}>
        <Card.Content style={styles.visitorCardContent}>
          <View style={styles.visitorHeader}>
            <View style={styles.visitorInfo}>
              {getVisitorPhoto() && !photoError ? (
                <Avatar.Image
                  size={isTablet ? 48 : 40}
                  source={{ uri: getVisitorPhoto() }}
                  style={{ backgroundColor: colors.primary }}
                  onError={() => {
                    // If photo fails to load, set error state to show initials
                    console.log('Failed to load visitor photo');
                    setPhotoError(true);
                  }}
                />
              ) : (
                <Avatar.Text
                  size={isTablet ? 48 : 40}
                  label={getInitials(getVisitorName())}
                  style={{ backgroundColor: colors.primary }}
                />
              )}
              <View style={styles.visitorDetails}>
                <Title style={styles.visitorName} numberOfLines={1}>
                  {getVisitorName()}
                </Title>
                <Paragraph style={styles.visitorContact} numberOfLines={1}>
                  {getVisitorEmail()} • {getVisitorPhone()}
                </Paragraph>
              </View>
            </View>
            <StatusChip
              status={visitor.is_active ? 'Active' : 'Completed'}
              isActive={visitor.is_active}
              size={isTablet ? 'medium' : 'small'}
            />
          </View>

          <View style={styles.visitorBody}>
            <Paragraph style={styles.visitorPurpose} numberOfLines={2}>
              <RNText style={styles.label}>Purpose: </RNText>
              {visitor.purpose || 'No purpose specified'}
            </Paragraph>

            <View style={styles.visitorTimeContainer}>
              <Paragraph style={styles.visitorTime}>
                <RNText style={styles.label}>Check-in: </RNText>
                {formatDate(visitor.check_in_time)}
              </Paragraph>

              {visitor.check_out_time && (
                <Paragraph style={styles.visitorTime}>
                  <RNText style={styles.label}>Check-out: </RNText>
                  {formatDate(visitor.check_out_time)}
                </Paragraph>
              )}

              {visitor.duration_formatted && visitor.duration_formatted !== 'N/A' && (
                <Paragraph style={styles.visitorTime}>
                  <RNText style={styles.label}>Duration: </RNText>
                  {visitor.duration_formatted}
                </Paragraph>
              )}
            </View>
          </View>

          {showActions && visitor.is_active && onCheckOut && (
            <View style={styles.visitorActions}>
              <View style={styles.visitorActionButtons}>
                <Button
                  mode="outlined"
                  onPress={(e) => {
                    e.stopPropagation();
                    const signatureData = visitor.signature_data || visitor.signature;
                    const signatureUrl = visitor.signature_url ||
                      (signatureData && signatureData.startsWith('http') ? signatureData : null);

                    router.push({
                      pathname: "/visitor-detail",
                      params: {
                        id: visitor.id,
                        name: getVisitorName(),
                        email: getVisitorEmail(),
                        phone: getVisitorPhone(),
                        purpose: visitor.purpose,
                        checkInTime: visitor.check_in_time,
                        checkOutTime: visitor.check_out_time,
                        signatureUrl: signatureUrl,
                        signature_data: signatureData && !signatureData.startsWith('http') ? signatureData : undefined,
                        photoUrl: getVisitorPhoto(),
                      },
                    });
                  }}
                  style={[styles.actionButton, { marginRight: spacing.xs }]}
                  labelStyle={styles.actionButtonLabel}
                  icon="eye"
                  compact={isMobile}
                >
                  View
                </Button>
                {showActions && visitor.is_active && onCheckOut && (
                  <Button
                    mode="outlined"
                    onPress={(e) => {
                      e.stopPropagation();
                      onCheckOut(visitor.id);
                    }}
                    style={styles.actionButton}
                    labelStyle={styles.checkOutButtonLabel}
                    icon="logout"
                    compact={isMobile}
                  >
                    Check Out
                  </Button>
                )}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// Empty State Component
export const EmptyState = ({
  title,
  message,
  icon = 'inbox-outline'
}: {
  title: string;
  message: string;
  icon?: string;
}) => {
  return (
    <View style={styles.emptyContainer}>
      <IconButton
        icon={icon}
        size={isTablet ? 64 : 48}
        iconColor={colors.gray400}
      />
      <Title style={styles.emptyTitle}>{title}</Title>
      <Paragraph style={styles.emptyMessage}>{message}</Paragraph>
    </View>
  );
};

// Section Header Component
export const SectionHeader = ({ 
  title, 
  subtitle,
  action 
}: { 
  title: string; 
  subtitle?: string;
  action?: React.ReactNode;
}) => {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Title style={styles.sectionTitle}>{title}</Title>
        {subtitle && (
          <Paragraph style={styles.sectionSubtitle}>{subtitle}</Paragraph>
        )}
      </View>
      {action && (
        <View style={styles.sectionAction}>
          {action}
        </View>
      )}
    </View>
  );
};

// Filter Card Component
export const FilterCard = ({ 
  children, 
  title 
}: { 
  children: React.ReactNode; 
  title?: string;
}) => {
  return (
    <Card style={styles.filterCard}>
      <Card.Content style={styles.filterCardContent}>
        {title && (
          <Title style={styles.filterTitle}>{title}</Title>
        )}
        {children}
      </Card.Content>
    </Card>
  );
};

// Enhanced TextInput Component
export const EnhancedTextInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  error,
  disabled = false,
  style,
  containerStyle,
  ...props 
}: any) => {
  const theme = useTheme();
  
  return (
    <View style={containerStyle}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        error={!!error}
        disabled={disabled}
        mode="outlined"
        style={[{
          fontSize: getResponsiveTextSize(responsive.fontSize.md),
          minHeight: 56, // Increased minimum height for better touch targets
        }, style]}
        contentStyle={{
          fontSize: getResponsiveTextSize(responsive.fontSize.md),
        }}
        outlineStyle={{
          borderRadius: borderRadius.sm,
          borderWidth: 1,
        }}
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
            primary: colors.primary,
            placeholder: colors.textTertiary,
            text: colors.textPrimary,
            onSurface: disabled ? colors.textDisabled : colors.textPrimary,
          },
        }}
        {...props}
      />
      {error && (
        <RNText style={styles.errorText}>
          {error}
        </RNText>
      )}
    </View>
  );
};

// Enhanced Button Component
export const EnhancedButton = ({ 
  mode = 'contained', 
  children, 
  loading = false,
  disabled = false,
  style,
  labelStyle,
  ...props 
}: any) => {
  return (
    <Button
      mode={mode}
      loading={loading}
      disabled={disabled}
      style={[{
        borderRadius: borderRadius.sm,
        marginVertical: getResponsiveSpacing(spacing.sm),
      }, style]}
      contentStyle={{
        height: responsive.buttonHeight,
      }}
      labelStyle={[{
        fontSize: getResponsiveTextSize(responsive.fontSize.md),
        fontWeight: '500',
        paddingVertical: 4,
        paddingHorizontal: 8,
      }, labelStyle]}
      theme={{
        ...appTheme,
        colors: {
          ...appTheme.colors,
          primary: colors.primary,
          onPrimary: colors.white,
          onSurface: disabled ? colors.textDisabled : colors.primary,
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  // Status Chip
  statusChip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    minWidth: isTablet ? 80 : 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Visitor Card
  visitorCard: {
    ...componentStyles.card,
    marginBottom: getResponsiveSpacing(spacing.md),
    flex: isTablet ? 0.48 : 1,
    minHeight: isTablet ? 200 : 160,
  },
  visitorCardContent: {
    padding: getResponsiveSpacing(responsive.cardPadding),
  },
  visitorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: getResponsiveSpacing(spacing.md),
  },
  visitorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: getResponsiveSpacing(spacing.sm),
  },
  visitorDetails: {
    marginLeft: getResponsiveSpacing(spacing.md),
    flex: 1,
    minWidth: 0, // Allows text to wrap properly
  },
  visitorName: {
    fontSize: getResponsiveTextSize(responsive.fontSize.lg),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: getResponsiveSpacing(spacing.xs),
  },
  visitorContact: {
    fontSize: getResponsiveTextSize(responsive.fontSize.sm),
    color: colors.textSecondary,
  },
  visitorBody: {
    marginBottom: getResponsiveSpacing(spacing.md),
  },
  visitorPurpose: {
    fontSize: getResponsiveTextSize(responsive.fontSize.md),
    marginBottom: getResponsiveSpacing(spacing.sm),
    color: colors.textPrimary,
    lineHeight: getResponsiveTextSize(responsive.fontSize.md) * 1.4,
  },
  visitorTime: {
    fontSize: getResponsiveTextSize(responsive.fontSize.sm),
    marginBottom: getResponsiveSpacing(spacing.xs),
    color: colors.textSecondary,
    flex: isTablet ? 1 : undefined,
  },
  label: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  visitorActions: {
    marginTop: spacing.sm,
  },
  visitorActionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionButton: {
    minWidth: 100,
  },
  checkOutButton: {
    borderColor: colors.error,
  },
  checkOutButtonLabel: {
    color: colors.error,
  },
  actionButtonLabel: {
    color: colors.primary,
  },
  errorText: {
    color: colors.error,
    fontSize: getResponsiveTextSize(responsive.fontSize.sm),
    marginTop: 2,
    marginLeft: 4,
  },
  visitorTimeContainer: {
    flexDirection: isTablet ? 'row' : 'column',
    justifyContent: isTablet ? 'space-between' : 'flex-start',
    marginTop: getResponsiveSpacing(spacing.xs),
    gap: isTablet ? getResponsiveSpacing(spacing.sm) : getResponsiveSpacing(spacing.xs),
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: getResponsiveSpacing(spacing.md),
    fontSize: getResponsiveTextSize(responsive.fontSize.md),
    color: colors.textSecondary,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing(spacing.xxxl),
  },
  emptyTitle: {
    fontSize: getResponsiveTextSize(responsive.fontSize.lg),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: getResponsiveSpacing(spacing.sm),
  },
  emptyMessage: {
    fontSize: getResponsiveTextSize(responsive.fontSize.md),
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: getResponsiveSpacing(spacing.lg),
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing(spacing.md),
    paddingVertical: getResponsiveSpacing(spacing.md),
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: getResponsiveTextSize(responsive.fontSize.lg),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: getResponsiveTextSize(responsive.fontSize.sm),
    color: colors.textSecondary,
    marginTop: getResponsiveSpacing(spacing.xs),
  },
  sectionAction: {
    marginLeft: getResponsiveSpacing(spacing.md),
  },
  
  // Filter Card
  filterCard: {
    ...componentStyles.card,
    marginBottom: getResponsiveSpacing(spacing.md),
  },
  filterCardContent: {
    padding: getResponsiveSpacing(responsive.cardPadding),
  },
  filterTitle: {
    fontSize: getResponsiveTextSize(responsive.fontSize.lg),
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: getResponsiveSpacing(spacing.md),
  },
  
  // Enhanced Input
  enhancedInput: {
    backgroundColor: colors.surface,
    marginBottom: getResponsiveSpacing(spacing.md),
  },
  enhancedInputContent: {
    fontSize: getResponsiveTextSize(responsive.fontSize.md),
  },
  enhancedInputOutline: {
    borderRadius: borderRadius.sm,
  },
  
  // Enhanced Button
  enhancedButton: {
    borderRadius: borderRadius.sm,
    marginVertical: getResponsiveSpacing(spacing.sm),
  },
  enhancedButtonContent: {
    height: responsive.buttonHeight,
  },
  enhancedButtonLabel: {
    fontSize: getResponsiveTextSize(responsive.fontSize.md),
    fontWeight: '500',
  },
}); 