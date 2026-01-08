/**
 * Themed Text component
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';
import { typography } from '@/src/theme';

type TypographyVariant = keyof typeof typography;

interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success';
}

export function Text({ 
  variant = 'bodyMedium', 
  color,
  style, 
  children, 
  ...props 
}: TextProps) {
  const { theme } = useTheme();

  const getColor = () => {
    switch (color) {
      case 'secondary': return theme.textSecondary;
      case 'muted': return theme.textMuted;
      case 'error': return '#EF4444';
      case 'success': return '#10B981';
      case 'primary':
      default: return theme.text;
    }
  };

  return (
    <RNText 
      style={[
        typography[variant],
        { color: getColor() },
        style,
      ]} 
      {...props}
    >
      {children}
    </RNText>
  );
}
