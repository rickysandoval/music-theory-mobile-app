# Music Theory Mobile — Launch Plan

What needs to be done to move from **development** to **production-ready** (e.g. first store release or public TestFlight/Internal Testing). Use this as a checklist and adjust for your target (e.g. Android-only vs Android + iOS).

---

## 1. Code & quality

| Task | Status / notes |
|------|-----------------|
| All tests passing | CI runs `npm test` and coverage; fix any failing or flaky tests. |
| Coverage thresholds met | Current: 70% statements/lines, 75% functions, 50% branches. Run `npm run test:coverage` and fix or relax if needed. |
| TypeScript clean | CI runs `npx tsc --noEmit`. Resolve all type errors. |
| Lint clean | Run `npm run lint`; fix or document any exceptions. |
| Remove or guard debug logs | Search for `console.log` / `console.debug` in production paths (e.g. pitch detection, permission flow); remove or wrap in `__DEV__`. |
| Error boundaries | Ensure root and key screens have error boundaries so one failure doesn’t blank the app. |
| Sensitive data | No API keys or secrets in repo; use env or EAS secrets if needed later. |

---

## 2. App configuration (app.json / EAS)

| Task | Status / notes |
|------|-----------------|
| Version and build number | Set `version` in `app.json` (e.g. 1.0.0). For store builds, use EAS to bump `android.versionCode` / iOS CFBundleVersion as needed. |
| App name and slug | Already set (Music Theory, music-theory-mobile). Confirm display name is final. |
| Icons and splash | Ensure `icon`, `adaptiveIcon`, `splash` point to final assets; no placeholders in production. |
| Orientation | Currently portrait; lock or allow landscape only if intentional. |
| Permissions | Android: RECORD_AUDIO, MODIFY_AUDIO_SETTINGS. iOS: NSMicrophoneUsageDescription. Remove any unused permissions. |
| EAS project | `extra.eas.projectId` and owner already set. Confirm EAS project is under correct account. |
| Build profiles | `eas.json`: development, preview (APK), production (AAB). Confirm production profile is what you want for store. |

---

## 3. Store assets and listing (Google Play example)

| Task | Status / notes |
|------|-----------------|
| App icon | 512×512 PNG (and any required variants) for store listing. |
| Feature graphic | 1024×500 for Play Store. |
| Screenshots | At least 2 (phone); consider 7” and 10” if targeting tablets. Show main flows: home, one game, progress, settings. |
| Short description | ~80 chars. |
| Full description | Clear value proposition, features, and optional “Coming soon” (e.g. Interval Training, Scale Patterns). |
| Privacy policy URL | Required if you collect any user data (see Privacy below). |
| Content rating | Complete questionnaire in Play Console (and equivalent for iOS if applicable). |
| Target audience / age | Set in store console. |
| Pricing | Free vs paid; in-app products if any. |

---

## 4. Privacy and compliance

| Task | Status / notes |
|------|-----------------|
| Data collection | Current app: no analytics or backend; only local storage (settings, progress). If you add analytics or crash reporting, document it. |
| Privacy policy | Publish a policy that matches behavior (e.g. “We do not collect personal data; all data stays on device”). Link in store listing and optionally in Settings > About. |
| Microphone | Already declared: Android permissions and iOS NSMicrophoneUsageDescription. Ensure in-app explanation (e.g. “Used only for Listen mode in Fretboard”) is clear. |
| No account required | If you stay no-login, state that in description and policy. |

---

## 5. Build and distribution

| Task | Status / notes |
|------|-----------------|
| EAS login and project | `eas login`; confirm correct project linked. |
| Production Android build | `npm run build:android:prod` or `eas build --platform android --profile production`. Produces AAB for Play Store. |
| Test the build | Install AAB on a real device (internal testing or download from EAS); smoke-test main flows and microphone (Listen mode). |
| iOS (if launching on iOS) | Add production (or internal) iOS profile in EAS; build and upload to TestFlight/App Store Connect. Resolve signing and provisioning. |
| Versioning | Decide strategy: e.g. manual bump in app.json + EAS auto-increment for build numbers, or EAS versioning. |

---

## 6. Pre-launch testing

| Task | Status / notes |
|------|-----------------|
| Happy path | Install production build; run through: open app → Games → Chord Spelling (practice + test) → Fretboard (identify/find, and listen if mic granted) → Progress → Settings (theme, chord toggles). |
| Permissions | Deny microphone: confirm Fretboard Listen mode shows clear message; grant later and retest. |
| Offline | App works offline; no hidden network calls. |
| Low storage / background | Optional: test with low space or after app was killed; ensure no crashes on cold start. |
| Devices | Test on at least one physical Android device (and one iOS device if shipping iOS). |
| Regression | After any “launch” change, re-run tests and key user flows. |

---

## 7. Post-launch (optional but recommended)

| Task | Status / notes |
|------|-----------------|
| Crash reporting | Consider EAS or a provider (e.g. Sentry) for production crashes; add after first release if desired. |
| Analytics | If you add events (e.g. game started, test completed), document in privacy policy and keep minimal. |
| Feedback channel | Support email or in-app “Send feedback” so users can report issues. |
| Update strategy | Plan how you’ll ship fixes (e.g. new store build vs OTA if you introduce OTA later). |

---

## 8. Launch checklist summary

- [ ] Tests and TypeScript pass in CI  
- [ ] Lint clean; debug logs removed or dev-only  
- [ ] app.json version and assets final; permissions minimal  
- [ ] EAS production Android build succeeds and is tested on device  
- [ ] Store assets and listing text ready (icon, screenshots, description)  
- [ ] Privacy policy published and linked (if required or desired)  
- [ ] Content rating and target audience set in store  
- [ ] (If iOS) iOS build and TestFlight/App Store steps done  
- [ ] One full pass of pre-launch testing on real device(s)  

---

*Use this as a living checklist; tick items as you complete them and add project-specific rows (e.g. “Legal review”, “Marketing assets”) as needed.*
