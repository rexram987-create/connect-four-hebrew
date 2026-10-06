# ארבע בשורה — תוכנית מימוש

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Hebrew mobile Connect Four PWA with local two-player and three computer difficulty levels.

**Architecture:** A static client application separates pure game rules, computer decision-making and UI state. The hard opponent runs in a Web Worker; a versioned service worker caches the complete self-contained application. Site setup and delivery use the supported Sites workflow after the plan is approved.

**Tech Stack:** Semantic HTML, responsive CSS, JavaScript ES modules, Web Worker, Service Worker, Web App Manifest; Node built-in test runner for pure logic.

**Spec:** `docs/superpowers/specs/2026-10-06-connect-four-design.md`

## Global Constraints

- ממשק בעברית מימין לשמאל, לוח כחול ודיסקיות אדומות וצהובות.
- הלוח כולל שבע עמודות ושש שורות ומתאים לרוחב הטלפון ללא גלילה אופקית.
- השחקן האדום מתחיל. מול המחשב, המשתמש אדום והמחשב צהוב.
- משחק מרחוק אינו חלק מהגרסה הראשונה.
- בזמן חשיבת המחשב ולאחר סיום המשחק אין קבלת מהלכים נוספים.
- שינוי מצב או קושי מתחיל משחק חדש ומבטל כל מהלך מחשב ממתין.
- בחירות מצב וקושי נשמרות מקומית; המשחק הפעיל מתחיל מחדש בפתיחה חדשה.
- אין תלות בקבצים חיצוניים הדרושים להפעלת המשחק אופליין.
- קובץ הגדרת PWA עם שם, צבעים וסמלי PNG בגודל 192 ו־512 פיקסלים, כולל סמל מתאים למסכת מערכת.

## Review Focus

1. Rapid repeated taps while the computer is thinking must not insert extra disks; check in Task 3.
2. A worker answer arriving after reset or mode change must not affect the new game; check in Task 3.
3. Disabled or corrupt browser storage must leave the game playable; check in Task 3.
4. A narrow viewport, keyboard use and reduced-motion preference must preserve usable controls; check in Task 3.
5. Reopening offline and installing an update must load one coherent app version; check in Task 4.

All product file paths below are relative to the registered Site checkout selected at execution. Keep the approved spec and plan alongside the project documentation. If Sites setup provides an existing stack, preserve it and adjust only the placement of static modules, not their interfaces or behavior.

### Task 1: Rules engine and project setup

**Files:** Create `public/game.js`, `tests/game.test.js`; add the Node test command to the project package configuration while preserving its package manager and lockfile.

**Interfaces:** `createBoard() -> number[6][7]`; `legalColumns(board) -> number[]`; `dropDisk(board, column, player) -> {board, row} | null` returns a copied board; `getOutcome(board) -> {winner: 0|1|2, cells: [row,column][], draw: boolean}`. Empty cells are 0, red is 1, yellow is 2; rows run top to bottom, columns physically left to right regardless of RTL text.

- [ ] Write failing Node tests: empty board has 6 rows, 7 columns and 7 legal moves; drop reaches row 5 and preserves original board; a seventh disk in one column returns null; out-of-range/non-integer columns return null. Add horizontal, vertical and both diagonal win fixtures and a full board without any winning line returning draw.
- [ ] Run `node --test tests/game.test.js`; confirm failure because the module has not been implemented.
- [ ] Initialize the supported Site checkout, preserving its required files; implement the four pure interfaces with input guards and four-direction win detection.
- [ ] Run `node --test tests/game.test.js`; require every assertion to pass.
- [ ] Commit the rules engine and its tests.

### Task 2: Three computer levels

**Files:** Create `public/ai.js`, `public/ai-worker.js`, `tests/ai.test.js`.

**Interfaces:** Consume Task 1 exports. Produce `chooseMove(board, player, difficulty, random = Math.random) -> number | null`, where difficulty is `easy`, `medium` or `hard`. Worker request is `{requestId, board, player, difficulty}`; response is `{requestId, column}`. A finished board returns null.

- [ ] Write failing tests with an injected deterministic random function: every level chooses a legal move; a board with one available column selects it; terminal boards return null; medium and hard take a direct win and block a direct opponent win. Add a hard-level fixture where avoiding a forced loss requires looking beyond one ply.
- [ ] Run `node --test tests/ai.test.js`; confirm missing-module failure.
- [ ] Implement easy as random legal selection. Implement medium using immediate win, immediate block, then center and window scoring. Implement hard using depth-5 minimax, alpha-beta pruning and center-first move ordering; handle terminal scores before cutoff. Worker wraps the same pure interface and echoes requestId.
- [ ] Run `node --test tests/game.test.js tests/ai.test.js`; require all tests to pass and confirm the hard fixture demonstrates deeper reasoning.
- [ ] Commit AI modules and tests.

### Task 3: Hebrew mobile game interface

**Files:** Create `public/index.html`, `public/styles.css`, `public/app.js`, `public/favicon.svg`. If setup requires a generated static output, copy these to its public output directory through the supported build command.

**Interfaces:** Consume the game exports and the worker protocol. UI state contains board, player, mode (`computer` or `local`), difficulty, outcome, thinking and incrementing requestId. A reset invalidates outstanding worker responses. Preferences use a validated localStorage record; catch read/write failures.

- [ ] Add failing integration checks for one disk per accepted move, blocked input while thinking, ignored stale response after reset, and no moves after game over. Use the available browser test tooling; select actual column controls by accessible name.
- [ ] Run the checks against the initial page; confirm the missing controls or behavior fail.
- [ ] Implement the blue board with seven semantic column buttons, touch and keyboard activation, visible focus, red/yellow disks, short drop animation and winner highlighting. Add Hebrew turn/thinking/result text with live announcements, mode and difficulty selectors, new-game button and short rules. Use a persistent worker for hard mode and request IDs for all pending computer turns.
- [ ] Implement responsive sizing, targets at least 44px where practical, readable labels, explicit player labels, reduced-motion support, and guarded preference reads/writes. Default to computer/medium when no valid preferences exist; starting a new game sets red to move.
- [ ] Show the first meaningful local preview only after a representative board and primary controls render successfully, if this runtime supports a user-facing preview.
- [ ] Run integration checks and play complete local and computer games. At 360px viewport confirm no horizontal overflow; activate all column controls by keyboard; emulate reduced motion; inject invalid preferences and denied storage; reset during a hard calculation and confirm no old move appears.
- [ ] Commit the interface and verification results.

### Task 4: Installability, offline delivery and final verification

**Files:** Create `public/manifest.webmanifest`, `public/sw.js`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/maskable-512.png`; modify `public/index.html`, `public/app.js` and Site hosting configuration as required for static publishing.

**Interfaces:** Manifest uses Hebrew name `ארבע בשורה`, `lang: he`, `dir: rtl`, display standalone and matching scope/start URL. Service worker uses one cache name per release and an explicit complete file list including both workers and all modules. Installation caches the complete list before activation; activate removes obsolete app caches. Defer takeover of an active old page until reload to avoid mixing code versions.

- [ ] Check that the initial site has no manifest/service worker/icons and record the expected failure of installability/offline checks.
- [ ] Create matching original PNG icons using standard drawing tools, wire metadata and register the service worker. Cache all required local assets without external runtime dependencies. Capture `beforeinstallprompt` to expose an install button only when available; otherwise show short browser-appropriate installation instructions. Hide the offer in standalone mode.
- [ ] Validate manifest JSON, icon dimensions, worker registration and all cached URLs. Load once online, close/reopen in offline mode and play both local and computer games at all three levels. Test an updated release: an existing game remains functional, a reload receives the complete new release, and old app caches are removed after activation.
- [ ] Run all pure and integration tests; run the supported static build. Record checks and any device-specific installation limits without claiming a real Android install unless observed.
- [ ] Publish using sites-hosting and verify a terminal successful deployment plus the live game, manifest, icons and worker URLs. If publication is unavailable, provide the complete saved project and state that it is not yet published.
- [ ] Save deliverables using the appropriate supported Site/file workflow, commit final changes, and hand off a working link with concise install instructions.
