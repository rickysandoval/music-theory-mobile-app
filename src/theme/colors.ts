/**
 * Color palette for Music Theory App
 * Inspired by vintage music equipment and warm analog tones
 */

export const colors = {
  // Primary palette - warm amber/gold tones
  primary: {
    50: '#FFF8E6',
    100: '#FFEFC2',
    200: '#FFE299',
    300: '#FFD166',
    400: '#FFC233',
    500: '#FFB000', // Main primary
    600: '#E69E00',
    700: '#B37B00',
    800: '#805800',
    900: '#4D3500',
  },

  // Secondary palette - deep teal for contrast
  secondary: {
    50: '#E6F7F7',
    100: '#C2EBEB',
    200: '#99DEDE',
    300: '#66CECE',
    400: '#33BFBF',
    500: '#00A3A3', // Main secondary
    600: '#008F8F',
    700: '#006F6F',
    800: '#004F4F',
    900: '#003030',
  },

  // Neutral palette - warm grays
  neutral: {
    50: '#FAFAF8',
    100: '#F5F5F2',
    200: '#E8E8E4',
    300: '#D4D4CE',
    400: '#A3A39A',
    500: '#737369',
    600: '#52524A',
    700: '#3D3D37',
    800: '#292925',
    900: '#1A1A17',
    950: '#0D0D0B',
  },

  // Semantic colors
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#047857',
  },

  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#B91C1C',
  },

  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#B45309',
  },

  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1D4ED8',
  },

  // Special colors for music elements
  music: {
    piano: {
      whiteKey: '#FEFEFE',
      whiteKeyPressed: '#E8E8E4',
      blackKey: '#1A1A17',
      blackKeyPressed: '#3D3D37',
    },
    fretboard: {
      wood: '#8B5A2B',
      fret: '#C0C0C0',
      string: '#D4AF37',
      marker: '#F5F5F2',
    },
    notes: {
      correct: '#10B981',
      incorrect: '#EF4444',
      neutral: '#737369',
      highlight: '#FFB000',
    },
  },
} as const;

// Theme type definition
export interface Theme {
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;
}

// Light theme
export const lightTheme: Theme = {
  background: colors.neutral[50],
  surface: '#FFFFFF',
  surfaceVariant: colors.neutral[100],
  text: colors.neutral[900],
  textSecondary: colors.neutral[600],
  textMuted: colors.neutral[400],
  border: colors.neutral[200],
  primary: colors.primary[500],
  primaryText: colors.neutral[900],
  secondary: colors.secondary[500],
  secondaryText: '#FFFFFF',
};

// Dark theme
export const darkTheme: Theme = {
  background: colors.neutral[950],
  surface: colors.neutral[900],
  surfaceVariant: colors.neutral[800],
  text: colors.neutral[50],
  textSecondary: colors.neutral[300],
  textMuted: colors.neutral[500],
  border: colors.neutral[700],
  primary: colors.primary[400],
  primaryText: colors.neutral[900],
  secondary: colors.secondary[400],
  secondaryText: colors.neutral[900],
};
