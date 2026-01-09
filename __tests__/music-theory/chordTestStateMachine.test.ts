/**
 * Unit tests for Chord Test State Machine
 * 
 * Tests the pure state transition functions for the chord test flow:
 * - Creating initial test state
 * - Recording results (correct/incorrect)
 * - Completing a test
 * - Reviewing missed chords
 * - Restarting tests
 */

import {
  calculateScore,
  createTestState,
  getCurrentChord,
  getMissedChords,
  getProgress,
  markReviewCorrect,
  recordTestResult,
  restartTest,
  shuffleArray,
  startReviewingMissed,
} from '../../src/lib/music-theory/chordTestStateMachine';
import type { ChordGameSettings, TestState } from '../../src/lib/music-theory/types';

// Mock settings for predictable chord generation
const createTestSettings = (options: Partial<ChordGameSettings> = {}): ChordGameSettings => ({
  includeDiatonicRoots: true,
  includeAccidentalRoots: false,
  includeMajorChords: true,
  includeMinorChords: false,
  ...options,
});

describe('shuffleArray', () => {
  it('should return a new array with same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('should not modify the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    shuffleArray(original);
    
    expect(original).toEqual(originalCopy);
  });

  it('should produce different orderings (probabilistic)', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const orderings = new Set<string>();
    
    for (let i = 0; i < 20; i++) {
      orderings.add(shuffleArray(original).join(','));
    }
    
    // With 10 elements, very high probability of multiple unique orderings
    expect(orderings.size).toBeGreaterThan(1);
  });
});

describe('createTestState', () => {
  it('should create initial state with in-progress mode', () => {
    const state = createTestState(createTestSettings());
    
    expect(state.mode).toBe('in-progress');
    expect(state.currentIndex).toBe(0);
    expect(state.results).toEqual([]);
    expect(state.missedChords).toEqual([]);
    expect(state.reviewIndex).toBe(0);
  });

  it('should generate chords based on settings', () => {
    const state = createTestState(createTestSettings());
    
    // With diatonic major only, should have 7 chords (C, D, E, F, G, A, B)
    expect(state.allChords.length).toBe(7);
    expect(state.allChords.every(c => !c.isMinor)).toBe(true);
  });

  it('should include minor chords when enabled', () => {
    const state = createTestState(createTestSettings({ includeMinorChords: true }));
    
    // Should have 14 chords (7 major + 7 minor)
    expect(state.allChords.length).toBe(14);
    
    const majorCount = state.allChords.filter(c => !c.isMinor).length;
    const minorCount = state.allChords.filter(c => c.isMinor).length;
    
    expect(majorCount).toBe(7);
    expect(minorCount).toBe(7);
  });
});

describe('recordTestResult', () => {
  let initialState: TestState;
  
  beforeEach(() => {
    initialState = createTestState(createTestSettings());
  });

  it('should record a correct result', () => {
    const newState = recordTestResult(initialState, true);
    
    expect(newState).not.toBeNull();
    expect(newState!.results.length).toBe(1);
    expect(newState!.results[0].wasCorrect).toBe(true);
    expect(newState!.results[0].chord).toBe(initialState.allChords[0]);
  });

  it('should record an incorrect result', () => {
    const newState = recordTestResult(initialState, false);
    
    expect(newState).not.toBeNull();
    expect(newState!.results[0].wasCorrect).toBe(false);
  });

  it('should advance currentIndex', () => {
    const newState = recordTestResult(initialState, true);
    
    expect(newState!.currentIndex).toBe(1);
  });

  it('should transition to completed when all chords done', () => {
    let state = initialState;
    const total = state.allChords.length;
    
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, true);
      if (nextState) state = nextState;
    }
    
    expect(state.mode).toBe('completed');
    expect(state.results.length).toBe(total);
  });

  it('should populate missedChords when completing with wrong answers', () => {
    let state = initialState;
    const total = state.allChords.length;
    
    // Answer all incorrectly
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, false);
      if (nextState) state = nextState;
    }
    
    expect(state.missedChords.length).toBe(total);
  });

  it('should return null if not in progress mode', () => {
    const completedState: TestState = {
      ...initialState,
      mode: 'completed',
    };
    
    const result = recordTestResult(completedState, true);
    expect(result).toBeNull();
  });
});

describe('startReviewingMissed', () => {
  it('should transition to reviewing-missed mode', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    // Complete with some wrong answers
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, i !== 0);
      if (nextState) state = nextState;
    }
    
    const reviewState = startReviewingMissed(state);
    
    expect(reviewState.mode).toBe('reviewing-missed');
    expect(reviewState.reviewIndex).toBe(0);
  });

  it('should shuffle the missed chords', () => {
    let state = createTestState(createTestSettings({ includeMinorChords: true }));
    const total = state.allChords.length;
    
    // Miss half the chords
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, i % 2 === 0);
      if (nextState) state = nextState;
    }
    
    // Run multiple times to check for shuffling
    const orderings = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const reviewState = startReviewingMissed(state);
      orderings.add(reviewState.missedChords.map(c => c.name).join(','));
    }
    
    // Should have different orderings (high probability with 7+ missed)
    expect(orderings.size).toBeGreaterThan(1);
  });
});

describe('markReviewCorrect', () => {
  function createReviewState(): TestState {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    // Miss all chords
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, false);
      if (nextState) state = nextState;
    }
    
    return startReviewingMissed(state);
  }

  it('should remove current chord from missed list', () => {
    const reviewState = createReviewState();
    const initialMissedCount = reviewState.missedChords.length;
    
    const newState = markReviewCorrect(reviewState);
    
    expect(newState).not.toBeNull();
    expect(newState!.missedChords.length).toBe(initialMissedCount - 1);
  });

  it('should transition to completed when all missed reviewed', () => {
    let state = createReviewState();
    const missedCount = state.missedChords.length;
    
    // Review all missed chords
    for (let i = 0; i < missedCount; i++) {
      const nextState = markReviewCorrect(state);
      if (nextState) state = nextState;
    }
    
    expect(state.mode).toBe('completed');
    expect(state.missedChords.length).toBe(0);
  });

  it('should return null if not in reviewing mode', () => {
    const inProgressState = createTestState(createTestSettings());
    
    const result = markReviewCorrect(inProgressState);
    expect(result).toBeNull();
  });
});

describe('restartTest', () => {
  it('should reset to in-progress mode', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    // Complete the test
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, true);
      if (nextState) state = nextState;
    }
    
    const restarted = restartTest(state);
    
    expect(restarted.mode).toBe('in-progress');
    expect(restarted.currentIndex).toBe(0);
    expect(restarted.results).toEqual([]);
    expect(restarted.missedChords).toEqual([]);
  });

  it('should keep the same chord pool', () => {
    const state = createTestState(createTestSettings());
    const originalChordNames = state.allChords.map(c => c.name).sort();
    
    const restarted = restartTest(state);
    const restartedChordNames = restarted.allChords.map(c => c.name).sort();
    
    expect(restartedChordNames).toEqual(originalChordNames);
  });

  it('should re-shuffle the chords', () => {
    const state = createTestState(createTestSettings({ includeMinorChords: true }));
    
    const orderings = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const restarted = restartTest(state);
      orderings.add(restarted.allChords.map(c => c.name).join(','));
    }
    
    expect(orderings.size).toBeGreaterThan(1);
  });
});

describe('getCurrentChord', () => {
  it('should return null for null state', () => {
    expect(getCurrentChord(null)).toBeNull();
  });

  it('should return first chord for initial state', () => {
    const state = createTestState(createTestSettings());
    const current = getCurrentChord(state);
    
    expect(current).toBe(state.allChords[0]);
  });

  it('should return current chord based on index', () => {
    let state = createTestState(createTestSettings());
    recordTestResult(state, true); // Advance to index 1
    state = { ...state, currentIndex: 2 };
    
    const current = getCurrentChord(state);
    expect(current).toBe(state.allChords[2]);
  });

  it('should return review chord when in reviewing mode', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, false);
      if (nextState) state = nextState;
    }
    
    const reviewState = startReviewingMissed(state);
    const current = getCurrentChord(reviewState);
    
    expect(current).toBe(reviewState.missedChords[0]);
  });

  it('should return null for completed state', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, true);
      if (nextState) state = nextState;
    }
    
    const current = getCurrentChord(state);
    expect(current).toBeNull();
  });
});

describe('getProgress', () => {
  it('should return zeros for null state', () => {
    expect(getProgress(null)).toEqual({ current: 0, total: 0 });
  });

  it('should return 1/total for initial state', () => {
    const state = createTestState(createTestSettings());
    const progress = getProgress(state);
    
    expect(progress.current).toBe(1);
    expect(progress.total).toBe(state.allChords.length);
  });

  it('should advance current as results are recorded', () => {
    let state = createTestState(createTestSettings());
    
    const nextState = recordTestResult(state, true);
    if (nextState) state = nextState;
    
    const progress = getProgress(state);
    expect(progress.current).toBe(2);
  });

  it('should show review progress when reviewing missed', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, false);
      if (nextState) state = nextState;
    }
    
    const reviewState = startReviewingMissed(state);
    const progress = getProgress(reviewState);
    
    expect(progress.current).toBe(1);
    expect(progress.total).toBe(total);
  });
});

describe('calculateScore', () => {
  it('should return null for null state', () => {
    expect(calculateScore(null)).toBeNull();
  });

  it('should return null for empty results', () => {
    const state = createTestState(createTestSettings());
    expect(calculateScore(state)).toBeNull();
  });

  it('should calculate 100% for all correct', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, true);
      if (nextState) state = nextState;
    }
    
    const score = calculateScore(state);
    
    expect(score).toEqual({
      correct: total,
      total,
      percentage: 100,
    });
  });

  it('should calculate 0% for all incorrect', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, false);
      if (nextState) state = nextState;
    }
    
    const score = calculateScore(state);
    
    expect(score).toEqual({
      correct: 0,
      total,
      percentage: 0,
    });
  });

  it('should calculate mixed scores correctly', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    // Alternate correct/incorrect
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, i % 2 === 0);
      if (nextState) state = nextState;
    }
    
    const score = calculateScore(state);
    const expectedCorrect = Math.ceil(total / 2);
    
    expect(score!.correct).toBe(expectedCorrect);
    expect(score!.total).toBe(total);
    expect(score!.percentage).toBe(Math.round((expectedCorrect / total) * 100));
  });
});

describe('getMissedChords', () => {
  it('should return empty array for null state', () => {
    expect(getMissedChords(null)).toEqual([]);
  });

  it('should return empty array when all correct', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, true);
      if (nextState) state = nextState;
    }
    
    expect(getMissedChords(state)).toEqual([]);
  });

  it('should return all chords when all incorrect', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    const originalChords = [...state.allChords];
    
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, false);
      if (nextState) state = nextState;
    }
    
    const missed = getMissedChords(state);
    expect(missed.length).toBe(total);
    expect(missed).toEqual(originalChords);
  });

  it('should return only incorrect chords', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    // Miss only first and third chord
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, i !== 0 && i !== 2);
      if (nextState) state = nextState;
    }
    
    const missed = getMissedChords(state);
    expect(missed.length).toBe(2);
  });
});

describe('State Machine Integration', () => {
  it('should handle full test flow: start -> answer all -> complete', () => {
    let state = createTestState(createTestSettings());
    
    expect(state.mode).toBe('in-progress');
    
    const total = state.allChords.length;
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, true);
      expect(nextState).not.toBeNull();
      state = nextState!;
    }
    
    expect(state.mode).toBe('completed');
    expect(calculateScore(state)?.percentage).toBe(100);
  });

  it('should handle full test flow with review: start -> miss some -> review -> complete', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    // Miss first 2 chords
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, i >= 2);
      if (nextState) state = nextState;
    }
    
    expect(state.mode).toBe('completed');
    expect(getMissedChords(state).length).toBe(2);
    
    // Start review
    state = startReviewingMissed(state);
    expect(state.mode).toBe('reviewing-missed');
    expect(state.missedChords.length).toBe(2);
    
    // Review both missed chords
    for (let i = 0; i < 2; i++) {
      const nextState = markReviewCorrect(state);
      if (nextState) state = nextState;
    }
    
    expect(state.mode).toBe('completed');
    expect(state.missedChords.length).toBe(0);
  });

  it('should handle restart flow', () => {
    let state = createTestState(createTestSettings());
    const total = state.allChords.length;
    
    // Complete test
    for (let i = 0; i < total; i++) {
      const nextState = recordTestResult(state, true);
      if (nextState) state = nextState;
    }
    
    expect(state.mode).toBe('completed');
    
    // Restart
    state = restartTest(state);
    
    expect(state.mode).toBe('in-progress');
    expect(state.currentIndex).toBe(0);
    expect(state.results).toEqual([]);
    expect(getCurrentChord(state)).not.toBeNull();
  });
});
