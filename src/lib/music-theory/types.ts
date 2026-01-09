/**
 * Music Theory Types
 */

export interface Chord {
  name: string;
  notes: string[];
  root: string;
  isMinor: boolean;
}

export interface ChordGameSettings {
  includeDiatonicRoots: boolean;  // Natural notes (C, D, E, F, G, A, B)
  includeAccidentalRoots: boolean; // Sharps & flats
  includeMajorChords: boolean;
  includeMinorChords: boolean;
}

export type FretboardGameMode = 'identify' | 'find' | 'listen';

export interface FretboardGameSettings {
  gameMode: FretboardGameMode;     // 'identify' = name the note at position, 'find' = tap the position for note, 'listen' = play on guitar
  includeNaturalNotes: boolean;    // C, D, E, F, G, A, B
  includeAccidentals: boolean;     // Sharps & flats
  strings: boolean[];              // Which strings to include [E, A, D, G, B, E] (low to high)
  minFret: number;                 // Minimum fret (0 = open)
  maxFret: number;                 // Maximum fret
  useFlats: boolean;               // Display preference: flats vs sharps
  showOpenStringNotes?: boolean;   // Show note labels on open strings
  autoAdvanceOnCorrect?: boolean;  // Automatically move to next note when correct (listen mode)
  listenSensitivity?: 'low' | 'medium' | 'high';  // Microphone sensitivity for listen mode
}

export type NoteName = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type NaturalNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface FretPosition {
  string: number; // 0-5 (low E to high E)
  fret: number;   // 0-12+
  note: string;
}

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented';

// Game mode types
export type GameMode = 'practice' | 'test';
export type InputMode = 'piano' | 'flashcard';

// Test state tracking
export interface TestChordResult {
  chord: Chord;
  wasCorrect: boolean;
  attempts: number;
}

export interface TestState {
  mode: 'in-progress' | 'reviewing-missed' | 'completed';
  allChords: Chord[];
  currentIndex: number;
  results: TestChordResult[];
  missedChords: Chord[]; // Chords to review after initial test
  reviewIndex: number;   // Current position in missed chords review
}
