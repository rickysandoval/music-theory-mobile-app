/**
 * Interactive Piano Keyboard Component
 */

import React from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '../ui/ThemeContext';
import { colors, borderRadius } from '@/src/theme';
import { 
  NATURAL_NOTES, 
  BLACK_KEYS_MAP, 
  WHITE_KEY_BEFORE_BLACK,
  ENHARMONIC_MAP,
} from '@/src/lib/music-theory';

interface PianoKeyboardProps {
  onKeyPress: (note: string) => void;
  highlightedNotes?: string[];
  rootNote?: string;
  disabled?: boolean;
}

export function PianoKeyboard({ 
  onKeyPress, 
  highlightedNotes = [], 
  rootNote,
  disabled = false,
}: PianoKeyboardProps) {
  const { theme, isDark } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const keyboardPadding = 16;
  const keyboardWidth = screenWidth - (keyboardPadding * 2);

  // Determine starting white key based on root note
  const getStartingKey = () => {
    if (!rootNote) return 'C';
    
    const rootLetter = rootNote.charAt(0);
    const rootAccidental = rootNote.length > 1 ? rootNote.charAt(1) : '';
    
    // If root is natural, start with it
    if (rootAccidental === '' && NATURAL_NOTES.includes(rootLetter as typeof NATURAL_NOTES[number])) {
      return rootLetter;
    }
    
    // If root is sharp/flat, find white key before it
    if (rootAccidental === '#' || rootAccidental === 'b') {
      return WHITE_KEY_BEFORE_BLACK[rootNote] || 'C';
    }
    
    return 'C';
  };

  const startKey = getStartingKey();
  const startIndex = NATURAL_NOTES.indexOf(startKey as typeof NATURAL_NOTES[number]);
  
  // Reorder white keys to start with determined key (show 8 keys = one octave)
  const whiteKeys = [
    ...NATURAL_NOTES.slice(startIndex),
    ...NATURAL_NOTES.slice(0, startIndex + 1),
  ];

  // Check if a note is highlighted (considering enharmonics)
  const isNoteHighlighted = (note: string | null) => {
    if (!note) return false;
    return highlightedNotes.some(highlighted => {
      if (highlighted.toUpperCase() === note.toUpperCase()) return true;
      
      // Check enharmonic equivalents
      const noteKey = Object.keys(ENHARMONIC_MAP).find(key =>
        ENHARMONIC_MAP[key].map(n => n.toUpperCase()).includes(note.toUpperCase())
      );
      if (!noteKey) return false;
      
      return ENHARMONIC_MAP[noteKey]
        .map(n => n.toUpperCase())
        .includes(highlighted.toUpperCase());
    });
  };

  const whiteKeyWidth = keyboardWidth / 8;
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const whiteKeyHeight = 160;
  const blackKeyHeight = 100;

  return (
    <View style={[styles.container, { width: keyboardWidth }]}>
      <View style={[styles.keyboard, { height: whiteKeyHeight }]}>
        {/* White keys */}
        {whiteKeys.map((note, index) => {
          const isHighlighted = isNoteHighlighted(note);
          const isRoot = rootNote?.charAt(0) === note && rootNote?.length === 1;
          const isLastKey = index === whiteKeys.length - 1;
          
          return (
            <Pressable
              key={`white-${index}`}
              disabled={disabled || isLastKey}
              onPress={() => !isLastKey && onKeyPress(note)}
              style={({ pressed }) => [
                styles.whiteKey,
                {
                  width: whiteKeyWidth,
                  height: whiteKeyHeight,
                  backgroundColor: isHighlighted 
                    ? colors.primary[400] 
                    : pressed 
                      ? colors.music.piano.whiteKeyPressed 
                      : colors.music.piano.whiteKey,
                  opacity: isLastKey ? 0.5 : 1,
                },
                isRoot && styles.rootKey,
              ]}
            >
              <Text 
                variant="labelMedium" 
                style={[
                  styles.keyLabel,
                  { color: colors.neutral[600] },
                ]}
              >
                {note}
              </Text>
            </Pressable>
          );
        })}
        
        {/* Black keys - positioned absolutely */}
        {whiteKeys.slice(0, -1).map((note, index) => {
          const blackNote = BLACK_KEYS_MAP[note];
          if (!blackNote) return null;
          
          const isHighlighted = isNoteHighlighted(blackNote);
          const isRoot = rootNote === blackNote || 
            (rootNote && ENHARMONIC_MAP[blackNote]?.includes(rootNote));
          
          // Position black key at the right edge of white key
          const leftPosition = (index + 1) * whiteKeyWidth - (blackKeyWidth / 2);
          
          return (
            <Pressable
              key={`black-${index}`}
              disabled={disabled}
              onPress={() => onKeyPress(blackNote)}
              style={({ pressed }) => [
                styles.blackKey,
                {
                  left: leftPosition,
                  width: blackKeyWidth,
                  height: blackKeyHeight,
                  backgroundColor: isHighlighted
                    ? colors.primary[600]
                    : pressed
                      ? colors.music.piano.blackKeyPressed
                      : colors.music.piano.blackKey,
                },
                isRoot && styles.rootKeyBlack,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  keyboard: {
    flexDirection: 'row',
    position: 'relative',
  },
  whiteKey: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.sm,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  blackKey: {
    position: 'absolute',
    top: 0,
    borderRadius: borderRadius.sm,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    zIndex: 1,
  },
  keyLabel: {
    fontSize: 12,
  },
  rootKey: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  rootKeyBlack: {
    borderColor: colors.primary[300],
    borderWidth: 2,
  },
});
