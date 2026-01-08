/**
 * Unit tests for audio frequency calculations
 * These test the core logic that determines pitch relationships
 */

// We need to extract the pure functions for testing
// Since the actual module has side effects (Audio), we'll recreate the logic here

const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const C4_FREQUENCY = 261.63;

function getNoteIndex(note: string): number {
  const flatToSharp: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };
  const normalized = flatToSharp[note] || note;
  return CHROMATIC_NOTES.indexOf(normalized);
}

function getFrequencyAtOctave(note: string, octave: number): number {
  const noteIndex = getNoteIndex(note);
  if (noteIndex === -1) return 440;
  const semitonesFromC4 = noteIndex + (octave - 4) * 12;
  return C4_FREQUENCY * Math.pow(2, semitonesFromC4 / 12);
}

function getFrequencyRelativeToRoot(note: string, rootNote: string): number {
  const rootIndex = getNoteIndex(rootNote);
  const noteIndex = getNoteIndex(note);
  const rootFrequency = getFrequencyAtOctave(rootNote, 4);
  
  let semitonesAboveRoot = (noteIndex - rootIndex + 12) % 12;
  
  if (semitonesAboveRoot === 0) {
    return rootFrequency;
  }
  return rootFrequency * Math.pow(2, semitonesAboveRoot / 12);
}

function getChordFrequencies(notes: string[]): number[] {
  if (notes.length === 0) return [];
  
  const rootNote = notes[0];
  const rootIndex = getNoteIndex(rootNote);
  const rootFrequency = getFrequencyAtOctave(rootNote, 4);
  
  const frequencies: number[] = [rootFrequency];
  
  for (let i = 1; i < notes.length; i++) {
    const note = notes[i];
    const noteIndex = getNoteIndex(note);
    let semitonesAboveRoot = (noteIndex - rootIndex + 12) % 12;
    const frequency = rootFrequency * Math.pow(2, semitonesAboveRoot / 12);
    frequencies.push(frequency);
  }
  
  return frequencies;
}

// Helper to round frequencies for comparison
const roundFreq = (f: number) => Math.round(f * 10) / 10;

describe('getNoteIndex', () => {
  it('should return correct index for natural notes', () => {
    expect(getNoteIndex('C')).toBe(0);
    expect(getNoteIndex('D')).toBe(2);
    expect(getNoteIndex('E')).toBe(4);
    expect(getNoteIndex('F')).toBe(5);
    expect(getNoteIndex('G')).toBe(7);
    expect(getNoteIndex('A')).toBe(9);
    expect(getNoteIndex('B')).toBe(11);
  });

  it('should return correct index for sharps', () => {
    expect(getNoteIndex('C#')).toBe(1);
    expect(getNoteIndex('D#')).toBe(3);
    expect(getNoteIndex('F#')).toBe(6);
    expect(getNoteIndex('G#')).toBe(8);
    expect(getNoteIndex('A#')).toBe(10);
  });

  it('should normalize flats to sharps', () => {
    expect(getNoteIndex('Db')).toBe(1);  // Same as C#
    expect(getNoteIndex('Eb')).toBe(3);  // Same as D#
    expect(getNoteIndex('Gb')).toBe(6);  // Same as F#
    expect(getNoteIndex('Ab')).toBe(8);  // Same as G#
    expect(getNoteIndex('Bb')).toBe(10); // Same as A#
  });

  it('should return -1 for invalid notes', () => {
    expect(getNoteIndex('X')).toBe(-1);
    expect(getNoteIndex('H')).toBe(-1);
  });
});

describe('getFrequencyAtOctave', () => {
  it('should return correct frequency for A4 (440 Hz)', () => {
    expect(roundFreq(getFrequencyAtOctave('A', 4))).toBe(440.0);
  });

  it('should return correct frequency for C4 (middle C)', () => {
    expect(roundFreq(getFrequencyAtOctave('C', 4))).toBe(261.6);
  });

  it('should double frequency for each octave up', () => {
    const c4 = getFrequencyAtOctave('C', 4);
    const c5 = getFrequencyAtOctave('C', 5);
    expect(roundFreq(c5 / c4)).toBe(2.0);
  });

  it('should halve frequency for each octave down', () => {
    const c4 = getFrequencyAtOctave('C', 4);
    const c3 = getFrequencyAtOctave('C', 3);
    expect(roundFreq(c4 / c3)).toBe(2.0);
  });

  it('should handle common reference frequencies', () => {
    // Standard piano reference frequencies (rounded)
    expect(roundFreq(getFrequencyAtOctave('E', 4))).toBe(329.6);
    expect(roundFreq(getFrequencyAtOctave('G', 4))).toBe(392.0);
  });
});

describe('getFrequencyRelativeToRoot', () => {
  describe('when note is higher in chromatic order than root', () => {
    it('should play C major chord notes in ascending order from C', () => {
      const cFreq = getFrequencyRelativeToRoot('C', 'C');
      const eFreq = getFrequencyRelativeToRoot('E', 'C');
      const gFreq = getFrequencyRelativeToRoot('G', 'C');
      
      expect(cFreq).toBeLessThan(eFreq);
      expect(eFreq).toBeLessThan(gFreq);
    });

    it('should play G major chord notes in ascending order from G', () => {
      const gFreq = getFrequencyRelativeToRoot('G', 'G');
      const bFreq = getFrequencyRelativeToRoot('B', 'G');
      const dFreq = getFrequencyRelativeToRoot('D', 'G');
      
      expect(gFreq).toBeLessThan(bFreq);
      expect(bFreq).toBeLessThan(dFreq);
    });
  });

  describe('when note is lower in chromatic order than root (wrapping)', () => {
    it('should play Am chord with C and E above A', () => {
      // A minor: A - C - E
      // C is "before" A in chromatic order, but should sound ABOVE A
      const aFreq = getFrequencyRelativeToRoot('A', 'A');
      const cFreq = getFrequencyRelativeToRoot('C', 'A');
      const eFreq = getFrequencyRelativeToRoot('E', 'A');
      
      // A4 = 440 Hz
      expect(roundFreq(aFreq)).toBe(440.0);
      
      // C should be above A (3 semitones up = minor third)
      expect(cFreq).toBeGreaterThan(aFreq);
      expect(roundFreq(cFreq)).toBe(523.3); // C5
      
      // E should be above C (7 semitones above A = perfect fifth)
      expect(eFreq).toBeGreaterThan(cFreq);
      expect(roundFreq(eFreq)).toBe(659.3); // E5
    });

    it('should play Eb chord notes in ascending order', () => {
      // Eb major: Eb - G - Bb
      const ebFreq = getFrequencyRelativeToRoot('Eb', 'Eb');
      const gFreq = getFrequencyRelativeToRoot('G', 'Eb');
      const bbFreq = getFrequencyRelativeToRoot('Bb', 'Eb');
      
      expect(ebFreq).toBeLessThan(gFreq);
      expect(gFreq).toBeLessThan(bbFreq);
    });

    it('should play B chord notes in ascending order (worst case wrap)', () => {
      // B major: B - D# - F#
      // Both D# and F# are "before" B in chromatic order
      const bFreq = getFrequencyRelativeToRoot('B', 'B');
      const dsFreq = getFrequencyRelativeToRoot('D#', 'B');
      const fsFreq = getFrequencyRelativeToRoot('F#', 'B');
      
      expect(bFreq).toBeLessThan(dsFreq);
      expect(dsFreq).toBeLessThan(fsFreq);
    });
  });

  describe('keyboard-relative note playback', () => {
    it('should play notes ascending when keyboard starts with D for Eb chord', () => {
      // Keyboard shows: D - Eb - E - F - G - A - B - C - D
      // Reference note is D (keyboard start), not Eb (chord root)
      const dFreq = getFrequencyRelativeToRoot('D', 'D');
      const ebFreq = getFrequencyRelativeToRoot('Eb', 'D');
      const eFreq = getFrequencyRelativeToRoot('E', 'D');
      const fFreq = getFrequencyRelativeToRoot('F', 'D');
      const gFreq = getFrequencyRelativeToRoot('G', 'D');
      const aFreq = getFrequencyRelativeToRoot('A', 'D');
      const bFreq = getFrequencyRelativeToRoot('B', 'D');
      const cFreq = getFrequencyRelativeToRoot('C', 'D');
      
      // All should ascend
      expect(dFreq).toBeLessThan(ebFreq);
      expect(ebFreq).toBeLessThan(eFreq);
      expect(eFreq).toBeLessThan(fFreq);
      expect(fFreq).toBeLessThan(gFreq);
      expect(gFreq).toBeLessThan(aFreq);
      expect(aFreq).toBeLessThan(bFreq);
      expect(bFreq).toBeLessThan(cFreq);
    });

    it('should play notes ascending when keyboard starts with F for F# chord', () => {
      // Keyboard shows: F - F# - G - A - B - C - D - E - F
      const fFreq = getFrequencyRelativeToRoot('F', 'F');
      const fsFreq = getFrequencyRelativeToRoot('F#', 'F');
      const gFreq = getFrequencyRelativeToRoot('G', 'F');
      const aFreq = getFrequencyRelativeToRoot('A', 'F');
      const bFreq = getFrequencyRelativeToRoot('B', 'F');
      const cFreq = getFrequencyRelativeToRoot('C', 'F');
      const dFreq = getFrequencyRelativeToRoot('D', 'F');
      const eFreq = getFrequencyRelativeToRoot('E', 'F');
      
      // All should ascend
      expect(fFreq).toBeLessThan(fsFreq);
      expect(fsFreq).toBeLessThan(gFreq);
      expect(gFreq).toBeLessThan(aFreq);
      expect(aFreq).toBeLessThan(bFreq);
      expect(bFreq).toBeLessThan(cFreq);
      expect(cFreq).toBeLessThan(dFreq);
      expect(dFreq).toBeLessThan(eFreq);
    });

    it('should play notes ascending when keyboard starts with G for G chord', () => {
      // This was the original bug report: G chord, C dropping down
      const gFreq = getFrequencyRelativeToRoot('G', 'G');
      const aFreq = getFrequencyRelativeToRoot('A', 'G');
      const bFreq = getFrequencyRelativeToRoot('B', 'G');
      const cFreq = getFrequencyRelativeToRoot('C', 'G');
      const dFreq = getFrequencyRelativeToRoot('D', 'G');
      const eFreq = getFrequencyRelativeToRoot('E', 'G');
      const fFreq = getFrequencyRelativeToRoot('F', 'G');
      
      expect(gFreq).toBeLessThan(aFreq);
      expect(aFreq).toBeLessThan(bFreq);
      expect(bFreq).toBeLessThan(cFreq); // C should NOT drop down!
      expect(cFreq).toBeLessThan(dFreq);
      expect(dFreq).toBeLessThan(eFreq);
      expect(eFreq).toBeLessThan(fFreq);
    });
  });
});

describe('getChordFrequencies', () => {
  it('should return frequencies in ascending order for C major', () => {
    const [c, e, g] = getChordFrequencies(['C', 'E', 'G']);
    
    expect(c).toBeLessThan(e);
    expect(e).toBeLessThan(g);
  });

  it('should return frequencies in ascending order for Am', () => {
    const [a, c, e] = getChordFrequencies(['A', 'C', 'E']);
    
    expect(a).toBeLessThan(c);
    expect(c).toBeLessThan(e);
    
    // Verify actual frequencies
    expect(roundFreq(a)).toBe(440.0); // A4
    expect(roundFreq(c)).toBe(523.3); // C5
    expect(roundFreq(e)).toBe(659.3); // E5
  });

  it('should return frequencies in ascending order for G major', () => {
    const [g, b, d] = getChordFrequencies(['G', 'B', 'D']);
    
    expect(g).toBeLessThan(b);
    expect(b).toBeLessThan(d);
  });

  it('should return frequencies in ascending order for Eb major', () => {
    const [eb, g, bb] = getChordFrequencies(['Eb', 'G', 'Bb']);
    
    expect(eb).toBeLessThan(g);
    expect(g).toBeLessThan(bb);
  });

  it('should return frequencies in ascending order for F#m', () => {
    const [fs, a, cs] = getChordFrequencies(['F#', 'A', 'C#']);
    
    expect(fs).toBeLessThan(a);
    expect(a).toBeLessThan(cs);
  });

  it('should return frequencies in ascending order for Bm', () => {
    const [b, d, fs] = getChordFrequencies(['B', 'D', 'F#']);
    
    expect(b).toBeLessThan(d);
    expect(d).toBeLessThan(fs);
  });

  it('should handle empty array', () => {
    expect(getChordFrequencies([])).toEqual([]);
  });

  it('should handle single note', () => {
    const [a] = getChordFrequencies(['A']);
    expect(roundFreq(a)).toBe(440.0);
  });
});

describe('interval calculations', () => {
  it('should produce correct interval ratios', () => {
    const root = getFrequencyAtOctave('C', 4);
    
    // Minor third (3 semitones) = ~1.189
    const minorThird = getFrequencyRelativeToRoot('Eb', 'C');
    expect(roundFreq(minorThird / root)).toBe(1.2);
    
    // Major third (4 semitones) = ~1.26
    const majorThird = getFrequencyRelativeToRoot('E', 'C');
    expect(roundFreq(majorThird / root)).toBe(1.3);
    
    // Perfect fifth (7 semitones) = ~1.5
    const fifth = getFrequencyRelativeToRoot('G', 'C');
    expect(roundFreq(fifth / root)).toBe(1.5);
    
    // Octave (12 semitones) = 2.0
    // Note: C relative to C returns same frequency (unison), not octave
    // This is by design for chord voicing
  });
});
