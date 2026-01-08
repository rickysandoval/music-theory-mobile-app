/**
 * Chord Spelling Game Screen
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/src/components/ui';
import { ChordSpellingGame } from '@/src/components/games';

export default function ChordSpellingScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ChordSpellingGame />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
