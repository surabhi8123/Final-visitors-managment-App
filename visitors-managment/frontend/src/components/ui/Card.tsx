import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Card as PaperCard, CardProps } from 'react-native-paper';
import { colors, spacing, borderRadius, shadows } from '../../utils/theme';

export interface CustomCardProps extends Omit<CardProps, 'mode' | 'elevation'> {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CustomCardProps> = ({
  variant = 'elevated',
  padding = 'md',
  fullWidth = true,
  children,
  style,
  contentStyle,
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          ...shadows.md,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.surfaceVariant,
        };
      default:
        return baseStyle;
    }
  };

  const getContentStyle = (): ViewStyle => {
    const paddingMap = {
      none: 0,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
      xl: spacing.xl,
    };

    return {
      padding: paddingMap[padding],
    };
  };

  return (
    <PaperCard
      style={[getCardStyle(), style]}
      contentStyle={[getContentStyle(), contentStyle]}
      {...props}
    >
      {children}
    </PaperCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
}); 