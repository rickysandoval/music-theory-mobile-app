/**
 * Hook to manage chord test state and flow
 */

import { useState, useCallback, useMemo } from 'react';
import { Chord, TestState, TestChordResult, ChordGameSettings } from '@/src/lib/music-theory/types';
import { generateAllChords } from '@/src/lib/music-theory';

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

  const isTestActive = testState !== null && testState.mode !== 'completed';
  const isReviewingMissed = testState?.mode === 'reviewing-missed';
  const isCompleted = testState?.mode === 'completed';

  const currentChord = useMemo(() => {
    if (!testState) return null;
    
    if (testState.mode === 'in-progress') {
      return testState.allChords[testState.currentIndex] || null;
    }
    
    if (testState.mode === 'reviewing-missed') {
      return testState.missedChords[testState.reviewIndex] || null;
    }
    
    return null;
  }, [testState]);

  const progress = useMemo(() => {
    if (!testState) return { current: 0, total: 0 };
    
    if (testState.mode === 'in-progress') {
      return { current: testState.currentIndex + 1, total: testState.allChords.length };
    }
    
    if (testState.mode === 'reviewing-missed') {
      const remaining = testState.missedChords.length;
      return { current: testState.reviewIndex + 1, total: remaining };
    }
    
    return { current: testState.allChords.length, total: testState.allChords.length };
  }, [testState]);

  const score = useMemo(() => {
    if (!testState || testState.results.length === 0) return null;
    
    const correct = testState.results.filter(r => r.wasCorrect).length;
    const total = testState.results.length;
    const percentage = Math.round((correct / total) * 100);
    
    return { correct, total, percentage };
  }, [testState]);

  const missedChords = useMemo(() => {
    if (!testState) return [];
    return testState.results.filter(r => !r.wasCorrect).map(r => r.chord);
  }, [testState]);

  const startTest = useCallback((settings: ChordGameSettings) => {
    const allChords = generateAllChords(settings);
    
    setTestState({
      mode: 'in-progress',
      allChords,
      currentIndex: 0,
      results: [],
      missedChords: [],
      reviewIndex: 0,
    });
  }, []);

  const recordResult = useCallback((wasCorrect: boolean) => {
    setTestState(prev => {
      if (!prev || prev.mode !== 'in-progress') return prev;
      
      const currentChord = prev.allChords[prev.currentIndex];
      const newResults: TestChordResult[] = [
        ...prev.results,
        { chord: currentChord, wasCorrect, attempts: 1 },
      ];
      
      const nextIndex = prev.currentIndex + 1;
      const isFinished = nextIndex >= prev.allChords.length;
      
      if (isFinished) {
        // Calculate missed chords
        const missed = newResults.filter(r => !r.wasCorrect).map(r => r.chord);
        
        return {
          ...prev,
          mode: 'completed',
          results: newResults,
          missedChords: missed,
          currentIndex: nextIndex,
        };
      }
      
      return {
        ...prev,
        results: newResults,
        currentIndex: nextIndex,
      };
    });
  }, []);

  const startPracticeMissed = useCallback(() => {
    setTestState(prev => {
      if (!prev) return prev;
      
      // Shuffle missed chords
      const shuffled = [...prev.missedChords];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return {
        ...prev,
        mode: 'reviewing-missed',
        missedChords: shuffled,
        reviewIndex: 0,
      };
    });
  }, []);

  const markReviewedCorrect = useCallback(() => {
    setTestState(prev => {
      if (!prev || prev.mode !== 'reviewing-missed') return prev;
      
      // Remove current chord from missed list
      const newMissed = prev.missedChords.filter((_, i) => i !== prev.reviewIndex);
      
      if (newMissed.length === 0) {
        // All missed chords have been practiced successfully
        return {
          ...prev,
          mode: 'completed',
          missedChords: [],
          reviewIndex: 0,
        };
      }
      
      // Move to next, or wrap around if at end
      const nextIndex = prev.reviewIndex >= newMissed.length ? 0 : prev.reviewIndex;
      
      return {
        ...prev,
        missedChords: newMissed,
        reviewIndex: nextIndex,
      };
    });
  }, []);

  const restartTest = useCallback(() => {
    setTestState(prev => {
      if (!prev) return prev;
      
      // Re-shuffle the same chord set
      const shuffled = [...prev.allChords];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return {
        mode: 'in-progress',
        allChords: shuffled,
        currentIndex: 0,
        results: [],
        missedChords: [],
        reviewIndex: 0,
      };
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
