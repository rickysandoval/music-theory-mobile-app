/**
 * Game Feedback Utilities
 * 
 * Centralized logic for determining feedback state in games.
 * This keeps the logic testable and consistent across game modes.
 */

export type FeedbackType = 'correct' | 'corrected' | 'incorrect' | 'revealed';

export interface FeedbackState {
  type: FeedbackType;
  color: 'success' | 'error';
  icon: '✓' | '✗';
  title: string;
}

export interface FeedbackInput {
  /** Whether this is test mode (no retries) or practice mode (allows retries) */
  isTestMode: boolean;
  /** Whether the user got it right on their first attempt */
  isFirstTry: boolean;
  /** Whether the game round is complete */
  isComplete: boolean;
  /** Whether the user revealed the answer (optional) */
  wasRevealed?: boolean;
}

/**
 * Determines the appropriate feedback to show based on game state.
 * 
 * Scenarios:
 * 1. Practice mode, correct on first try → "Correct!" (success)
 * 2. Practice mode, corrected after retry → "Corrected!" (success)
 * 3. Practice mode, revealed answer → "Revealed" (success color, learning opportunity)
 * 4. Test mode, correct on first try → "Correct!" (success)
 * 5. Test mode, incorrect (no retries allowed) → "Incorrect" (error)
 * 6. Test mode, revealed answer → "Incorrect" (error, counts as fail)
 * 
 * Note: In practice mode, isComplete=true always means the answer is correct
 * (because the game doesn't complete until you get it right).
 * In test mode, isComplete=true can mean correct OR incorrect.
 */
export function determineFeedback(input: FeedbackInput): FeedbackState {
  const { isTestMode, isFirstTry, isComplete, wasRevealed } = input;

  // If not complete, no feedback to show
  if (!isComplete) {
    // Return a neutral state (though this shouldn't be used)
    return {
      type: 'correct',
      color: 'success',
      icon: '✓',
      title: '',
    };
  }

  // Scenario 1 & 4: Correct on first try (both modes)
  if (isFirstTry) {
    return {
      type: 'correct',
      color: 'success',
      icon: '✓',
      title: 'Correct!',
    };
  }

  // Handle revealed answers
  if (wasRevealed) {
    // Scenario 6: Test mode, revealed = incorrect
    if (isTestMode) {
      return {
        type: 'incorrect',
        color: 'error',
        icon: '✗',
        title: 'Incorrect',
      };
    }
    // Scenario 3: Practice mode, revealed = show the answer (learning)
    return {
      type: 'revealed',
      color: 'success',
      icon: '✓',
      title: 'Revealed',
    };
  }

  // Scenario 2: Practice mode, corrected after retry
  // In practice mode, isComplete=true means they eventually got it right
  if (!isTestMode) {
    return {
      type: 'corrected',
      color: 'success',
      icon: '✓',
      title: 'Corrected!',
    };
  }

  // Scenario 5: Test mode, incorrect (they didn't get it on first try, no retries)
  return {
    type: 'incorrect',
    color: 'error',
    icon: '✗',
    title: 'Incorrect',
  };
}

/**
 * Generates the subtitle text for feedback based on chord and feedback type.
 */
export function getFeedbackSubtitle(
  feedbackType: FeedbackType,
  chordName: string,
  chordNotes: string[]
): string {
  const notesDisplay = chordNotes.join(' - ');
  
  switch (feedbackType) {
    case 'correct':
    case 'corrected':
      return `${chordName}: ${notesDisplay}`;
    case 'revealed':
      return `The answer is: ${notesDisplay}`;
    case 'incorrect':
      return `Correct answer: ${notesDisplay}`;
  }
}
