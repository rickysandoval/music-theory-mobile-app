/**
 * Metronome Settings Sheet
 * Sound options: voice, time signature, accent, subdivision
 */

import React from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';

import { Text, Button, Switch, useTheme } from '@/src/components/ui';
import { colors, spacing, borderRadius } from '@/src/theme';
import type { MetronomeSettings, MetronomeVoice, MetronomeSubdivision } from '@/src/stores';

const VOICES: { value: MetronomeVoice; label: string }[] = [
  { value: 'high', label: 'High tick' },
  { value: 'low', label: 'Low tick' },
  { value: 'snare', label: 'Snare' },
  { value: 'beep', label: 'Beep' },
];

const TIME_SIGS: { value: 2 | 3 | 4; label: string }[] = [
  { value: 2, label: '2/4' },
  { value: 3, label: '3/4' },
  { value: 4, label: '4/4' },
];

const SUBDIVISIONS: { value: MetronomeSubdivision; label: string }[] = [
  { value: 'quarter', label: 'Quarter only' },
  { value: 'eighth', label: 'Eighth notes' },
];

interface MetronomeSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  settings: MetronomeSettings;
  onSettingsChange: (updates: Partial<MetronomeSettings>) => void;
}

export function MetronomeSettingsSheet({
  visible,
  onClose,
  settings,
  onSettingsChange,
}: MetronomeSettingsSheetProps) {
  const { theme, isDark } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.surface }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text variant="titleLarge" style={styles.title}>
            Metronome sound
          </Text>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Voice */}
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Sound
            </Text>
            <View style={styles.optionRow}>
              {VOICES.map(({ value, label }) => (
                <Pressable
                  key={value}
                  onPress={() => onSettingsChange({ voice: value })}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: settings.voice === value
                        ? colors.primary[isDark ? 900 : 50]
                        : isDark ? colors.neutral[800] : colors.neutral[100],
                      borderColor: settings.voice === value ? colors.primary[500] : 'transparent',
                    },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={{ color: settings.voice === value ? colors.primary[500] : theme.text }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Time signature */}
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Time signature
            </Text>
            <View style={styles.optionRow}>
              {TIME_SIGS.map(({ value, label }) => (
                <Pressable
                  key={value}
                  onPress={() => onSettingsChange({ timeSignature: value })}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: settings.timeSignature === value
                        ? colors.primary[isDark ? 900 : 50]
                        : isDark ? colors.neutral[800] : colors.neutral[100],
                      borderColor: settings.timeSignature === value ? colors.primary[500] : 'transparent',
                    },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={{ color: settings.timeSignature === value ? colors.primary[500] : theme.text }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Accent first beat */}
            <Switch
              label="Accent first beat"
              description="Louder click on beat 1 of each bar"
              value={settings.accentFirstBeat}
              onValueChange={(value) => onSettingsChange({ accentFirstBeat: value })}
            />

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Subdivision */}
            <Text variant="labelMedium" color="secondary" style={styles.sectionLabel}>
              Subdivision
            </Text>
            <View style={styles.optionRow}>
              {SUBDIVISIONS.map(({ value, label }) => (
                <Pressable
                  key={value}
                  onPress={() => onSettingsChange({ subdivision: value })}
                  style={[
                    styles.optionButton,
                    {
                      backgroundColor: settings.subdivision === value
                        ? colors.primary[isDark ? 900 : 50]
                        : isDark ? colors.neutral[800] : colors.neutral[100],
                      borderColor: settings.subdivision === value ? colors.primary[500] : 'transparent',
                    },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={{ color: settings.subdivision === value ? colors.primary[500] : theme.text }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
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
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  optionButton: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  divider: {
    height: 1,
    marginVertical: spacing[3],
  },
});
