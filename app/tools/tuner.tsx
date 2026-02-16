/**
 * Tuner Tool
 * Real-time pitch detection for tuning instruments
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Button, Card, useTheme } from '@/src/components/ui';
import { pitchDetector } from '@/src/lib/audio';
import type { PitchResult } from '@/src/lib/audio';
import { noteToFrequency } from '@/src/lib/audio';
import {
  TUNING_PRESETS,
  INSTRUMENTS,
  getTuningById,
  type TuningPreset,
} from '@/src/lib/tunings';
import { getTunerTuningId, setTunerTuningId } from '@/src/stores';
import { colors, spacing, borderRadius } from '@/src/theme';

const CENTS_RANGE = 50; // Show ±50 cents for the gauge
const IN_TUNE_CENTS = 10; // Green when within ±10¢ (achievable for real instruments)
const MIN_CONFIDENCE = 0.5; // Ignore low-confidence results (reduces noise/typing)
const SMOOTH = 0.35; // Lower = smoother display, less jumpy

export default function TunerScreen() {
  const { theme, isDark } = useTheme();
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [pitch, setPitch] = useState<PitchResult | null>(null);
  const [tuningId, setTuningId] = useState<string>('guitar-standard');
  const [showTuningPicker, setShowTuningPicker] = useState(false);
  const smoothedRef = useRef<{ freq: number; cents: number } | null>(null);

  const tuning = useMemo(() => getTuningById(tuningId), [tuningId]);

  useEffect(() => {
    getTunerTuningId().then(setTuningId);
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await pitchDetector.requestPermissions();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const startListening = useCallback(async () => {
    if (permissionGranted === false) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    if (permissionGranted === null) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    smoothedRef.current = null;
    const started = await pitchDetector.startListening(
      (result) => {
        if (result.confidence < MIN_CONFIDENCE) return;
        setPitch((prev) => {
          const freq = result.frequency ?? 0;
          const cents = result.cents ?? 0;
          const prevS = smoothedRef.current;
          if (!prevS) {
            smoothedRef.current = { freq, cents };
            return result;
          }
          const newFreq = prevS.freq * (1 - SMOOTH) + freq * SMOOTH;
          const newCents = prevS.cents * (1 - SMOOTH) + cents * SMOOTH;
          smoothedRef.current = { freq: newFreq, cents: newCents };
          return {
            ...result,
            frequency: newFreq,
            cents: Math.round(newCents),
          };
        });
      },
      false,
      'low'
    );
    setIsListening(started);
  }, [permissionGranted, requestPermission]);

  const stopListening = useCallback(async () => {
    await pitchDetector.stopListening();
    setIsListening(false);
    setPitch(null);
    smoothedRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (isListening) {
        pitchDetector.stopListening();
      }
    };
  }, [isListening]);

  const displayNote = pitch?.noteWithOctave ?? '—';
  const rawCents = pitch?.note != null ? pitch.cents : null;
  const displayCents = rawCents != null ? Math.max(-CENTS_RANGE, Math.min(CENTS_RANGE, rawCents)) : null;
  const displayHz = pitch?.frequency != null ? `${pitch.frequency.toFixed(1)} Hz` : '—';
  const isInTune = displayCents != null && Math.abs(displayCents) <= IN_TUNE_CENTS;

  const closestString = useMemo(() => {
    if (!pitch?.frequency || !pitch.noteWithOctave || !tuning) return null;
    const match = pitch.noteWithOctave.match(/^(.*?)(\d+)$/);
    const displayNote = match ? match[1] : pitch.note ?? '';
    const displayOctave = match ? parseInt(match[2], 10) : 0;
    let displayFreq: number;
    try {
      displayFreq = noteToFrequency(displayNote, displayOctave);
    } catch {
      return null;
    }
    let best = { index: -1, cents: Infinity };
    tuning.strings.forEach((s, i) => {
      try {
        const targetHz = noteToFrequency(s.note, s.octave);
        if (Math.abs(displayFreq - targetHz) > 0.5) return;
        const cents = 1200 * Math.log2(pitch.frequency / targetHz);
        if (Math.abs(cents) < Math.abs(best.cents)) best = { index: i, cents };
      } catch {
        // ignore
      }
    });
    if (best.index < 0 || Math.abs(best.cents) > 100) return null;
    return { ...tuning.strings[best.index], index: best.index };
  }, [pitch?.frequency, pitch?.note, pitch?.noteWithOctave, tuning]);

  const selectTuning = useCallback((preset: TuningPreset) => {
    setTuningId(preset.id);
    setTunerTuningId(preset.id);
    setShowTuningPicker(false);
  }, []);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['bottom']}
    >
      <View style={styles.content}>
        <Text variant="bodyMedium" color="secondary" style={styles.subtitle}>
          Play a note to see its pitch. Use for tuning guitar or other instruments.
        </Text>

        {permissionGranted === false && (
          <Card variant="outlined" style={[styles.card, { borderColor: colors.error.main }]}>
            <Text variant="bodyMedium" style={{ color: colors.error.main, marginBottom: spacing[2] }}>
              Microphone access is required for the tuner.
            </Text>
            <Button variant="primary" onPress={requestPermission}>
              Grant microphone access
            </Button>
          </Card>
        )}

        {tuning && (
          <Card variant="outlined" style={styles.referenceCard}>
            <View style={styles.referenceHeader}>
              <Text variant="labelMedium" color="secondary">
                Reference: {tuning.instrument} — {tuning.name}
              </Text>
              <Pressable
                onPress={() => setShowTuningPicker(true)}
                style={({ pressed }) => [styles.changeTuningBtn, pressed && { opacity: 0.8 }]}
              >
                <Text variant="labelSmall" style={{ color: colors.primary[500] }}>Change</Text>
              </Pressable>
            </View>
            <View style={styles.stringList}>
              {[...tuning.strings].reverse().map((s, reversedIdx) => {
                const i = tuning.strings.length - 1 - reversedIdx;
                const isClosest = closestString?.index === i;
                return (
                  <View
                    key={`${s.note}-${s.octave}-${i}`}
                    style={[
                      styles.stringRow,
                      isClosest && { backgroundColor: isDark ? colors.primary[900] + '40' : colors.primary[50] },
                    ]}
                  >
                    <Text variant="labelMedium" color="secondary" style={styles.stringLabel}>
                      {s.label} string
                    </Text>
                    <Text variant="bodyLarge" style={[styles.stringNote, isClosest && { color: colors.primary[500] }]}>
                      {s.note}{s.octave}
                    </Text>
                    {isClosest && (
                      <Text variant="labelSmall" style={{ color: colors.primary[500] }}>← closest</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        <Card variant="outlined" style={styles.card}>
          <Text variant="displaySmall" style={styles.noteDisplay}>
            {displayNote}
          </Text>
          <Text variant="bodyLarge" color="secondary" style={styles.hzDisplay}>
            {displayHz}
          </Text>
          {displayCents != null && (
            <View style={styles.gaugeRow}>
              <View style={styles.gaugeLabels}>
                <Text variant="labelSmall" color="muted">−50</Text>
                <Text variant="labelSmall" color="muted">−25</Text>
                <Text variant="labelSmall" style={{ color: colors.success.main, fontWeight: '600' }}>0</Text>
                <Text variant="labelSmall" color="muted">+25</Text>
                <Text variant="labelSmall" color="muted">+50</Text>
              </View>
              <View style={[styles.gaugeTrackWrap, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]}>
                <View
                  style={[
                    styles.inTuneZone,
                    { left: `${(50 - IN_TUNE_CENTS / CENTS_RANGE * 50)}%`, width: `${(IN_TUNE_CENTS / CENTS_RANGE) * 100}%` },
                  ]}
                />
                <View
                  style={[styles.gaugeCenterLine, { left: '50%' }]}
                />
                <View
                  style={[
                    styles.gaugeNeedle,
                    {
                      left: `${50 + (displayCents / CENTS_RANGE) * 50}%`,
                      backgroundColor: isInTune ? colors.success.main : colors.primary[500],
                    },
                  ]}
                />
              </View>
              <Text variant="labelSmall" color="muted" style={styles.gaugeHint}>
                {isInTune ? 'In tune' : displayCents > 0 ? `+${displayCents}¢ sharp` : `${displayCents}¢ flat`}
              </Text>
              {isInTune && (
                <Text variant="bodySmall" color="secondary" style={styles.inTuneHint}>
                  Within ±{IN_TUNE_CENTS}¢ is good for most playing
                </Text>
              )}
            </View>
          )}
        </Card>

        <View style={styles.controlRow}>
          <Button
            variant={isListening ? 'secondary' : 'primary'}
            size="lg"
            onPress={isListening ? stopListening : startListening}
            style={styles.mainButton}
          >
            {isListening ? 'Stop' : 'Start listening'}
          </Button>
        </View>
      </View>

      <Modal visible={showTuningPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowTuningPicker(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.surface }]} onPress={(e) => e.stopPropagation()}>
            <Text variant="titleMedium" style={styles.modalTitle}>Reference tuning</Text>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {INSTRUMENTS.map((instrument) => {
                const presets = TUNING_PRESETS.filter((t) => t.instrument === instrument);
                return (
                  <View key={instrument} style={styles.tuningSection}>
                    <Text variant="labelSmall" color="secondary" style={styles.tuningSectionTitle}>
                      {instrument}
                    </Text>
                    {presets.map((preset) => (
                      <Pressable
                        key={preset.id}
                        onPress={() => selectTuning(preset)}
                        style={[
                          styles.tuningOption,
                          {
                            backgroundColor: preset.id === tuningId
                              ? colors.primary[isDark ? 900 : 50]
                              : isDark ? colors.neutral[800] : colors.neutral[100],
                          },
                        ]}
                      >
                        <Text
                          variant="bodyMedium"
                          style={{ color: preset.id === tuningId ? colors.primary[500] : theme.text }}
                        >
                          {preset.name}
                        </Text>
                        <Text variant="bodySmall" color="muted">
                          {preset.strings.map((s) => `${s.note}${s.octave}`).join(' ')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                );
              })}
            </ScrollView>
            <Button variant="primary" onPress={() => setShowTuningPicker(false)} fullWidth>
              Done
            </Button>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing[4],
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  referenceCard: {
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  referenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  changeTuningBtn: {
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
  },
  stringList: {
    gap: spacing[1],
  },
  stringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.md,
    gap: spacing[3],
  },
  stringLabel: {
    width: 80,
  },
  stringNote: {
    minWidth: 48,
  },
  card: {
    padding: spacing[6],
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  noteDisplay: {
    color: colors.primary[500],
    marginBottom: spacing[2],
  },
  hzDisplay: {
    marginBottom: spacing[4],
  },
  gaugeRow: {
    width: '100%',
    alignItems: 'center',
  },
  gaugeLabels: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: spacing[1],
  },
  gaugeTrackWrap: {
    width: '100%',
    height: 12,
    borderRadius: borderRadius.full,
    position: 'relative',
    marginBottom: spacing[2],
    overflow: 'visible',
  },
  inTuneZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.success.main + '40',
    borderRadius: borderRadius.full,
  },
  gaugeCenterLine: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    width: 2,
    marginLeft: -1,
    backgroundColor: colors.success.main,
    borderRadius: 1,
  },
  gaugeNeedle: {
    position: 'absolute',
    top: -4,
    width: 4,
    height: 20,
    borderRadius: 2,
    marginLeft: -2,
  },
  gaugeHint: {
    marginBottom: spacing[1],
  },
  inTuneHint: {
    marginTop: spacing[1],
  },
  controlRow: {
    alignItems: 'center',
  },
  mainButton: {
    minWidth: 180,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    padding: spacing[4],
    paddingBottom: spacing[8],
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: spacing[4],
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: spacing[4],
    maxHeight: 360,
  },
  tuningSection: {
    marginBottom: spacing[4],
  },
  tuningSectionTitle: {
    marginBottom: spacing[2],
    marginLeft: spacing[1],
  },
  tuningOption: {
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[2],
  },
});
