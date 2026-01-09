/**
 * Home Screen - Games List
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, Card, useTheme } from '@/src/components/ui';
import { colors, spacing } from '@/src/theme';

interface GameCardProps {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  onPress: () => void;
  comingSoon?: boolean;
}

function GameCard({ title, description, icon, onPress, comingSoon = false }: GameCardProps) {
  const { theme, isDark } = useTheme();
  
  return (
    <Card 
      variant="elevated" 
      onPress={comingSoon ? undefined : onPress}
      style={[styles.gameCard, comingSoon && styles.comingSoonCard]}
    >
      <View style={styles.gameCardContent}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }
        ]}>
          <FontAwesome 
            name={icon} 
            size={28} 
            color={colors.primary[isDark ? 400 : 600]} 
          />
        </View>
        <View style={styles.gameCardText}>
          <View style={styles.titleRow}>
            <Text variant="titleMedium">{title}</Text>
            {comingSoon && (
              <View style={styles.comingSoonBadge}>
                <Text variant="labelSmall" style={{ color: '#FFFFFF' }}>
                  Coming Soon
                </Text>
              </View>
            )}
          </View>
          <Text variant="bodySmall" color="secondary" numberOfLines={2}>
            {description}
          </Text>
        </View>
        {!comingSoon && (
          <FontAwesome 
            name="chevron-right" 
            size={16} 
            color={theme.textMuted} 
          />
        )}
      </View>
    </Card>
  );
}

export default function GamesScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="displaySmall" style={{ color: colors.primary[500] }}>
          🎸 Music Theory
        </Text>
        <Text variant="bodyLarge" color="secondary">
          Practice and master music fundamentals
        </Text>
      </View>

      {/* Games Section */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Games
        </Text>
        
        <GameCard
          title="Chord Spelling"
          description="Learn the notes that make up major and minor chords"
          icon="music"
          onPress={() => router.push('/games/chord-spelling')}
        />

        <GameCard
          title="Fretboard Notes"
          description="Master the notes on the guitar fretboard"
          icon="hand-rock-o"
          onPress={() => router.push('/games/fretboard-notes')}
        />

        <GameCard
          title="Interval Training"
          description="Identify intervals by ear and theory"
          icon="headphones"
          onPress={() => {}}
          comingSoon
        />

        <GameCard
          title="Scale Patterns"
          description="Learn scale shapes across the fretboard"
          icon="th"
          onPress={() => {}}
          comingSoon
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  header: {
    marginBottom: spacing[6],
    paddingTop: spacing[2],
  },
  section: {
    marginBottom: spacing[4],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  gameCard: {
    marginBottom: spacing[3],
  },
  comingSoonCard: {
    opacity: 0.7,
  },
  gameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  gameCardText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: 2,
  },
  comingSoonBadge: {
    backgroundColor: colors.neutral[500],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
  },
});
