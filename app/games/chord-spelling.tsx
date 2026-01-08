/**
 * Chord Spelling Game Screen
 * Orchestrates practice/test modes and piano/flashcard input modes
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { Text, Button, Card, useTheme } from '@/src/components/ui';
import { 
  ChordSpellingGame, 
  FlashcardGame, 
  TestResults,
  GameSettingsSheet,
} from '@/src/components/games';
import { useChordTest } from '@/src/hooks/useChordTest';
import { useSettings } from '@/src/stores';
import { colors, spacing, borderRadius, Theme } from '@/src/theme';
import { GameMode, InputMode } from '@/src/lib/music-theory/types';

export default function ChordSpellingScreen() {
  const { theme, isDark } = useTheme();
  const { settings, updateChordSettings } = useSettings();
  
  // Mode selection
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [inputMode, setInputMode] = useState<InputMode>('piano');
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Test management
  const {
    currentChord,
    isTestActive,
    isReviewingMissed,
    isCompleted,
    progress,
    startTest,
    recordResult,
    startPracticeMissed,
    markReviewedCorrect,
    restartTest,
    endTest,
    score,
    missedChords,
  } = useChordTest();

  // Handle starting a test or practice session
  const handleStartSession = useCallback(() => {
    if (gameMode === 'test' && settings) {
      startTest(settings.chordGame);
    }
    setShowModeSelection(false);
  }, [gameMode, settings, startTest]);

  // Handle result from piano or flashcard game
  const handleResult = useCallback((wasCorrect: boolean) => {
    if (isReviewingMissed) {
      // In review mode, only advance if correct
      if (wasCorrect) {
        markReviewedCorrect();
      }
    } else {
      recordResult(wasCorrect);
    }
  }, [isReviewingMissed, recordResult, markReviewedCorrect]);

  // Handle going back to mode selection
  const handleBackToPractice = useCallback(() => {
    endTest();
    setGameMode('practice');
    setShowModeSelection(true);
  }, [endTest]);

  // Handle restarting test
  const handleRestartTest = useCallback(() => {
    restartTest();
  }, [restartTest]);

  // Practice mode - just show the game
  if (!showModeSelection && gameMode === 'practice') {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['bottom']}
      >
        {inputMode === 'piano' ? (
          <ChordSpellingGame 
            onSettingsPress={() => setShowSettings(true)}
          />
        ) : (
          <FlashcardPractice 
            onSettingsPress={() => setShowSettings(true)}
          />
        )}
        
        {/* Back button */}
        <Pressable
          onPress={() => setShowModeSelection(true)}
          style={[styles.backButton, { backgroundColor: theme.surfaceVariant }]}
        >
          <FontAwesome name="arrow-left" size={14} color={theme.textSecondary} />
          <Text variant="labelSmall" color="secondary" style={styles.backButtonText}>
            Change Mode
          </Text>
        </Pressable>

        <GameSettingsSheet
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings?.chordGame || { includeDiatonicRoots: true, includeAccidentalRoots: true, includeMajorChords: true, includeMinorChords: true }}
          onSettingsChange={updateChordSettings}
        />
      </SafeAreaView>
    );
  }

  // Test mode - show results if completed
  if (gameMode === 'test' && isCompleted && score) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['bottom']}
      >
        <TestResults
          score={score}
          missedChords={missedChords}
          isAfterReview={missedChords.length === 0 && isReviewingMissed}
          onPracticeMissed={startPracticeMissed}
          onRestartTest={handleRestartTest}
          onBackToPractice={handleBackToPractice}
        />
      </SafeAreaView>
    );
  }

  // Test mode - active test or review
  if (gameMode === 'test' && isTestActive && currentChord) {
    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['bottom']}
      >
        {inputMode === 'piano' ? (
          <ChordSpellingGame
            isTestMode
            testChord={currentChord}
            onTestResult={handleResult}
            showProgress={progress}
            isReviewMode={isReviewingMissed}
          />
        ) : (
          <FlashcardGame
            chord={currentChord}
            onResult={handleResult}
            showProgress={progress}
            isReviewMode={isReviewingMissed}
          />
        )}
      </SafeAreaView>
    );
  }

  // Mode selection screen
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['bottom']}
    >
      <View style={styles.selectionContainer}>
        <Text variant="headlineMedium" style={styles.title}>
          Chord Spelling
        </Text>
        <Text variant="bodyMedium" color="secondary" style={styles.subtitle}>
          Choose your practice mode
        </Text>

        {/* Game Mode Selection */}
        <Text variant="labelLarge" style={styles.sectionTitle}>
          Mode
        </Text>
        <View style={styles.optionRow}>
          <ModeButton
            title="Practice"
            description="Endless random chords"
            icon="refresh"
            isSelected={gameMode === 'practice'}
            onPress={() => setGameMode('practice')}
            theme={theme}
            isDark={isDark}
          />
          <ModeButton
            title="Test"
            description="Go through all chords"
            icon="check-square-o"
            isSelected={gameMode === 'test'}
            onPress={() => setGameMode('test')}
            theme={theme}
            isDark={isDark}
          />
        </View>

        {/* Input Mode Selection */}
        <Text variant="labelLarge" style={styles.sectionTitle}>
          Input Style
        </Text>
        <View style={styles.optionRow}>
          <ModeButton
            title="Piano"
            description="Tap keys to spell"
            icon="music"
            isSelected={inputMode === 'piano'}
            onPress={() => setInputMode('piano')}
            theme={theme}
            isDark={isDark}
          />
          <ModeButton
            title="Flashcard"
            description="Reveal & self-grade"
            icon="clone"
            isSelected={inputMode === 'flashcard'}
            onPress={() => setInputMode('flashcard')}
            theme={theme}
            isDark={isDark}
          />
        </View>

        {/* Settings Summary */}
        <Pressable
          onPress={() => setShowSettings(true)}
          style={({ pressed }) => [
            styles.settingsSummary,
            { 
              backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View>
            <Text variant="labelMedium">Chord Settings</Text>
            <Text variant="bodySmall" color="muted">
              {[
                settings?.chordGame.includeDiatonicRoots && 'Diatonic',
                settings?.chordGame.includeAccidentalRoots && '♯/♭',
              ].filter(Boolean).join(' & ') || 'No roots'}
              {' • '}
              {[
                settings?.chordGame.includeMajorChords && 'Major',
                settings?.chordGame.includeMinorChords && 'Minor',
              ].filter(Boolean).join(' & ') || 'No chords'}
            </Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color={theme.textMuted} />
        </Pressable>

        {/* Test info / Warning */}
        {settings && (
          <Card 
            variant="outlined" 
            style={[
              styles.testInfo,
              getChordCount(settings.chordGame) === 0 && { borderColor: colors.error.main }
            ]}
          >
            {getChordCount(settings.chordGame) === 0 ? (
              <Text variant="labelSmall" style={{ color: colors.error.main }}>
                No chords available! Enable at least one root type and one chord quality.
              </Text>
            ) : gameMode === 'test' ? (
              <Text variant="labelSmall" color="secondary">
                Test will include{' '}
                <Text variant="labelSmall" style={{ color: colors.primary[500] }}>
                  {getChordCount(settings.chordGame)}
                </Text>
                {' '}chords
              </Text>
            ) : (
              <Text variant="labelSmall" color="secondary">
                {getChordCount(settings.chordGame)} chords available
              </Text>
            )}
          </Card>
        )}

        {/* Start button */}
        <View style={styles.startButtonContainer}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleStartSession}
            disabled={!settings || getChordCount(settings.chordGame) === 0}
          >
            {gameMode === 'test' ? 'Start Test' : 'Start Practice'}
          </Button>
        </View>
      </View>

      <GameSettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings?.chordGame || { includeDiatonicRoots: true, includeAccidentalRoots: true, includeMajorChords: true, includeMinorChords: true }}
        onSettingsChange={updateChordSettings}
      />
    </SafeAreaView>
  );
}

// Helper component for mode selection buttons
function ModeButton({ 
  title, 
  description, 
  icon, 
  isSelected, 
  onPress,
  theme,
  isDark,
}: {
  title: string;
  description: string;
  icon: keyof typeof FontAwesome.glyphMap;
  isSelected: boolean;
  onPress: () => void;
  theme: Theme;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.modeButton,
        {
          backgroundColor: isSelected 
            ? colors.primary[isDark ? 900 : 50]
            : isDark ? colors.neutral[800] : colors.neutral[50],
          borderColor: isSelected 
            ? colors.primary[500]
            : isDark ? colors.neutral[700] : colors.neutral[200],
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <FontAwesome 
        name={icon} 
        size={24} 
        color={isSelected ? colors.primary[500] : theme.textSecondary} 
      />
      <Text 
        variant="titleSmall" 
        style={{ 
          color: isSelected ? colors.primary[500] : theme.text,
          marginTop: spacing[2],
        }}
      >
        {title}
      </Text>
      <Text variant="bodySmall" color="muted" style={styles.modeDescription}>
        {description}
      </Text>
    </Pressable>
  );
}

// Flashcard practice mode (endless)
function FlashcardPractice({ 
  onSettingsPress 
}: { 
  onSettingsPress: () => void 
}) {
  const { settings } = useSettings();
  const { theme, isDark } = useTheme();
  const [currentChord, setCurrentChord] = React.useState<any>(null);
  
  // Import dynamically to avoid circular deps
  const { generateRandomChord } = require('@/src/lib/music-theory');
  
  React.useEffect(() => {
    if (settings && !currentChord) {
      setCurrentChord(generateRandomChord(settings.chordGame, null));
    }
  }, [settings]);

  const handleResult = React.useCallback(() => {
    if (settings) {
      setCurrentChord(generateRandomChord(settings.chordGame, currentChord));
    }
  }, [settings, currentChord]);

  if (!currentChord) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.flashcardPractice}>
      {/* Settings button */}
      <View style={styles.practiceHeader}>
        <View style={styles.headerSpacer} />
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
      </View>
      
      <FlashcardGame
        chord={currentChord}
        onResult={handleResult}
      />
    </View>
  );
}

// Helper to count chords based on settings
function getChordCount(settings: { 
  includeDiatonicRoots: boolean; 
  includeAccidentalRoots: boolean; 
  includeMajorChords: boolean; 
  includeMinorChords: boolean; 
}) {
  // Count root notes
  let rootCount = 0;
  if (settings.includeDiatonicRoots) {
    rootCount += 7; // C, D, E, F, G, A, B
  }
  if (settings.includeAccidentalRoots) {
    rootCount += 5; // C#/Db, Eb, F#/Gb, Ab, Bb
  }
  
  // Count chord qualities
  let qualityCount = 0;
  if (settings.includeMajorChords) qualityCount += 1;
  if (settings.includeMinorChords) qualityCount += 1;
  
  return rootCount * qualityCount;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectionContainer: {
    flex: 1,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[1],
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[2],
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  modeDescription: {
    textAlign: 'center',
    marginTop: spacing[1],
  },
  settingsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  testInfo: {
    alignItems: 'center',
    paddingVertical: spacing[2],
    marginBottom: spacing[4],
  },
  startButtonContainer: {
    marginTop: 'auto',
    paddingBottom: spacing[4],
  },
  backButton: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    marginLeft: spacing[2],
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashcardPractice: {
    flex: 1,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[4],
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
});
