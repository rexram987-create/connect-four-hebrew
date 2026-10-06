# ארבע בשורה לנייד

משחק PWA בעברית: מול המחשב בשלוש רמות קושי, או שני שחקנים באותו מכשיר. התקנה למסך הבית ומשחק ללא אינטרנט לאחר טעינה ראשונה.

## Development

Requires Node.js 20+; no runtime dependencies.

- `npm test` — game, AI, UI state and offline cache tests.
- `npm run build` — copies the static application into `dist/`.
- `python3 -m http.server 4173 --directory public` — local development.
- `node scripts/browser-check.cjs` — optional Chromium checks (requires Playwright installed in `CODEX_PRIMARY_RUNTIME_NODE_MODULES`).

Deploy on Vercel with the checked-in `vercel.json`. Hard difficulty uses a module worker. Installation availability depends on browser and device; manual instructions are always available outside standalone mode. The service worker stores a complete version and waits for old tabs to close before adopting an update.

## Project files

`public/game.js`: pure rules. `public/ai.js`: three opponents. `public/ai-worker.js`: background hard AI. `public/app.js`: Hebrew game interaction. `public/install.js`: install guidance. `public/sw.js`: versioned offline cache.
