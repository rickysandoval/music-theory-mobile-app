/**
 * Hook to manage chord test state and flow
 * 
 * Uses pure state machine functions from chordTestStateMachine.ts
 * for testability and separation of concerns.
 */

import { useState, useCallback, useMemo } from 'react';
import { Chord, TestState, ChordGameSettings } from '@/src/lib/music-theory/types';
import {
  calculateScore,
  createTestState,
  getCurrentChord,
  getMissedChords,
  getProgress,
  markReviewCorrect,
  recordTestResult,
  restartTest as restartTestState,
  startReviewingMissed,
} from '@/src/lib/music-theory';

export interface UseChordTestReturn {
  // State
  testState: TestState | null;
  currentChord: Chord | null;
  isTestActive: boolean;
  isReviewingMissed: boolean;
  isCompleted: boolean;
  progress: { current: number; total: number };
  
  // Actions
  startTest: (settings: ChordGameSettings) => void;
  recordResult: (wasCorrect: boolean) => void;
  startPracticeMissed: () => void;
  markReviewedCorrect: () => void;
  restartTest: () => void;
  endTest: () => void;
  
  // Results
  score: { correct: number; total: number; percentage: number } | null;
  missedChords: Chord[];
}

export function useChordTest(): UseChordTestReturn {
  const [testState, setTestState] = useState<TestState | null>(null);

  // Derived state
  const isTestActive = testState !== null && testState.mode !== 'completed';
  const isReviewingMissed = testState?.mode === 'reviewing-missed';
  const isCompleted = testState?.mode === 'completed';

  // Use pure functions for derived values
  const currentChord = useMemo(() => getCurrentChord(testState), [testState]);
  const progress = useMemo(() => getProgress(testState), [testState]);
  const score = useMemo(() => calculateScore(testState), [testState]);
  const missedChords = useMemo(() => getMissedChords(testState), [testState]);

  // Actions delegate to pure state transition functions
  const startTest = useCallback((settings: ChordGameSettings) => {
    setTestState(createTestState(settings));
  }, []);

  const recordResult = useCallback((wasCorrect: boolean) => {
    setTestState(prev => {
      if (!prev) return prev;
      return recordTestResult(prev, wasCorrect) ?? prev;
    });
  }, []);

  const startPracticeMissed = useCallback(() => {
    setTestState(prev => {
      if (!prev) return prev;
      return startReviewingMissed(prev);
    });
  }, []);

  const markReviewedCorrect = useCallback(() => {
    setTestState(prev => {
      if (!prev) return prev;
      return markReviewCorrect(prev) ?? prev;
    });
  }, []);

  const restartTest = useCallback(() => {
    setTestState(prev => {
      if (!prev) return prev;
      return restartTestState(prev);
    });
  }, []);

  const endTest = useCallback(() => {
    setTestState(null);
  }, []);

  return {
    testState,
    currentChord,
    isTestActive,
    isReviewingMissed,
    isCompleted,
    progress,
    startTest,
    recordResult,
    startPracticeMissed,
    markReviewedCorrect,
    restartTest,
    endTest,
    score,
    missedChords,
  };
}
