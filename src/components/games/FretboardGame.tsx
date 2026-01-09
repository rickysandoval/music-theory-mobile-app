/**
 * Fretboard Notes Game
 * Three modes: 
 * - Identify: Show position, user names the note
 * - Find: Show note name, user taps the position
 * - Listen: Show note name, user plays it on real guitar
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, Pressable, Vibration, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useTheme } from '../ui/ThemeContext';
import { Fretboard } from './Fretboard';
import { colors, spacing, borderRadius } from '@/src/theme';
import { getNoteAtFret, getNoteIndex, isNaturalNote, areEnharmonic } from '@/src/lib/music-theory';
import { playNote, pitchDetector, PitchResult, PitchDetector } from '@/src/lib/audio';
import { GameSettings } from '@/src/stores';

// Note buttons for "identify" mode - natural notes on first row, accidentals on second
const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const ACCIDENTAL_NOTES_SHARPS = ['C#', 'D#', 'F#', 'G#', 'A#'];
const ACCIDENTAL_NOTES_FLATS = ['Db', 'Eb', 'Gb', 'Ab', 'Bb'];
const NOTE_OPTIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_OPTIONS_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

interface FretboardGameProps {
  onSettingsPress?: () => void;
  settings: GameSettings['fretboardGame'] | undefined;
}

interface GamePosition {
  string: number;
  fret: number;
  note: string;
}

export function FretboardGame({ onSettingsPress, settings: gameSettings }: FretboardGameProps) {
  const { theme, isDark } = useTheme();
  
  const [currentPosition, setCurrentPosition] = useState<GamePosition | null>(null);
  const [currentNote, setCurrentNote] = useState<string | null>(null); // For "find" and "listen" modes
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  
  // Listen mode state
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const listenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoAdvancing = useRef(false);
  
  // Refs to hold latest values for the pitch callback (avoids stale closures)
  const currentNoteRef = useRef<string | null>(null);
  const autoAdvanceSettingRef = useRef(false);

  const isIdentifyMode = gameSettings?.gameMode === 'identify';
  const isListenMode = gameSettings?.gameMode === 'listen';
  const isFindMode = gameSettings?.gameMode === 'find';

  // Keep refs in sync with state (for use in pitch callback)
  useEffect(() => {
    currentNoteRef.current = currentNote;
  }, [currentNote]);
  
  useEffect(() => {
    autoAdvanceSettingRef.current = gameSettings?.autoAdvanceOnCorrect ?? false;
  }, [gameSettings?.autoAdvanceOnCorrect]);

  // Get available notes based on settings
  const availableNotes = useMemo(() => {
    if (!gameSettings) return NOTE_OPTIONS;
    
    const noteList = gameSettings.useFlats ? NOTE_OPTIONS_FLATS : NOTE_OPTIONS;
    return noteList.filter(note => {
      const isNatural = isNaturalNote(note);
      if (isNatural && gameSettings.includeNaturalNotes) return true;
      if (!isNatural && gameSettings.includeAccidentals) return true;
      return false;
    });
  }, [gameSettings]);

  // Generate a random position for "identify" mode
  const generateRandomPosition = useCallback((): GamePosition | null => {
    if (!gameSettings) return null;
    
    const enabledStrings = gameSettings.strings
      .map((enabled, index) => enabled ? index : -1)
      .filter(i => i !== -1);
    
    if (enabledStrings.length === 0) return null;
    
    // Try up to 50 times to find a valid position
    for (let attempt = 0; attempt < 50; attempt++) {
      const stringIndex = enabledStrings[Math.floor(Math.random() * enabledStrings.length)];
      const fret = gameSettings.minFret + Math.floor(Math.random() * (gameSettings.maxFret - gameSettings.minFret + 1));
      const note = getNoteAtFret(stringIndex, fret, gameSettings.useFlats);
      
      // Check if this note matches our settings
      const isNatural = isNaturalNote(note);
      if (isNatural && gameSettings.includeNaturalNotes) {
        return { string: stringIndex, fret, note };
      }
      if (!isNatural && gameSettings.includeAccidentals) {
        return { string: stringIndex, fret, note };
      }
    }
    
    return null;
  }, [gameSettings]);

  // Generate a random note for "find" mode (avoiding the previous note)
  const generateRandomNote = useCallback((previousNote: string | null): string | null => {
    if (availableNotes.length === 0) return null;
    if (availableNotes.length === 1) return availableNotes[0];
    
    // Filter out the previous note to avoid repeats
    const filteredNotes = previousNote 
      ? availableNotes.filter(n => n !== previousNote)
      : availableNotes;
    
    return filteredNotes[Math.floor(Math.random() * filteredNotes.length)];
  }, [availableNotes]);

  // Start a new round
  const startNewRound = useCallback((keepListening = false) => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setDetectedNote(null);
    setDetectedFrequency(null);
    
    // Only stop listening if not keeping it active
    if (!keepListening) {
      setIsListening(false);
    }
    
    // Clear any pending timeouts
    if (listenTimeoutRef.current) {
      clearTimeout(listenTimeoutRef.current);
      listenTimeoutRef.current = null;
    }
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    
    if (isIdentifyMode) {
      // For identify mode, avoid same position
      setCurrentPosition(prev => {
        const newPosition = generateRandomPosition();
        // If same position, try again (up to 3 times)
        if (prev && newPosition && prev.string === newPosition.string && prev.fret === newPosition.fret) {
          for (let i = 0; i < 3; i++) {
            const retry = generateRandomPosition();
            if (retry && (retry.string !== prev.string || retry.fret !== prev.fret)) {
              return retry;
            }
          }
        }
        return newPosition;
      });
      setCurrentNote(null);
    } else {
      // For find and listen modes, pass the previous note to avoid repeats
      setCurrentNote(prev => generateRandomNote(prev));
      setCurrentPosition(null);
    }
    
    isAutoAdvancing.current = false;
  }, [isIdentifyMode, generateRandomPosition, generateRandomNote]);

  // Handle pitch detection callback
  // Uses refs to always access latest values (avoids stale closure issues)
  const handlePitchDetected = useCallback((result: PitchResult) => {
    const targetNote = currentNoteRef.current;
    const autoAdvance = autoAdvanceSettingRef.current;
    
    console.log('[FretboardGame] handlePitchDetected:', result.note, 'target:', targetNote, 'isAutoAdvancing:', isAutoAdvancing.current);
    
    if (result.note && result.frequency && !isAutoAdvancing.current) {
      setDetectedNote(result.note);
      setDetectedFrequency(result.frequency);
      
      // Check if the detected note matches the target
      if (targetNote && areEnharmonic(result.note, targetNote)) {
        console.log('[FretboardGame] CORRECT! Setting isCorrect=true');
        setIsCorrect(true);
        setStreak(s => s + 1);
        Vibration.vibrate(100);
        
        if (autoAdvance) {
          // Mark that we're auto-advancing to ignore further detections
          isAutoAdvancing.current = true;
          console.log('[FretboardGame] Auto-advance enabled, will advance in 1s');
          
          // Don't stop listening - just wait and advance
          autoAdvanceTimeoutRef.current = setTimeout(() => {
            console.log('[FretboardGame] Auto-advancing to next note...');
            startNewRound(true); // Keep listening active
          }, 1000); // 1 second delay to show feedback
        } else {
          // Stop listening if not auto-advancing
          setIsListening(false);
          pitchDetector.stopListening();
        }
      }
    }
  }, [startNewRound]); // Only depends on startNewRound now, uses refs for other values

  // Start listening for guitar input
  const startListening = useCallback(async () => {
    console.log('[FretboardGame] startListening called, current isListening:', isListening);
    if (isListening) return;
    
    // Check/request permission
    console.log('[FretboardGame] Requesting permissions...');
    const granted = await pitchDetector.requestPermissions();
    console.log('[FretboardGame] Permission granted:', granted);
    setHasPermission(granted);
    
    if (!granted) {
      console.log('[FretboardGame] Permission not granted, aborting');
      return;
    }
    
    setIsListening(true);
    setDetectedNote(null);
    setDetectedFrequency(null);
    
    // Start the pitch detector
    const sensitivity = gameSettings?.listenSensitivity ?? 'medium';
    console.log('==============================================');
    console.log('[FretboardGame] Starting pitch detector with:');
    console.log('[FretboardGame]   sensitivity:', sensitivity);
    console.log('[FretboardGame]   useFlats:', gameSettings?.useFlats ?? false);
    console.log('==============================================');
    const started = await pitchDetector.startListening(
      handlePitchDetected,
      gameSettings?.useFlats ?? false,
      sensitivity
    );
    console.log('[FretboardGame] Pitch detector started:', started);
    
    if (!started) {
      console.log('[FretboardGame] Failed to start, resetting isListening');
      setIsListening(false);
    }
  }, [isListening, handlePitchDetected, gameSettings?.useFlats]);

  // Stop listening
  const stopListening = useCallback(async () => {
    console.log('[FretboardGame] stopListening called');
    setIsListening(false);
    await pitchDetector.stopListening();
    console.log('[FretboardGame] Stopped listening, state updated');
  }, []);

  // Give up on listen mode
  const handleGiveUp = useCallback(() => {
    setIsCorrect(false);
    setStreak(0);
    Vibration.vibrate([0, 100, 50, 100]);
    stopListening();
  }, [stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pitchDetector.stopListening();
      if (listenTimeoutRef.current) {
        clearTimeout(listenTimeoutRef.current);
      }
      if (autoAdvanceTimeoutRef.current) {
        clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  // Initialize game
  useEffect(() => {
    if (gameSettings && !currentPosition && !currentNote) {
      startNewRound();
    }
  }, [gameSettings]);

  // Reset when mode changes
  useEffect(() => {
    startNewRound();
  }, [gameSettings?.gameMode]);

  // Auto-start listening when entering Listen mode on Android
  useEffect(() => {
    if (isListenMode && Platform.OS === 'android' && !isListening && currentNote && isCorrect === null) {
      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isListenMode, currentNote, isCorrect]);

  // Stop listening when leaving Listen mode
  useEffect(() => {
    if (!isListenMode && isListening) {
      stopListening();
    }
  }, [isListenMode, isListening, stopListening]);

  // Restart listening when sensitivity changes (to apply new threshold)
  useEffect(() => {
    if (isListenMode && isListening && Platform.OS === 'android') {
      const restartWithNewSensitivity = async () => {
        console.log('[FretboardGame] Sensitivity changed, restarting listener...');
        await pitchDetector.stopListening();
        setIsListening(false);
        // Small delay before restarting
        setTimeout(() => {
          startListening();
        }, 300);
      };
      restartWithNewSensitivity();
    }
  }, [gameSettings?.listenSensitivity]);

  // Handle note button press (identify mode)
  const handleNoteGuess = useCallback((note: string) => {
    if (!currentPosition || isCorrect !== null) return;
    
    setSelectedAnswer(note);
    const correct = areEnharmonic(note, currentPosition.note);
    setIsCorrect(correct);
    
    if (correct) {
      setStreak(s => s + 1);
      Vibration.vibrate(100);
      playNote(currentPosition.note, 0.4);
    } else {
      setStreak(0);
      Vibration.vibrate([0, 100, 50, 100]);
    }
  }, [currentPosition, isCorrect]);

  // Handle fretboard tap (find mode)
  const handleFretPress = useCallback((string: number, fret: number, note: string) => {
    if (!currentNote || isCorrect !== null) return;
    
    const correct = areEnharmonic(note, currentNote);
    setSelectedAnswer(`${string}-${fret}`);
    setCurrentPosition({ string, fret, note });
    setIsCorrect(correct);
    
    if (correct) {
      setStreak(s => s + 1);
      Vibration.vibrate(100);
      playNote(note, 0.4);
    } else {
      setStreak(0);
      Vibration.vibrate([0, 100, 50, 100]);
    }
  }, [currentNote, isCorrect]);

  // Play current note
  const handlePlayNote = useCallback(() => {
    const noteToPlay = isIdentifyMode ? currentPosition?.note : currentNote;
    if (noteToPlay) {
      playNote(noteToPlay, 0.5);
    }
  }, [isIdentifyMode, currentPosition, currentNote]);

  if (!gameSettings) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Check if any options are available
  if (availableNotes.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text variant="bodyMedium" color="secondary" style={styles.noOptionsText}>
          No notes available with current settings.
          {'\n'}Enable natural notes or accidentals.
        </Text>
        {onSettingsPress && (
          <Button variant="primary" onPress={onSettingsPress} style={{ marginTop: spacing[4] }}>
            Open Settings
          </Button>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.streakContainer}>
          <FontAwesome name="fire" size={16} color={colors.primary[500]} />
          <Text variant="labelMedium" style={{ marginLeft: spacing[1] }}>
            {streak}
          </Text>
        </View>
        
        {onSettingsPress && (
          <Pressable
            onPress={onSettingsPress}
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
        )}
      </View>

      {/* Game prompt */}
      <Card variant="filled" style={styles.promptCard}>
        {isIdentifyMode ? (
          <>
            <Text variant="labelMedium" color="secondary">
              What note is at this position?
            </Text>
            <View style={styles.positionInfo}>
              <Text variant="bodySmall" color="muted">
                String {currentPosition ? currentPosition.string + 1 : '-'}, Fret {currentPosition?.fret ?? '-'}
              </Text>
            </View>
          </>
        ) : isListenMode ? (
          <>
            <Text variant="labelMedium" color="secondary">
              Play this note on your guitar:
            </Text>
            <View style={styles.noteDisplay}>
              <Text style={[styles.targetNote, { color: colors.primary[500] }]}>
                {currentNote || '?'}
              </Text>
              <Pressable onPress={handlePlayNote} style={styles.playButton}>
                <FontAwesome name="volume-up" size={20} color={colors.primary[500]} />
              </Pressable>
            </View>
            {/* Detected note display */}
            {detectedNote && (
              <View style={styles.detectedNoteContainer}>
                <Text variant="bodySmall" color="muted">
                  Detected: <Text style={{ color: areEnharmonic(detectedNote, currentNote || '') ? colors.success.main : colors.error.main, fontWeight: '600' }}>{detectedNote}</Text>
                  {detectedFrequency && ` (${detectedFrequency.toFixed(1)} Hz)`}
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text variant="labelMedium" color="secondary">
              Find this note on the fretboard:
            </Text>
            <View style={styles.noteDisplay}>
              <Text style={[styles.targetNote, { color: colors.primary[500] }]}>
                {currentNote || '?'}
              </Text>
              <Pressable onPress={handlePlayNote} style={styles.playButton}>
                <FontAwesome name="volume-up" size={20} color={colors.primary[500]} />
              </Pressable>
            </View>
          </>
        )}
      </Card>

      {/* Fretboard */}
      <View style={styles.fretboardContainer}>
        <Fretboard
          minFret={gameSettings.minFret}
          maxFret={gameSettings.maxFret}
          highlightedPosition={currentPosition}
          highlightedNote={(isFindMode || isListenMode) && isCorrect !== null ? currentNote : undefined}
          onFretPress={isFindMode ? handleFretPress : undefined}
          onStringLabelPress={isFindMode ? (stringIndex) => handleFretPress(stringIndex, 0, getNoteAtFret(stringIndex, 0, gameSettings.useFlats)) : undefined}
          showOpenStringNotes={gameSettings.showOpenStringNotes ?? true}
          hideHighlightedNoteName={isIdentifyMode && isCorrect === null}
          useFlats={gameSettings.useFlats}
          enabledStrings={gameSettings.strings}
          disabled={isCorrect !== null}
        />
      </View>

      {/* Note selection (identify mode) - Piano keyboard layout */}
      {isIdentifyMode && (
        <View style={styles.noteButtonsContainer}>
          {/* Wrap both rows for alignment */}
          <View style={styles.pianoKeysWrapper}>
            {/* Natural notes row */}
            {gameSettings.includeNaturalNotes && (
              <View style={styles.noteButtonsRow}>
                {NATURAL_NOTES.map(note => (
                  <NoteButton
                    key={note}
                    note={note}
                    onPress={() => handleNoteGuess(note)}
                    isSelected={selectedAnswer === note}
                    isCorrect={selectedAnswer === note ? isCorrect : null}
                    disabled={isCorrect !== null}
                    theme={theme}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}
            {/* Accidental notes row - offset to align between naturals like piano keys */}
            {gameSettings.includeAccidentals && (
              <View style={styles.accidentalButtonsRow}>
              {/* C#/Db between C and D */}
              <NoteButton
                note={gameSettings.useFlats ? 'Db' : 'C#'}
                onPress={() => handleNoteGuess(gameSettings.useFlats ? 'Db' : 'C#')}
                isSelected={selectedAnswer === (gameSettings.useFlats ? 'Db' : 'C#')}
                isCorrect={selectedAnswer === (gameSettings.useFlats ? 'Db' : 'C#') ? isCorrect : null}
                disabled={isCorrect !== null}
                theme={theme}
                isDark={isDark}
              />
              {/* D#/Eb between D and E */}
              <NoteButton
                note={gameSettings.useFlats ? 'Eb' : 'D#'}
                onPress={() => handleNoteGuess(gameSettings.useFlats ? 'Eb' : 'D#')}
                isSelected={selectedAnswer === (gameSettings.useFlats ? 'Eb' : 'D#')}
                isCorrect={selectedAnswer === (gameSettings.useFlats ? 'Eb' : 'D#') ? isCorrect : null}
                disabled={isCorrect !== null}
                theme={theme}
                isDark={isDark}
              />
              {/* Empty space where E#/F would be */}
              <View style={styles.accidentalSpacer} />
              {/* F#/Gb between F and G */}
              <NoteButton
                note={gameSettings.useFlats ? 'Gb' : 'F#'}
                onPress={() => handleNoteGuess(gameSettings.useFlats ? 'Gb' : 'F#')}
                isSelected={selectedAnswer === (gameSettings.useFlats ? 'Gb' : 'F#')}
                isCorrect={selectedAnswer === (gameSettings.useFlats ? 'Gb' : 'F#') ? isCorrect : null}
                disabled={isCorrect !== null}
                theme={theme}
                isDark={isDark}
              />
              {/* G#/Ab between G and A */}
              <NoteButton
                note={gameSettings.useFlats ? 'Ab' : 'G#'}
                onPress={() => handleNoteGuess(gameSettings.useFlats ? 'Ab' : 'G#')}
                isSelected={selectedAnswer === (gameSettings.useFlats ? 'Ab' : 'G#')}
                isCorrect={selectedAnswer === (gameSettings.useFlats ? 'Ab' : 'G#') ? isCorrect : null}
                disabled={isCorrect !== null}
                theme={theme}
                isDark={isDark}
              />
              {/* A#/Bb between A and B */}
              <NoteButton
                note={gameSettings.useFlats ? 'Bb' : 'A#'}
                onPress={() => handleNoteGuess(gameSettings.useFlats ? 'Bb' : 'A#')}
                isSelected={selectedAnswer === (gameSettings.useFlats ? 'Bb' : 'A#')}
                isCorrect={selectedAnswer === (gameSettings.useFlats ? 'Bb' : 'A#') ? isCorrect : null}
                disabled={isCorrect !== null}
                theme={theme}
                isDark={isDark}
              />
            </View>
          )}
          </View>
        </View>
      )}

      {/* Listen mode controls */}
      {isListenMode && isCorrect === null && (
        <View style={styles.listenControlsContainer}>
          {hasPermission === false ? (
            <Card variant="outlined" style={[styles.permissionCard, { borderColor: colors.error.main }]}>
              <FontAwesome name="microphone-slash" size={24} color={colors.error.main} />
              <Text variant="bodyMedium" style={{ marginTop: spacing[2], textAlign: 'center' }}>
                Microphone permission required
              </Text>
              <Text variant="bodySmall" color="muted" style={{ marginTop: spacing[1], textAlign: 'center' }}>
                Please enable microphone access in your device settings
              </Text>
            </Card>
          ) : Platform.OS !== 'web' && PitchDetector.isExpoGo() ? (
            <Card variant="outlined" style={styles.permissionCard}>
              <FontAwesome name="exclamation-triangle" size={24} color={colors.warning.main} />
              <Text variant="bodyMedium" style={{ marginTop: spacing[2], textAlign: 'center' }}>
                Listen mode requires a development build
              </Text>
              <Text variant="bodySmall" color="muted" style={{ marginTop: spacing[1], textAlign: 'center' }}>
                Expo Go doesn't support native pitch detection.{'\n'}
                Use the web version or build a development APK.
              </Text>
            </Card>
          ) : (
            <>
              <Button
                variant={isListening ? 'secondary' : 'primary'}
                size="lg"
                fullWidth
                onPress={isListening ? stopListening : startListening}
              >
                <View style={styles.listenButtonContent}>
                  <FontAwesome 
                    name={isListening ? 'stop' : 'microphone'} 
                    size={20} 
                    color={isListening ? colors.error.main : '#FFFFFF'} 
                  />
                  <Text style={{ 
                    marginLeft: spacing[2], 
                    color: isListening ? theme.text : '#FFFFFF',
                    fontWeight: '600',
                  }}>
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                  </Text>
                </View>
              </Button>
              {isListening && (
                <View style={styles.listeningIndicator}>
                  <View style={[styles.listeningDot, styles.listeningDotPulse, { backgroundColor: colors.error.main }]} />
                  <Text variant="bodySmall" color="muted" style={{ marginLeft: spacing[2] }}>
                    {detectedNote 
                      ? `Hearing: ${detectedNote} ${detectedFrequency ? `(${detectedFrequency.toFixed(0)}Hz)` : ''}`
                      : 'Listening... Play the note on your guitar'}
                  </Text>
                </View>
              )}
              {isListening && !detectedNote && (
                <Text variant="bodySmall" color="muted" style={{ marginTop: spacing[2], textAlign: 'center' }}>
                  Make sure your microphone is working and play loudly
                </Text>
              )}
              <Button
                variant="ghost"
                size="md"
                onPress={handleGiveUp}
                style={{ marginTop: spacing[2] }}
              >
                Give Up
              </Button>
            </>
          )}
        </View>
      )}

      {/* Feedback */}
      {isCorrect !== null && (
        <Card 
          variant="outlined" 
          style={[
            styles.feedbackCard,
            { 
              borderColor: isCorrect ? colors.success.main : colors.error.main,
              backgroundColor: isCorrect ? colors.success.light : colors.error.light,
            }
          ]}
        >
          <View style={styles.feedbackContent}>
            <FontAwesome 
              name={isCorrect ? 'check-circle' : 'times-circle'} 
              size={24} 
              color={isCorrect ? colors.success.main : colors.error.main} 
            />
            <Text 
              variant="titleSmall" 
              style={{ 
                color: isCorrect ? colors.success.dark : colors.error.dark,
                marginLeft: spacing[2],
              }}
            >
              {isCorrect ? 'Correct!' : `Incorrect - it was ${currentPosition?.note || currentNote}`}
            </Text>
          </View>
        </Card>
      )}

      {/* Next button */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={startNewRound}
        >
          {isCorrect === null ? 'Skip' : 'Next'}
        </Button>
      </View>
    </View>
  );
}

// Note button component for identify mode
function NoteButton({
  note,
  onPress,
  isSelected,
  isCorrect,
  disabled,
  theme,
  isDark,
}: {
  note: string;
  onPress: () => void;
  isSelected: boolean;
  isCorrect: boolean | null;
  disabled: boolean;
  theme: any;
  isDark: boolean;
}) {
  const getBackgroundColor = () => {
    if (isSelected && isCorrect === true) return colors.success.main;
    if (isSelected && isCorrect === false) return colors.error.main;
    return isDark ? colors.neutral[800] : colors.neutral[100];
  };

  const getTextColor = () => {
    if (isSelected && isCorrect !== null) return '#FFFFFF';
    return theme.text;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.noteButton,
        {
          backgroundColor: getBackgroundColor(),
          opacity: pressed ? 0.8 : disabled && !isSelected ? 0.5 : 1,
        },
      ]}
    >
      <Text style={[styles.noteButtonText, { color: getTextColor() }]}>
        {note}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing[4],
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOptionsText: {
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptCard: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    minHeight: 120,
    overflow: 'visible',
    flexShrink: 0,
  },
  positionInfo: {
    marginTop: spacing[2],
  },
  noteDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing[2],
    minHeight: 60,
  },
  targetNote: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
    textAlign: 'center',
  },
  playButton: {
    marginLeft: spacing[3],
    padding: spacing[2],
  },
  fretboardContainer: {
    marginBottom: spacing[4],
  },
  noteButtonsContainer: {
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  pianoKeysWrapper: {
    gap: spacing[2],
  },
  noteButtonsRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  accidentalButtonsRow: {
    flexDirection: 'row',
    gap: spacing[2],
    // Position relative to the naturals row
    // Naturals: 7 buttons (48px each) + 6 gaps (8px each) = 384px wide
    // Accidentals need to be offset so C# sits between C and D
    // Offset = (button width + gap) / 2 = (48 + 8) / 2 = 28px
    paddingLeft: (48 + spacing[2]) / 2,
  },
  accidentalSpacer: {
    width: 48, // Same as button width
  },
  noteButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  feedbackCard: {
    marginBottom: spacing[3],
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: spacing[4],
  },
  // Listen mode styles
  detectedNoteContainer: {
    marginTop: spacing[3],
    paddingTop: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  listenControlsContainer: {
    marginBottom: spacing[3],
    alignItems: 'center',
  },
  permissionCard: {
    alignItems: 'center',
    padding: spacing[4],
  },
  listenButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
  },
  listeningDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  listeningDotPulse: {
    // Animation would go here but RN doesn't support CSS animations
    // The dot color indicates recording is active
  },
});
