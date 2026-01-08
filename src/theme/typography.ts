/**
 * Typography scale
 * Using system fonts for performance, with fallbacks
 */

import { Platform, TextStyle } from 'react-native';

// Font families - using system fonts for better performance
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

const fontFamilyMono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  // Display - for large headers
  displayLarge: {
    fontFamily,
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    letterSpacing: -0.25,
  } as TextStyle,

  displayMedium: {
    fontFamily,
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400',
    letterSpacing: 0,
  } as TextStyle,

  displaySmall: {
    fontFamily,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: 0,
  } as TextStyle,

  // Headlines
  headlineLarge: {
    fontFamily,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    letterSpacing: 0,
  } as TextStyle,

  headlineMedium: {
    fontFamily,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    letterSpacing: 0,
  } as TextStyle,

  headlineSmall: {
    fontFamily,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: 0,
  } as TextStyle,

  // Titles
  titleLarge: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
    letterSpacing: 0,
  } as TextStyle,

  titleMedium: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.15,
  } as TextStyle,

  titleSmall: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  } as TextStyle,

  // Body text
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
  } as TextStyle,

  bodyMedium: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
  } as TextStyle,

  bodySmall: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
  } as TextStyle,

  // Labels
  labelLarge: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
  } as TextStyle,

  labelMedium: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  } as TextStyle,

  labelSmall: {
    fontFamily,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  } as TextStyle,

  // Special - for music notation
  noteLabel: {
    fontFamily: fontFamilyMono,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0,
  } as TextStyle,

  chordName: {
    fontFamily,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: 0,
  } as TextStyle,
} as const;
