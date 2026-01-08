/**
 * Chord generation and manipulation utilities
 */

import { COMMON_CHORDS, ENHARMONIC_MAP, MAJOR_INTERVALS, MINOR_INTERVALS, NOTES, NOTES_WITH_FLATS, NATURAL_NOTES } from './constants';
import { getNoteIndex, getNoteFromIndex, getNoteLetterAtInterval, areEnharmonic } from './notes';
import type { Chord, ChordGameSettings } from './types';

/**
 * Parses a chord name into its components
 * @example parseChordName('Am') => { root: 'A', isMinor: true }
 * @example parseChordName('F#m') => { root: 'F#', isMinor: true }
 */
export function parseChordName(chordName: string): { root: string; isMinor: boolean } {
  const isMinor = chordName.includes('m');
  const root = chordName.replace('m', '');
  return { root, isMinor };
}

/**
 * Builds chord notes from a root note and quality
 * Uses proper note spelling (e.g., C major = C, E, G not C, E, G)
 */
export function buildChordNotes(root: string, isMinor: boolean): string[] {
  const intervals = isMinor ? MINOR_INTERVALS : MAJOR_INTERVALS;
  const useFlats = root.includes('b');
  const noteCollection = useFlats ? NOTES_WITH_FLATS : NOTES;
  
  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return [];
  
  const rootLetter = root.charAt(0);
  const rootLetterIndex = NATURAL_NOTES.indexOf(rootLetter as typeof NATURAL_NOTES[number]);
  
  const chordNotes: string[] = [];
  
  // Root note
  chordNotes.push(root);
  
  // Third (2 letter steps from root)
  const thirdLetter = getNoteLetterAtInterval(root, 2);
  const thirdIndex = (rootIndex + intervals[1]) % 12;
  const thirdNote = findNoteWithLetter(thirdLetter, thirdIndex, noteCollection);
  chordNotes.push(thirdNote);
  
  // Fifth (4 letter steps from root)
  const fifthLetter = getNoteLetterAtInterval(root, 4);
  const fifthIndex = (rootIndex + intervals[2]) % 12;
  const fifthNote = findNoteWithLetter(fifthLetter, fifthIndex, noteCollection);
  chordNotes.push(fifthNote);
  
  return chordNotes;
}

/**
 * Finds a note with a specific letter at a chromatic index
 * Used for proper chord spelling
 */
function findNoteWithLetter(targetLetter: string, chromaticIndex: number, noteCollection: readonly string[]): string {
  // First check if the note at the index starts with our target letter
  const directNote = noteCollection[chromaticIndex];
  if (directNote.charAt(0) === targetLetter) {
    return directNote;
  }
  
  // Check enharmonic equivalents
  const enharmonics = ENHARMONIC_MAP[NOTES[chromaticIndex]] || [NOTES[chromaticIndex]];
  const match = enharmonics.find(note => note.charAt(0) === targetLetter);
  
  return match || directNote;
}

/**
 * Generates a random chord based on game settings
 * Avoids repeating the previous chord
 */
export function generateRandomChord(settings: ChordGameSettings, currentChord: Chord | null = null): Chord {
  let availableChords = [...COMMON_CHORDS];
  
  // Filter based on settings
  if (!settings.includeMinorChords) {
    availableChords = availableChords.filter(chord => !chord.includes('m'));
  }
  
  if (!settings.includeSharpsFlatRoots) {
    availableChords = availableChords.filter(chord => !chord.includes('#') && !chord.includes('b'));
  }
  
  // Avoid repeating the current chord
  if (currentChord) {
    availableChords = availableChords.filter(chord => chord !== currentChord.name);
  }
  
  // Fallback if no chords available
  if (availableChords.length === 0) {
    availableChords = ['C', 'G', 'Am', 'F'];
  }
  
  // Select random chord
  const randomChordName = availableChords[Math.floor(Math.random() * availableChords.length)];
  const { root, isMinor } = parseChordName(randomChordName);
  const notes = buildChordNotes(root, isMinor);
  
  return {
    name: randomChordName,
    notes,
    root,
    isMinor,
  };
}

/**
 * Checks if a single note is part of a chord (considering enharmonics)
 */
export function isNoteInChord(note: string, chord: Chord): boolean {
  if (!note) return false;
  return chord.notes.some(chordNote => areEnharmonic(note, chordNote));
}

/**
 * Checks if user's notes match the chord notes (order-independent, enharmonic-aware)
 * @returns true if all 3 notes match the chord
 */
export function checkChordAnswer(userNotes: string[], chord: Chord): boolean {
  // Filter out empty notes
  const filledNotes = userNotes.filter(n => n !== '');
  
  // Must have exactly 3 notes
  if (filledNotes.length !== 3) return false;
  
  // Every user note must be in the chord
  const allNotesInChord = filledNotes.every(note => isNoteInChord(note, chord));
  
  // Every chord note must be represented by a user note
  const allChordNotesCovered = chord.notes.every(chordNote => 
    filledNotes.some(userNote => areEnharmonic(userNote, chordNote))
  );
  
  return allNotesInChord && allChordNotesCovered;
}

/**
 * Gets the chord name from notes (basic triad recognition)
 * @returns chord name or null if not recognized
 */
export function identifyChord(notes: string[]): string | null {
  if (notes.length !== 3) return null;
  
  // Try each note as potential root
  for (const potentialRoot of notes) {
    const rootIndex = getNoteIndex(potentialRoot);
    if (rootIndex === -1) continue;
    
    // Get intervals from root to other notes
    const otherNotes = notes.filter(n => n !== potentialRoot);
    const intervals = otherNotes
      .map(note => {
        const noteIndex = getNoteIndex(note);
        return ((noteIndex - rootIndex) % 12 + 12) % 12;
      })
      .sort((a, b) => a - b);
    
    // Check for major triad (0, 4, 7)
    if (intervals.includes(4) && intervals.includes(7)) {
      return potentialRoot;
    }
    
    // Check for minor triad (0, 3, 7)
    if (intervals.includes(3) && intervals.includes(7)) {
      return potentialRoot + 'm';
    }
  }
  
  return null;
}
