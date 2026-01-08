/**
 * Themed Button component
 */

import React from 'react';
import { 
  Pressable, 
  PressableProps, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from './ThemeContext';
import { Text } from './Text';
import { spacing, borderRadius, colors } from '@/src/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  children,
  ...props
}: ButtonProps) {
  const { theme, isDark } = useTheme();

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) return theme.surfaceVariant;
    
    switch (variant) {
      case 'primary':
        return pressed ? colors.primary[600] : colors.primary[500];
      case 'secondary':
        return pressed ? colors.secondary[600] : colors.secondary[500];
      case 'outline':
      case 'ghost':
        return pressed ? (isDark ? colors.neutral[800] : colors.neutral[100]) : 'transparent';
      default:
        return colors.primary[500];
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.textMuted;
    
    switch (variant) {
      case 'primary':
        return colors.neutral[900];
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return theme.text;
      default:
        return colors.neutral[900];
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? theme.textMuted : theme.border;
    }
    return 'transparent';
  };

  const sizeStyles: Record<ButtonSize, { paddingHorizontal: number; paddingVertical: number; minHeight: number }> = {
    sm: { paddingHorizontal: spacing[3], paddingVertical: spacing[1], minHeight: 32 },
    md: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], minHeight: 44 },
    lg: { paddingHorizontal: spacing[6], paddingVertical: spacing[3], minHeight: 52 },
  };

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: pressed ? 0.9 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text 
          variant={size === 'sm' ? 'labelMedium' : 'labelLarge'}
          style={[{ color: getTextColor(), textAlign: 'center' }, textStyle]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  fullWidth: {
    width: '100%',
  },
});
