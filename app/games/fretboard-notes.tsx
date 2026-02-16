/**
 * Fretboard Notes Game Screen
 */

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { useTheme } from '@/src/components/ui';
import { FretboardGame, FretboardSettingsSheet } from '@/src/components/games';
import { useSettings } from '@/src/stores';
export default function FretboardNotesScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { settings, updateFretboardSettings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => setShowSettings(true)}
          style={({ pressed }) => [
            styles.headerButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel="Fretboard settings"
        >
          <FontAwesome name="sliders" size={18} color={theme.textSecondary} />
        </Pressable>
      ),
    });
  }, [navigation, theme.textSecondary]);

  // Allow rotation (landscape) on this screen when native module is available (dev build).
  // Expo Go does not include expo-screen-orientation — require + all calls are guarded so it never crashes.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cleanup: (() => void) | undefined;
    try {
      const ScreenOrientation = require('expo-screen-orientation');
      (async () => {
        try {
          await ScreenOrientation.unlockAsync();
        } catch {
          // Native module not available (e.g. Expo Go) or other failure
        }
      })();
      cleanup = () => {
        try {
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT).catch(() => {});
        } catch {
          // ignore
        }
      };
    } catch {
      // require() failed (e.g. package not installed) — no-op
    }
    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['bottom']}
    >
      <FretboardGame settings={settings?.fretboardGame} />
      
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
  headerButton: {
    marginRight: 16,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
