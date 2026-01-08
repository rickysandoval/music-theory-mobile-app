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
  includeSharpsFlatRoots: boolean;
  includeMinorChords: boolean;
}

export type NoteName = 'C' | 'C#' | 'Db' | 'D' | 'D#' | 'Eb' | 'E' | 'F' | 'F#' | 'Gb' | 'G' | 'G#' | 'Ab' | 'A' | 'A#' | 'Bb' | 'B';

export type NaturalNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export interface FretPosition {
  string: number; // 0-5 (low E to high E)
  fret: number;   // 0-12+
  note: string;
}

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented';
