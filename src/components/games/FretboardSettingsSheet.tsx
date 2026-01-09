/**
 * Fretboard Game Settings Sheet
 */

import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Text } from '../ui/Text';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { useTheme } from '../ui/ThemeContext';
import { colors, spacing, borderRadius } from '@/src/theme';
import { GameSettings } from '@/src/stores';

const STRING_NAMES = ['E (low)', 'A', 'D', 'G', 'B', 'E (high)'];

interface FretboardSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  settings: GameSettings['fretboardGame'];
  onSettingsChange: (updates: Partial<GameSettings['fretboardGame']>) => void;
}

export function FretboardSettingsSheet({
  visible,
  onClose,
  settings,
  onSettingsChange,
}: FretboardSettingsSheetProps) {
  const { theme, isDark } = useTheme();

  const handleStringToggle = (index: number, value: boolean) => {
    const newStrings = [...settings.strings];
    newStrings[index] = value;
    onSettingsChange({ strings: newStrings });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.sheet, { backgroundColor: theme.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          
          <Text variant="titleLarge" style={styles.title}>
            Fretboard Settings
          </Text>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Game Mode */}
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Game Mode
            </Text>
            <View style={styles.modeContainer}>
              <Pressable
                onPress={() => onSettingsChange({ gameMode: 'identify' })}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor: settings.gameMode === 'identify'
                      ? colors.primary[isDark ? 900 : 50]
                      : isDark ? colors.neutral[800] : colors.neutral[100],
                    borderColor: settings.gameMode === 'identify'
                      ? colors.primary[500]
                      : 'transparent',
                  },
                ]}
              >
                <Text 
                  variant="labelMedium"
                  style={{ color: settings.gameMode === 'identify' ? colors.primary[500] : theme.text }}
                >
                  Identify
                </Text>
                <Text variant="bodySmall" color="muted">
                  Name the note
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onSettingsChange({ gameMode: 'find' })}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor: settings.gameMode === 'find'
                      ? colors.primary[isDark ? 900 : 50]
                      : isDark ? colors.neutral[800] : colors.neutral[100],
                    borderColor: settings.gameMode === 'find'
                      ? colors.primary[500]
                      : 'transparent',
                  },
                ]}
              >
                <Text 
                  variant="labelMedium"
                  style={{ color: settings.gameMode === 'find' ? colors.primary[500] : theme.text }}
                >
                  Find
                </Text>
                <Text variant="bodySmall" color="muted">
                  Tap the position
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onSettingsChange({ gameMode: 'listen' })}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor: settings.gameMode === 'listen'
                      ? colors.primary[isDark ? 900 : 50]
                      : isDark ? colors.neutral[800] : colors.neutral[100],
                    borderColor: settings.gameMode === 'listen'
                      ? colors.primary[500]
                      : 'transparent',
                  },
                ]}
              >
                <Text 
                  variant="labelMedium"
                  style={{ color: settings.gameMode === 'listen' ? colors.primary[500] : theme.text }}
                >
                  Listen
                </Text>
                <Text variant="bodySmall" color="muted">
                  Play on guitar
                </Text>
              </Pressable>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Notes to Include */}
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Notes to Include
            </Text>
            <Switch
              label="Natural Notes"
              description="C, D, E, F, G, A, B"
              value={settings.includeNaturalNotes}
              onValueChange={(value) => onSettingsChange({ includeNaturalNotes: value })}
            />
            <Switch
              label="Accidentals"
              description="Sharps & flats"
              value={settings.includeAccidentals}
              onValueChange={(value) => onSettingsChange({ includeAccidentals: value })}
            />
            <Switch
              label="Use Flat Names"
              description="Show Bb instead of A#"
              value={settings.useFlats}
              onValueChange={(value) => onSettingsChange({ useFlats: value })}
            />

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Fret Range */}
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Fret Range
            </Text>
            <View style={styles.fretRangeContainer}>
              <View style={styles.fretRangeItem}>
                <Text variant="bodySmall" color="muted">Min Fret</Text>
                <View style={styles.fretRangeButtons}>
                  <Pressable
                    onPress={() => onSettingsChange({ minFret: Math.max(0, settings.minFret - 1) })}
                    style={[styles.fretAdjustButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
                  >
                    <Text>-</Text>
                  </Pressable>
                  <Text variant="titleMedium" style={styles.fretValue}>{settings.minFret}</Text>
                  <Pressable
                    onPress={() => onSettingsChange({ minFret: Math.min(settings.maxFret - 1, settings.minFret + 1) })}
                    style={[styles.fretAdjustButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
                  >
                    <Text>+</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.fretRangeItem}>
                <Text variant="bodySmall" color="muted">Max Fret</Text>
                <View style={styles.fretRangeButtons}>
                  <Pressable
                    onPress={() => onSettingsChange({ maxFret: Math.max(settings.minFret + 1, settings.maxFret - 1) })}
                    style={[styles.fretAdjustButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
                  >
                    <Text>-</Text>
                  </Pressable>
                  <Text variant="titleMedium" style={styles.fretValue}>{settings.maxFret}</Text>
                  <Pressable
                    onPress={() => onSettingsChange({ maxFret: Math.min(12, settings.maxFret + 1) })}
                    style={[styles.fretAdjustButton, { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] }]}
                  >
                    <Text>+</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Listen Mode Options */}
            {settings.gameMode === 'listen' && (
              <>
                <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
                  Listen Mode
                </Text>
                <Switch
                  label="Auto-advance when correct"
                  description="Automatically move to next note"
                  value={settings.autoAdvanceOnCorrect ?? false}
                  onValueChange={(value) => onSettingsChange({ autoAdvanceOnCorrect: value })}
                />
                
                <Text variant="bodySmall" color="muted" style={{ marginTop: spacing[3], marginBottom: spacing[2] }}>
                  Microphone Sensitivity
                </Text>
                <View style={styles.sensitivityContainer}>
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <Pressable
                      key={level}
                      onPress={() => onSettingsChange({ listenSensitivity: level })}
                      style={[
                        styles.sensitivityButton,
                        {
                          backgroundColor: (settings.listenSensitivity ?? 'medium') === level
                            ? colors.primary[isDark ? 900 : 50]
                            : isDark ? colors.neutral[800] : colors.neutral[100],
                          borderColor: (settings.listenSensitivity ?? 'medium') === level
                            ? colors.primary[500]
                            : 'transparent',
                        },
                      ]}
                    >
                      <Text 
                        variant="labelSmall"
                        style={{ 
                          color: (settings.listenSensitivity ?? 'medium') === level 
                            ? colors.primary[500] 
                            : theme.text,
                          textTransform: 'capitalize',
                        }}
                      >
                        {level}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text variant="bodySmall" color="muted" style={{ marginTop: spacing[1] }}>
                  {(settings.listenSensitivity ?? 'medium') === 'low' && 'Best for noisy rooms - play loud & close to mic'}
                  {(settings.listenSensitivity ?? 'medium') === 'medium' && 'Good balance - filters most background noise'}
                  {(settings.listenSensitivity ?? 'medium') === 'high' && 'For quiet rooms only'}
                </Text>
                
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              </>
            )}

            {/* Display Options */}
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Display
            </Text>
            <Switch
              label="Show Open String Notes"
              description="Display note names at the nut"
              value={settings.showOpenStringNotes}
              onValueChange={(value) => onSettingsChange({ showOpenStringNotes: value })}
            />

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Strings */}
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Strings
            </Text>
            {STRING_NAMES.map((name, index) => (
              <Switch
                key={index}
                label={name}
                value={settings.strings[index]}
                onValueChange={(value) => handleStringToggle(index, value)}
              />
            ))}
          </ScrollView>

          <Button variant="primary" onPress={onClose} fullWidth>
            Done
          </Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[4],
    paddingBottom: spacing[8],
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  scrollContainer: {
    marginBottom: spacing[4],
  },
  sectionLabel: {
    marginBottom: spacing[2],
    marginTop: spacing[1],
  },
  modeContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  modeButton: {
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing[3],
  },
  fretRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing[2],
  },
  fretRangeItem: {
    alignItems: 'center',
  },
  fretRangeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  fretAdjustButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fretValue: {
    minWidth: 30,
    textAlign: 'center',
  },
  sensitivityContainer: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  sensitivityButton: {
    flex: 1,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
});
