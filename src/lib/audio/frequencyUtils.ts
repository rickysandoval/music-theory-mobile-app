/**
 * Pure utility functions for frequency/note conversion
 * 
 * These are extracted from pitchDetection.ts to be easily testable
 * without React Native dependencies.
 */

// Note frequencies (A4 = 440Hz)
const A4_FREQ = 440;
const A4_MIDI = 69;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export interface FrequencyToNoteResult {
  note: string;
  octave: number;
  cents: number;
}

/**
 * Convert frequency to note name
 * 
 * Uses A4 = 440 Hz as the reference pitch.
 * 
 * @param frequency - The frequency in Hz
 * @param useFlats - If true, use flat names (Bb) instead of sharps (A#)
 * @returns The note name, octave, and cents deviation from perfect pitch
 */
export function frequencyToNote(frequency: number, useFlats = false): FrequencyToNoteResult {
  // Convert frequency to MIDI note number
  // MIDI note 69 = A4 = 440 Hz
  const midi = 12 * Math.log2(frequency / A4_FREQ) + A4_MIDI;
  const roundedMidi = Math.round(midi);
  const cents = Math.round((midi - roundedMidi) * 100);
  
  // Get note index within octave (0-11)
  const noteIndex = ((roundedMidi % 12) + 12) % 12;
  
  // Calculate octave (MIDI note 60 = C4, so octave = floor(midi/12) - 1)
  const octave = Math.floor(roundedMidi / 12) - 1;
  
  const noteNames = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES;
  const note = noteNames[noteIndex];
  
  return { note, octave, cents };
}

/**
 * Convert note name and octave to frequency
 * 
 * @param note - The note name (e.g., 'A', 'C#', 'Bb')
 * @param octave - The octave number (e.g., 4 for A4)
 * @returns The frequency in Hz
 */
export function noteToFrequency(note: string, octave: number): number {
  // Normalize flats to sharps for lookup
  const flatToSharp: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };
  
  const normalizedNote = flatToSharp[note] || note;
  const noteIndex = NOTE_NAMES.indexOf(normalizedNote);
  
  if (noteIndex === -1) {
    throw new Error(`Invalid note: ${note}`);
  }
  
  // Calculate MIDI note number
  const midi = (octave + 1) * 12 + noteIndex;
  
  // Convert MIDI to frequency
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}
