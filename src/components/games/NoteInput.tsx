/**
 * Note Input Component for chord games
 */

import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '../ui/ThemeContext';
import { colors, spacing, borderRadius, typography } from '@/src/theme';

interface NoteInputProps {
  value: string;
  onChange: (value: string) => void;
  isCorrect?: boolean | null;
  isRoot?: boolean;
  disabled?: boolean;
  showAccidentalButtons?: boolean;
}

export function NoteInput({
  value,
  onChange,
  isCorrect = null,
  isRoot = false,
  disabled = false,
  showAccidentalButtons = true,
}: NoteInputProps) {
  const { theme } = useTheme();

  const handleTextChange = (text: string) => {
    // Normalize and validate note input
    const normalized = text.toUpperCase();
    const validPattern = /^[A-G][#b]?$/;
    
    if (normalized === '' || normalized.match(/^[A-G]?[#b]?$/)) {
      onChange(normalized);
    }
  };

  const adjustNote = (adjustment: 'sharp' | 'flat') => {
    if (!value) return;
    
    const noteName = value.charAt(0);
    let accidental = value.substring(1);
    
    if (adjustment === 'sharp') {
      if (accidental === '#') return;
      if (accidental === 'b') accidental = '';
      else accidental = '#';
    } else {
      if (accidental === 'b') return;
      if (accidental === '#') accidental = '';
      else accidental = 'b';
    }
    
    onChange(noteName + accidental);
  };

  const getBorderColor = () => {
    if (isRoot) return theme.border;
    if (isCorrect === null) return colors.primary[400];
    return isCorrect ? colors.success.main : colors.error.main;
  };

  const getBackgroundColor = () => {
    if (isRoot) return theme.surfaceVariant;
    if (isCorrect === null) return theme.surface;
    return isCorrect ? colors.success.light : colors.error.light;
  };

  return (
    <View style={styles.container}>
      {/* Sharp button */}
      {showAccidentalButtons && !isRoot && (
        <Pressable
          onPress={() => adjustNote('sharp')}
          disabled={disabled || !value}
          style={({ pressed }) => [
            styles.accidentalButton,
            {
              backgroundColor: pressed ? colors.primary[600] : colors.primary[500],
              opacity: disabled || !value ? 0.5 : 1,
            },
          ]}
        >
          <Text style={styles.accidentalText}>#</Text>
        </Pressable>
      )}
      {showAccidentalButtons && isRoot && <View style={styles.spacer} />}

      {/* Note input */}
      <TextInput
        value={value}
        onChangeText={handleTextChange}
        editable={!disabled && !isRoot}
        placeholder={isRoot ? '' : 'Note'}
        placeholderTextColor={theme.textMuted}
        maxLength={2}
        autoCapitalize="characters"
        style={[
          styles.input,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
            color: theme.text,
          },
        ]}
      />

      {/* Flat button */}
      {showAccidentalButtons && !isRoot && (
        <Pressable
          onPress={() => adjustNote('flat')}
          disabled={disabled || !value}
          style={({ pressed }) => [
            styles.accidentalButton,
            {
              backgroundColor: pressed ? colors.primary[600] : colors.primary[500],
              opacity: disabled || !value ? 0.5 : 1,
            },
          ]}
        >
          <Text style={styles.accidentalText}>♭</Text>
        </Pressable>
      )}
      {showAccidentalButtons && isRoot && <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing[1],
  },
  input: {
    width: 56,
    height: 56,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    ...typography.noteLabel,
  },
  accidentalButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accidentalText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  spacer: {
    width: 36,
    height: 36,
  },
});
