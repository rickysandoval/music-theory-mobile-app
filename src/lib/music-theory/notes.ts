/**
 * Note manipulation utilities
 * Pure functions for working with musical notes
 */

import { ENHARMONIC_MAP, NOTES, NOTES_WITH_FLATS, STANDARD_TUNING, NATURAL_NOTES, WHITE_KEY_BEFORE_BLACK } from './constants';

/**
 * Normalizes a note name to uppercase with proper accidentals
 * @example normalizeNote('c#') => 'C#'
 * @example normalizeNote('DB') => 'Db'
 */
export function normalizeNote(note: string): string {
  if (!note || note.length === 0) return '';
  
  const letter = note.charAt(0).toUpperCase();
  const accidental = note.length > 1 ? note.substring(1).toLowerCase() : '';
  
  // Normalize sharp and flat symbols
  const normalizedAccidental = accidental
    .replace('♯', '#')
    .replace('♭', 'b');
  
  return letter + normalizedAccidental;
}

/**
 * Validates if a string is a valid note name
 */
export function isValidNote(note: string): boolean {
  if (!note) return false;
  const normalized = normalizeNote(note);
  const validPattern = /^[A-G][#b]?$/;
  return validPattern.test(normalized);
}

/**
 * Gets the chromatic index (0-11) for a note
 * Returns -1 if note is invalid
 */
export function getNoteIndex(note: string): number {
  const normalized = normalizeNote(note);
  
  // Check sharps first
  const sharpIndex = NOTES.indexOf(normalized as typeof NOTES[number]);
  if (sharpIndex !== -1) return sharpIndex;
  
  // Check flats
  const flatIndex = NOTES_WITH_FLATS.indexOf(normalized as typeof NOTES_WITH_FLATS[number]);
  if (flatIndex !== -1) return flatIndex;
  
  // Check enharmonic equivalents
  for (const [key, equivalents] of Object.entries(ENHARMONIC_MAP)) {
    if (equivalents.map(n => n.toUpperCase()).includes(normalized.toUpperCase())) {
      return NOTES.indexOf(key as typeof NOTES[number]);
    }
  }
  
  return -1;
}

/**
 * Gets a note name from a chromatic index (0-11)
 * @param preferFlats - if true, returns flat names (Db) instead of sharps (C#)
 */
export function getNoteFromIndex(index: number, preferFlats: boolean = false): string {
  const normalizedIndex = ((index % 12) + 12) % 12; // Handle negative indices
  return preferFlats ? NOTES_WITH_FLATS[normalizedIndex] : NOTES[normalizedIndex];
}

/**
 * Checks if two notes are enharmonically equivalent
 * @example areEnharmonic('C#', 'Db') => true
 * @example areEnharmonic('C', 'D') => false
 */
export function areEnharmonic(note1: string, note2: string): boolean {
  return getNoteIndex(note1) === getNoteIndex(note2);
}

/**
 * Gets all enharmonic equivalents for a note
 * @example getEnharmonics('C#') => ['C#', 'Db']
 */
export function getEnharmonics(note: string): string[] {
  const index = getNoteIndex(note);
  if (index === -1) return [];
  
  const baseNote = NOTES[index];
  return ENHARMONIC_MAP[baseNote] || [baseNote];
}

/**
 * Transposes a note by a number of semitones
 * @example transpose('C', 4) => 'E' (major third up)
 * @example transpose('G', -2) => 'F' (whole step down)
 */
export function transpose(note: string, semitones: number, preferFlats: boolean = false): string {
  const index = getNoteIndex(note);
  if (index === -1) return note;
  
  const newIndex = ((index + semitones) % 12 + 12) % 12;
  return getNoteFromIndex(newIndex, preferFlats);
}

/**
 * Gets the interval (in semitones) between two notes
 * Always returns a positive value (0-11)
 */
export function getInterval(note1: string, note2: string): number {
  const index1 = getNoteIndex(note1);
  const index2 = getNoteIndex(note2);
  
  if (index1 === -1 || index2 === -1) return -1;
  
  return ((index2 - index1) % 12 + 12) % 12;
}

/**
 * Gets the note at a specific fret on a specific string (standard tuning)
 * @param stringNumber - 0-5 (low E to high E)
 * @param fret - 0-24
 */
export function getNoteAtFret(stringNumber: number, fret: number, preferFlats: boolean = false): string {
  if (stringNumber < 0 || stringNumber > 5) return '';
  if (fret < 0) return '';
  
  const openNote = STANDARD_TUNING[stringNumber];
  return transpose(openNote, fret, preferFlats);
}

/**
 * Finds all positions of a note on the fretboard (standard tuning)
 * @param note - The note to find
 * @param maxFret - Maximum fret to search (default 12)
 */
export function findNoteOnFretboard(note: string, maxFret: number = 12): Array<{ string: number; fret: number }> {
  const positions: Array<{ string: number; fret: number }> = [];
  const targetIndex = getNoteIndex(note);
  
  if (targetIndex === -1) return positions;
  
  for (let string = 0; string < 6; string++) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const fretNote = getNoteAtFret(string, fret);
      if (getNoteIndex(fretNote) === targetIndex) {
        positions.push({ string, fret });
      }
    }
  }
  
  return positions;
}

/**
 * Checks if a note is a natural note (no sharps or flats)
 */
export function isNaturalNote(note: string): boolean {
  const normalized = normalizeNote(note);
  return NATURAL_NOTES.includes(normalized as typeof NATURAL_NOTES[number]);
}

/**
 * Gets the next natural note letter
 * @example getNextNoteLetter('C') => 'D'
 * @example getNextNoteLetter('G') => 'A'
 */
export function getNextNoteLetter(note: string): string {
  const letter = note.charAt(0).toUpperCase();
  const index = NATURAL_NOTES.indexOf(letter as typeof NATURAL_NOTES[number]);
  if (index === -1) return '';
  return NATURAL_NOTES[(index + 1) % 7];
}

/**
 * Gets the note letter that is N steps away in the natural note sequence
 * @example getNoteLetterAtInterval('C', 2) => 'E' (third)
 * @example getNoteLetterAtInterval('C', 4) => 'G' (fifth)
 */
export function getNoteLetterAtInterval(root: string, letterSteps: number): string {
  const letter = root.charAt(0).toUpperCase();
  const index = NATURAL_NOTES.indexOf(letter as typeof NATURAL_NOTES[number]);
  if (index === -1) return '';
  return NATURAL_NOTES[(index + letterSteps) % 7];
}

/**
 * Gets the starting white key for a piano keyboard display based on a root note.
 * If root is a natural note, returns it. If root is sharp/flat, returns the white key before it.
 * @example getKeyboardStartKey('C') => 'C'
 * @example getKeyboardStartKey('Eb') => 'D'
 * @example getKeyboardStartKey('F#') => 'F'
 */
export function getKeyboardStartKey(rootNote: string): string {
  if (!rootNote) return 'C';
  
  const rootLetter = rootNote.charAt(0).toUpperCase();
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
}
