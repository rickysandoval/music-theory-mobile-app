/**
 * Music Theory Constants
 * Core definitions for notes, chords, and musical relationships
 */

// Chromatic scale with sharps
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Chromatic scale with flats
export const NOTES_WITH_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

// Natural notes (white keys)
export const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;

// Enharmonic mapping (maps each note to all its equivalent spellings)
export const ENHARMONIC_MAP: Record<string, string[]> = {
  'C': ['C', 'B#'],
  'C#': ['C#', 'Db'],
  'D': ['D'],
  'D#': ['D#', 'Eb'],
  'E': ['E', 'Fb'],
  'F': ['F', 'E#'],
  'F#': ['F#', 'Gb'],
  'G': ['G'],
  'G#': ['G#', 'Ab'],
  'A': ['A'],
  'A#': ['A#', 'Bb'],
  'B': ['B', 'Cb'],
};

// Common musical keys and their diatonic chords (I, ii, iii, IV, V, vi)
export const COMMON_KEYS = [
  { key: 'C', chords: ['C', 'Dm', 'Em', 'F', 'G', 'Am'] },
  { key: 'G', chords: ['G', 'Am', 'Bm', 'C', 'D', 'Em'] },
  { key: 'D', chords: ['D', 'Em', 'F#m', 'G', 'A', 'Bm'] },
  { key: 'A', chords: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m'] },
  { key: 'E', chords: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m'] },
  { key: 'F', chords: ['F', 'Gm', 'Am', 'Bb', 'C', 'Dm'] },
  { key: 'Bb', chords: ['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm'] },
  { key: 'Eb', chords: ['Eb', 'Fm', 'Gm', 'Ab', 'Bb', 'Cm'] },
] as const;

// Flatten all common chords into a unique list
export const COMMON_CHORDS = COMMON_KEYS.reduce((allChords, nextKey) => {
  return [
    ...allChords,
    ...nextKey.chords.filter(chord => !allChords.includes(chord)),
  ];
}, [] as string[]);

// Chord intervals (semitones from root)
export const MAJOR_INTERVALS = [0, 4, 7] as const; // Root, Major Third, Perfect Fifth
export const MINOR_INTERVALS = [0, 3, 7] as const; // Root, Minor Third, Perfect Fifth
export const DIMINISHED_INTERVALS = [0, 3, 6] as const; // Root, Minor Third, Diminished Fifth
export const AUGMENTED_INTERVALS = [0, 4, 8] as const; // Root, Major Third, Augmented Fifth

// Interval names for reference
export const INTERVAL_NAMES = {
  0: 'Unison',
  1: 'Minor 2nd',
  2: 'Major 2nd',
  3: 'Minor 3rd',
  4: 'Major 3rd',
  5: 'Perfect 4th',
  6: 'Tritone',
  7: 'Perfect 5th',
  8: 'Minor 6th',
  9: 'Major 6th',
  10: 'Minor 7th',
  11: 'Major 7th',
  12: 'Octave',
} as const;

// Piano keyboard helpers
// White keys that come before each black key
export const WHITE_KEY_BEFORE_BLACK: Record<string, string> = {
  'C#': 'C',
  'Db': 'C',
  'D#': 'D',
  'Eb': 'D',
  'F#': 'F',
  'Gb': 'F',
  'G#': 'G',
  'Ab': 'G',
  'A#': 'A',
  'Bb': 'A',
};

// Map of white keys with their subsequent black keys
export const BLACK_KEYS_MAP: Record<string, string | null> = {
  'C': 'C#',
  'D': 'D#',
  'E': null,
  'F': 'F#',
  'G': 'G#',
  'A': 'A#',
  'B': null,
};

// Guitar tuning (standard tuning, from low to high string)
export const STANDARD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'] as const;

// Number of frets to consider (0-12 covers one octave)
export const FRET_COUNT = 12;
