/**
 * Game Settings Sheet - Quick access settings overlay
 */

import React from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { Text } from '../ui/Text';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';
import { useTheme } from '../ui/ThemeContext';
import { colors, spacing, borderRadius } from '@/src/theme';
import { GameSettings } from '@/src/stores';

interface GameSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  settings: GameSettings['chordGame'];
  onSettingsChange: (updates: Partial<GameSettings['chordGame']>) => void;
}

export function GameSettingsSheet({
  visible,
  onClose,
  settings,
  onSettingsChange,
}: GameSettingsSheetProps) {
  const { theme, isDark } = useTheme();

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
            Game Settings
          </Text>

          <View style={styles.settingsContainer}>
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Root Notes
            </Text>
            
            <Switch
              label="Diatonic Notes"
              description="Natural notes (C, D, E, F, G, A, B)"
              value={settings.includeDiatonicRoots}
              onValueChange={(value) => 
                onSettingsChange({ includeDiatonicRoots: value })
              }
            />
            
            <Switch
              label="Accidentals"
              description="Sharps & flats (F#, Bb, etc.)"
              value={settings.includeAccidentalRoots}
              onValueChange={(value) => 
                onSettingsChange({ includeAccidentalRoots: value })
              }
            />
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Chord Quality
            </Text>
            
            <Switch
              label="Major Chords"
              description="C, D, E, F, G, A, B"
              value={settings.includeMajorChords}
              onValueChange={(value) => 
                onSettingsChange({ includeMajorChords: value })
              }
            />
            
            <Switch
              label="Minor Chords"
              description="Am, Dm, Em, etc."
              value={settings.includeMinorChords}
              onValueChange={(value) => 
                onSettingsChange({ includeMinorChords: value })
              }
            />
          </View>

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
  settingsContainer: {
    marginBottom: spacing[4],
  },
  sectionLabel: {
    marginBottom: spacing[2],
    marginTop: spacing[1],
  },
  divider: {
    height: 1,
    marginVertical: spacing[3],
  },
});
