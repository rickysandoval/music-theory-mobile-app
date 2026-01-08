/**
 * Note Slot Component - Touch-friendly note display for chord games
 * Tappable slots that display notes and can be selected
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '../ui/ThemeContext';
import { colors, spacing, borderRadius, typography } from '@/src/theme';

interface NoteSlotProps {
  value: string;
  isSelected?: boolean;
  isCorrect?: boolean | null;
  isRoot?: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function NoteSlot({
  value,
  isSelected = false,
  isCorrect = null,
  isRoot = false,
  onPress,
  disabled = false,
}: NoteSlotProps) {
  const { theme, isDark } = useTheme();

  const getBorderColor = () => {
    if (isSelected) return colors.primary[500];
    if (isRoot) return theme.border;
    if (isCorrect === null) return theme.border;
    return isCorrect ? colors.success.main : colors.error.main;
  };

  const getBackgroundColor = () => {
    if (isSelected) return isDark ? colors.primary[900] : colors.primary[50];
    if (isRoot) return theme.surfaceVariant;
    if (isCorrect === null) return theme.surface;
    return isCorrect ? colors.success.light : colors.error.light;
  };

  const isEmpty = !value;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.slot,
        {
          borderColor: getBorderColor(),
          backgroundColor: getBackgroundColor(),
          opacity: pressed ? 0.8 : disabled ? 0.6 : 1,
          transform: [{ scale: isSelected ? 1.05 : 1 }],
        },
      ]}
    >
      {isEmpty ? (
        <View style={styles.emptyIndicator}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>?</Text>
        </View>
      ) : (
        <Text style={[styles.noteText, { color: theme.text }]}>
          {value}
        </Text>
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <View style={[styles.selectionIndicator, { backgroundColor: colors.primary[500] }]} />
      )}
      
      {/* Root label */}
      {isRoot && (
        <Text style={[styles.label, { color: theme.textMuted }]}>Root</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 64,
    height: 72,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  noteText: {
    ...typography.chordName,
    fontSize: 24,
  },
  emptyIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  selectionIndicator: {
    position: 'absolute',
    bottom: -4,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 2,
  },
  label: {
    position: 'absolute',
    bottom: 4,
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
