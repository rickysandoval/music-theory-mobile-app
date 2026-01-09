/**
 * Flashcard Game Component
 * Shows chord name, user reveals answer and self-reports correct/incorrect
 */

import { Chord } from '@/src/lib/music-theory/types';
import { borderRadius, colors, spacing } from '@/src/theme';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { useTheme } from '../ui/ThemeContext';

interface FlashcardGameProps {
  chord: Chord;
  onResult: (wasCorrect: boolean) => void;
  showProgress?: { current: number; total: number };
  isReviewMode?: boolean;
}

export function FlashcardGame({ 
  chord, 
  onResult, 
  showProgress,
  isReviewMode = false,
}: FlashcardGameProps) {
  const { theme, isDark } = useTheme();
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleResult = useCallback((wasCorrect: boolean) => {
    setIsRevealed(false);
    onResult(wasCorrect);
  }, [onResult]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress indicator */}
      {showProgress && (
        <View style={styles.progressContainer}>
          <Text variant="labelMedium" color="secondary">
            {isReviewMode ? 'Reviewing: ' : ''}
            {showProgress.current} / {showProgress.total}
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.surfaceVariant }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: colors.primary[500],
                  width: `${(showProgress.current / showProgress.total) * 100}%`,
                }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Chord card */}
      <View style={styles.flashcardWrapper}>
        <Card variant="elevated" style={styles.flashcard}>
          <Text variant="labelMedium" color="secondary" style={styles.label}>
            {isReviewMode ? 'Practice this chord:' : 'What are the notes of:'}
          </Text>
        
        <Text style={[styles.chordName, { color: colors.primary[500] }]}>
          {chord.name}
        </Text>

        {/* Answer section - fixed height area */}
        <View style={styles.answerArea}>
          {!isRevealed ? (
            <Pressable
              onPress={handleReveal}
              style={({ pressed }) => [
                styles.revealButton,
                {
                  backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text variant="titleMedium" color="secondary">
                Tap to reveal answer
              </Text>
            </Pressable>
          ) : (
            <View style={styles.answerSection}>
              <View style={[styles.notesContainer, { backgroundColor: theme.surfaceVariant }]}>
                {chord.notes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text variant="labelSmall" color="muted">
                      {index === 0 ? 'Root' : index === 1 ? '3rd' : '5th'}
                    </Text>
                    <Text style={[styles.noteText, { color: theme.text }]}>
                      {note}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
        </Card>
      </View>

      {/* Action buttons */}
      {isRevealed && (
        <View style={styles.buttonContainer}>
          {isReviewMode ? (
            // Review mode: only "Got it" button
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => handleResult(true)}
            >
              ✓ Got it!
            </Button>
          ) : (
            // Test mode: Got it / Missed it buttons
            <>
              <Button
                variant="secondary"
                size="lg"
                onPress={() => handleResult(false)}
                style={styles.missedButton}
              >
                ✗ Missed it
              </Button>
              <Button
                variant="primary"
                size="lg"
                onPress={() => handleResult(true)}
                style={styles.gotItButton}
              >
                ✓ Got it!
              </Button>
            </>
          )}
        </View>
      )}

      {/* Hint when not revealed */}
      {!isRevealed && (
        <Text variant="bodySmall" color="muted" style={styles.hint}>
          Think of the notes, then reveal to check
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  progressContainer: {
    marginTop: spacing[4],
    marginBottom: spacing[4],
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  flashcardWrapper: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  flashcard: {
    alignItems: 'center',
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[6],
    maxWidth: 340,
    width: '100%',
    overflow: 'visible',
  },
  label: {
    marginBottom: spacing[4],
  },
  chordName: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 68,
    minHeight: 68,
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  answerArea: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  revealButton: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.lg,
  },
  answerSection: {
    width: '100%',
    overflow: 'visible',
  },
  notesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[4],
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.lg,
    overflow: 'visible',
  },
  noteItem: {
    alignItems: 'center',
    minWidth: 60,
    overflow: 'visible',
  },
  noteText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    minHeight: 36,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: 'auto',
    paddingBottom: spacing[4],
  },
  missedButton: {
    flex: 1,
  },
  gotItButton: {
    flex: 1,
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing[4],
  },
});
