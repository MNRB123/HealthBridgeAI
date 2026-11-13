---
inclusion: always
---

# Tech stack and workflow

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 3, React Router 6.
- Backend (`backend/`): FastAPI, SQLAlchemy, SQLite, JWT auth, OpenAI. Written but **not yet run end to end**.
- Tests: Vitest with jsdom and Testing Library (`src/test`).

#[[file:package.json]]

## Commands

| Task | Command |
|---|---|
| Dev server | `npm run dev` |
| Real type check + build | `npm run build` |
| UI tests | `npm test` |
| Demo-data guard | `npm run check:demo-data` |

## Gotchas learned on this project

- **`tsc --noEmit` checks nothing here.** The root tsconfig only has project references. Use `tsc -b` (what `npm run build` runs).
- **Windows PowerShell 5.1 corrupts UTF-8.** `Get-Content`/`Set-Content` without `-Encoding UTF8` can write invalid bytes (a `·` became a broken byte and broke the Vite build). Edit files with the editor tools, or use Node, not PowerShell read/write.
- **Application Control blocks native binaries** on this machine (`oxlint`, Python wheels with compiled extensions). Do not rely on them locally.
- Display settings are applied through classes on `<html>` (`hb-font-large`, `hb-contrast`, `hb-reduce-motion`, `hb-compact`) from `SettingsContext`.
- Persisted app data uses `localStorage` keys prefixed `hb_`. "Delete all data" removes every `hb_` key.
- Use real `<button role="switch">` for toggles, never a clickable `<div>`.
- Each page has exactly one `<h1>`, in the page body. The header title is not a heading.
