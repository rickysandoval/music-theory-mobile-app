/**
 * Music Theory Library
 * Export all utilities from a single entry point
 */

// Constants
export * from './constants';

// Types
export * from './types';

// Note utilities
export {
  normalizeNote,
  isValidNote,
  getNoteIndex,
  getNoteFromIndex,
  areEnharmonic,
  getEnharmonics,
  transpose,
  getInterval,
  getNoteAtFret,
  findNoteOnFretboard,
  isNaturalNote,
  getNextNoteLetter,
  getNoteLetterAtInterval,
  getKeyboardStartKey,
  getEnharmonicForLetter,
  getCorrectSpellingForChordPosition,
} from './notes';

// Chord utilities
export {
  parseChordName,
  buildChordNotes,
  generateRandomChord,
  isNoteInChord,
  isNoteCorrectAtPosition,
  checkChordAnswer,
  identifyChord,
} from './chords';
