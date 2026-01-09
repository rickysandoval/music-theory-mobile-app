/**
 * Test Results Component
 * Shows score and options after completing a test or review session
 */

import { Chord } from '@/src/lib/music-theory/types';
import { colors, spacing } from '@/src/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { useTheme } from '../ui/ThemeContext';

interface TestResultsProps {
  score: { correct: number; total: number; percentage: number };
  missedChords: Chord[];
  isAfterReview?: boolean; // True when user completed practicing missed chords
  onPracticeMissed: () => void;
  onRestartTest: () => void;
  onBackToPractice: () => void;
}

export function TestResults({
  score,
  missedChords,
  isAfterReview = false,
  onPracticeMissed,
  onRestartTest,
  onBackToPractice,
}: TestResultsProps) {
  const { theme } = useTheme();
  
  const isPerfect = score.percentage === 100;
  const isGood = score.percentage >= 80;
  
  const getEmoji = () => {
    if (isPerfect) return '🎉';
    if (isGood) return '👏';
    if (score.percentage >= 60) return '👍';
    return '💪';
  };
  
  const getMessage = () => {
    if (isAfterReview) return 'Great job practicing!';
    if (isPerfect) return 'Perfect score!';
    if (isGood) return 'Great work!';
    if (score.percentage >= 60) return 'Good effort!';
    return 'Keep practicing!';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Card variant="elevated" style={styles.card}>
        {/* Emoji */}
        <Text style={styles.emoji}>{getEmoji()}</Text>
        
        {/* Message */}
        <Text variant="headlineMedium" style={styles.message}>
          {getMessage()}
        </Text>

        {/* Score display */}
        {!isAfterReview && (
          <>
            <View style={[styles.scoreCircle, { borderColor: colors.primary[500] }]}>
              <Text style={[styles.scorePercentage, { color: colors.primary[500] }]}>
                {score.percentage}%
              </Text>
              <Text variant="bodyMedium" color="secondary" style={styles.scoreFraction}>
                {score.correct} / {score.total}
              </Text>
            </View>

            {/* Missed chords list */}
            {missedChords.length > 0 && (
              <View style={styles.missedSection}>
                <Text variant="labelMedium" color="secondary" style={styles.missedLabel}>
                  Chords to review:
                </Text>
                <View style={styles.missedList}>
                  {missedChords.slice(0, 10).map((chord, index) => (
                    <View 
                      key={index} 
                      style={[styles.missedChip, { backgroundColor: theme.surfaceVariant }]}
                    >
                      <Text variant="bodySmall">{chord.name}</Text>
                    </View>
                  ))}
                  {missedChords.length > 10 && (
                    <Text variant="bodySmall" color="muted">
                      +{missedChords.length - 10} more
                    </Text>
                  )}
                </View>
              </View>
            )}
          </>
        )}

        {isAfterReview && (
          <Text variant="bodyMedium" color="secondary" style={styles.reviewComplete}>
            You've successfully reviewed all the chords you missed.
          </Text>
        )}
      </Card>

      {/* Action buttons */}
      <View style={styles.buttonContainer}>
        {!isAfterReview && missedChords.length > 0 && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={onPracticeMissed}
            style={styles.button}
          >
            Practice What I Missed ({missedChords.length})
          </Button>
        )}
        
        <Button
          variant={!isAfterReview && missedChords.length > 0 ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          onPress={onRestartTest}
          style={styles.button}
        >
          Start Test Over
        </Button>
        
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onPress={onBackToPractice}
        >
          Back to Practice Mode
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    paddingTop: spacing[10],
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[6],
    overflow: 'visible',
  },
  emoji: {
    fontSize: 64,
    lineHeight: 80,
    minHeight: 80,
    marginTop: spacing[6],
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
    overflow: 'visible',
  },
  scorePercentage: {
    fontSize: 42,
    fontWeight: '700',
    lineHeight: 50,
    textAlign: 'center',
  },
  scoreFraction: {
  },
  missedSection: {
    width: '100%',
    marginTop: spacing[2],
  },
  missedLabel: {
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  missedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing[2],
  },
  missedChip: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: 16,
  },
  reviewComplete: {
    textAlign: 'center',
    marginTop: spacing[2],
  },
  buttonContainer: {
    gap: spacing[3],
  },
  button: {
    marginBottom: 0,
  },
});
