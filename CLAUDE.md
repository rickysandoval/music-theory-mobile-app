# Music Theory Mobile - Development Guide

## Additional Context
The current year is 2026, so when doing search terms on the web use 2025 instead of 2024

## Build Commands

- `npm start` - Start Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS simulator (macOS only)
- `npm run web` - Start web version
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run build:android` - Build Android APK via EAS (preview profile)
- `npm run build:android:prod` - Build Android AAB for Play Store

## CI/CD Pipeline

GitHub Actions runs on every PR and push to `main`:

1. **Test & Coverage** - Runs all tests with coverage report
   - Coverage thresholds: 70% statements/lines, 75% functions, 50% branches
   - HTML report uploaded as artifact
   - Summary posted to PR

2. **TypeScript Check** - Verifies no type errors

Coverage report is available in workflow artifacts after each run.

## Code Style Guidelines

- **TypeScript**: Strict mode enabled
- **Path Aliases**: Use `@/` for imports from project root (e.g., `@/src/components/ui`)
- **Component Structure**: Functional components with hooks
- **Naming**: 
  - PascalCase for components and types
  - camelCase for functions, variables, hooks
  - SCREAMING_SNAKE_CASE for constants
- **File Organization**:
  - Screen components in `app/` (Expo Router)
  - Reusable components in `src/components/`
  - Music theory logic in `src/lib/music-theory/`
  - State/persistence in `src/stores/`

## Architecture Decisions

### Expo Router
- File-based routing in `app/` directory
- Tab navigation for main screens
- Stack navigation for game screens

### State Management
- React hooks (useState, useEffect, useCallback)
- AsyncStorage for persistence
- No external state library (keep it simple)

### Music Theory Module
- Pure functions, no React dependencies
- Fully unit tested
- Handles enharmonic equivalents (C# = Db)
- Guitar-focused (standard tuning helpers)

### Design System
- Custom theme with light/dark support
- Reusable UI components (Button, Card, Text, Switch)
- Consistent spacing and typography scales

## Testing Strategy

### Test Organization
Jest is configured with two projects:
- **`unit`**: Pure function tests (node environment, fast)
- **`components`**: Hook and component tests (jest-expo preset)

```
__tests__/
  music-theory/     # Unit tests (pure functions)
  audio/            # Unit tests (pure functions)
  hooks/            # Hook tests (React Native)
  components/       # Component tests (React Native)
```

### What to Test
Focus unit tests on:
1. Music theory utilities (notes, chords, intervals)
2. Answer validation logic
3. Fretboard calculations
4. Game feedback/state logic
5. State machine transitions

### Testing Principles
- **Bug → Test**: When fixing a bug involving important logic, add test coverage to prevent regression
- **Testable by design**: Prefer small, focused components and/or extracting complex logic into pure utility functions - both approaches make testing easier
- **Pure functions for complex logic**: When logic has multiple branches/scenarios (like game feedback states), extract to a pure function (e.g., `determineFeedback()`) for easy unit testing
- **Choose the right approach**: Small focused components can be unit tested directly; complex branching logic often benefits from extraction into utilities

### Writing Tests

**Unit tests** (pure functions) - place in `__tests__/music-theory/` or `__tests__/audio/`:
```typescript
import { frequencyToNote } from '../../src/lib/audio/frequencyUtils';

test('A440 should be A4', () => {
  expect(frequencyToNote(440).note).toBe('A');
});
```

**Hook tests** - place in `__tests__/hooks/` with `.tsx` extension:
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useMyHook } from '../../src/hooks/useMyHook';

test('hook behavior', () => {
  const { result } = renderHook(() => useMyHook());
  
  act(() => {
    result.current.doSomething();
  });
  
  expect(result.current.value).toBe(expected);
});
```

**Component tests** - place in `__tests__/components/` with `.tsx` extension:
```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../../src/components/MyComponent';

test('component behavior', () => {
  const { getByText } = render(<MyComponent />);
  fireEvent.press(getByText('Button'));
  // assertions...
});
```

## Adding New Games

1. Create game component in `src/components/games/`
2. Add screen in `app/games/[game-name].tsx`
3. Register route in `app/_layout.tsx`
4. Add card to games list in `app/(tabs)/index.tsx`
5. Add settings if needed in `src/stores/storage.ts`
6. Add progress tracking in `src/stores/storage.ts`
