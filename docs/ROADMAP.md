# Music Theory Mobile — Roadmap

Planned and potential features for future releases. Use this to prioritize and track what to build next.

---

## Already on Home (Coming Soon)

These are listed on the Games screen as “Coming Soon” and are natural next bets.

| Feature             | Description (from UI)                     | Notes |
|---------------------|-------------------------------------------|--------|
| **Interval Training** | Identify intervals by ear and theory    | New game; likely needs audio (play interval) + theory (name interval). Can reuse note/interval utilities from `src/lib/music-theory/`. |
| **Scale Patterns**    | Learn scale shapes across the fretboard | New game; fretboard + scale logic (e.g. major/minor, positions). Could extend `src/lib/music-theory/` with scale helpers. |

---

## Suggested roadmap (optional phases)

### Phase 1 — Complete current experience

- **Fretboard progress:** Persist and show Fretboard game stats on the Progress screen (e.g. total played, correct, accuracy, last played), and optionally “Reset” per game or for Fretboard.
- **Register Fretboard in root layout:** Ensure `games/fretboard-notes` has a `Stack.Screen` in `app/_layout.tsx` if you want an explicit title/options (Expo Router may still resolve it by file).
- **Reset progress UX:** Add confirmation dialog before “Reset All Progress” (and later per-game reset if added).
- **Polish:** Error boundaries, loading states, and any high-impact bug fixes.

### Phase 2 — New games

- **Interval Training:** Design modes (by ear vs by theory), integrate with music-theory lib and audio (expo-av / pitch if needed). Add screen, route, and card from “Coming Soon” to active.
- **Scale Patterns:** Define scope (which scales, which positions), implement scale logic and fretboard UI. Add screen, route, and card from “Coming Soon” to active.

### Phase 3 — Depth and retention

- **More chord types:** e.g. seventh chords, in Chord Spelling (settings + generation + validation).
- **Fretboard difficulty / levels:** Preset difficulty (e.g. “first 5 frets”, “all frets”) or simple “levels” that change range/accidentals.
- **Achievements / streaks:** Simple badges or streaks based on Progress data (e.g. “7 days in a row”, “100 correct chord answers”).
- **Onboarding:** Short first-run flow (e.g. “Pick your instrument focus”, “Try one chord question”) to orient new users.

### Phase 4 — Platform and reach

- **iOS build and TestFlight:** Production or internal iOS build via EAS, TestFlight for testers.
- **Web polish:** If keeping `npm run web`, ensure routing, audio, and (where applicable) mic work in browser; document limitations.
- **Accessibility:** Screen reader labels, focus order, and contrast checks for main flows.
- **Localization:** If targeting multiple languages, extract strings and add i18n (e.g. expo-localization).

---

## Backlog / ideas (no commitment)

- More input methods for Chord Spelling (e.g. type note names, select from list).
- Alternate tunings for Fretboard (still standard-only in logic today).
- “Daily challenge” (fixed set of questions per day).
- Optional cloud backup of progress (account required).
- iPad/tablet layout improvements (e.g. split view for theory + game).

---

## How to use this doc

- **Prioritize:** Move items between phases or into “Backlog” as priorities change.
- **When you start a feature:** Add a short “In progress” or “Next” section at the top with the current focus and link to PRODUCT.md once it’s shipped.
- **When you ship:** Update PRODUCT.md and optionally add a one-line “Shipped” note and date under the feature here or in a small changelog at the bottom.

---

*Last updated: Feb 2025. Adjust phases and items to match your goals and capacity.*
