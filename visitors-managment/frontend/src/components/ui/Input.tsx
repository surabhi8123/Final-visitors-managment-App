import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';
import { colors, typography, spacing, borderRadius, sizes } from '../../utils/theme';

export interface InputProps extends Omit<TextInputProps, 'mode'> {
  variant?: 'outlined' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
}

export const Input: React.FC<InputProps> = ({
  variant = 'outlined',
  size = 'md',
  fullWidth = true,
  error = false,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  onLeftIconPress,
  style,
  contentStyle,
  outlineStyle,
  ...props
}) => {
  const getInputStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.md,
      minHeight: sizes.inputHeight[size],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    return baseStyle;
  };

  const getContentStyle = (): ViewStyle => {
    return {
      height: sizes.inputHeight[size],
      paddingHorizontal: spacing.md,
    };
  };

  const getOutlineStyle = () => {
    return {
      borderRadius: borderRadius.md,
      borderColor: error ? colors.error : colors.border,
    };
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return undefined;
    
    return (
      <TextInput.Icon
        icon={leftIcon}
        onPress={onLeftIconPress}
      />
    );
  };

  const renderRightIcon = () => {
    if (!rightIcon) return undefined;
    
    return (
      <TextInput.Icon
        icon={rightIcon}
        onPress={onRightIconPress}
      />
    );
  };

  return (
    <TextInput
      mode={variant}
      error={error}
      style={[getInputStyle(), style]}
      contentStyle={[getContentStyle(), contentStyle]}
      outlineStyle={[getOutlineStyle(), outlineStyle]}
      left={renderLeftIcon()}
      right={renderRightIcon()}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
}); 