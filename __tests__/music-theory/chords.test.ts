/**
 * Unit tests for chord utilities
 */

import {
  parseChordName,
  buildChordNotes,
  generateRandomChord,
  isNoteInChord,
  checkChordAnswer,
  identifyChord,
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
    includeSharpsFlatRoots: true,
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
      includeSharpsFlatRoots: true,
      includeMinorChords: false,
    };

    // Generate multiple chords to increase confidence
    for (let i = 0; i < 20; i++) {
      const chord = generateRandomChord(settings);
      expect(chord.isMinor).toBe(false);
      expect(chord.name).not.toContain('m');
    }
  });

  it('should not include sharps/flats when disabled', () => {
    const settings: ChordGameSettings = {
      includeSharpsFlatRoots: false,
      includeMinorChords: true,
    };

    for (let i = 0; i < 20; i++) {
      const chord = generateRandomChord(settings);
      expect(chord.root).not.toContain('#');
      expect(chord.root).not.toContain('b');
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

  it('should return true for correct answer', () => {
    expect(checkChordAnswer(['C', 'E', 'G'], cMajor)).toBe(true);
  });

  it('should return true regardless of order', () => {
    expect(checkChordAnswer(['E', 'G', 'C'], cMajor)).toBe(true);
    expect(checkChordAnswer(['G', 'C', 'E'], cMajor)).toBe(true);
  });

  it('should return true for enharmonic equivalents', () => {
    const dbChord: Chord = {
      name: 'Db',
      notes: ['Db', 'F', 'Ab'],
      root: 'Db',
      isMinor: false,
    };

    // Using sharps instead of flats
    expect(checkChordAnswer(['C#', 'F', 'G#'], dbChord)).toBe(true);
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
    // Even if all notes are "correct", we need all three unique notes
    expect(checkChordAnswer(['C', 'C', 'C'], cMajor)).toBe(false);
    expect(checkChordAnswer(['C', 'E', 'E'], cMajor)).toBe(false);
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
