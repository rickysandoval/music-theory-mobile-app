/**
 * Card component for content containers
 */

import React from 'react';
import { View, ViewProps, StyleSheet, Pressable } from 'react-native';
import { useTheme } from './ThemeContext';
import { spacing, borderRadius } from '@/src/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: keyof typeof spacing;
  onPress?: () => void;
}

export function Card({ 
  variant = 'elevated', 
  padding = 4,
  style, 
  onPress,
  children, 
  ...props 
}: CardProps) {
  const { theme, isDark } = useTheme();

  const getStyles = () => {
    const base = {
      backgroundColor: theme.surface,
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...base,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'outlined':
        return {
          ...base,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case 'filled':
        return {
          ...base,
          backgroundColor: theme.surfaceVariant,
        };
      default:
        return base;
    }
  };

  const content = (
    <View style={[getStyles(), style]} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
        {content}
      </Pressable>
    );
  }

  return content;
}
