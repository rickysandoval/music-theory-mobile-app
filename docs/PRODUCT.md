# Music Theory Mobile — Product Documentation

This document describes all current features of the app for product tracking and reference. Update it when you add or change features.

---

## App Overview

**Music Theory Mobile** is a React Native (Expo) app for learning music theory and guitar fundamentals. It is Android-first with iOS support; builds use EAS (Expo Application Services).

- **App name (display):** Music Theory  
- **Slug:** music-theory-mobile  
- **Version:** 1.0.0  
- **Bundle ID (iOS):** com.musictheory.app  
- **Package (Android):** com.musictheory.app  

---

## Navigation & Screens

### Tab bar (main navigation)

| Tab     | Screen   | Route      | Description                          |
|---------|----------|------------|--------------------------------------|
| Games   | Home     | `(tabs)/index` | List of games and entry point        |
| Progress| Progress | `(tabs)/progress` | Stats and achievements               |
| Settings| Settings | `(tabs)/settings` | Appearance and per-game settings     |

### Stack (game) screens

| Screen          | Route                  | Description                                |
|-----------------|------------------------|--------------------------------------------|
| Chord Spelling  | `games/chord-spelling` | Chord spelling game (practice/test, piano/flashcard) |
| Fretboard Notes | `games/fretboard-notes`| Fretboard note game (identify / find / listen)       |

- **404:** `+not-found.tsx` — "Oops!" screen for unknown routes.

---

## Features by Area

### 1. Home (Games list)

- **Header:** Title “Music Theory” and short tagline.
- **Game cards:** Each card has title, short description, icon, and tap action.
  - **Chord Spelling** — Navigate to chord spelling game.
  - **Fretboard Notes** — Navigate to fretboard game.
  - **Interval Training** — “Coming Soon” (no navigation).
  - **Scale Patterns** — “Coming Soon” (no navigation).
- **Coming Soon** badge and disabled tap for future games.

### 2. Chord Spelling Game

**Purpose:** Learn which notes form major and minor chords.

**Modes:**

- **Practice:** Endless random chords; no score.
- **Test:** Fixed set of chords based on settings; score and optional review of missed chords.

**Input styles:**

- **Piano:** On-screen piano keyboard to tap notes and spell the chord.
- **Flashcard:** Show chord name, reveal answer, self-grade correct/incorrect.

**Flow:**

- Mode selection screen: choose Practice vs Test, Piano vs Flashcard.
- Chord settings summary and link to full Chord Settings (same as in Settings).
- “Start Practice” or “Start Test” starts the session.
- In practice: “Change Mode” returns to mode selection.
- In test: after completion, results screen with score and missed chords; options to “Practice missed”, “Restart test”, or “Back to practice”.
- In-test “review missed” mode: only advance when user marks correct.

**Settings (persisted):**

- **Root notes:** Diatonic (C–B), Accidentals (sharps/flats).
- **Chord quality:** Major, Minor.

**Persistence:** Chord game results (total played, correct count, last played) are saved and shown on the Progress screen. Only Chord Spelling contributes to progress today.

### 3. Fretboard Notes Game

**Purpose:** Learn note names and positions on the guitar fretboard (standard tuning).

**Game modes:**

- **Identify:** Show a fret position; user chooses the note name.
- **Find:** Show a note name; user taps the correct fret(s).
- **Listen:** User plays the note on guitar; app uses microphone to detect pitch and check if it matches the target note.

**Settings (persisted, in-sheet and/or Settings):**

- Game mode (identify / find / listen).
- **Notes:** Natural only vs include accidentals; sharps vs flats.
- **Strings:** Per-string toggles (E, A, D, G, B, E).
- **Fret range:** Min/max fret (e.g. 0–5).
- **UI:** Show open string labels at nut; auto-advance on correct (listen mode).
- **Listen mode:** Microphone sensitivity (low / medium / high).

**Permissions:** Microphone (RECORD_AUDIO, MODIFY_AUDIO_SETTINGS on Android; NSMicrophoneUsageDescription on iOS) for Listen mode. Permission request and denial states are shown in the UI.

**Persistence:** Fretboard game settings are persisted; **progress/stats for Fretboard are not yet stored** (Progress screen is Chord Spelling only).

### 4. Progress Screen

- **Chord Spelling stats:** Total played, Correct count, Accuracy %, Last played date.
- **Empty state:** Shown when user has not played Chord Spelling yet.
- **Reset:** “Reset All Progress” clears all progress (Chord Spelling only today).

No Fretboard or other game stats are displayed yet.

### 5. Settings Screen

**Appearance**

- **Dark Mode:** Toggle; persists theme preference (light/dark).

**Chord Spelling Game**

- Same toggles as in-game Chord Settings: Diatonic roots, Accidentals roots, Major chords, Minor chords.

**About**

- App name “Music Theory Mobile”, version 1.0.0, short description.  
- Version should be kept in sync with `app.json` / `package.json`.

**Note:** Fretboard game settings are not duplicated here; they live in the Fretboard game’s settings sheet.

### 6. Theme & Design

- **Light / dark:** Full theme support; follows system or manual override from Settings.
- **Design system:** Custom theme (colors, typography, spacing); reusable UI: Button, Card, Text, Switch, etc.
- **Status bar:** Style (light/dark) follows theme.

### 7. Persistence (AsyncStorage)

| Key (concept)     | Content |
|-------------------|--------|
| Game settings     | Chord + Fretboard game options (roots, qualities, modes, strings, frets, sensitivity, etc.). |
| Game progress     | Chord game: totalPlayed, correctAnswers, lastPlayed. (Fretboard progress not stored.) |
| Theme             | User’s color scheme preference (light/dark). |

Storage is local only; no backend or sync.

### 8. Audio & Permissions

- **Piano / playback:** expo-av for playing note sounds in Chord Spelling (and anywhere notes are played).
- **Pitch detection:** Used in Fretboard “Listen” mode; Web Audio API (web) and react-native-pitchy (mobile); microphone permission required on device.
- **Android:** RECORD_AUDIO, MODIFY_AUDIO_SETTINGS in `app.json`.
- **iOS:** NSMicrophoneUsageDescription in `app.json` (Listen mode explanation).

---

## Technical Summary

- **Routing:** Expo Router (file-based); tabs for main app, stack for game screens.
- **State:** React hooks + AsyncStorage; no global state library.
- **Music theory:** Pure JS/TS module (`src/lib/music-theory/`): notes, chords, intervals, enharmonics, fretboard mapping (standard tuning). Used by both games and tests.
- **Testing:** Jest (unit + component/hook tests); coverage thresholds in CI.

---

## Changelog (high level)

- **1.0.0 (current):** Chord Spelling (practice/test, piano/flashcard), Fretboard Notes (identify/find/listen), Progress (Chord only), Settings, dark mode, local persistence, Android/iOS capable with EAS.

---

*Last updated from codebase review. Update this file when you ship new features or change behavior.*
