import React from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Chip } from 'react-native-paper';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';

export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'error';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  children,
  style,
  textStyle,
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'active':
        return {
          backgroundColor: colors.successLight,
          textColor: colors.success,
          borderColor: colors.success,
        };
      case 'inactive':
        return {
          backgroundColor: colors.secondaryLight,
          textColor: colors.secondary,
          borderColor: colors.secondary,
        };
      case 'pending':
        return {
          backgroundColor: colors.warningLight,
          textColor: colors.warning,
          borderColor: colors.warning,
        };
      case 'completed':
        return {
          backgroundColor: colors.infoLight,
          textColor: colors.info,
          borderColor: colors.info,
        };
      case 'error':
        return {
          backgroundColor: colors.errorLight,
          textColor: colors.error,
          borderColor: colors.error,
        };
      default:
        return {
          backgroundColor: colors.secondaryLight,
          textColor: colors.secondary,
          borderColor: colors.secondary,
        };
    }
  };

  const getSizeStyles = () => {
    const colors = getStatusColors();
    
    switch (size) {
      case 'sm':
        return {
          height: 24,
          paddingHorizontal: spacing.xs,
          fontSize: typography.labelSmall,
          lineHeight: typography.lineHeight.labelSmall,
        };
      case 'md':
        return {
          height: 32,
          paddingHorizontal: spacing.sm,
          fontSize: typography.labelMedium,
          lineHeight: typography.lineHeight.labelMedium,
        };
      case 'lg':
        return {
          height: 40,
          paddingHorizontal: spacing.md,
          fontSize: typography.labelLarge,
          lineHeight: typography.lineHeight.labelLarge,
        };
      default:
        return {
          height: 32,
          paddingHorizontal: spacing.sm,
          fontSize: typography.labelMedium,
          lineHeight: typography.lineHeight.labelMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const statusColors = getStatusColors();

  return (
    <Chip
      style={[
        {
          backgroundColor: statusColors.backgroundColor,
          borderColor: statusColors.borderColor,
          borderWidth: 1,
          borderRadius: borderRadius.round,
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}
      textStyle={[
        {
          color: statusColors.textColor,
          fontSize: sizeStyles.fontSize,
          fontWeight: typography.semiBold,
          lineHeight: sizeStyles.lineHeight,
        },
        textStyle,
      ]}
      compact
    >
      {children}
    </Chip>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.round,
    borderWidth: 1,
  },
}); 