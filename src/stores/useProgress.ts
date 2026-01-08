/**
 * Progress hook with persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  GameProgress, 
  getGameProgress, 
  recordChordGameResult,
  resetProgress as resetStoredProgress,
} from './storage';

export function useProgress() {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress on mount
  useEffect(() => {
    getGameProgress().then((loaded) => {
      setProgress(loaded);
      setIsLoading(false);
    });
  }, []);

  // Record a chord game result
  const recordChordResult = useCallback(async (isCorrect: boolean) => {
    const updated = await recordChordGameResult(isCorrect);
    setProgress(updated);
    return updated;
  }, []);

  // Reset all progress
  const resetProgress = useCallback(async () => {
    await resetStoredProgress();
    const fresh = await getGameProgress();
    setProgress(fresh);
  }, []);

  // Calculate stats
  const stats = progress ? {
    chordGame: {
      ...progress.chordGame,
      accuracy: progress.chordGame.totalPlayed > 0 
        ? Math.round((progress.chordGame.correctAnswers / progress.chordGame.totalPlayed) * 100)
        : 0,
    },
  } : null;

  return {
    progress,
    stats,
    isLoading,
    recordChordResult,
    resetProgress,
  };
}
