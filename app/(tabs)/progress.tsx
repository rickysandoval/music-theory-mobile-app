/**
 * Progress Screen
 * Shows game statistics and achievements
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, Card, Button, useTheme } from '@/src/components/ui';
import { useProgress } from '@/src/stores';
import { colors, spacing } from '@/src/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const { isDark } = useTheme();
  
  return (
    <Card variant="outlined" style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <FontAwesome name={icon} size={20} color={color} />
      </View>
      <Text variant="headlineMedium" style={{ color }}>
        {value}
      </Text>
      <Text variant="labelSmall" color="secondary">
        {label}
      </Text>
    </Card>
  );
}

export default function ProgressScreen() {
  const { theme, isDark } = useTheme();
  const { stats, isLoading, resetProgress } = useProgress();

  if (isLoading || !stats) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { chordGame } = stats;
  const hasPlayed = chordGame.totalPlayed > 0;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium">Your Progress</Text>
        <Text variant="bodyMedium" color="secondary">
          Track your music theory journey
        </Text>
      </View>

      {/* Chord Spelling Stats */}
      <View style={styles.section}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Chord Spelling
        </Text>
        
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Played"
            value={chordGame.totalPlayed}
            icon="play-circle"
            color={colors.primary[500]}
          />
          <StatCard
            label="Correct"
            value={chordGame.correctAnswers}
            icon="check-circle"
            color={colors.success.main}
          />
          <StatCard
            label="Accuracy"
            value={`${chordGame.accuracy}%`}
            icon="bullseye"
            color={colors.secondary[500]}
          />
        </View>

        {!hasPlayed && (
          <Card variant="filled" style={styles.emptyState}>
            <FontAwesome 
              name="music" 
              size={32} 
              color={theme.textMuted} 
              style={styles.emptyIcon}
            />
            <Text variant="bodyMedium" color="muted" style={styles.emptyText}>
              Start playing to track your progress!
            </Text>
          </Card>
        )}

        {hasPlayed && chordGame.lastPlayed && (
          <Text variant="bodySmall" color="muted" style={styles.lastPlayed}>
            Last played: {new Date(chordGame.lastPlayed).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Reset Section */}
      {hasPlayed && (
        <View style={styles.resetSection}>
          <Button
            variant="outline"
            onPress={() => {
              // Add confirmation in a real app
              resetProgress();
            }}
          >
            Reset All Progress
          </Button>
        </View>
      )}
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
  header: {
    marginBottom: spacing[6],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    marginTop: spacing[4],
  },
  emptyIcon: {
    marginBottom: spacing[3],
  },
  emptyText: {
    textAlign: 'center',
  },
  lastPlayed: {
    marginTop: spacing[3],
    textAlign: 'center',
  },
  resetSection: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
});
