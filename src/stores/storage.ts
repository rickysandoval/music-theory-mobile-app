/**
 * AsyncStorage wrapper with type safety
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  GAME_SETTINGS: '@music_theory_game_settings',
  GAME_PROGRESS: '@music_theory_game_progress',
  THEME: '@music_theory_theme',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Generic storage helpers
 */
export async function getItem<T>(key: StorageKey): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS[key]);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return null;
  }
}

export async function setItem<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS[key], JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
  }
}

export async function removeItem(key: StorageKey): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
}

/**
 * Game Settings
 */
export interface GameSettings {
  chordGame: {
    includeDiatonicRoots: boolean;  // Natural notes (C, D, E, F, G, A, B)
    includeAccidentalRoots: boolean; // Sharps & flats
    includeMajorChords: boolean;
    includeMinorChords: boolean;
  };
  fretboardGame: {
    gameMode: 'identify' | 'find' | 'listen';  // identify = name the note, find = tap the position, listen = play on guitar
    includeNaturalNotes: boolean;
    includeAccidentals: boolean;
    strings: boolean[];             // [E, A, D, G, B, E] low to high
    minFret: number;
    maxFret: number;
    useFlats: boolean;
    showOpenStringNotes: boolean;   // Show note names at the nut
  };
}

const DEFAULT_GAME_SETTINGS: GameSettings = {
  chordGame: {
    includeDiatonicRoots: true,
    includeAccidentalRoots: true,
    includeMajorChords: true,
    includeMinorChords: true,
  },
  fretboardGame: {
    gameMode: 'identify',
    includeNaturalNotes: true,
    includeAccidentals: true,
    strings: [true, true, true, true, true, true], // All strings enabled
    minFret: 0,
    maxFret: 5,
    useFlats: false,
    showOpenStringNotes: true,
    autoAdvanceOnCorrect: true, // Auto-advance in listen mode
    listenSensitivity: 'medium', // Microphone sensitivity
  },
};

export async function getGameSettings(): Promise<GameSettings> {
  const settings = await getItem<GameSettings>('GAME_SETTINGS');
  
  if (!settings) {
    return DEFAULT_GAME_SETTINGS;
  }
  
  let needsSave = false;
  let migratedSettings = { ...settings };
  
  // Migrate old chord game settings format
  const chordGame = settings.chordGame as any;
  if (chordGame.includeDiatonicRoots === undefined) {
    // Old format had: includeSharpsFlatRoots, includeMinorChords
    migratedSettings.chordGame = {
      includeDiatonicRoots: true,
      includeAccidentalRoots: chordGame.includeSharpsFlatRoots ?? true,
      includeMajorChords: true,
      includeMinorChords: chordGame.includeMinorChords ?? true,
    };
    needsSave = true;
  }
  
  // Add fretboard game settings if missing
  if (!settings.fretboardGame) {
    migratedSettings.fretboardGame = DEFAULT_GAME_SETTINGS.fretboardGame;
    needsSave = true;
  } else {
    // Migrate new fretboard settings fields
    const fretboardGame = settings.fretboardGame as any;
    let fretboardNeedsMigration = false;
    let migratedFretboard = { ...fretboardGame };
    
    if (fretboardGame.showOpenStringNotes === undefined) {
      migratedFretboard.showOpenStringNotes = DEFAULT_GAME_SETTINGS.fretboardGame.showOpenStringNotes;
      fretboardNeedsMigration = true;
    }
    if (fretboardGame.autoAdvanceOnCorrect === undefined) {
      migratedFretboard.autoAdvanceOnCorrect = DEFAULT_GAME_SETTINGS.fretboardGame.autoAdvanceOnCorrect;
      fretboardNeedsMigration = true;
    }
    if (fretboardGame.listenSensitivity === undefined) {
      migratedFretboard.listenSensitivity = DEFAULT_GAME_SETTINGS.fretboardGame.listenSensitivity;
      fretboardNeedsMigration = true;
    }
    
    if (fretboardNeedsMigration) {
      migratedSettings.fretboardGame = migratedFretboard;
      needsSave = true;
    }
  }
  
  if (needsSave) {
    await saveGameSettings(migratedSettings);
  }
  
  return migratedSettings;
}

export async function saveGameSettings(settings: GameSettings): Promise<void> {
  await setItem('GAME_SETTINGS', settings);
}

export async function updateChordGameSettings(
  updates: Partial<GameSettings['chordGame']>
): Promise<GameSettings> {
  const current = await getGameSettings();
  const updated = {
    ...current,
    chordGame: {
      ...current.chordGame,
      ...updates,
    },
  };
  await saveGameSettings(updated);
  return updated;
}

export async function updateFretboardGameSettings(
  updates: Partial<GameSettings['fretboardGame']>
): Promise<GameSettings> {
  const current = await getGameSettings();
  const updated = {
    ...current,
    fretboardGame: {
      ...current.fretboardGame,
      ...updates,
    },
  };
  await saveGameSettings(updated);
  return updated;
}

/**
 * Game Progress
 */
export interface GameProgress {
  chordGame: {
    totalPlayed: number;
    correctAnswers: number;
    lastPlayed: string | null;
  };
  // Add more game progress as we add games
}

const DEFAULT_GAME_PROGRESS: GameProgress = {
  chordGame: {
    totalPlayed: 0,
    correctAnswers: 0,
    lastPlayed: null,
  },
};

export async function getGameProgress(): Promise<GameProgress> {
  const progress = await getItem<GameProgress>('GAME_PROGRESS');
  return progress ?? DEFAULT_GAME_PROGRESS;
}

export async function saveGameProgress(progress: GameProgress): Promise<void> {
  await setItem('GAME_PROGRESS', progress);
}

export async function recordChordGameResult(isCorrect: boolean): Promise<GameProgress> {
  const current = await getGameProgress();
  const updated = {
    ...current,
    chordGame: {
      totalPlayed: current.chordGame.totalPlayed + 1,
      correctAnswers: current.chordGame.correctAnswers + (isCorrect ? 1 : 0),
      lastPlayed: new Date().toISOString(),
    },
  };
  await saveGameProgress(updated);
  return updated;
}

export async function resetProgress(): Promise<void> {
  await setItem('GAME_PROGRESS', DEFAULT_GAME_PROGRESS);
}
