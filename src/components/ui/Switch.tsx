/**
 * Themed Switch component
 */

import React from 'react';
import { 
  Switch as RNSwitch, 
  SwitchProps as RNSwitchProps,
  View,
  StyleSheet,
} from 'react-native';
import { useTheme } from './ThemeContext';
import { Text } from './Text';
import { colors, spacing } from '@/src/theme';

interface SwitchProps extends Omit<RNSwitchProps, 'trackColor' | 'thumbColor'> {
  label?: string;
  description?: string;
}

export function Switch({ label, description, value, ...props }: SwitchProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {label && <Text variant="bodyLarge">{label}</Text>}
        {description && <Text variant="bodySmall" color="secondary">{description}</Text>}
      </View>
      <RNSwitch
        value={value}
        trackColor={{
          false: isDark ? colors.neutral[700] : colors.neutral[300],
          true: colors.primary[500],
        }}
        thumbColor={value ? colors.neutral[50] : colors.neutral[100]}
        ios_backgroundColor={isDark ? colors.neutral[700] : colors.neutral[300]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  labelContainer: {
    flex: 1,
    marginRight: spacing[3],
  },
});
