/**
 * Unit tests for chord utilities
 */

import {
    buildChordNotes,
    checkChordAnswer,
    generateAllChords,
    generateRandomChord,
    identifyChord,
    isNoteCorrectAtPosition,
    isNoteInChord,
    parseChordName,
} from '../../src/lib/music-theory/chords';
import type { Chord, ChordGameSettings } from '../../src/lib/music-theory/types';

describe('parseChordName', () => {
  it('should parse major chords', () => {
    expect(parseChordName('C')).toEqual({ root: 'C', isMinor: false });
    expect(parseChordName('G')).toEqual({ root: 'G', isMinor: false });
    expect(parseChordName('F#')).toEqual({ root: 'F#', isMinor: false });
  });

  it('should parse minor chords', () => {
    expect(parseChordName('Am')).toEqual({ root: 'A', isMinor: true });
    expect(parseChordName('Dm')).toEqual({ root: 'D', isMinor: true });
    expect(parseChordName('F#m')).toEqual({ root: 'F#', isMinor: true });
  });

  it('should handle flat root notes', () => {
    expect(parseChordName('Bb')).toEqual({ root: 'Bb', isMinor: false });
    expect(parseChordName('Ebm')).toEqual({ root: 'Eb', isMinor: true });
  });
});

describe('buildChordNotes', () => {
  it('should build major chord notes correctly', () => {
    const cMajor = buildChordNotes('C', false);
    expect(cMajor).toHaveLength(3);
    expect(cMajor[0]).toBe('C'); // Root
    expect(cMajor[1]).toBe('E'); // Major third
    expect(cMajor[2]).toBe('G'); // Perfect fifth
  });

  it('should build minor chord notes correctly', () => {
    const aMinor = buildChordNotes('A', true);
    expect(aMinor).toHaveLength(3);
    expect(aMinor[0]).toBe('A'); // Root
    expect(aMinor[1]).toBe('C'); // Minor third
    expect(aMinor[2]).toBe('E'); // Perfect fifth
  });

  it('should handle sharp root notes', () => {
    const fSharpMinor = buildChordNotes('F#', true);
    expect(fSharpMinor[0]).toBe('F#');
    // The third of F#m should be A
    expect(fSharpMinor[1]).toBe('A');
    // The fifth of F#m should be C#
    expect(fSharpMinor[2]).toBe('C#');
  });

  it('should handle flat root notes', () => {
    const bbMajor = buildChordNotes('Bb', false);
    expect(bbMajor[0]).toBe('Bb');
    // The third of Bb should be D
    expect(bbMajor[1]).toBe('D');
    // The fifth of Bb should be F
    expect(bbMajor[2]).toBe('F');
  });
});

describe('generateRandomChord', () => {
  const defaultSettings: ChordGameSettings = {
    includeDiatonicRoots: true,
    includeAccidentalRoots: true,
    includeMajorChords: true,
    includeMinorChords: true,
  };

  it('should return a valid chord object', () => {
    const chord = generateRandomChord(defaultSettings);
    
    expect(chord).toHaveProperty('name');
    expect(chord).toHaveProperty('notes');
    expect(chord).toHaveProperty('root');
    expect(chord).toHaveProperty('isMinor');
    expect(chord.notes).toHaveLength(3);
  });

  it('should not include minor chords when disabled', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: true,
      includeMajorChords: true,
      includeMinorChords: false,
    };

    // Generate multiple chords to increase confidence
    for (let i = 0; i < 20; i++) {
      const chord = generateRandomChord(settings);
      expect(chord.isMinor).toBe(false);
      expect(chord.name).not.toContain('m');
    }
  });

  it('should not include major chords when disabled', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: true,
      includeMajorChords: false,
      includeMinorChords: true,
    };

    for (let i = 0; i < 20; i++) {
      const chord = generateRandomChord(settings);
      expect(chord.isMinor).toBe(true);
      expect(chord.name).toContain('m');
    }
  });

  it('should not include accidentals when disabled', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: false,
      includeMajorChords: true,
      includeMinorChords: true,
    };

    for (let i = 0; i < 20; i++) {
      const chord = generateRandomChord(settings);
      expect(chord.root).not.toContain('#');
      expect(chord.root).not.toContain('b');
    }
  });

  it('should only include accidentals when diatonic disabled', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: false,
      includeAccidentalRoots: true,
      includeMajorChords: true,
      includeMinorChords: true,
    };

    for (let i = 0; i < 20; i++) {
      const chord = generateRandomChord(settings);
      expect(chord.root.includes('#') || chord.root.includes('b')).toBe(true);
    }
  });

  it('should avoid repeating the same chord', () => {
    const currentChord: Chord = {
      name: 'C',
      notes: ['C', 'E', 'G'],
      root: 'C',
      isMinor: false,
    };

    for (let i = 0; i < 20; i++) {
      const newChord = generateRandomChord(defaultSettings, currentChord);
      expect(newChord.name).not.toBe(currentChord.name);
    }
  });
});

describe('isNoteInChord', () => {
  const cMajor: Chord = {
    name: 'C',
    notes: ['C', 'E', 'G'],
    root: 'C',
    isMinor: false,
  };

  it('should return true for notes in the chord', () => {
    expect(isNoteInChord('C', cMajor)).toBe(true);
    expect(isNoteInChord('E', cMajor)).toBe(true);
    expect(isNoteInChord('G', cMajor)).toBe(true);
  });

  it('should return false for notes not in the chord', () => {
    expect(isNoteInChord('D', cMajor)).toBe(false);
    expect(isNoteInChord('F', cMajor)).toBe(false);
    expect(isNoteInChord('A', cMajor)).toBe(false);
  });

  it('should handle enharmonic equivalents', () => {
    const dbChord: Chord = {
      name: 'Db',
      notes: ['Db', 'F', 'Ab'],
      root: 'Db',
      isMinor: false,
    };

    // C# is enharmonic to Db
    expect(isNoteInChord('C#', dbChord)).toBe(true);
    // G# is enharmonic to Ab
    expect(isNoteInChord('G#', dbChord)).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(isNoteInChord('', cMajor)).toBe(false);
  });
});

describe('checkChordAnswer', () => {
  const cMajor: Chord = {
    name: 'C',
    notes: ['C', 'E', 'G'],
    root: 'C',
    isMinor: false,
  };

  it('should return true for correct answer in correct order (Root, Third, Fifth)', () => {
    expect(checkChordAnswer(['C', 'E', 'G'], cMajor)).toBe(true);
  });

  it('should return false for correct notes in wrong order', () => {
    // Fifth in third position, third in fifth position
    expect(checkChordAnswer(['C', 'G', 'E'], cMajor)).toBe(false);
    // These would be inversions, but we want root position only
    expect(checkChordAnswer(['E', 'G', 'C'], cMajor)).toBe(false);
    expect(checkChordAnswer(['G', 'C', 'E'], cMajor)).toBe(false);
  });

  it('should return true for enharmonic equivalents in correct positions', () => {
    const dbChord: Chord = {
      name: 'Db',
      notes: ['Db', 'F', 'Ab'],
      root: 'Db',
      isMinor: false,
    };

    // Using sharps instead of flats, but in correct order
    expect(checkChordAnswer(['C#', 'F', 'G#'], dbChord)).toBe(true);
  });

  it('should return false for enharmonic equivalents in wrong positions', () => {
    const dbChord: Chord = {
      name: 'Db',
      notes: ['Db', 'F', 'Ab'],
      root: 'Db',
      isMinor: false,
    };

    // Wrong order even with enharmonics
    expect(checkChordAnswer(['C#', 'G#', 'F'], dbChord)).toBe(false);
  });

  it('should return false for incomplete answer', () => {
    expect(checkChordAnswer(['C', 'E', ''], cMajor)).toBe(false);
    expect(checkChordAnswer(['C', '', ''], cMajor)).toBe(false);
  });

  it('should return false for wrong notes', () => {
    expect(checkChordAnswer(['C', 'E', 'A'], cMajor)).toBe(false);
    expect(checkChordAnswer(['D', 'F#', 'A'], cMajor)).toBe(false);
  });

  it('should return false for duplicate correct notes', () => {
    expect(checkChordAnswer(['C', 'C', 'C'], cMajor)).toBe(false);
    expect(checkChordAnswer(['C', 'E', 'E'], cMajor)).toBe(false);
  });

  it('should return false for correct third and fifth but wrong root', () => {
    expect(checkChordAnswer(['D', 'E', 'G'], cMajor)).toBe(false);
  });
});

describe('isNoteCorrectAtPosition', () => {
  const aMinor: Chord = {
    name: 'Am',
    notes: ['A', 'C', 'E'],
    root: 'A',
    isMinor: true,
  };

  it('should return true for correct note at position 0 (root)', () => {
    expect(isNoteCorrectAtPosition('A', 0, aMinor)).toBe(true);
  });

  it('should return true for correct note at position 1 (third)', () => {
    expect(isNoteCorrectAtPosition('C', 1, aMinor)).toBe(true);
  });

  it('should return true for correct note at position 2 (fifth)', () => {
    expect(isNoteCorrectAtPosition('E', 2, aMinor)).toBe(true);
  });

  it('should return false for wrong note at position', () => {
    // E is in the chord, but not at position 1 (third)
    expect(isNoteCorrectAtPosition('E', 1, aMinor)).toBe(false);
    // C is in the chord, but not at position 2 (fifth)
    expect(isNoteCorrectAtPosition('C', 2, aMinor)).toBe(false);
  });

  it('should accept enharmonic equivalents at correct position', () => {
    const fSharpMinor: Chord = {
      name: 'F#m',
      notes: ['F#', 'A', 'C#'],
      root: 'F#',
      isMinor: true,
    };

    // Gb is enharmonic to F# at position 0
    expect(isNoteCorrectAtPosition('Gb', 0, fSharpMinor)).toBe(true);
    // Db is enharmonic to C# at position 2
    expect(isNoteCorrectAtPosition('Db', 2, fSharpMinor)).toBe(true);
  });

  it('should return false for empty note', () => {
    expect(isNoteCorrectAtPosition('', 0, aMinor)).toBe(false);
  });

  it('should return false for invalid position', () => {
    expect(isNoteCorrectAtPosition('A', -1, aMinor)).toBe(false);
    expect(isNoteCorrectAtPosition('A', 3, aMinor)).toBe(false);
  });
});

describe('identifyChord', () => {
  it('should identify major chords', () => {
    expect(identifyChord(['C', 'E', 'G'])).toBe('C');
    expect(identifyChord(['G', 'B', 'D'])).toBe('G');
    expect(identifyChord(['F', 'A', 'C'])).toBe('F');
  });

  it('should identify minor chords', () => {
    expect(identifyChord(['A', 'C', 'E'])).toBe('Am');
    expect(identifyChord(['D', 'F', 'A'])).toBe('Dm');
    expect(identifyChord(['E', 'G', 'B'])).toBe('Em');
  });

  it('should identify chords regardless of note order', () => {
    expect(identifyChord(['E', 'G', 'C'])).toBe('C');
    expect(identifyChord(['G', 'C', 'E'])).toBe('C');
  });

  it('should return null for unrecognized note combinations', () => {
    expect(identifyChord(['C', 'D', 'E'])).toBe(null);
    expect(identifyChord(['C', 'F', 'G'])).toBe(null);
  });

  it('should return null for wrong number of notes', () => {
    expect(identifyChord(['C', 'E'])).toBe(null);
    expect(identifyChord(['C', 'E', 'G', 'B'])).toBe(null);
  });
});

describe('generateAllChords', () => {
  it('should generate all major diatonic chords', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: false,
      includeMajorChords: true,
      includeMinorChords: false,
    };

    const chords = generateAllChords(settings);
    
    // Should have 7 natural major chords (C, D, E, F, G, A, B)
    expect(chords.length).toBe(7);
    
    // All should be major
    chords.forEach(chord => {
      expect(chord.isMinor).toBe(false);
    });
    
    // All should have natural roots
    chords.forEach(chord => {
      expect(chord.root).not.toContain('#');
      expect(chord.root).not.toContain('b');
    });
  });

  it('should include minor chords when enabled', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: false,
      includeMajorChords: true,
      includeMinorChords: true,
    };

    const chords = generateAllChords(settings);
    
    // Should have 14 chords (7 major + 7 minor)
    expect(chords.length).toBe(14);
    
    const majorChords = chords.filter(c => !c.isMinor);
    const minorChords = chords.filter(c => c.isMinor);
    
    expect(majorChords.length).toBe(7);
    expect(minorChords.length).toBe(7);
  });

  it('should include accidental roots when enabled', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: true,
      includeMajorChords: true,
      includeMinorChords: false,
    };

    const chords = generateAllChords(settings);
    
    // Should have more than just diatonic chords
    expect(chords.length).toBeGreaterThan(7);
    
    // Should include some with sharps or flats
    const hasSharpFlat = chords.some(
      c => c.root.includes('#') || c.root.includes('b')
    );
    expect(hasSharpFlat).toBe(true);
    
    // Should also include diatonic
    const hasDiatonic = chords.some(
      c => !c.root.includes('#') && !c.root.includes('b')
    );
    expect(hasDiatonic).toBe(true);
  });

  it('should only include accidentals when diatonic disabled', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: false,
      includeAccidentalRoots: true,
      includeMajorChords: true,
      includeMinorChords: false,
    };

    const chords = generateAllChords(settings);
    
    // Should have some accidental major chords
    expect(chords.length).toBeGreaterThan(0);
    
    // All should have accidentals
    chords.forEach(chord => {
      expect(chord.root.includes('#') || chord.root.includes('b')).toBe(true);
    });
  });

  it('should return shuffled chords (not always in same order)', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: true,
      includeMajorChords: true,
      includeMinorChords: true,
    };

    // Generate multiple times and check that at least one ordering is different
    const results: string[][] = [];
    for (let i = 0; i < 5; i++) {
      const chords = generateAllChords(settings);
      results.push(chords.map(c => c.name));
    }
    
    // At least two different orderings should exist (very high probability)
    const uniqueOrderings = new Set(results.map(r => r.join(',')));
    expect(uniqueOrderings.size).toBeGreaterThan(1);
  });

  it('should generate valid chord objects', () => {
    const settings: ChordGameSettings = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: true,
      includeMajorChords: true,
      includeMinorChords: true,
    };

    const chords = generateAllChords(settings);
    
    chords.forEach(chord => {
      expect(chord).toHaveProperty('name');
      expect(chord).toHaveProperty('notes');
      expect(chord).toHaveProperty('root');
      expect(chord).toHaveProperty('isMinor');
      expect(chord.notes).toHaveLength(3);
      expect(chord.notes[0]).toBe(chord.root);
    });
  });
});
