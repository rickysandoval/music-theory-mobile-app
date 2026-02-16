# Music Theory Mobile

A React Native (Expo) mobile app for learning music theory and guitar fundamentals. Built Android-first with iOS support planned.

## Features

- 🎸 **Chord Spelling Game** - Learn the notes that make up major and minor chords
- 🎸 **Fretboard Notes Game** - Identify, find, or play notes on the guitar fretboard (including Listen mode with mic)
- ⏱️ **Metronome** - Steady click at any BPM (40–240)
- 🎵 **Tuner** - Real-time pitch detection for tuning instruments
- 📊 **Progress Tracking** - Track your accuracy and practice history
- 🌙 **Dark/Light Mode** - Comfortable practice anytime
- 💾 **Local Persistence** - Settings and progress saved locally
- 🎹 **Interactive Piano** - Touch-friendly keyboard for note input

### Coming Soon
- Interval training
- Scale patterns

## Tech Stack

- **Framework**: Expo SDK 54 with Expo Router v6
- **Language**: TypeScript
- **State**: React hooks + AsyncStorage
- **Styling**: React Native StyleSheet with custom theme
- **Testing**: Jest with ts-jest

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo Go app on your Android device (for development)
- EAS CLI for builds (`npm install -g eas-cli`)

### Installation

```bash
# Clone the repository
cd music-theory-mobile

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm start

# Start with specific platform
npm run android   # Opens in Android emulator/Expo Go
npm run ios       # Opens in iOS simulator (macOS only)
npm run web       # Opens in browser
```

Scan the QR code with Expo Go (Android) or Camera app (iOS) to run on your device.

#### Running two Expo apps at once

You can run this app and another Expo app in dev mode at the same time by using different ports. Start the first app as usual, then start the second with an explicit port:

```bash
# Terminal 1: this app (default port 8081)
npm start

# Terminal 2: other Expo app
cd /path/to/other-expo-app
npx expo start --port 8082
```

Connect to each app from Expo Go by choosing the dev server that appears (they will show different ports/URLs).

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Building for Android

### Development Build (APK)

For testing on physical devices:

```bash
# First time: Login to EAS
eas login

# Configure EAS (first time only)
eas build:configure

# Build preview APK
npm run build:android
# or
eas build --platform android --profile preview
```

The APK will be available for download from the Expo dashboard.

### Production Build (AAB)

For Google Play Store:

```bash
eas build --platform android --profile production
```

## Documentation

- **[docs/PRODUCT.md](docs/PRODUCT.md)** — Product documentation: all current features, screens, and behavior.
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — Roadmap: planned features (Interval Training, Scale Patterns, etc.) and optional phases.
- **[docs/LAUNCH-PLAN.md](docs/LAUNCH-PLAN.md)** — Launch plan: checklist to go from development to production-ready (store, privacy, testing).

## Project Structure

```
music-theory-mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home - Games list
│   │   ├── progress.tsx   # Progress tracking
│   │   └── settings.tsx   # App settings
│   ├── games/
│   │   └── chord-spelling.tsx
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/
│   │   ├── ui/           # Design system components
│   │   └── games/        # Game-specific components
│   ├── lib/
│   │   └── music-theory/ # Music theory utilities
│   ├── stores/           # State management & persistence
│   └── theme/            # Colors, typography, spacing
├── docs/                 # Product docs, roadmap, launch plan
├── __tests__/            # Unit tests
├── assets/               # Images, fonts
└── app.json              # Expo configuration
```

## Music Theory Library

The `src/lib/music-theory/` module provides pure, testable functions for:

- **Notes**: Normalization, transposition, intervals, enharmonic equivalents
- **Chords**: Building triads, chord identification, answer validation
- **Fretboard**: Note mapping for standard guitar tuning

All music theory logic is decoupled from React and fully unit tested.

## Configuration

### Game Settings (persisted locally)

- **Include Sharps/Flats**: Toggle chords with accidental roots (F#, Bb)
- **Include Minor Chords**: Toggle minor chord variations

### Theme

- Follows system preference by default
- Manual override available in Settings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new music theory functions
4. Submit a pull request

## License

MIT
