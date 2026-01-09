/**
 * Pitch Detection Module
 * Uses Web Audio API for web and react-native-pitchy for mobile
 */

import { Platform, PermissionsAndroid } from 'react-native';
import Pitchfinder from 'pitchfinder';
import { frequencyToNote } from './frequencyUtils';

// Re-export for backwards compatibility
export { frequencyToNote } from './frequencyUtils';

export interface PitchResult {
  frequency: number | null;
  note: string | null;
  noteWithOctave: string | null;
  cents: number; // How many cents off from perfect pitch
  confidence: number; // 0-1 confidence level
}

/**
 * Pitch detector class for real-time audio analysis
 * Supports both web (Web Audio API) and mobile (react-native-pitchy)
 */
export class PitchDetector {
  // Web-specific properties
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private dataArray: Float32Array | null = null;
  private animationFrameId: number | null = null;
  
  // Mobile-specific properties
  private mobileSubscription: any = null;
  
  // Shared properties
  private detectPitch: ReturnType<typeof Pitchfinder.YIN>;
  private isListening = false;
  private onPitchDetected: ((result: PitchResult) => void) | null = null;
  private useFlats: boolean = false;
  private loopCount = 0;
  private lastLogTime = 0;
  private sampleRate = 44100;
  
  constructor() {
    // YIN algorithm is good for monophonic instruments like guitar
    this.detectPitch = Pitchfinder.YIN({ sampleRate: this.sampleRate });
  }

  /**
   * Check if running on web
   */
  private get isWeb(): boolean {
    return Platform.OS === 'web';
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    console.log('[PitchDetector] Requesting permissions... Platform:', Platform.OS);
    
    if (this.isWeb) {
      return this.requestWebPermissions();
    } else {
      return this.requestMobilePermissions();
    }
  }

  private async requestWebPermissions(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      console.error('[PitchDetector] MediaDevices API not available');
      return false;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      console.log('[PitchDetector] Web permissions granted');
      return true;
    } catch (error) {
      console.error('[PitchDetector] Error requesting web audio permissions:', error);
      return false;
    }
  }

  private async requestMobilePermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        console.log('[PitchDetector] Requesting Android RECORD_AUDIO permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to detect notes played on your guitar.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log('[PitchDetector] Android permission result:', granted, 'isGranted:', isGranted);
        return isGranted;
      } else {
        // iOS permissions are handled by react-native-pitchy or expo-audio
        console.log('[PitchDetector] iOS - permissions handled by native module');
        return true;
      }
    } catch (error) {
      console.error('[PitchDetector] Error requesting mobile audio permissions:', error);
      return false;
    }
  }

  // Sensitivity to minVolume (dB) mapping
  // Lower dB = more sensitive, higher dB = less sensitive (requires louder sound)
  // Note: 0 dB = max signal, -10 dB = loud, -20 dB = moderate, -40 dB = quiet
  private sensitivityToMinVolume(sensitivity: 'low' | 'medium' | 'high'): number {
    switch (sensitivity) {
      case 'high': return -35; // Moderate sensitivity
      case 'medium': return -20; // Requires clear notes
      case 'low': return -10; // Requires loud, very clear notes
      default: return -20;
    }
  }

  // How many consecutive same-note detections required before accepting
  // Higher = more noise filtering but slightly slower response
  private getMinConsecutive(): number {
    switch (this.currentSensitivity) {
      case 'high': return 2; // Quick response, some noise possible
      case 'medium': return 3; // Balanced
      case 'low': return 5; // Very strict, filters most noise
      default: return 3;
    }
  }

  private currentSensitivity: 'low' | 'medium' | 'high' = 'medium';

  /**
   * Start listening for pitch in real-time
   */
  async startListening(
    onPitchDetected: (result: PitchResult) => void,
    useFlats = false,
    sensitivity: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<boolean> {
    console.log('[PitchDetector] startListening called, isListening:', this.isListening, 'Platform:', Platform.OS, 'sensitivity:', sensitivity);
    
    if (this.isListening) {
      console.log('[PitchDetector] Already listening, returning true');
      return true;
    }

    this.onPitchDetected = onPitchDetected;
    this.useFlats = useFlats;
    this.currentSensitivity = sensitivity;

    if (this.isWeb) {
      return this.startWebListening();
    } else {
      return this.startMobileListening();
    }
  }

  /**
   * Web implementation using Web Audio API
   */
  private async startWebListening(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.error('[PitchDetector] Web Audio API not available');
      return false;
    }

    try {
      console.log('[PitchDetector] Getting microphone access (web)...');
      
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });
      
      const audioTracks = this.mediaStream.getAudioTracks();
      console.log('[PitchDetector] Audio tracks:', audioTracks.length);
      audioTracks.forEach((track, i) => {
        console.log(`[PitchDetector] Track ${i}:`, {
          kind: track.kind,
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
        });
        track.enabled = true;
      });
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      console.log('[PitchDetector] Created AudioContext, state:', this.audioContext.state);
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('[PitchDetector] AudioContext resumed');
      }
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0;
      
      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.sourceNode.connect(this.analyser);
      
      const silentGain = this.audioContext.createGain();
      silentGain.gain.value = 0;
      this.sourceNode.connect(silentGain);
      silentGain.connect(this.audioContext.destination);
      
      this.dataArray = new Float32Array(this.analyser.fftSize);
      this.sampleRate = this.audioContext.sampleRate;
      this.detectPitch = Pitchfinder.YIN({ sampleRate: this.sampleRate });
      
      this.isListening = true;
      this.loopCount = 0;
      this.lastLogTime = 0;
      
      this.analyzeLoopWeb();
      
      console.log('[PitchDetector] Web pitch detection started');
      return true;
    } catch (error) {
      console.error('[PitchDetector] Error starting web pitch detection:', error);
      this.cleanup();
      return false;
    }
  }

  /**
   * Mobile implementation using react-native-pitchy
   */
  private async startMobileListening(): Promise<boolean> {
    try {
      console.log('[PitchDetector] Starting mobile listening with react-native-pitchy...');
      
      // Request permissions first
      const hasPermission = await this.requestMobilePermissions();
      if (!hasPermission) {
        console.error('[PitchDetector] Microphone permission not granted');
        return false;
      }
      
      console.log('[PitchDetector] Permission granted, waiting a moment for system to be ready...');
      
      // Small delay to ensure Android audio system is ready after permission grant
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dynamic import to avoid issues on web
      const Pitchy = await import('react-native-pitchy');
      
      console.log('[PitchDetector] Pitchy imported, initializing...');
      
      // Get minVolume based on sensitivity setting
      const minVolume = this.sensitivityToMinVolume(this.currentSensitivity);
      console.log('==============================================');
      console.log('[PitchDetector] SENSITIVITY CONFIG:');
      console.log('[PitchDetector]   currentSensitivity:', this.currentSensitivity);
      console.log('[PitchDetector]   minVolume (dB):', minVolume);
      console.log('[PitchDetector]   bufferSize:', 4096);
      console.log('==============================================');
      
      // Initialize with config - use smaller buffer for better responsiveness
      const config = {
        bufferSize: 4096,
        minVolume: minVolume, // dB threshold based on sensitivity
      };
      console.log('[PitchDetector] Calling Pitchy.init with config:', JSON.stringify(config));
      
      try {
        Pitchy.default.init(config);
        console.log('[PitchDetector] Pitchy.init() succeeded with config');
      } catch (initError) {
        console.error('[PitchDetector] Pitchy.init() failed:', initError);
        // Try with default config
        console.log('[PitchDetector] Trying with default config...');
        Pitchy.default.init();
      }
      
      console.log('[PitchDetector] Pitchy initialized, adding listener...');
      
      // Add listener for pitch events with noise filtering
      let pitchCount = 0;
      let lastDetectedNote: string | null = null;
      let consecutiveCount = 0;
      const MIN_CONSECUTIVE = this.getMinConsecutive(); // Require multiple detections
      const MIN_FREQ = 80; // Below low E string (82 Hz) - filters rumble noise
      const MAX_FREQ = 1500; // Above practical guitar range
      
      console.log('[PitchDetector] Noise filter settings: MIN_FREQ=' + MIN_FREQ + ', MIN_CONSECUTIVE=' + MIN_CONSECUTIVE);
      
      this.mobileSubscription = Pitchy.default.addListener((data: { pitch: number; volume?: number }) => {
        pitchCount++;
        
        // Log every pitch event to see what's coming through
        if (pitchCount <= 10 || pitchCount % 100 === 0) {
          console.log('[PitchDetector] RAW pitch event #' + pitchCount + ':', JSON.stringify(data));
        }
        
        // Filter by frequency range (guitar range)
        if (data.pitch > 0 && data.pitch >= MIN_FREQ && data.pitch <= MAX_FREQ) {
          const { note, octave, cents } = frequencyToNote(data.pitch, this.useFlats);
          const noteWithOctave = `${note}${octave}`;
          
          // Check for consecutive same-note detections (filters sporadic noise)
          if (noteWithOctave === lastDetectedNote) {
            consecutiveCount++;
          } else {
            lastDetectedNote = noteWithOctave;
            consecutiveCount = 1;
          }
          
          // Only accept if we've seen this note multiple times in a row
          if (consecutiveCount >= MIN_CONSECUTIVE) {
            const result: PitchResult = {
              frequency: data.pitch,
              note,
              noteWithOctave,
              cents,
              confidence: 0.8,
            };
            
            console.log('[PitchDetector] ACCEPTED pitch:', noteWithOctave, 'at', data.pitch.toFixed(1), 'Hz', '(consecutive:', consecutiveCount + ')');
            
            if (this.onPitchDetected) {
              this.onPitchDetected(result);
            }
            
            // Reset after accepting to avoid rapid-fire triggers
            consecutiveCount = 0;
            lastDetectedNote = null;
          } else {
            // Log rejected due to not enough consecutive
            if (pitchCount <= 20) {
              console.log('[PitchDetector] PENDING:', noteWithOctave, 'consecutive:', consecutiveCount, '/', MIN_CONSECUTIVE);
            }
          }
        } else if (data.pitch > 0 && pitchCount <= 20) {
          // Log rejected due to frequency
          console.log('[PitchDetector] REJECTED (freq):', data.pitch.toFixed(1), 'Hz - outside', MIN_FREQ + '-' + MAX_FREQ);
        }
      });
      
      console.log('[PitchDetector] Listener added, starting pitch detection...');
      
      // Start pitch detection
      await Pitchy.default.start();
      
      this.isListening = true;
      console.log('[PitchDetector] Mobile pitch detection started successfully!');
      return true;
    } catch (error) {
      console.error('[PitchDetector] Error starting mobile pitch detection:', error);
      console.error('[PitchDetector] Full error:', JSON.stringify(error, null, 2));
      this.cleanup();
      return false;
    }
  }

  // RMS threshold based on sensitivity (for web)
  // Higher value = requires louder sound
  private getRmsThreshold(): number {
    switch (this.currentSensitivity) {
      case 'high': return 0.02; // Moderate sensitivity
      case 'medium': return 0.08; // Requires clear notes
      case 'low': return 0.15; // Requires loud, clear notes
      default: return 0.08;
    }
  }

  /**
   * Web analysis loop using requestAnimationFrame
   */
  private analyzeLoopWeb = (): void => {
    if (!this.isListening || !this.analyser || !this.dataArray) {
      return;
    }
    
    this.loopCount++;
    const now = Date.now();
    
    if (now - this.lastLogTime > 1000) {
      console.log('[PitchDetector] Web analysis loop running, iterations:', this.loopCount);
      this.lastLogTime = now;
    }
    
    // @ts-ignore
    this.analyser.getFloatTimeDomainData(this.dataArray);
    
    const rms = this.calculateRMS(this.dataArray);
    const rmsThreshold = this.getRmsThreshold();
    
    if (now - this.lastLogTime < 50) {
      console.log('[PitchDetector] RMS level:', rms.toFixed(4), 'threshold:', rmsThreshold);
    }
    
    if (rms > rmsThreshold) {
      const frequency = this.detectPitch(this.dataArray as any);
      
      if (frequency && frequency > 60 && frequency < 1500) {
        const { note, octave, cents } = frequencyToNote(frequency, this.useFlats);
        
        const result: PitchResult = {
          frequency,
          note,
          noteWithOctave: `${note}${octave}`,
          cents,
          confidence: 0.8 + (0.2 * Math.min(rms * 10, 1)),
        };
        
        console.log('[PitchDetector] Detected:', note, octave, 'at', frequency.toFixed(1), 'Hz');
        
        if (this.onPitchDetected) {
          this.onPitchDetected(result);
        }
      }
    }
    
    this.animationFrameId = requestAnimationFrame(this.analyzeLoopWeb);
  };

  /**
   * Stop listening for pitch
   */
  async stopListening(): Promise<void> {
    console.log('[PitchDetector] stopListening called, isListening:', this.isListening);
    this.isListening = false;
    this.onPitchDetected = null;
    
    if (this.isWeb) {
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    } else {
      // Stop mobile pitch detection
      if (this.mobileSubscription) {
        this.mobileSubscription.remove();
        this.mobileSubscription = null;
      }
      
      try {
        const Pitchy = await import('react-native-pitchy');
        await Pitchy.default.stop();
      } catch (error) {
        console.error('[PitchDetector] Error stopping mobile pitch detection:', error);
      }
    }
    
    this.cleanup();
    console.log('[PitchDetector] Stopped and cleaned up');
  }

  /**
   * Clean up audio resources
   */
  private cleanup(): void {
    // Web cleanup
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.dataArray = null;
  }

  /**
   * Calculate RMS (root mean square) of audio signal
   */
  private calculateRMS(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Check if currently listening
   */
  get listening(): boolean {
    return this.isListening;
  }

  /**
   * Check if pitch detection is supported on current platform
   */
  static isSupported(): boolean {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' && 
             typeof navigator !== 'undefined' && 
             !!navigator.mediaDevices;
    }
    // Mobile is supported via react-native-pitchy (requires dev build)
    return true;
  }

  /**
   * Check if we're in Expo Go (where native modules won't work)
   */
  static isExpoGo(): boolean {
    // @ts-ignore - Constants might not be typed
    try {
      const Constants = require('expo-constants').default;
      return Constants.appOwnership === 'expo';
    } catch {
      return false;
    }
  }

  /**
   * Check if mobile pitch detection requires a development build
   */
  static requiresDevBuild(): boolean {
    return Platform.OS !== 'web';
  }
}

// Singleton instance
export const pitchDetector = new PitchDetector();
