/**
 * Audio module exports
 */

export { 
  initializeAudio, 
  playNote, 
  playChord, 
  playClick, 
  playMetronomeClick, 
  cleanupAudio,
  type MetronomeVoice,
} from './notePlayer';

export { 
  pitchDetector, 
  PitchDetector,
  type PitchResult 
} from './pitchDetection';

// Pure utilities (no React Native deps, easily testable)
export { 
  frequencyToNote,
  noteToFrequency,
  type FrequencyToNoteResult,
} from './frequencyUtils';
