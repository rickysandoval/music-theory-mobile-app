/**
 * Fretboard Component
 * Visual representation of a guitar fretboard
 */

import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text } from '../ui/Text';
import { useTheme } from '../ui/ThemeContext';
import { colors, spacing } from '@/src/theme';
import { getNoteAtFret } from '@/src/lib/music-theory';

const SCREEN_WIDTH = Dimensions.get('window').width;
// String numbers (1 = high E, 6 = low E in standard notation)
const STRING_NUMBERS = ['6', '5', '4', '3', '2', '1']; // Index 0 = low E = string 6

interface FretboardProps {
  minFret?: number;
  maxFret?: number;
  highlightedPosition?: { string: number; fret: number } | null;
  highlightedNote?: string | null; // Highlight all positions of this note
  onFretPress?: (string: number, fret: number, note: string) => void;
  onStringLabelPress?: (string: number) => void; // Click string label to select open string
  showFretNumbers?: boolean;
  showOpenStringNotes?: boolean; // Show note names at the nut
  hideHighlightedNoteName?: boolean; // Hide note name on highlighted position (for quiz mode)
  disabled?: boolean;
  useFlats?: boolean;
  enabledStrings?: boolean[]; // Which strings are enabled for interaction
}

export function Fretboard({
  minFret = 0,
  maxFret = 5,
  highlightedPosition = null,
  highlightedNote = null,
  onFretPress,
  onStringLabelPress,
  showFretNumbers = true,
  showOpenStringNotes = false,
  hideHighlightedNoteName = false,
  disabled = false,
  useFlats = false,
  enabledStrings = [true, true, true, true, true, true],
}: FretboardProps) {
  const { theme, isDark } = useTheme();
  
  // When minFret is 0, we show the nut but don't render fret 0 as a cell
  // Fret cells start from fret 1 (or minFret if > 0)
  const showNut = minFret === 0;
  const firstFretCell = showNut ? 1 : minFret;
  const fretCellCount = maxFret - firstFretCell + 1;
  
  const nutWidth = 6;
  const stringLabelWidth = 30;
  const openNoteWidth = showOpenStringNotes ? 24 : 0;
  const fretWidth = Math.min((SCREEN_WIDTH - spacing[8] - (showNut ? nutWidth : 0) - stringLabelWidth - openNoteWidth) / fretCellCount, 60);
  const stringSpacing = 28;
  const totalStringsHeight = stringSpacing * 6;
  
  // Standard fret markers (3, 5, 7, 9, 12)
  const fretMarkers = [3, 5, 7, 9, 12, 15, 17, 19, 21];
  const doubleFretMarkers = [12, 24];

  const isPositionHighlighted = (string: number, fret: number) => {
    if (highlightedPosition) {
      return highlightedPosition.string === string && highlightedPosition.fret === fret;
    }
    if (highlightedNote) {
      const noteAtPosition = getNoteAtFret(string, fret, useFlats);
      // Compare by normalizing to check enharmonic equivalence
      const { getNoteIndex } = require('@/src/lib/music-theory');
      return getNoteIndex(noteAtPosition) === getNoteIndex(highlightedNote);
    }
    return false;
  };

  const handlePress = (string: number, fret: number) => {
    if (disabled || !enabledStrings[string]) return;
    const note = getNoteAtFret(string, fret, useFlats);
    onFretPress?.(string, fret, note);
  };

  // Generate array of frets to render (excludes fret 0 when showing nut)
  const fretsToRender = Array.from({ length: fretCellCount }, (_, i) => firstFretCell + i);

  return (
    <View style={styles.container}>
      {/* Fret numbers */}
      {showFretNumbers && (
        <View style={[styles.fretNumbersRow, { marginLeft: stringLabelWidth + (showNut ? nutWidth : 0) + openNoteWidth }]}>
          {fretsToRender.map(fret => (
            <View key={fret} style={[styles.fretNumberCell, { width: fretWidth }]}>
              <Text variant="labelSmall" color="muted">
                {fret}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Fretboard */}
      <View style={[styles.fretboard, { backgroundColor: colors.music.fretboard.wood }]}>
        {/* Nut - extends full height */}
        {showNut && (
          <View 
            style={[
              styles.nutBar, 
              { 
                width: nutWidth,
                left: stringLabelWidth + openNoteWidth,
                height: totalStringsHeight,
              }
            ]} 
          />
        )}
        
        {/* Fret wires - extend full height */}
        <View style={[styles.fretWiresContainer, { left: stringLabelWidth + (showNut ? nutWidth : 0) + openNoteWidth }]}>
          {fretsToRender.map(fret => (
            <View 
              key={fret} 
              style={[
                styles.fretWire, 
                { 
                  left: (fret - firstFretCell + 1) * fretWidth - 1,
                  height: totalStringsHeight,
                }
              ]} 
            />
          ))}
        </View>
        
        {/* Fret markers - single dots */}
        <View style={[styles.fretMarkersRow, { marginLeft: stringLabelWidth + (showNut ? nutWidth : 0) + openNoteWidth }]}>
          {fretsToRender.map(fret => (
            <View key={fret} style={[styles.fretMarkerCell, { width: fretWidth }]}>
              {fretMarkers.includes(fret) && !doubleFretMarkers.includes(fret) && (
                <View style={styles.fretMarker} />
              )}
            </View>
          ))}
        </View>
        
        {/* Double fret markers (12th, 24th) - positioned separately for proper spacing */}
        <View style={[styles.doubleFretMarkersRow, { marginLeft: stringLabelWidth + (showNut ? nutWidth : 0) + openNoteWidth, height: totalStringsHeight }]}>
          {fretsToRender.map(fret => (
            <View key={fret} style={[styles.fretMarkerCell, { width: fretWidth, height: '100%' }]}>
              {doubleFretMarkers.includes(fret) && (
                <>
                  {/* Position dots between strings, not behind them */}
                  <View style={[styles.fretMarker, { position: 'absolute', top: stringSpacing * 2 - 4 }]} />
                  <View style={[styles.fretMarker, { position: 'absolute', bottom: stringSpacing * 2 - 4 }]} />
                </>
              )}
            </View>
          ))}
        </View>

        {/* Strings and frets - render in reverse order (high E at top, low E at bottom) */}
        {STRING_NUMBERS.slice().reverse().map((stringNumber, visualIndex) => {
          // Convert visual index back to actual string index (0=low E, 5=high E)
          const stringIndex = 5 - visualIndex;
          const isEnabled = enabledStrings[stringIndex];
          const openNote = getNoteAtFret(stringIndex, 0, useFlats);
          const isOpenHighlighted = isPositionHighlighted(stringIndex, 0);
          
          return (
          <View key={stringIndex} style={styles.stringRow}>
            {/* String label - show string number, clickable for open string selection */}
            <Pressable 
              style={[styles.stringLabel, { width: stringLabelWidth }]}
              onPress={() => onStringLabelPress?.(stringIndex)}
              disabled={disabled || !isEnabled || !onStringLabelPress}
            >
              <Text 
                variant="labelSmall" 
                style={{ 
                  color: isEnabled && onStringLabelPress ? colors.primary[500] : isEnabled ? theme.text : theme.textMuted,
                  opacity: isEnabled ? 1 : 0.5,
                  fontWeight: onStringLabelPress ? '600' : '400',
                }}
              >
                {stringNumber}
              </Text>
            </Pressable>

            {/* Open string note display (at end of neck) */}
            {showOpenStringNotes && showNut && (
              <View style={[styles.openNoteCell, { width: openNoteWidth, height: stringSpacing }]}>
                <View 
                  style={[
                    styles.openNoteMarker,
                    { 
                      backgroundColor: isOpenHighlighted 
                        ? colors.primary[500]
                        : isDark ? colors.neutral[700] : colors.neutral[200],
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.noteText,
                      { 
                        color: isOpenHighlighted 
                          ? colors.neutral[900]
                          : theme.textSecondary,
                      }
                    ]}
                  >
                    {openNote}
                  </Text>
                </View>
              </View>
            )}

            {/* Nut area for open strings (fret 0) - pressable but invisible */}
            {showNut && (
              <Pressable
                onPress={() => handlePress(stringIndex, 0)}
                disabled={disabled || !isEnabled}
                style={({ pressed }) => [
                  styles.nutCell,
                  { 
                    width: nutWidth,
                    height: stringSpacing,
                  },
                  pressed && isEnabled && !disabled && styles.fretCellPressed,
                ]}
              >
                {/* String line through nut */}
                <View 
                  style={[
                    styles.stringLine, 
                    { 
                      backgroundColor: colors.music.fretboard.string,
                      height: Math.max(1, 3 - stringIndex * 0.4),
                      opacity: isEnabled ? 1 : 0.3,
                    }
                  ]} 
                />
                {/* Open string highlight marker (only if not showing open notes separately) */}
                {!showOpenStringNotes && isOpenHighlighted && (
                  <View 
                    style={[
                      styles.openStringMarker,
                      { backgroundColor: colors.primary[500] }
                    ]}
                  >
                    {!hideHighlightedNoteName && (
                      <Text style={[styles.noteText, { color: colors.neutral[900] }]}>
                        {openNote}
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>
            )}

            {/* Frets for this string */}
            {fretsToRender.map(fret => {
              const isHighlighted = isPositionHighlighted(stringIndex, fret);
              const note = getNoteAtFret(stringIndex, fret, useFlats);
              
              return (
                <Pressable
                  key={fret}
                  onPress={() => handlePress(stringIndex, fret)}
                  disabled={disabled || !isEnabled}
                  style={({ pressed }) => [
                    styles.fretCell,
                    { 
                      width: fretWidth,
                      height: stringSpacing,
                    },
                    pressed && isEnabled && !disabled && styles.fretCellPressed,
                  ]}
                >
                  {/* String line */}
                  <View 
                    style={[
                      styles.stringLine, 
                      { 
                        backgroundColor: colors.music.fretboard.string,
                        height: Math.max(1, 3 - stringIndex * 0.4), // Thicker for lower strings
                        opacity: isEnabled ? 1 : 0.3,
                      }
                    ]} 
                  />
                  
                  {/* Note marker - only show if highlighted */}
                  {isHighlighted && (
                    <View 
                      style={[
                        styles.noteMarker,
                        { backgroundColor: colors.primary[500] }
                      ]}
                    >
                      {!hideHighlightedNoteName && (
                        <Text 
                          style={[styles.noteText, { color: colors.neutral[900] }]}
                        >
                          {note}
                        </Text>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  fretNumbersRow: {
    flexDirection: 'row',
    marginBottom: spacing[1],
  },
  fretNumberCell: {
    alignItems: 'center',
  },
  fretboard: {
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  nutBar: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#F5F5DC', // Bone/ivory color
    zIndex: 5,
  },
  fretWiresContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 5,
  },
  fretWire: {
    position: 'absolute',
    top: 0,
    width: 2,
    backgroundColor: colors.music.fretboard.fret,
  },
  nutCell: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 11,
  },
  openNoteCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  openNoteMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openStringMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    left: -7,
  },
  fretMarkersRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -4 }],
    zIndex: 0,
  },
  doubleFretMarkersRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    zIndex: 0,
  },
  fretMarkerCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fretMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.music.fretboard.marker,
    opacity: 0.6,
  },
  stringRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stringLabel: {
    alignItems: 'center',
  },
  fretCell: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fretCellPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  stringLine: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  noteMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  noteText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
