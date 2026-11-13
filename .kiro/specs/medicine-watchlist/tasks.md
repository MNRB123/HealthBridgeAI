# Implementation plan: Medicine Watchlist

- [x] 1. Create the `useWatchlist` hook (`src/hooks/useWatchlist.ts`)
  - Types, id derivation, 10-item limit, `toggle` returning `added | removed | full`.
  - Validates stored data and falls back to an empty list.
  - _Requirements: 1.2, 1.3, 1.4, 3.1, 3.3_

- [x] 2. Create the `Watchlist` component (`src/components/Watchlist.tsx`)
  - Empty state, item rows labelled as demo prices with saved date.
  - Remove and "Compare again" buttons with item-specific accessible names.
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 5.1_

- [x] 3. Integrate into the Medicine Price Finder
  - "Save to watchlist" toggle with `aria-pressed`, limit message.
  - "Compare again" restores name, dosage, quantity, and toggles, then shows results.
  - _Requirements: 1.1, 1.3, 2.3, 5.2_

- [x] 4. Write tests (`src/test/watchlist.test.tsx`, 12 tests)
  - Save, duplicate toggle, remove, limit, persistence, malformed storage (3 cases), compare again.
  - Asserts no price-change or alert text is shown.
  - _Requirements: 1 to 4_

- [x] 5. Verify
  - `npm run build`, `npm test` (48 passing), `npm run check:demo-data` all pass.
  - "Delete all saved demo data" clears `hb_watchlist` (covered by a test).
  - _Requirements: 3.2_

- [x] 6. Update docs
  - README feature table and test count updated; linked from the main `tasks.md`.

## Not verified

- Visual layout of the new panel and button at phone, tablet, and desktop widths (tests run in jsdom, not a real browser).
- Screen-reader behavior beyond what Testing Library's accessible-name queries confirm.
