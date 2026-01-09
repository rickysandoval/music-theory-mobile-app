/**
 * Hook tests for useChordTest
 * 
 * These tests use @testing-library/react-native's renderHook to test
 * the hook's integration with React. For testing the underlying state
 * machine logic, see __tests__/music-theory/chordTestStateMachine.test.ts
 */

import { renderHook, act } from '@testing-library/react-native';
import { useChordTest } from '../../src/hooks/useChordTest';
import type { ChordGameSettings } from '../../src/lib/music-theory/types';

const createTestSettings = (): ChordGameSettings => ({
  includeDiatonicRoots: true,
  includeAccidentalRoots: false,
  includeMajorChords: true,
  includeMinorChords: false,
});

describe('useChordTest hook', () => {
  it('should start with null state', () => {
    const { result } = renderHook(() => useChordTest());
    
    expect(result.current.testState).toBeNull();
    expect(result.current.isTestActive).toBe(false);
    expect(result.current.currentChord).toBeNull();
  });

  it('should start a test when startTest is called', () => {
    const { result } = renderHook(() => useChordTest());
    
    act(() => {
      result.current.startTest(createTestSettings());
    });
    
    expect(result.current.testState).not.toBeNull();
    expect(result.current.isTestActive).toBe(true);
    expect(result.current.currentChord).not.toBeNull();
    expect(result.current.progress.current).toBe(1);
  });

  it('should advance when recordResult is called', () => {
    const { result } = renderHook(() => useChordTest());
    
    act(() => {
      result.current.startTest(createTestSettings());
    });
    
    const firstChord = result.current.currentChord;
    
    act(() => {
      result.current.recordResult(true);
    });
    
    expect(result.current.currentChord).not.toBe(firstChord);
    expect(result.current.progress.current).toBe(2);
  });

  it('should complete test after all chords answered', () => {
    const { result } = renderHook(() => useChordTest());
    
    act(() => {
      result.current.startTest(createTestSettings());
    });
    
    const total = result.current.progress.total;
    
    // Answer all chords
    for (let i = 0; i < total; i++) {
      act(() => {
        result.current.recordResult(true);
      });
    }
    
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.score?.percentage).toBe(100);
  });

  it('should reset state when endTest is called', () => {
    const { result } = renderHook(() => useChordTest());
    
    act(() => {
      result.current.startTest(createTestSettings());
    });
    
    expect(result.current.isTestActive).toBe(true);
    
    act(() => {
      result.current.endTest();
    });
    
    expect(result.current.testState).toBeNull();
    expect(result.current.isTestActive).toBe(false);
  });
});
