/**
 * Audio playback for musical notes
 * Uses expo-av with generated sine wave tones
 */

import { Platform } from 'react-native';
import { Audio } from 'expo-av';

// Chromatic note order (for calculating semitone distances)
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Base frequency for C4 (middle C)
const C4_FREQUENCY = 261.63;

let isAudioInitialized = false;

/**
 * Get the chromatic index of a note (0-11)
 */
function getNoteIndex(note: string): number {
  // Normalize flats to sharps for lookup
  const flatToSharp: Record<string, string> = {
    'Db': 'C#',
    'Eb': 'D#',
    'Gb': 'F#',
    'Ab': 'G#',
    'Bb': 'A#',
  };
  
  const normalized = flatToSharp[note] || note;
  return CHROMATIC_NOTES.indexOf(normalized);
}

/**
 * Calculate frequency for a note at a specific octave
 * Using equal temperament: freq = C4 * 2^((noteIndex + (octave-4)*12) / 12)
 */
function getFrequencyAtOctave(note: string, octave: number): number {
  const noteIndex = getNoteIndex(note);
  if (noteIndex === -1) return 440; // Fallback
  
  // Semitones from C4
  const semitonesFromC4 = noteIndex + (octave - 4) * 12;
  return C4_FREQUENCY * Math.pow(2, semitonesFromC4 / 12);
}

/**
 * Initialize audio mode for the app
 */
export async function initializeAudio(): Promise<void> {
  if (isAudioInitialized) return;
  
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    isAudioInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize audio:', error);
  }
}

/**
 * Generate a WAV data URI for a sine wave tone
 */
function generateToneDataUri(
  frequency: number,
  duration: number = 0.5,
  sampleRate: number = 44100,
  amplitude: number = 0.25
): string {
  const numSamples = Math.floor(sampleRate * duration);
  
  const samples = new Int16Array(numSamples);
  const isShortTransient = duration < 0.02;
  const attackTime = isShortTransient ? 0.0002 : 0.015;
  const releaseTime = isShortTransient ? duration * 0.6 : 0.08;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let envelope = 1;
    if (t < attackTime) {
      envelope = attackTime > 0 ? t / attackTime : 1;
    } else if (t > duration - releaseTime) {
      envelope = releaseTime > 0 ? Math.max(0, (duration - t) / releaseTime) : 1;
    }
    samples[i] = Math.floor(amplitude * envelope * 32767 * Math.sin(2 * Math.PI * frequency * t));
  }
  
  const wavBuffer = createWavBuffer(samples, sampleRate);
  const base64 = arrayBufferToBase64(wavBuffer);
  
  return `data:audio/wav;base64,${base64}`;
}

function createWavBuffer(samples: Int16Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const bufferSize = 44 + dataSize;
  
  const buffer = new ArrayBuffer(bufferSize);
  const view = new DataView(buffer);
  
  writeString(view, 0, 'RIFF');
  view.setUint32(4, bufferSize - 8, true);
  writeString(view, 8, 'WAVE');
  
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  for (let i = 0; i < samples.length; i++) {
    view.setInt16(44 + i * 2, samples[i], true);
  }
  
  return buffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Cache for generated sounds (keyed by frequency + duration)
const soundCache = new Map<string, Audio.Sound>();

/**
 * Play a single note
 * @param note - The note to play (e.g., 'C', 'F#', 'Bb')
 * @param duration - Duration in seconds
 * @param rootNote - Optional root note context. If provided, ensures this note plays at/above the root's pitch.
 */
export async function playNote(note: string, duration: number = 0.5, rootNote?: string): Promise<void> {
  let frequency: number;
  
  if (rootNote) {
    // Play relative to root - ensure note is at or above root pitch
    const rootIndex = getNoteIndex(rootNote);
    const noteIndex = getNoteIndex(note);
    const rootFrequency = getFrequencyAtOctave(rootNote, 4);
    
    // Calculate semitones above root (wrapping within octave)
    let semitonesAboveRoot = (noteIndex - rootIndex + 12) % 12;
    
    // If it's the same note as root, play at same pitch
    if (semitonesAboveRoot === 0) {
      frequency = rootFrequency;
    } else {
      frequency = rootFrequency * Math.pow(2, semitonesAboveRoot / 12);
    }
  } else {
    // No root context - play at octave 4
    frequency = getFrequencyAtOctave(note, 4);
  }
  
  await initializeAudio();
  
  try {
    const cacheKey = `${Math.round(frequency)}-${duration}`;
    let sound = soundCache.get(cacheKey);
    
    if (!sound) {
      const uri = generateToneDataUri(frequency, duration);
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      sound = newSound;
      soundCache.set(cacheKey, sound);
    } else {
      await sound.setPositionAsync(0);
    }
    
    await sound.playAsync();
  } catch (error) {
    console.warn('Failed to play note:', error);
  }
}

/**
 * Play a frequency directly
 */
async function playFrequency(frequency: number, duration: number): Promise<void> {
  await initializeAudio();
  
  try {
    const cacheKey = `${Math.round(frequency)}-${duration}`;
    let sound = soundCache.get(cacheKey);
    
    if (!sound) {
      const uri = generateToneDataUri(frequency, duration);
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      sound = newSound;
      soundCache.set(cacheKey, sound);
    } else {
      await sound.setPositionAsync(0);
    }
    
    await sound.playAsync();
  } catch (error) {
    console.warn('Failed to play frequency:', error);
  }
}

/** Metronome voice params: [frequency Hz, duration s]. Snare = short bright stick hit (sine). */
const METRONOME_VOICES: Record<string, [number, number]> = {
  high: [1000, 0.04],
  low: [400, 0.04],
  snare: [2200, 0.005], // short bright tick – one clear hit
  beep: [800, 0.08],
};

export type MetronomeVoice = keyof typeof METRONOME_VOICES;

/** Web: shared AudioContext for metronome (created on first user gesture) */
let webClickContext: AudioContext | null = null;

/** Accent: louder and slightly lower pitch for clear downbeat. Subdivision: quieter for "and" beats. */
function getClickParams(
  voice: MetronomeVoice,
  accent: boolean,
  subdivision: boolean
): { freq: number; dur: number; gain: number } {
  const [freq, dur] = METRONOME_VOICES[voice] ?? METRONOME_VOICES.high;
  if (subdivision) {
    return { freq, dur, gain: 0.14 };
  }
  if (accent) {
    return { freq: freq * 1.25, dur: dur * 1.2, gain: 0.52 };
  }
  return { freq, dur, gain: 0.25 };
}

function playClickWeb(voice: MetronomeVoice, accent: boolean, subdivision: boolean): void {
  if (typeof window === 'undefined') return;
  const { freq, dur, gain } = getClickParams(voice, accent, subdivision);
  const attackTime = dur < 0.02 ? 0.0002 : 0.015;
  const releaseTime = dur < 0.02 ? dur * 0.6 : 0.08;
  const Ctx = (window as typeof window & { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
    || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  if (!webClickContext) webClickContext = new Ctx();
  const ctx = webClickContext;
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(gain, ctx.currentTime + attackTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur);
}

/**
 * Play a metronome click with optional voice, accent (downbeat), and subdivision (softer "and" beat).
 * On web uses Web Audio API; on native uses expo-av with generated tone or noise (snare).
 */
export async function playMetronomeClick(
  voice: MetronomeVoice = 'high',
  accent: boolean = false,
  subdivision: boolean = false
): Promise<void> {
  if (Platform.OS === 'web') {
    playClickWeb(voice, accent, subdivision);
    return;
  }
  await initializeAudio();
  const { freq, dur, gain } = getClickParams(voice, accent, subdivision);
  try {
    const uri = generateToneDataUri(freq, dur, 44100, gain);
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    await sound.unloadAsync();
  } catch (error) {
    console.warn('Failed to play metronome click:', error);
  }
}

/**
 * Play a short metronome click (default voice, no accent).
 * Safe to call repeatedly at high BPM.
 */
export async function playClick(): Promise<void> {
  return playMetronomeClick('high', false);
}

/**
 * Play multiple notes as a chord with proper voicing
 * Root plays at octave 4, other notes play at the nearest position above the root
 */
export async function playChord(notes: string[], duration: number = 1): Promise<void> {
  if (notes.length === 0) return;
  
  await initializeAudio();
  
  // Root note plays at octave 4
  const rootNote = notes[0];
  const rootIndex = getNoteIndex(rootNote);
  const rootOctave = 4;
  const rootFrequency = getFrequencyAtOctave(rootNote, rootOctave);
  
  // Calculate frequencies for all notes
  const frequencies: number[] = [rootFrequency];
  
  for (let i = 1; i < notes.length; i++) {
    const note = notes[i];
    const noteIndex = getNoteIndex(note);
    
    // Calculate semitones above root (within the octave)
    let semitonesAboveRoot = (noteIndex - rootIndex + 12) % 12;
    
    // For chord tones, they should be within 0-11 semitones above root
    // This ensures proper root position voicing
    const frequency = rootFrequency * Math.pow(2, semitonesAboveRoot / 12);
    frequencies.push(frequency);
  }
  
  // Play all frequencies simultaneously
  await Promise.all(frequencies.map(freq => playFrequency(freq, duration)));
}

/**
 * Clean up audio resources
 */
export async function cleanupAudio(): Promise<void> {
  for (const sound of soundCache.values()) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
  soundCache.clear();
}
