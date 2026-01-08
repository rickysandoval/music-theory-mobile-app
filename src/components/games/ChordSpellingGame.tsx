/**
 * Chord Spelling Game
 * Mobile-optimized: tap to select slots, piano keys to input notes
 */

import { playChord, playNote } from '@/src/lib/audio';
import {
    areEnharmonic,
    checkChordAnswer,
    Chord,
    generateRandomChord,
    getCorrectSpellingForChordPosition,
    getKeyboardStartKey,
    isNoteCorrectAtPosition,
} from '@/src/lib/music-theory';
import { useProgress, useSettings } from '@/src/stores';
import { colors, spacing } from '@/src/theme';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Vibration, View } from 'react-native';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { useTheme } from '../ui/ThemeContext';
import { GameSettingsSheet } from './GameSettingsSheet';
import { NoteSlot } from './NoteSlot';
import { PianoKeyboard } from './PianoKeyboard';

interface ChordSpellingGameProps {
  // Optional: for test mode
  isTestMode?: boolean;
  testChord?: Chord | null;
  onTestResult?: (wasCorrect: boolean) => void;
  showProgress?: { current: number; total: number };
  isReviewMode?: boolean;
  onSettingsPress?: () => void;
}

export function ChordSpellingGame({
  isTestMode = false,
  testChord = null,
  onTestResult,
  showProgress,
  isReviewMode = false,
  onSettingsPress,
}: ChordSpellingGameProps) {
  const { theme, isDark } = useTheme();
  const { settings, updateChordSettings } = useSettings();
  const { recordChordResult } = useProgress();
  
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [userNotes, setUserNotes] = useState<string[]>(['', '', '']);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(1);
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasChecked, setHasChecked] = useState(false); // Track if we've checked answers
  const [isFirstTry, setIsFirstTry] = useState(true); // Track if this is their first attempt (for test mode)
  const [hasReportedResult, setHasReportedResult] = useState(false); // Ensure we only report once per chord

  // Compute which notes are correct (only after all slots filled)
  // Now checks position: slot 1 must be third, slot 2 must be fifth
  const noteCorrectness = useMemo(() => {
    if (!currentChord || !hasChecked) return [null, null, null];
    
    return userNotes.map((note, index) => {
      if (index === 0) return null; // Root is always correct, don't show indicator
      if (!note) return null;
      // Check if note is correct for THIS position (not just in chord)
      return isNoteCorrectAtPosition(note, index, currentChord);
    });
  }, [currentChord, userNotes, hasChecked]);

  // Find first incorrect slot (for auto-focus)
  const findFirstIncorrectSlot = useCallback(() => {
    for (let i = 1; i < noteCorrectness.length; i++) {
      if (noteCorrectness[i] === false) {
        return i;
      }
    }
    return null;
  }, [noteCorrectness]);

  // Sync with testChord when in test mode
  useEffect(() => {
    if (isTestMode && testChord) {
      setCurrentChord(testChord);
      setUserNotes([testChord.root, '', '']);
      setSelectedIndex(1);
      setIsComplete(false);
      setShowFeedback(false);
      setHasChecked(false);
      setIsFirstTry(true);
      setHasReportedResult(false);
    }
  }, [isTestMode, testChord]);

  // Generate initial chord when settings are loaded (practice mode only)
  useEffect(() => {
    if (!isTestMode && settings && !currentChord) {
      generateNewChord();
    }
  }, [settings, isTestMode]);

  const generateNewChord = useCallback(() => {
    if (!settings) return;
    // Don't generate new chord in test mode - use testChord instead
    if (isTestMode) return;
    
    const newChord = generateRandomChord(settings.chordGame, currentChord);
    setCurrentChord(newChord);
    setUserNotes([newChord.root, '', '']);
    setSelectedIndex(1);
    setIsComplete(false);
    setShowFeedback(false);
    setHasChecked(false);
    setIsFirstTry(true);
    setHasReportedResult(false);
  }, [settings, currentChord, isTestMode]);

  const handleSlotPress = useCallback((index: number) => {
    if (isComplete) return;
    
    const rootNote = userNotes[0];
    // Use keyboard start key as audio reference (may be different from chord root for sharps/flats)
    const keyboardRefNote = getKeyboardStartKey(rootNote);
    
    // If pressing the root note, just play it
    if (index === 0 && rootNote) {
      playNote(rootNote, 0.4, keyboardRefNote);
      return;
    }
    
    // If this note is already correct (green), don't allow selecting it
    if (noteCorrectness[index] === true) {
      // Just play it (relative to keyboard start for correct pitch)
      if (userNotes[index]) {
        playNote(userNotes[index], 0.3, keyboardRefNote);
      }
      return;
    }
    
    // Select this slot for editing
    setSelectedIndex(index);
    
    // If the slot has a note, play it (relative to keyboard start)
    if (userNotes[index]) {
      playNote(userNotes[index], 0.3, keyboardRefNote);
    }
  }, [userNotes, isComplete, noteCorrectness]);

  const handlePianoKeyPress = useCallback((note: string) => {
    if (isComplete || !currentChord) return;
    
    const rootNote = currentChord.root;
    // Use keyboard start key as audio reference (may be different from chord root for sharps/flats)
    const keyboardRefNote = getKeyboardStartKey(rootNote);
    
    // IGNORE if user presses the root note on keyboard
    if (areEnharmonic(note, rootNote)) {
      // Still play the sound for feedback, but don't fill any slot
      playNote(note, 0.3, keyboardRefNote);
      return;
    }
    
    // Play the note (relative to keyboard start for correct pitch)
    playNote(note, 0.3, keyboardRefNote);
    
    // Determine which slot to fill
    let targetIndex = selectedIndex;
    
    // If no slot selected or root is selected, find first available slot
    if (targetIndex === null || targetIndex === 0) {
      // First try to find an empty slot
      targetIndex = userNotes.findIndex((n, i) => i > 0 && n === '');
      
      if (targetIndex === -1) {
        // All filled - find first incorrect slot
        const firstIncorrect = findFirstIncorrectSlot();
        if (firstIncorrect !== null) {
          targetIndex = firstIncorrect;
        } else {
          // All correct somehow? Shouldn't happen, but fallback to slot 1
          targetIndex = 1;
        }
      }
    }
    
    // Don't allow changing a correct note
    if (noteCorrectness[targetIndex] === true) {
      // Find first incorrect slot instead
      const firstIncorrect = findFirstIncorrectSlot();
      if (firstIncorrect !== null) {
        targetIndex = firstIncorrect;
      } else {
        return; // All correct, shouldn't happen
      }
    }
    
    // Convert to correct enharmonic spelling for this position
    const correctSpelling = getCorrectSpellingForChordPosition(note, rootNote, targetIndex);
    
    // Update the note
    const newNotes = [...userNotes];
    newNotes[targetIndex] = correctSpelling;
    setUserNotes(newNotes);
    
    // Check if all slots are now filled
    const allFilled = newNotes.every((n, i) => i === 0 || n !== '');
    
    if (allFilled) {
      // Mark that we've checked
      setHasChecked(true);
      
      // Check if answer is fully correct
      const correct = checkChordAnswer(newNotes, currentChord);
      
      if (correct) {
        // Correct answer
        setIsComplete(true);
        setShowFeedback(true);
        setSelectedIndex(null);
        Vibration.vibrate(100);
        
        // Only record progress in practice mode
        if (!isTestMode) {
          recordChordResult(true);
        }
        
        // Play the chord on success
        setTimeout(() => {
          playChord(newNotes.filter(n => n !== ''));
        }, 200);
      } else if (isTestMode) {
        // Test mode: wrong answer = complete (no retries)
        setIsComplete(true);
        setShowFeedback(true);
        setSelectedIndex(null);
        setIsFirstTry(false); // Mark as incorrect
        Vibration.vibrate([0, 100, 50, 100]); // Double vibration for wrong
        
        // Play what they entered so they can hear the difference
        setTimeout(() => {
          playChord(newNotes.filter(n => n !== ''));
        }, 200);
      } else {
        // Practice mode: wrong answer = allow retries
        setIsFirstTry(false);
        
        // Find the first incorrect note and focus it
        setTimeout(() => {
          for (let i = 1; i < newNotes.length; i++) {
            if (!isNoteCorrectAtPosition(newNotes[i], i, currentChord)) {
              setSelectedIndex(i);
              break;
            }
          }
        }, 50);
      }
    } else {
      // Move selection to next empty slot
      const nextEmpty = newNotes.findIndex((n, i) => i > 0 && n === '');
      setSelectedIndex(nextEmpty === -1 ? null : nextEmpty);
    }
  }, [selectedIndex, userNotes, currentChord, isComplete, noteCorrectness, findFirstIncorrectSlot, recordChordResult]);

  const handlePlayNotes = useCallback(() => {
    const notesToPlay = userNotes.filter(n => n !== '');
    if (notesToPlay.length > 0) {
      playChord(notesToPlay);
    }
  }, [userNotes]);

  // Handle "Next Chord" or "Skip" in test mode
  // NOTE: This must be defined BEFORE any early returns to maintain hook order
  const handleNext = useCallback(() => {
    if (isTestMode && onTestResult) {
      if (!hasReportedResult) {
        setHasReportedResult(true);
        if (isComplete) {
          // Completed correctly - report based on first try
          onTestResult(isFirstTry);
        } else {
          // Skip = incorrect in test mode
          onTestResult(false);
        }
      }
    } else {
      generateNewChord();
    }
  }, [isTestMode, onTestResult, isComplete, isFirstTry, hasReportedResult, generateNewChord]);

  if (!settings || !currentChord) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Progress indicator for test mode */}
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

      {/* Header with settings - only in practice mode */}
      {!isTestMode && (
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Pressable
            onPress={onSettingsPress || (() => setShowSettings(true))}
            style={({ pressed }) => [
              styles.settingsButton,
              { 
                backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <FontAwesome name="sliders" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      )}

      {/* Chord to spell */}
      <Card variant="filled" style={styles.chordCard}>
        <Text variant="labelMedium" color="secondary">Spell this chord:</Text>
        <Text variant="chordName" style={{ color: colors.primary[500] }}>
          {currentChord.name}
        </Text>
      </Card>

      {/* Note slots with play button */}
      <View style={styles.notesRow}>
        <View style={styles.slotsContainer}>
          {userNotes.map((note, index) => (
            <NoteSlot
              key={index}
              value={note}
              isSelected={selectedIndex === index}
              isCorrect={noteCorrectness[index]}
              isRoot={index === 0}
              onPress={() => handleSlotPress(index)}
              disabled={isComplete}
            />
          ))}
        </View>
        
        {/* Play button */}
        <Pressable
          onPress={handlePlayNotes}
          style={({ pressed }) => [
            styles.playButton,
            {
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <FontAwesome 
            name="volume-up" 
            size={22} 
            color={colors.primary[isDark ? 400 : 500]} 
          />
        </Pressable>
      </View>

      {/* Hint text */}
      {!isComplete && selectedIndex !== null && (
        <Text variant="bodySmall" color="muted" style={styles.hintText}>
          {hasChecked && noteCorrectness[selectedIndex] === false
            ? 'Try a different note'
            : 'Tap a piano key to fill the selected slot'
          }
        </Text>
      )}

      {/* Feedback - success or failure */}
      {showFeedback && isComplete && (
        <Card 
          variant="outlined" 
          style={[
            styles.feedbackCard, 
            { 
              borderColor: isFirstTry ? colors.success.main : colors.error.main,
              backgroundColor: isFirstTry ? colors.success.light : colors.error.light,
            }
          ]}
        >
          <View style={styles.feedbackHeader}>
            <View style={[
              styles.feedbackIcon,
              { backgroundColor: isFirstTry ? colors.success.main : colors.error.main }
            ]}>
              <Text style={{ color: '#FFFFFF', fontSize: 18 }}>
                {isFirstTry ? '✓' : '✗'}
              </Text>
            </View>
            <Text 
              variant="titleMedium" 
              style={{ color: isFirstTry ? colors.success.dark : colors.error.dark }}
            >
              {isFirstTry ? 'Correct!' : 'Incorrect'}
            </Text>
          </View>
          <Text variant="bodyMedium" color="secondary">
            {isFirstTry 
              ? `${currentChord.name}: ${currentChord.notes.join(' - ')}`
              : `Correct answer: ${currentChord.notes.join(' - ')}`
            }
          </Text>
        </Card>
      )}

      {/* Piano keyboard */}
      <View style={styles.keyboardContainer}>
        <PianoKeyboard
          onKeyPress={handlePianoKeyPress}
          highlightedNotes={userNotes.filter(n => n !== '')}
          rootNote={currentChord.root}
          disabled={isComplete}
        />
      </View>

      {/* Action button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
        >
          {isComplete 
            ? (isTestMode && showProgress && showProgress.current === showProgress.total)
              ? 'Finish'
              : 'Next Chord'
            : isTestMode 
              ? 'Skip (Mark Incorrect)' 
              : 'Skip'
          }
        </Button>
      </View>

      {/* Settings Sheet - only in practice mode when no external handler */}
      {!isTestMode && !onSettingsPress && (
        <GameSettingsSheet
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings.chordGame}
          onSettingsChange={(updates) => {
            updateChordSettings(updates);
          }}
        />
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
    marginBottom: spacing[2],
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  headerSpacer: {
    flex: 1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chordCard: {
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingVertical: spacing[3],
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  slotsContainer: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[4],
  },
  hintText: {
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  feedbackCard: {
    marginVertical: spacing[3],
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  feedbackIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    marginVertical: spacing[3],
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: spacing[4],
  },
});
