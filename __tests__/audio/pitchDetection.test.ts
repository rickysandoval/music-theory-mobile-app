/**
 * Unit tests for frequency/note conversion utilities
 * 
 * Tests the frequencyToNote function which converts audio frequencies
 * to musical note names.
 */

import { frequencyToNote } from '../../src/lib/audio/frequencyUtils';

// Standard reference frequencies (A4 = 440 Hz tuning)
const REFERENCE_FREQUENCIES = {
  // Octave 2 (low guitar range)
  E2: 82.41,
  A2: 110.0,
  
  // Octave 3
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  
  // Octave 4 (middle range)
  C4: 261.63,  // Middle C
  'C#4': 277.18,
  D4: 293.66,
  'D#4': 311.13,
  E4: 329.63,
  F4: 349.23,
  'F#4': 369.99,
  G4: 392.0,
  'G#4': 415.30,
  A4: 440.0,   // Concert A
  'A#4': 466.16,
  B4: 493.88,
  
  // Octave 5 (high guitar range)
  C5: 523.25,
  E5: 659.25,
};

describe('frequencyToNote', () => {
  describe('Standard Reference Frequencies', () => {
    it('should correctly identify A4 (440 Hz) - concert pitch', () => {
      const result = frequencyToNote(440);
      
      expect(result.note).toBe('A');
      expect(result.octave).toBe(4);
      expect(result.cents).toBe(0); // Exactly in tune
    });

    it('should correctly identify C4 (261.63 Hz) - middle C', () => {
      const result = frequencyToNote(261.63);
      
      expect(result.note).toBe('C');
      expect(result.octave).toBe(4);
      expect(Math.abs(result.cents)).toBeLessThan(5); // Within 5 cents tolerance
    });

    it('should correctly identify E4 (329.63 Hz)', () => {
      const result = frequencyToNote(329.63);
      
      expect(result.note).toBe('E');
      expect(result.octave).toBe(4);
    });

    it('should correctly identify G4 (392 Hz)', () => {
      const result = frequencyToNote(392);
      
      expect(result.note).toBe('G');
      expect(result.octave).toBe(4);
    });
  });

  describe('Guitar String Frequencies (Standard Tuning)', () => {
    it('should identify low E string (E2 ~82 Hz)', () => {
      const result = frequencyToNote(82.41);
      
      expect(result.note).toBe('E');
      expect(result.octave).toBe(2);
    });

    it('should identify A string (A2 ~110 Hz)', () => {
      const result = frequencyToNote(110);
      
      expect(result.note).toBe('A');
      expect(result.octave).toBe(2);
    });

    it('should identify D string (D3 ~147 Hz)', () => {
      const result = frequencyToNote(146.83);
      
      expect(result.note).toBe('D');
      expect(result.octave).toBe(3);
    });

    it('should identify G string (G3 ~196 Hz)', () => {
      const result = frequencyToNote(196);
      
      expect(result.note).toBe('G');
      expect(result.octave).toBe(3);
    });

    it('should identify B string (B3 ~247 Hz)', () => {
      const result = frequencyToNote(246.94);
      
      expect(result.note).toBe('B');
      expect(result.octave).toBe(3);
    });

    it('should identify high E string (E4 ~330 Hz)', () => {
      const result = frequencyToNote(329.63);
      
      expect(result.note).toBe('E');
      expect(result.octave).toBe(4);
    });
  });

  describe('Sharp Notes (useFlats = false)', () => {
    it('should identify C# at ~277 Hz', () => {
      const result = frequencyToNote(277.18, false);
      
      expect(result.note).toBe('C#');
      expect(result.octave).toBe(4);
    });

    it('should identify F# at ~370 Hz', () => {
      const result = frequencyToNote(369.99, false);
      
      expect(result.note).toBe('F#');
      expect(result.octave).toBe(4);
    });

    it('should identify G# at ~415 Hz', () => {
      const result = frequencyToNote(415.30, false);
      
      expect(result.note).toBe('G#');
      expect(result.octave).toBe(4);
    });

    it('should identify A# at ~466 Hz', () => {
      const result = frequencyToNote(466.16, false);
      
      expect(result.note).toBe('A#');
      expect(result.octave).toBe(4);
    });

    it('should identify D# at ~311 Hz', () => {
      const result = frequencyToNote(311.13, false);
      
      expect(result.note).toBe('D#');
      expect(result.octave).toBe(4);
    });
  });

  describe('Flat Notes (useFlats = true)', () => {
    it('should identify Db (same as C#) at ~277 Hz', () => {
      const result = frequencyToNote(277.18, true);
      
      expect(result.note).toBe('Db');
      expect(result.octave).toBe(4);
    });

    it('should identify Gb (same as F#) at ~370 Hz', () => {
      const result = frequencyToNote(369.99, true);
      
      expect(result.note).toBe('Gb');
      expect(result.octave).toBe(4);
    });

    it('should identify Ab (same as G#) at ~415 Hz', () => {
      const result = frequencyToNote(415.30, true);
      
      expect(result.note).toBe('Ab');
      expect(result.octave).toBe(4);
    });

    it('should identify Bb (same as A#) at ~466 Hz', () => {
      const result = frequencyToNote(466.16, true);
      
      expect(result.note).toBe('Bb');
      expect(result.octave).toBe(4);
    });

    it('should identify Eb (same as D#) at ~311 Hz', () => {
      const result = frequencyToNote(311.13, true);
      
      expect(result.note).toBe('Eb');
      expect(result.octave).toBe(4);
    });
  });

  describe('Cents Calculation (Tuning Accuracy)', () => {
    it('should return 0 cents for perfectly tuned A4 (440 Hz)', () => {
      const result = frequencyToNote(440);
      expect(result.cents).toBe(0);
    });

    it('should return positive cents when sharp (above target)', () => {
      // 441 Hz is slightly sharp of A4
      const result = frequencyToNote(441);
      expect(result.cents).toBeGreaterThan(0);
      expect(result.cents).toBeLessThan(10); // Should be small
    });

    it('should return negative cents when flat (below target)', () => {
      // 439 Hz is slightly flat of A4
      const result = frequencyToNote(439);
      expect(result.cents).toBeLessThan(0);
      expect(result.cents).toBeGreaterThan(-10); // Should be small
    });

    it('should be approximately ±50 cents at quarter tone boundaries', () => {
      // Halfway between A4 (440) and A#4 (466.16) should be ~+50 cents
      const halfwayFreq = 440 * Math.pow(2, 0.5 / 12); // 452.89 Hz
      const result = frequencyToNote(halfwayFreq);
      
      // Could round to either A or A#, but cents should be near ±50
      expect(Math.abs(result.cents)).toBeGreaterThanOrEqual(45);
      expect(Math.abs(result.cents)).toBeLessThanOrEqual(55);
    });
  });

  describe('Octave Boundaries', () => {
    it('should correctly identify notes across octave boundaries', () => {
      // B3 to C4 boundary
      const b3 = frequencyToNote(246.94);
      const c4 = frequencyToNote(261.63);
      
      expect(b3.note).toBe('B');
      expect(b3.octave).toBe(3);
      expect(c4.note).toBe('C');
      expect(c4.octave).toBe(4);
    });

    it('should handle A440 doubling to A880 (octave up)', () => {
      const a4 = frequencyToNote(440);
      const a5 = frequencyToNote(880);
      
      expect(a4.note).toBe('A');
      expect(a4.octave).toBe(4);
      expect(a5.note).toBe('A');
      expect(a5.octave).toBe(5);
    });

    it('should handle A440 halving to A220 (octave down)', () => {
      const a4 = frequencyToNote(440);
      const a3 = frequencyToNote(220);
      
      expect(a4.note).toBe('A');
      expect(a4.octave).toBe(4);
      expect(a3.note).toBe('A');
      expect(a3.octave).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very low frequencies (bass range)', () => {
      // E1 ~41 Hz (below standard guitar)
      const result = frequencyToNote(41.2);
      
      expect(result.note).toBe('E');
      expect(result.octave).toBe(1);
    });

    it('should handle very high frequencies', () => {
      // C7 ~2093 Hz
      const result = frequencyToNote(2093);
      
      expect(result.note).toBe('C');
      expect(result.octave).toBe(7);
    });

    it('should default to sharps when useFlats is not specified', () => {
      const result = frequencyToNote(277.18); // C#/Db
      
      expect(result.note).toBe('C#');
    });
  });

  describe('Consistency Between Sharp and Flat Modes', () => {
    const accidentalFrequencies = [
      277.18, // C#/Db
      311.13, // D#/Eb
      369.99, // F#/Gb
      415.30, // G#/Ab
      466.16, // A#/Bb
    ];

    it('should return the same octave for sharp and flat versions', () => {
      for (const freq of accidentalFrequencies) {
        const sharpResult = frequencyToNote(freq, false);
        const flatResult = frequencyToNote(freq, true);
        
        expect(sharpResult.octave).toBe(flatResult.octave);
      }
    });

    it('should return the same cents for sharp and flat versions', () => {
      for (const freq of accidentalFrequencies) {
        const sharpResult = frequencyToNote(freq, false);
        const flatResult = frequencyToNote(freq, true);
        
        expect(sharpResult.cents).toBe(flatResult.cents);
      }
    });
  });
});

describe('frequencyToNote - Real World Scenarios', () => {
  describe('Common Guitar Notes', () => {
    // Test common fretted notes on guitar
    const guitarNotes = [
      { freq: 82.41, note: 'E', octave: 2, desc: 'Low E open' },
      { freq: 87.31, note: 'F', octave: 2, desc: 'Low E 1st fret' },
      { freq: 110.0, note: 'A', octave: 2, desc: 'A string open' },
      { freq: 146.83, note: 'D', octave: 3, desc: 'D string open' },
      { freq: 196.0, note: 'G', octave: 3, desc: 'G string open' },
      { freq: 246.94, note: 'B', octave: 3, desc: 'B string open' },
      { freq: 329.63, note: 'E', octave: 4, desc: 'High E open' },
      { freq: 440.0, note: 'A', octave: 4, desc: 'A string 12th fret' },
    ];

    for (const { freq, note, octave, desc } of guitarNotes) {
      it(`should identify ${desc} (${freq} Hz) as ${note}${octave}`, () => {
        const result = frequencyToNote(freq);
        
        expect(result.note).toBe(note);
        expect(result.octave).toBe(octave);
      });
    }
  });

  describe('Slightly Out of Tune Notes', () => {
    it('should still identify note when slightly sharp', () => {
      // A4 at 442 Hz (common European tuning)
      const result = frequencyToNote(442);
      
      expect(result.note).toBe('A');
      expect(result.octave).toBe(4);
      expect(result.cents).toBeGreaterThan(0);
      expect(result.cents).toBeLessThan(15);
    });

    it('should still identify note when slightly flat', () => {
      // A4 at 438 Hz (slightly flat)
      const result = frequencyToNote(438);
      
      expect(result.note).toBe('A');
      expect(result.octave).toBe(4);
      expect(result.cents).toBeLessThan(0);
      expect(result.cents).toBeGreaterThan(-15);
    });
  });
});
