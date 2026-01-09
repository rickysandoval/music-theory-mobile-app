/**
 * Chord Test State Machine
 * 
 * Pure functions for managing chord test state transitions.
 * Extracted from useChordTest hook for testability.
 */

import { Chord, ChordGameSettings, TestChordResult, TestState } from './types';
import { generateAllChords } from './chords';

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create initial test state from settings
 */
export function createTestState(settings: ChordGameSettings): TestState {
  const allChords = generateAllChords(settings);
  
  return {
    mode: 'in-progress',
    allChords,
    currentIndex: 0,
    results: [],
    missedChords: [],
    reviewIndex: 0,
  };
}

/**
 * Record a result and advance to next chord
 * Returns null if state is invalid (not in progress)
 */
export function recordTestResult(state: TestState, wasCorrect: boolean): TestState | null {
  if (state.mode !== 'in-progress') {
    return null;
  }
  
  const currentChord = state.allChords[state.currentIndex];
  const newResults: TestChordResult[] = [
    ...state.results,
    { chord: currentChord, wasCorrect, attempts: 1 },
  ];
  
  const nextIndex = state.currentIndex + 1;
  const isFinished = nextIndex >= state.allChords.length;
  
  if (isFinished) {
    // Calculate missed chords
    const missed = newResults.filter(r => !r.wasCorrect).map(r => r.chord);
    
    return {
      ...state,
      mode: 'completed',
      results: newResults,
      missedChords: missed,
      currentIndex: nextIndex,
    };
  }
  
  return {
    ...state,
    results: newResults,
    currentIndex: nextIndex,
  };
}

/**
 * Start reviewing missed chords
 */
export function startReviewingMissed(state: TestState): TestState {
  const shuffled = shuffleArray(state.missedChords);
  
  return {
    ...state,
    mode: 'reviewing-missed',
    missedChords: shuffled,
    reviewIndex: 0,
  };
}

/**
 * Mark current review chord as correct (remove from list)
 */
export function markReviewCorrect(state: TestState): TestState | null {
  if (state.mode !== 'reviewing-missed') {
    return null;
  }
  
  // Remove current chord from missed list
  const newMissed = state.missedChords.filter((_, i) => i !== state.reviewIndex);
  
  if (newMissed.length === 0) {
    // All missed chords have been practiced successfully
    return {
      ...state,
      mode: 'completed',
      missedChords: [],
      reviewIndex: 0,
    };
  }
  
  // Move to next, or wrap around if at end
  const nextIndex = state.reviewIndex >= newMissed.length ? 0 : state.reviewIndex;
  
  return {
    ...state,
    missedChords: newMissed,
    reviewIndex: nextIndex,
  };
}

/**
 * Restart the test with re-shuffled chords
 */
export function restartTest(state: TestState): TestState {
  const shuffled = shuffleArray(state.allChords);
  
  return {
    mode: 'in-progress',
    allChords: shuffled,
    currentIndex: 0,
    results: [],
    missedChords: [],
    reviewIndex: 0,
  };
}

/**
 * Get the current chord to display
 */
export function getCurrentChord(state: TestState | null): Chord | null {
  if (!state) return null;
  
  if (state.mode === 'in-progress') {
    return state.allChords[state.currentIndex] || null;
  }
  
  if (state.mode === 'reviewing-missed') {
    return state.missedChords[state.reviewIndex] || null;
  }
  
  return null;
}

/**
 * Get progress information
 */
export function getProgress(state: TestState | null): { current: number; total: number } {
  if (!state) return { current: 0, total: 0 };
  
  if (state.mode === 'in-progress') {
    return { current: state.currentIndex + 1, total: state.allChords.length };
  }
  
  if (state.mode === 'reviewing-missed') {
    return { current: state.reviewIndex + 1, total: state.missedChords.length };
  }
  
  return { current: state.allChords.length, total: state.allChords.length };
}

/**
 * Calculate score from results
 */
export function calculateScore(state: TestState | null): { correct: number; total: number; percentage: number } | null {
  if (!state || state.results.length === 0) return null;
  
  const correct = state.results.filter(r => r.wasCorrect).length;
  const total = state.results.length;
  const percentage = Math.round((correct / total) * 100);
  
  return { correct, total, percentage };
}

/**
 * Get list of missed chords
 */
export function getMissedChords(state: TestState | null): Chord[] {
  if (!state) return [];
  return state.results.filter(r => !r.wasCorrect).map(r => r.chord);
}
