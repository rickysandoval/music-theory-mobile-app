/**
 * Chord Spelling Game
 * Mobile-optimized: tap to select slots, piano keys to input notes
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Vibration, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useTheme } from '../ui/ThemeContext';
import { PianoKeyboard } from './PianoKeyboard';
import { NoteSlot } from './NoteSlot';
import { GameSettingsSheet } from './GameSettingsSheet';
import { colors, spacing } from '@/src/theme';
import { 
  Chord, 
  generateRandomChord, 
  checkChordAnswer, 
  isNoteCorrectAtPosition,
  areEnharmonic,
  getKeyboardStartKey,
  getCorrectSpellingForChordPosition,
} from '@/src/lib/music-theory';
import { playNote, playChord } from '@/src/lib/audio';
import { useSettings, useProgress } from '@/src/stores';

export function ChordSpellingGame() {
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

  // Generate initial chord when settings are loaded
  useEffect(() => {
    if (settings && !currentChord) {
      generateNewChord();
    }
  }, [settings]);

  const generateNewChord = useCallback(() => {
    if (!settings) return;
    
    const newChord = generateRandomChord(settings.chordGame, currentChord);
    setCurrentChord(newChord);
    setUserNotes([newChord.root, '', '']);
    setSelectedIndex(1);
    setIsComplete(false);
    setShowFeedback(false);
    setHasChecked(false);
  }, [settings, currentChord]);

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
        setIsComplete(true);
        setShowFeedback(true);
        setSelectedIndex(null);
        Vibration.vibrate(100);
        recordChordResult(true);
        
        // Play the chord on success
        setTimeout(() => {
          playChord(newNotes.filter(n => n !== ''));
        }, 200);
      } else {
        // Not all correct - we need to find the first incorrect and focus it
        // This will happen on next render when noteCorrectness updates
        // For now, find it manually (checking position-correctness)
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

  if (!settings || !currentChord) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with settings */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={() => setShowSettings(true)}
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

      {/* Success feedback */}
      {showFeedback && isComplete && (
        <Card 
          variant="outlined" 
          style={[styles.feedbackCard, { borderColor: colors.success.main }]}
        >
          <View style={styles.feedbackHeader}>
            <View style={styles.checkmark}>
              <Text style={{ color: '#FFFFFF', fontSize: 18 }}>✓</Text>
            </View>
            <Text variant="titleMedium" style={{ color: colors.success.dark }}>
              Correct!
            </Text>
          </View>
          <Text variant="bodyMedium" color="secondary">
            {currentChord.name}: {currentChord.notes.join(' - ')}
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
          onPress={generateNewChord}
        >
          {isComplete ? 'Next Chord' : 'Skip'}
        </Button>
      </View>

      {/* Settings Sheet */}
      <GameSettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings.chordGame}
        onSettingsChange={(updates) => {
          updateChordSettings(updates);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
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
    backgroundColor: colors.success.light,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success.main,
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
