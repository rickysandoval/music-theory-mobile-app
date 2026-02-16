/**
 * Metronome Tool
 * Steady click at configurable BPM
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Text, useTheme } from '@/src/components/ui';
import { playMetronomeClick } from '@/src/lib/audio';
import { MetronomeSettingsSheet } from '@/src/components/tools/MetronomeSettingsSheet';
import {
  getMetronomeBpm,
  setMetronomeBpm,
  getMetronomeSettings,
  setMetronomeSettings,
  type MetronomeSettings,
} from '@/src/stores';
import { borderRadius, colors, spacing } from '@/src/theme';

const MIN_BPM = 40;
const MAX_BPM = 240;
const DEFAULT_BPM = 90;
/** Left column: -1 (top), -5 (middle), -10 (bottom). Right: +1, +5, +10. */
const SIDE_STEPS = [1, 5, 10] as const;

function clampBpm(n: number): number {
  return Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(n)));
}

const DEFAULT_METRONOME_SETTINGS: MetronomeSettings = {
  voice: 'high',
  timeSignature: 4,
  accentFirstBeat: true,
  subdivision: 'quarter',
};

export default function MetronomeScreen() {
  const { theme, isDark } = useTheme();
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [settings, setSettings] = useState<MetronomeSettings>(DEFAULT_METRONOME_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditingBpm, setIsEditingBpm] = useState(false);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTapRef = useRef<number>(0);
  const bpmRef = useRef(bpm);
  const settingsRef = useRef(settings);
  const beatRef = useRef(1);
  bpmRef.current = bpm;
  settingsRef.current = settings;

  // Load persisted BPM and settings on mount
  useEffect(() => {
    let mounted = true;
    Promise.all([getMetronomeBpm(), getMetronomeSettings()]).then(([savedBpm, savedSettings]) => {
      if (mounted) {
        setBpm(savedBpm);
        setSettings(savedSettings);
      }
    });
    return () => { mounted = false; };
  }, []);

  // Persist BPM when it changes (debounce slightly to avoid writes on every +/−)
  const saveBpmRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveBpmRef.current) clearTimeout(saveBpmRef.current);
    saveBpmRef.current = setTimeout(() => {
      setMetronomeBpm(bpm);
      saveBpmRef.current = null;
    }, 300);
    return () => {
      if (saveBpmRef.current) clearTimeout(saveBpmRef.current);
    };
  }, [bpm]);

  const scheduleNext = useCallback(() => {
    if (timeoutRef.current != null) return;
    const s = settingsRef.current;
    const ms = Math.round(60000 / bpmRef.current);
    const halfMs = Math.round(ms / 2);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      const beat = beatRef.current;
      const accent = s.accentFirstBeat && beat === 1;
      playMetronomeClick(s.voice, accent, false);
      if (s.subdivision === 'eighth') {
        subTimeoutRef.current = setTimeout(() => {
          subTimeoutRef.current = null;
          playMetronomeClick(s.voice, false, true);
        }, halfMs);
      }
      beatRef.current = beat >= s.timeSignature ? 1 : beat + 1;
      if (bpmRef.current > 0) scheduleNext();
    }, ms);
  }, []);

  const startMetronome = useCallback(() => {
    if (timeoutRef.current != null) return;
    beatRef.current = 1;
    const s = settingsRef.current;
    playMetronomeClick(s.voice, s.accentFirstBeat);
    beatRef.current = s.timeSignature > 1 ? 2 : 1;
    scheduleNext();
    setIsRunning(true);
  }, [scheduleNext]);

  const stopMetronome = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (subTimeoutRef.current != null) {
      clearTimeout(subTimeoutRef.current);
      subTimeoutRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      if (subTimeoutRef.current != null) clearTimeout(subTimeoutRef.current);
    };
  }, []);

  const handleSettingsChange = useCallback((updates: Partial<MetronomeSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      setMetronomeSettings(next);
      return next;
    });
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const commitEdit = useCallback(() => {
    const parsed = parseInt(editInputValue, 10);
    const next = Number.isNaN(parsed) ? bpm : clampBpm(parsed);
    setBpm(next);
    setEditInputValue('');
    setIsEditingBpm(false);
    setMetronomeBpm(next);
    if (Platform.OS === 'web') {
      inputRef.current?.blur();
    } else {
      Keyboard.dismiss();
    }
  }, [editInputValue, bpm]);

  const openEdit = useCallback(() => {
    if (isRunning) return;
    setEditInputValue(String(bpm));
    setIsEditingBpm(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [bpm, isRunning]);

  const handleBpmPress = useCallback(() => {
    if (Platform.OS !== 'web') return; // mobile: edit only via long-press
    const now = Date.now();
    if (now - lastTapRef.current < 500) {
      lastTapRef.current = 0;
      openEdit();
    } else {
      lastTapRef.current = now;
    }
  }, [openEdit]);

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const key = e.nativeEvent.key;
      if (key === 'Enter' || key === 'Tab') {
        commitEdit();
        return;
      }
      // Web: number input arrows change by 1
      if (key === 'ArrowUp') {
        const parsed = parseInt(editInputValue, 10);
        const current = Number.isNaN(parsed) ? bpm : parsed;
        setEditInputValue(String(clampBpm(current + 1)));
      } else if (key === 'ArrowDown') {
        const parsed = parseInt(editInputValue, 10);
        const current = Number.isNaN(parsed) ? bpm : parsed;
        setEditInputValue(String(clampBpm(current - 1)));
      }
    },
    [commitEdit, editInputValue, bpm]
  );

  const adjustBpm = (delta: number) => {
    setBpm((prev) => clampBpm(prev + delta));
  };

  const buttonBg = isDark ? colors.neutral[800] : colors.neutral[100];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['bottom']}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={() => setShowSettings(true)}
          style={({ pressed }) => [
            styles.settingsButton,
            { backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100] },
            pressed && { opacity: 0.8 },
          ]}
        >
          <FontAwesome name="cog" size={22} color={theme.textSecondary} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <Text variant="bodyMedium" color="secondary" style={styles.subtitle}>
          Steady beat at your chosen tempo
        </Text>

        <Card variant="outlined" style={styles.bpmCard}>
          <View style={styles.bpmRow}>
            <View style={styles.sideButtons}>
              {SIDE_STEPS.map((step) => (
                <Pressable
                  key={step}
                  onPress={() => adjustBpm(-step)}
                  style={({ pressed }) => [
                    step === 5 ? styles.bpmButtonLarge : styles.bpmButtonSmall,
                    { backgroundColor: buttonBg },
                    pressed && styles.bpmButtonPressed,
                  ]}
                >
                  <Text variant={step === 5 ? 'labelLarge' : 'labelSmall'} style={{ color: theme.text, marginRight: spacing[1] }}>
                    {step}
                  </Text>
                  <FontAwesome name="minus" size={step === 5 ? 22 : 16} color={theme.text} />
                </Pressable>
              ))}
            </View>
            <View style={styles.bpmDisplay}>
              {isEditingBpm ? (
                <TextInput
                  ref={inputRef}
                  value={editInputValue}
                  onChangeText={setEditInputValue}
                  onBlur={commitEdit}
                  onSubmitEditing={commitEdit}
                  onKeyPress={handleKeyPress}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  style={[
                    styles.bpmInput,
                    {
                      color: colors.primary[500],
                      borderColor: isDark ? colors.neutral[600] : colors.neutral[300],
                    },
                  ]}
                  maxLength={3}
                  accessibilityLabel="BPM value"
                />
              ) : (
                <Pressable
                  onPress={handleBpmPress}
                  onLongPress={openEdit}
                  delayLongPress={400}
                  style={[styles.bpmValueTouchable, Platform.OS === 'web' && styles.bpmValueNoSelect]}
                >
                  <Text variant="displaySmall" style={styles.bpmValue} selectable={false}>
                    {bpm}
                  </Text>
                </Pressable>
              )}
              <Text variant="labelLarge" color="secondary">
                BPM
              </Text>
            </View>
            <View style={styles.sideButtons}>
              {SIDE_STEPS.map((step) => (
                <Pressable
                  key={step}
                  onPress={() => adjustBpm(step)}
                  style={({ pressed }) => [
                    step === 5 ? styles.bpmButtonLarge : styles.bpmButtonSmall,
                    { backgroundColor: buttonBg },
                    pressed && styles.bpmButtonPressed,
                  ]}
                >
                  <FontAwesome name="plus" size={step === 5 ? 22 : 16} color={theme.text} />
                  <Text variant={step === 5 ? 'labelLarge' : 'labelSmall'} style={{ color: theme.text, marginLeft: spacing[1] }}>
                    {step}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        <View style={styles.controlRow}>
          <Button
            variant={isRunning ? 'secondary' : 'primary'}
            size="lg"
            onPress={isRunning ? stopMetronome : startMetronome}
            style={styles.mainButton}
          >
            {isRunning ? 'Stop' : 'Start'}
          </Button>
        </View>
      </View>

      <MetronomeSettingsSheet
        visible={showSettings}
        onClose={handleCloseSettings}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
  headerSpacer: { flex: 1 },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: { flex: 1, padding: spacing[4] },
  subtitle: { textAlign: 'center', marginBottom: spacing[6] },
  bpmCard: { padding: spacing[6], marginBottom: spacing[6] },
  bpmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideButtons: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  bpmButtonLarge: {
    flexDirection: 'row',
    paddingHorizontal: spacing[3],
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmButtonSmall: {
    flexDirection: 'row',
    paddingHorizontal: spacing[2],
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bpmButtonPressed: { opacity: 0.8 },
  bpmDisplay: { alignItems: 'center', minWidth: 80 },
  bpmValueTouchable: { alignItems: 'center' },
  bpmValueNoSelect: { userSelect: 'none' },
  bpmValue: { color: colors.primary[500], fontSize: 48 },
  bpmInput: {
    fontSize: 48,
    fontWeight: '700',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderWidth: 2,
    borderRadius: borderRadius.md,
    minWidth: 100,
    maxWidth: 200,
    textAlign: 'center',
  },
  controlRow: { alignItems: 'center' },
  mainButton: { minWidth: 160 },
});
