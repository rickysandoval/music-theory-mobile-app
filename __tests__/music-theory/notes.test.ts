/**
 * Unit tests for note manipulation utilities
 */

import {
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
  getEnharmonicForLetter,
  getCorrectSpellingForChordPosition,
} from '../../src/lib/music-theory/notes';

describe('normalizeNote', () => {
  it('should uppercase note letters', () => {
    expect(normalizeNote('c')).toBe('C');
    expect(normalizeNote('g')).toBe('G');
  });

  it('should handle sharps correctly', () => {
    expect(normalizeNote('c#')).toBe('C#');
    expect(normalizeNote('C#')).toBe('C#');
    expect(normalizeNote('f♯')).toBe('F#');
  });

  it('should handle flats correctly', () => {
    expect(normalizeNote('bb')).toBe('Bb');
    expect(normalizeNote('Db')).toBe('Db');
    expect(normalizeNote('e♭')).toBe('Eb');
  });

  it('should return empty string for invalid input', () => {
    expect(normalizeNote('')).toBe('');
  });
});

describe('isValidNote', () => {
  it('should return true for valid notes', () => {
    expect(isValidNote('C')).toBe(true);
    expect(isValidNote('F#')).toBe(true);
    expect(isValidNote('Bb')).toBe(true);
    expect(isValidNote('g')).toBe(true);
  });

  it('should return false for invalid notes', () => {
    expect(isValidNote('')).toBe(false);
    expect(isValidNote('H')).toBe(false);
    expect(isValidNote('C##')).toBe(false);
    expect(isValidNote('123')).toBe(false);
  });
});

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
    expect(getNoteIndex('F#')).toBe(6);
  });

  it('should return correct index for flats (enharmonic)', () => {
    expect(getNoteIndex('Db')).toBe(1);
    expect(getNoteIndex('Bb')).toBe(10);
  });

  it('should return -1 for invalid notes', () => {
    expect(getNoteIndex('')).toBe(-1);
    expect(getNoteIndex('X')).toBe(-1);
  });
});

describe('getNoteFromIndex', () => {
  it('should return sharp names by default', () => {
    expect(getNoteFromIndex(0)).toBe('C');
    expect(getNoteFromIndex(1)).toBe('C#');
    expect(getNoteFromIndex(6)).toBe('F#');
  });

  it('should return flat names when preferFlats is true', () => {
    expect(getNoteFromIndex(1, true)).toBe('Db');
    expect(getNoteFromIndex(3, true)).toBe('Eb');
    expect(getNoteFromIndex(10, true)).toBe('Bb');
  });

  it('should handle index wrapping', () => {
    expect(getNoteFromIndex(12)).toBe('C');
    expect(getNoteFromIndex(13)).toBe('C#');
    expect(getNoteFromIndex(-1)).toBe('B');
  });
});

describe('areEnharmonic', () => {
  it('should return true for enharmonic equivalents', () => {
    expect(areEnharmonic('C#', 'Db')).toBe(true);
    expect(areEnharmonic('F#', 'Gb')).toBe(true);
    expect(areEnharmonic('A#', 'Bb')).toBe(true);
  });

  it('should return true for same notes', () => {
    expect(areEnharmonic('C', 'C')).toBe(true);
    expect(areEnharmonic('F#', 'F#')).toBe(true);
  });

  it('should return false for non-enharmonic notes', () => {
    expect(areEnharmonic('C', 'D')).toBe(false);
    expect(areEnharmonic('F#', 'G')).toBe(false);
  });
});

describe('getEnharmonics', () => {
  it('should return all enharmonic spellings', () => {
    expect(getEnharmonics('C#')).toContain('C#');
    expect(getEnharmonics('C#')).toContain('Db');
    expect(getEnharmonics('Db')).toContain('C#');
  });

  it('should return single note for notes without common enharmonics', () => {
    expect(getEnharmonics('D')).toEqual(['D']);
  });
});

describe('transpose', () => {
  it('should transpose up correctly', () => {
    expect(transpose('C', 4)).toBe('E'); // Major third
    expect(transpose('C', 7)).toBe('G'); // Perfect fifth
    expect(transpose('G', 2)).toBe('A'); // Whole step
  });

  it('should transpose down correctly', () => {
    expect(transpose('E', -4)).toBe('C');
    expect(transpose('G', -7)).toBe('C');
  });

  it('should wrap around the octave', () => {
    expect(transpose('A', 5)).toBe('D');
    expect(transpose('C', 12)).toBe('C'); // Full octave
  });

  it('should respect preferFlats option', () => {
    expect(transpose('C', 1, true)).toBe('Db');
    expect(transpose('A', 1, true)).toBe('Bb');
  });
});

describe('getInterval', () => {
  it('should return correct intervals', () => {
    expect(getInterval('C', 'E')).toBe(4); // Major third
    expect(getInterval('C', 'G')).toBe(7); // Perfect fifth
    expect(getInterval('C', 'C')).toBe(0); // Unison
  });

  it('should handle enharmonic equivalents', () => {
    expect(getInterval('C', 'Db')).toBe(1);
    expect(getInterval('C', 'C#')).toBe(1);
  });

  it('should return -1 for invalid notes', () => {
    expect(getInterval('C', 'X')).toBe(-1);
  });
});

describe('getNoteAtFret', () => {
  it('should return correct open string notes (standard tuning)', () => {
    expect(getNoteAtFret(0, 0)).toBe('E'); // Low E
    expect(getNoteAtFret(1, 0)).toBe('A');
    expect(getNoteAtFret(2, 0)).toBe('D');
    expect(getNoteAtFret(3, 0)).toBe('G');
    expect(getNoteAtFret(4, 0)).toBe('B');
    expect(getNoteAtFret(5, 0)).toBe('E'); // High E
  });

  it('should return correct notes at frets', () => {
    expect(getNoteAtFret(0, 5)).toBe('A'); // 5th fret low E = A
    expect(getNoteAtFret(1, 2)).toBe('B'); // 2nd fret A string = B
    expect(getNoteAtFret(5, 3)).toBe('G'); // 3rd fret high E = G
  });

  it('should return empty string for invalid string numbers', () => {
    expect(getNoteAtFret(-1, 0)).toBe('');
    expect(getNoteAtFret(6, 0)).toBe('');
  });
});

describe('findNoteOnFretboard', () => {
  it('should find all positions of a note', () => {
    const cPositions = findNoteOnFretboard('C');
    
    // C should be found at multiple positions
    expect(cPositions.length).toBeGreaterThan(0);
    
    // Check a known position: 3rd fret of A string
    expect(cPositions).toContainEqual({ string: 1, fret: 3 });
  });

  it('should respect maxFret parameter', () => {
    const positions5 = findNoteOnFretboard('C', 5);
    const positions12 = findNoteOnFretboard('C', 12);
    
    expect(positions5.length).toBeLessThanOrEqual(positions12.length);
  });

  it('should return empty array for invalid notes', () => {
    expect(findNoteOnFretboard('X')).toEqual([]);
  });
});

describe('isNaturalNote', () => {
  it('should return true for natural notes', () => {
    expect(isNaturalNote('C')).toBe(true);
    expect(isNaturalNote('D')).toBe(true);
    expect(isNaturalNote('E')).toBe(true);
  });

  it('should return false for sharps and flats', () => {
    expect(isNaturalNote('C#')).toBe(false);
    expect(isNaturalNote('Bb')).toBe(false);
  });
});

describe('getNextNoteLetter', () => {
  it('should return the next letter in sequence', () => {
    expect(getNextNoteLetter('C')).toBe('D');
    expect(getNextNoteLetter('D')).toBe('E');
    expect(getNextNoteLetter('G')).toBe('A');
  });

  it('should wrap from B to C', () => {
    expect(getNextNoteLetter('B')).toBe('C');
  });
});

describe('getNoteLetterAtInterval', () => {
  it('should return correct letter for third (2 steps)', () => {
    expect(getNoteLetterAtInterval('C', 2)).toBe('E');
    expect(getNoteLetterAtInterval('A', 2)).toBe('C');
  });

  it('should return correct letter for fifth (4 steps)', () => {
    expect(getNoteLetterAtInterval('C', 4)).toBe('G');
    expect(getNoteLetterAtInterval('D', 4)).toBe('A');
  });

  it('should wrap around correctly', () => {
    expect(getNoteLetterAtInterval('G', 4)).toBe('D');
  });
});

describe('getEnharmonicForLetter', () => {
  it('should return same note if already starts with target letter', () => {
    expect(getEnharmonicForLetter('C', 'C')).toBe('C');
    expect(getEnharmonicForLetter('F#', 'F')).toBe('F#');
    expect(getEnharmonicForLetter('Bb', 'B')).toBe('Bb');
  });

  it('should convert sharp to flat equivalent', () => {
    expect(getEnharmonicForLetter('A#', 'B')).toBe('Bb');
    expect(getEnharmonicForLetter('C#', 'D')).toBe('Db');
    expect(getEnharmonicForLetter('D#', 'E')).toBe('Eb');
    expect(getEnharmonicForLetter('F#', 'G')).toBe('Gb');
    expect(getEnharmonicForLetter('G#', 'A')).toBe('Ab');
  });

  it('should convert flat to sharp equivalent', () => {
    expect(getEnharmonicForLetter('Bb', 'A')).toBe('A#');
    expect(getEnharmonicForLetter('Db', 'C')).toBe('C#');
    expect(getEnharmonicForLetter('Eb', 'D')).toBe('D#');
    expect(getEnharmonicForLetter('Gb', 'F')).toBe('F#');
    expect(getEnharmonicForLetter('Ab', 'G')).toBe('G#');
  });

  it('should return null if no enharmonic exists for target letter', () => {
    // C has no enharmonic starting with D
    expect(getEnharmonicForLetter('C', 'D')).toBe(null);
    // E natural has no common enharmonic starting with D
    expect(getEnharmonicForLetter('E', 'D')).toBe(null);
  });

  it('should handle case insensitivity', () => {
    expect(getEnharmonicForLetter('a#', 'b')).toBe('Bb');
    expect(getEnharmonicForLetter('BB', 'A')).toBe('A#');
  });
});

describe('getCorrectSpellingForChordPosition', () => {
  describe('G minor chord (G - Bb - D)', () => {
    it('should spell third as Bb not A#', () => {
      // User presses A#/Bb key for third position
      expect(getCorrectSpellingForChordPosition('A#', 'G', 1)).toBe('Bb');
      expect(getCorrectSpellingForChordPosition('Bb', 'G', 1)).toBe('Bb');
    });

    it('should spell fifth correctly', () => {
      expect(getCorrectSpellingForChordPosition('D', 'G', 2)).toBe('D');
    });
  });

  describe('F# minor chord (F# - A - C#)', () => {
    it('should spell root as F# not Gb', () => {
      expect(getCorrectSpellingForChordPosition('Gb', 'F#', 0)).toBe('F#');
      expect(getCorrectSpellingForChordPosition('F#', 'F#', 0)).toBe('F#');
    });

    it('should spell third as A', () => {
      expect(getCorrectSpellingForChordPosition('A', 'F#', 1)).toBe('A');
    });

    it('should spell fifth as C# not Db', () => {
      expect(getCorrectSpellingForChordPosition('Db', 'F#', 2)).toBe('C#');
      expect(getCorrectSpellingForChordPosition('C#', 'F#', 2)).toBe('C#');
    });
  });

  describe('Eb major chord (Eb - G - Bb)', () => {
    it('should spell root as Eb', () => {
      expect(getCorrectSpellingForChordPosition('D#', 'Eb', 0)).toBe('Eb');
      expect(getCorrectSpellingForChordPosition('Eb', 'Eb', 0)).toBe('Eb');
    });

    it('should spell third as G', () => {
      expect(getCorrectSpellingForChordPosition('G', 'Eb', 1)).toBe('G');
    });

    it('should spell fifth as Bb not A#', () => {
      expect(getCorrectSpellingForChordPosition('A#', 'Eb', 2)).toBe('Bb');
      expect(getCorrectSpellingForChordPosition('Bb', 'Eb', 2)).toBe('Bb');
    });
  });

  describe('A major chord (A - C# - E)', () => {
    it('should spell third as C# not Db', () => {
      expect(getCorrectSpellingForChordPosition('Db', 'A', 1)).toBe('C#');
      expect(getCorrectSpellingForChordPosition('C#', 'A', 1)).toBe('C#');
    });
  });

  describe('Bb major chord (Bb - D - F)', () => {
    it('should spell root as Bb not A#', () => {
      expect(getCorrectSpellingForChordPosition('A#', 'Bb', 0)).toBe('Bb');
    });

    it('should spell third as D', () => {
      expect(getCorrectSpellingForChordPosition('D', 'Bb', 1)).toBe('D');
    });

    it('should spell fifth as F', () => {
      expect(getCorrectSpellingForChordPosition('F', 'Bb', 2)).toBe('F');
    });
  });

  describe('edge cases', () => {
    it('should convert C to B# when B letter is needed (enharmonic exists)', () => {
      // C is enharmonic to B# - this would be used if third of G# needs to be B-something
      // Third of G is B (2 letters: G → A → B), so C played for third converts to B#
      expect(getCorrectSpellingForChordPosition('C', 'G', 1)).toBe('B#');
    });

    it('should return original when no conversion possible', () => {
      // E has no common enharmonic starting with G
      // This is an invalid chord tone anyway, so fallback is fine
      expect(getCorrectSpellingForChordPosition('E', 'C', 2)).toBe('E');
    });
  });
});
