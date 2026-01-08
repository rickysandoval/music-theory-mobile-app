# Music Theory Mobile - Development Guide

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

Focus unit tests on:
1. Music theory utilities (notes, chords, intervals)
2. Answer validation logic
3. Fretboard calculations

Component tests are optional - manual testing via Expo Go is fast.

## Adding New Games

1. Create game component in `src/components/games/`
2. Add screen in `app/games/[game-name].tsx`
3. Register route in `app/_layout.tsx`
4. Add card to games list in `app/(tabs)/index.tsx`
5. Add settings if needed in `src/stores/storage.ts`
6. Add progress tracking in `src/stores/storage.ts`
