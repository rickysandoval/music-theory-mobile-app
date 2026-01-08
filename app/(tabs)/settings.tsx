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
  const { settings, isLoading, updateChordSettings } = useSettings();

  if (isLoading || !settings) {
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

      {/* Chord Game Settings */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Chord Spelling Game
        </Text>
        <Card variant="outlined">
          <Text variant="labelMedium" color="secondary" style={styles.subsectionTitle}>
            Root Notes
          </Text>
          <Switch
            label="Diatonic Notes"
            description="Natural notes (C, D, E, F, G, A, B)"
            value={settings.chordGame.includeDiatonicRoots}
            onValueChange={(value) => {
              updateChordSettings({ includeDiatonicRoots: value });
            }}
          />
          <Switch
            label="Accidentals"
            description="Sharps & flats (F#, Bb, etc.)"
            value={settings.chordGame.includeAccidentalRoots}
            onValueChange={(value) => {
              updateChordSettings({ includeAccidentalRoots: value });
            }}
          />
          <View style={styles.divider} />
          <Text variant="labelMedium" color="secondary" style={styles.subsectionTitle}>
            Chord Quality
          </Text>
          <Switch
            label="Major Chords"
            description="C, D, E, F, G, A, B"
            value={settings.chordGame.includeMajorChords}
            onValueChange={(value) => {
              updateChordSettings({ includeMajorChords: value });
            }}
          />
          <Switch
            label="Minor Chords"
            description="Am, Dm, Em, etc."
            value={settings.chordGame.includeMinorChords}
            onValueChange={(value) => {
              updateChordSettings({ includeMinorChords: value });
            }}
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
  subsectionTitle: {
    marginBottom: spacing[2],
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: spacing[3],
  },
  aboutText: {
    marginTop: spacing[2],
  },
});
