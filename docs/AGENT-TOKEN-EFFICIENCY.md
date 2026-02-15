# Agent & Token Efficiency

Tips to complete work with Cursor (or similar AI coding agents) without overspending on tokens. Token use scales with context size and conversation length, so the goal is **smaller, focused context** and **fewer round-trips**.

---

## 1. Give the agent strong project context (once)

- **CLAUDE.md / .cursorrules** — Keep build commands, structure, testing approach, and conventions up to date. The agent reads these first and makes fewer wrong guesses and fewer file reads.
- **Docs in `docs/`** — PRODUCT.md, ROADMAP.md, LAUNCH-PLAN.md give the agent product and launch context without re-explaining in every chat.
- **Path aliases and naming** — Consistent patterns (e.g. `@/src/...`) and clear file names help the agent target the right files and use fewer searches.

**Effect:** Less exploratory search, fewer files opened, fewer tokens per task.

---

## 2. Narrow the context you send

- **@-mention only what’s needed** — e.g. `@src/stores/storage.ts` instead of “look at the whole project.” Avoid @-mentioning huge files or entire folders unless necessary.
- **Prefer specific file paths** — “In `app/(tabs)/settings.tsx` add a toggle for X” uses less context than “add a toggle somewhere in the app.”
- **One clear task per request** — “Add a confirmation dialog before Reset Progress in `progress.tsx`” is cheaper than “improve the progress screen and also fix anything else you see.”

**Effect:** Smaller context window per turn, lower token cost per request.

---

## 3. Break big work into small, named steps

- **Chunk by file or feature** — e.g. “1) Add type in storage.ts, 2) Add hook in useProgress, 3) Wire dialog in progress.tsx” instead of one giant “redo progress reset.”
- **Refer back to your docs** — “Implement the Fretboard progress item from ROADMAP Phase 1” lets the agent use the doc instead of long back-and-forth.
- **Use a todo list** — For multi-step tasks, a short list in the chat or in a doc keeps scope clear and reduces re-explanation.

**Effect:** Fewer long conversations, less re-sending of the same files, clearer completion criteria.

---

## 4. Reduce back-and-forth

- **State constraints up front** — “Use the existing Button and Card from `@/src/components/ui`, no new dependencies” avoids the agent proposing alternatives and you correcting.
- **Point to patterns** — “Same persistence pattern as chord game in storage.ts” instead of re-describing the pattern.
- **Accept small, reviewable edits** — Prefer “add this function to X” then “now call it from Y” over one request that touches many files and needs multiple fixes.

**Effect:** Shorter threads, fewer tokens per task.

---

## 5. Avoid token-heavy habits

- **Don’t paste huge logs or full file contents** unless the agent must see them. Prefer: “Test X fails with [one-line error] in component Y.”
- **Don’t re-open the whole codebase** — Start with the minimal set of files (or a single doc) and add more only if the agent asks or the task expands.
- **Close or summarize old chats** — For a new task, a new chat with a focused first message is usually cheaper than a 50-message thread with lots of history.

**Effect:** Lower baseline context and fewer redundant tokens.

---

## 6. Use rules and skills for repeatable patterns

- **Cursor rules** (e.g. in `.cursor/rules/`) — Encode project-specific rules: “New games get a screen in `app/games/`, a card on the home screen, and progress in storage.”
- **Skills** — For recurring workflows (e.g. “add a new game,” “add a Cursor rule”), a well-defined skill can cut down exploratory steps.

**Effect:** The agent follows conventions without re-reading multiple files each time.

---

## Quick checklist before a session

- [ ] Task is scoped to one or two files or one clear doc section.
- [ ] I’ve @-mentioned only the files the agent needs.
- [ ] CLAUDE.md / docs are up to date so the agent can trust them.
- [ ] I’m starting a new chat for a new, unrelated task.

---

*Adjust these to how you and your team actually use the agent; the biggest wins usually come from smaller context and clearer, chunked tasks.*
