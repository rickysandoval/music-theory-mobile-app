/**
 * Unit tests for game feedback logic
 * 
 * These tests cover all the different scenarios for feedback display
 * in both practice mode and test mode.
 */

import {
  determineFeedback,
  FeedbackInput,
  FeedbackState,
  getFeedbackSubtitle,
} from '../../src/lib/music-theory/gameFeedback';

describe('determineFeedback', () => {
  describe('Practice Mode', () => {
    it('should return "Correct!" for first try success', () => {
      const input: FeedbackInput = {
        isTestMode: false,
        isFirstTry: true,
        isComplete: true,
      };

      const result = determineFeedback(input);

      expect(result.type).toBe('correct');
      expect(result.color).toBe('success');
      expect(result.icon).toBe('✓');
      expect(result.title).toBe('Correct!');
    });

    it('should return "Corrected!" when user fixes their answer after retry', () => {
      const input: FeedbackInput = {
        isTestMode: false,
        isFirstTry: false,
        isComplete: true,
      };

      const result = determineFeedback(input);

      expect(result.type).toBe('corrected');
      expect(result.color).toBe('success');
      expect(result.icon).toBe('✓');
      expect(result.title).toBe('Corrected!');
    });

    it('should show success (green) even after retry in practice mode', () => {
      // This is the bug that was fixed - previously showed "Incorrect" with red
      const input: FeedbackInput = {
        isTestMode: false,
        isFirstTry: false,
        isComplete: true,
      };

      const result = determineFeedback(input);

      // Key assertion: should be success, NOT error
      expect(result.color).toBe('success');
      expect(result.icon).toBe('✓');
      // Should NOT show "Incorrect"
      expect(result.title).not.toBe('Incorrect');
    });
  });

  describe('Test Mode', () => {
    it('should return "Correct!" for first try success', () => {
      const input: FeedbackInput = {
        isTestMode: true,
        isFirstTry: true,
        isComplete: true,
      };

      const result = determineFeedback(input);

      expect(result.type).toBe('correct');
      expect(result.color).toBe('success');
      expect(result.icon).toBe('✓');
      expect(result.title).toBe('Correct!');
    });

    it('should return "Incorrect" when answer is wrong (no retries in test mode)', () => {
      const input: FeedbackInput = {
        isTestMode: true,
        isFirstTry: false,
        isComplete: true,
      };

      const result = determineFeedback(input);

      expect(result.type).toBe('incorrect');
      expect(result.color).toBe('error');
      expect(result.icon).toBe('✗');
      expect(result.title).toBe('Incorrect');
    });

    it('should show error (red) for wrong answers in test mode', () => {
      const input: FeedbackInput = {
        isTestMode: true,
        isFirstTry: false,
        isComplete: true,
      };

      const result = determineFeedback(input);

      expect(result.color).toBe('error');
      expect(result.icon).toBe('✗');
    });
  });

  describe('Edge Cases', () => {
    it('should return neutral state when not complete', () => {
      const input: FeedbackInput = {
        isTestMode: false,
        isFirstTry: true,
        isComplete: false,
      };

      const result = determineFeedback(input);

      // Returns a default state, though this shouldn't typically be rendered
      expect(result).toBeDefined();
      expect(result.title).toBe('');
    });

    it('should prioritize isFirstTry over isTestMode for success case', () => {
      // When isFirstTry is true, result should be "Correct!" regardless of mode
      const practiceFirst: FeedbackInput = {
        isTestMode: false,
        isFirstTry: true,
        isComplete: true,
      };

      const testFirst: FeedbackInput = {
        isTestMode: true,
        isFirstTry: true,
        isComplete: true,
      };

      const practiceResult = determineFeedback(practiceFirst);
      const testResult = determineFeedback(testFirst);

      expect(practiceResult.title).toBe('Correct!');
      expect(testResult.title).toBe('Correct!');
      expect(practiceResult.type).toBe(testResult.type);
    });
  });

  describe('Behavior Differences Between Modes', () => {
    it('should have different outcomes for !isFirstTry depending on mode', () => {
      const practiceFailed: FeedbackInput = {
        isTestMode: false,
        isFirstTry: false,
        isComplete: true,
      };

      const testFailed: FeedbackInput = {
        isTestMode: true,
        isFirstTry: false,
        isComplete: true,
      };

      const practiceResult = determineFeedback(practiceFailed);
      const testResult = determineFeedback(testFailed);

      // Practice mode: user corrected it, show success
      expect(practiceResult.color).toBe('success');
      expect(practiceResult.title).toBe('Corrected!');

      // Test mode: user got it wrong, no retries, show error
      expect(testResult.color).toBe('error');
      expect(testResult.title).toBe('Incorrect');
    });
  });
});

describe('getFeedbackSubtitle', () => {
  const chordName = 'C';
  const chordNotes = ['C', 'E', 'G'];

  it('should return chord info for "correct" type', () => {
    const result = getFeedbackSubtitle('correct', chordName, chordNotes);
    expect(result).toBe('C: C - E - G');
  });

  it('should return chord info for "corrected" type', () => {
    const result = getFeedbackSubtitle('corrected', chordName, chordNotes);
    expect(result).toBe('C: C - E - G');
  });

  it('should return "Correct answer:" prefix for "incorrect" type', () => {
    const result = getFeedbackSubtitle('incorrect', chordName, chordNotes);
    expect(result).toBe('Correct answer: C - E - G');
  });

  it('should handle minor chords correctly', () => {
    const minorChordName = 'Am';
    const minorChordNotes = ['A', 'C', 'E'];

    const correctResult = getFeedbackSubtitle('correct', minorChordName, minorChordNotes);
    expect(correctResult).toBe('Am: A - C - E');

    const incorrectResult = getFeedbackSubtitle('incorrect', minorChordName, minorChordNotes);
    expect(incorrectResult).toBe('Correct answer: A - C - E');
  });

  it('should handle chords with accidentals', () => {
    const sharpChordName = 'F#m';
    const sharpChordNotes = ['F#', 'A', 'C#'];

    const result = getFeedbackSubtitle('correct', sharpChordName, sharpChordNotes);
    expect(result).toBe('F#m: F# - A - C#');
  });
});

/**
 * Integration-style tests that document the expected behavior flow
 */
describe('Game Flow Scenarios', () => {
  describe('Practice Mode Flow', () => {
    it('Scenario: User gets C major correct on first try', () => {
      // User enters C, E, G correctly on first attempt
      const feedback = determineFeedback({
        isTestMode: false,
        isFirstTry: true,
        isComplete: true,
      });

      expect(feedback.title).toBe('Correct!');
      expect(feedback.color).toBe('success');
      
      const subtitle = getFeedbackSubtitle(feedback.type, 'C', ['C', 'E', 'G']);
      expect(subtitle).toBe('C: C - E - G');
    });

    it('Scenario: User enters wrong note, then corrects it', () => {
      // User enters C, F, G (wrong third)
      // Then fixes it to C, E, G
      // isFirstTry becomes false after first wrong attempt
      // isComplete becomes true when they finally get it right
      
      const feedback = determineFeedback({
        isTestMode: false,
        isFirstTry: false, // They got it wrong at first
        isComplete: true,  // But eventually got it right
      });

      // Should show positive feedback, not "Incorrect"
      expect(feedback.title).toBe('Corrected!');
      expect(feedback.color).toBe('success');
      expect(feedback.icon).toBe('✓');
      
      const subtitle = getFeedbackSubtitle(feedback.type, 'C', ['C', 'E', 'G']);
      expect(subtitle).toBe('C: C - E - G');
    });
  });

  describe('Test Mode Flow', () => {
    it('Scenario: User gets Am correct on first try', () => {
      const feedback = determineFeedback({
        isTestMode: true,
        isFirstTry: true,
        isComplete: true,
      });

      expect(feedback.title).toBe('Correct!');
      expect(feedback.color).toBe('success');
      
      const subtitle = getFeedbackSubtitle(feedback.type, 'Am', ['A', 'C', 'E']);
      expect(subtitle).toBe('Am: A - C - E');
    });

    it('Scenario: User enters wrong answer in test mode (no retry allowed)', () => {
      // User enters A, D, E (wrong third for Am)
      // In test mode, this immediately marks as incorrect and shows answer
      
      const feedback = determineFeedback({
        isTestMode: true,
        isFirstTry: false, // Wrong answer
        isComplete: true,  // Game ends immediately
      });

      expect(feedback.title).toBe('Incorrect');
      expect(feedback.color).toBe('error');
      expect(feedback.icon).toBe('✗');
      
      const subtitle = getFeedbackSubtitle(feedback.type, 'Am', ['A', 'C', 'E']);
      expect(subtitle).toBe('Correct answer: A - C - E');
    });
  });

  describe('The Bug That Was Fixed', () => {
    it('should NOT show "Incorrect" when user corrects answer in practice mode', () => {
      // This test documents the bug that was fixed
      // Previously, practice mode would show "Incorrect" even after correcting
      
      const feedback = determineFeedback({
        isTestMode: false,  // Practice mode
        isFirstTry: false,  // User got it wrong first
        isComplete: true,   // User corrected and completed
      });

      // The bug would have shown:
      // - title: "Incorrect" ❌
      // - color: "error" ❌
      // - icon: "✗" ❌
      
      // Correct behavior should show:
      expect(feedback.title).toBe('Corrected!');
      expect(feedback.title).not.toBe('Incorrect');
      expect(feedback.color).toBe('success');
      expect(feedback.color).not.toBe('error');
      expect(feedback.icon).toBe('✓');
      expect(feedback.icon).not.toBe('✗');
    });
  });
});
