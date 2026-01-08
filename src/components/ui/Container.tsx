/**
 * Container component for screen layouts
 */

import React from 'react';
import { View, ViewProps, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './ThemeContext';
import { spacing } from '@/src/theme';

interface ContainerProps extends ViewProps {
  scrollable?: boolean;
  padding?: keyof typeof spacing;
  safeArea?: boolean;
}

export function Container({ 
  scrollable = false, 
  padding = 4,
  safeArea = false,
  style, 
  children, 
  ...props 
}: ContainerProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.base,
    { 
      backgroundColor: theme.background,
      paddingHorizontal: spacing[padding],
    },
    safeArea && {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    },
    style,
  ];

  if (scrollable) {
    return (
      <ScrollView 
        style={[styles.base, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          { paddingHorizontal: spacing[padding] },
          safeArea && { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});
