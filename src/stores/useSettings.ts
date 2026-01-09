/**
 * Settings hook with persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  GameSettings, 
  getGameSettings, 
  updateChordGameSettings,
  updateFretboardGameSettings,
} from './storage';

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    getGameSettings().then((loaded) => {
      setSettings(loaded);
      setIsLoading(false);
    });
  }, []);

  // Update chord game settings
  const updateChordSettings = useCallback(
    async (updates: Partial<GameSettings['chordGame']>) => {
      const updated = await updateChordGameSettings(updates);
      setSettings(updated);
      return updated;
    },
    []
  );

  // Update fretboard game settings
  const updateFretboardSettings = useCallback(
    async (updates: Partial<GameSettings['fretboardGame']>) => {
      const updated = await updateFretboardGameSettings(updates);
      setSettings(updated);
      return updated;
    },
    []
  );

  return {
    settings,
    isLoading,
    updateChordSettings,
    updateFretboardSettings,
  };
}
