/**
 * Reference tunings for guitar, bass, ukulele, etc.
 */

export interface TuningString {
  note: string;
  octave: number;
  label: string;
}

export interface TuningPreset {
  id: string;
  name: string;
  instrument: string;
  strings: TuningString[];
}

export const TUNING_PRESETS: TuningPreset[] = [
  {
    id: 'guitar-standard',
    name: 'Standard',
    instrument: 'Guitar',
    strings: [
      { note: 'E', octave: 2, label: '6th' },
      { note: 'A', octave: 2, label: '5th' },
      { note: 'D', octave: 3, label: '4th' },
      { note: 'G', octave: 3, label: '3rd' },
      { note: 'B', octave: 3, label: '2nd' },
      { note: 'E', octave: 4, label: '1st' },
    ],
  },
  {
    id: 'guitar-drop-d',
    name: 'Drop D',
    instrument: 'Guitar',
    strings: [
      { note: 'D', octave: 2, label: '6th' },
      { note: 'A', octave: 2, label: '5th' },
      { note: 'D', octave: 3, label: '4th' },
      { note: 'G', octave: 3, label: '3rd' },
      { note: 'B', octave: 3, label: '2nd' },
      { note: 'E', octave: 4, label: '1st' },
    ],
  },
  {
    id: 'guitar-half-step-down',
    name: 'Half step down',
    instrument: 'Guitar',
    strings: [
      { note: 'D#', octave: 2, label: '6th' },
      { note: 'G#', octave: 2, label: '5th' },
      { note: 'C#', octave: 3, label: '4th' },
      { note: 'F#', octave: 3, label: '3rd' },
      { note: 'A#', octave: 3, label: '2nd' },
      { note: 'D#', octave: 4, label: '1st' },
    ],
  },
  {
    id: 'guitar-dadgad',
    name: 'DADGAD',
    instrument: 'Guitar',
    strings: [
      { note: 'D', octave: 2, label: '6th' },
      { note: 'A', octave: 2, label: '5th' },
      { note: 'D', octave: 3, label: '4th' },
      { note: 'G', octave: 3, label: '3rd' },
      { note: 'A', octave: 3, label: '2nd' },
      { note: 'D', octave: 4, label: '1st' },
    ],
  },
  {
    id: 'bass-standard',
    name: 'Standard',
    instrument: 'Bass',
    strings: [
      { note: 'E', octave: 1, label: '4th' },
      { note: 'A', octave: 1, label: '3rd' },
      { note: 'D', octave: 2, label: '2nd' },
      { note: 'G', octave: 2, label: '1st' },
    ],
  },
  {
    id: 'bass-five',
    name: '5-string (B standard)',
    instrument: 'Bass',
    strings: [
      { note: 'B', octave: 0, label: '5th' },
      { note: 'E', octave: 1, label: '4th' },
      { note: 'A', octave: 1, label: '3rd' },
      { note: 'D', octave: 2, label: '2nd' },
      { note: 'G', octave: 2, label: '1st' },
    ],
  },
  {
    id: 'ukulele-standard',
    name: 'Standard (GCEA)',
    instrument: 'Ukulele',
    strings: [
      { note: 'G', octave: 4, label: '4th' },
      { note: 'C', octave: 4, label: '3rd' },
      { note: 'E', octave: 4, label: '2nd' },
      { note: 'A', octave: 4, label: '1st' },
    ],
  },
  {
    id: 'ukulele-low-g',
    name: 'Low G',
    instrument: 'Ukulele',
    strings: [
      { note: 'G', octave: 3, label: '4th' },
      { note: 'C', octave: 4, label: '3rd' },
      { note: 'E', octave: 4, label: '2nd' },
      { note: 'A', octave: 4, label: '1st' },
    ],
  },
  {
    id: 'ukulele-baritone',
    name: 'Baritone (DGBE)',
    instrument: 'Ukulele',
    strings: [
      { note: 'D', octave: 3, label: '4th' },
      { note: 'G', octave: 3, label: '3rd' },
      { note: 'B', octave: 3, label: '2nd' },
      { note: 'E', octave: 4, label: '1st' },
    ],
  },
];

export function getTuningById(id: string): TuningPreset | undefined {
  return TUNING_PRESETS.find((t) => t.id === id);
}

export function getTuningsByInstrument(instrument: string): TuningPreset[] {
  return TUNING_PRESETS.filter((t) => t.instrument === instrument);
}

export const INSTRUMENTS = ['Guitar', 'Bass', 'Ukulele'] as const;
