/**
 * Music Theory Library
 * Export all utilities from a single entry point
 */

// Constants
export * from './constants';

// Types
export * from './types';

// Note utilities
export {
    areEnharmonic, findNoteOnFretboard, getCorrectSpellingForChordPosition, getEnharmonicForLetter, getEnharmonics, getInterval, getKeyboardStartKey, getNextNoteLetter, getNoteAtFret, getNoteFromIndex, getNoteIndex, getNoteLetterAtInterval, isNaturalNote, isValidNote, normalizeNote, transpose
} from './notes';

// Chord utilities
export {
    buildChordNotes, checkChordAnswer, generateAllChords, generateRandomChord, identifyChord, isNoteCorrectAtPosition, isNoteInChord, parseChordName
} from './chords';

// Game feedback utilities
export {
    determineFeedback, getFeedbackSubtitle
} from './gameFeedback';
export type { FeedbackInput, FeedbackState, FeedbackType } from './gameFeedback';

// Chord test state machine (pure functions)
export {
    calculateScore,
    createTestState,
    getCurrentChord,
    getMissedChords,
    getProgress,
    markReviewCorrect,
    recordTestResult,
    restartTest,
    shuffleArray,
    startReviewingMissed
} from './chordTestStateMachine';

