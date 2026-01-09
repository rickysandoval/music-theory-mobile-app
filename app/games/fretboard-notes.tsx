/**
 * Fretboard Notes Game Screen
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/components/ui';
import { FretboardGame, FretboardSettingsSheet } from '@/src/components/games';
import { useSettings } from '@/src/stores';

export default function FretboardNotesScreen() {
  const { theme } = useTheme();
  const { settings, updateFretboardSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['bottom']}
    >
      <FretboardGame 
        onSettingsPress={() => setShowSettings(true)}
        settings={settings?.fretboardGame}
      />
      
      {settings?.fretboardGame && (
        <FretboardSettingsSheet
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings.fretboardGame}
          onSettingsChange={updateFretboardSettings}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
