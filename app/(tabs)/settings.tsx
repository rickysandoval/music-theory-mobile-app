/**
 * Settings Screen
 * Game settings and app preferences
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

import { Text, Card, Switch, useTheme } from '@/src/components/ui';
import { useSettings } from '@/src/stores';
import { spacing } from '@/src/theme';

export default function SettingsScreen() {
  const { theme, colorScheme, setColorScheme, isDark } = useTheme();
  const { isLoading } = useSettings();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Appearance
        </Text>
        <Card variant="outlined">
          <Switch
            label="Dark Mode"
            description="Use dark theme throughout the app"
            value={isDark}
            onValueChange={(value) => setColorScheme(value ? 'dark' : 'light')}
          />
        </Card>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          About
        </Text>
        <Card variant="filled">
          <Text variant="bodyMedium">
            Music Theory Mobile
          </Text>
          <Text variant="bodySmall" color="secondary">
            Version 1.0.0
          </Text>
          <Text variant="bodySmall" color="muted" style={styles.aboutText}>
            A mobile app for learning music theory and guitar fundamentals.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  aboutText: {
    marginTop: spacing[2],
  },
});
