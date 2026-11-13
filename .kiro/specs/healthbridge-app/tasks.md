# Implementation plan: HealthBridge AI

Status reflects what has been verified. Unchecked items are genuinely open.

- [x] 1. Scaffold the project
  - Vite + React + TypeScript, Tailwind theme (blue, green, purple, amber), React Router.
  - _Requirements: 1_

- [x] 2. Layout and navigation
  - [x] 2.1 Sidebar with mobile drawer, header with search and notification menu
  - [x] 2.2 Reusable `NavItem`, `DashboardCard`, `Modal`
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 3. Dashboard page with four feature cards
  - _Requirements: 1.1_

- [x] 4. Medicine Price Finder
  - [x] 4.1 Search form with autocomplete, results table, mobile cards
  - [x] 4.2 Demo prices respond to drug, quantity, insurance
  - [x] 4.3 Fictional coupon dialog
  - [x] 4.4 Remove real pharmacy names; add `check:demo-data` guard
  - _Requirements: 2_

- [x] 5. Healthcare Finder
  - [x] 5.1 ZIP validation, radius, budget, specialty, insurance, provider-type filters
  - [x] 5.2 Provider cards, list/map toggle, fictional contact dialogs
  - _Requirements: 3_

- [x] 6. Mental Wellness
  - [x] 6.1 Chat with keyword replies and crisis routing to 988
  - [x] 6.2 Fix crisis regexes that missed "suicidal" and "anxious"
  - [x] 6.3 Mood journal (persist, delete), breathing exercise, resources
  - _Requirements: 4_

- [x] 7. Appointments
  - [x] 7.1 Book with validation, tabs, cancel, delete
  - [x] 7.2 Reschedule; local-date and 12-hour time formatting; persistence
  - _Requirements: 5_

- [x] 8. Accounts and settings
  - [x] 8.1 Login and Sign Up pages with demo login
  - [x] 8.2 Settings that apply app-wide and persist
  - _Requirements: 6_

- [x] 9. Automated UI tests (36 tests, Vitest + Testing Library)
  - _Requirements: 1 to 6_

- [x] 10. Backend code (FastAPI, SQLAlchemy, JWT, OpenAI) and Docker files
  - _Requirements: 7_

- [x] 10b. Medicine Watchlist (built from its own spec)
  - See `.kiro/specs/medicine-watchlist/` for requirements, design, and tasks.
  - _Requirements: 2 (extends)_

- [ ] 11. Run the backend end to end
  - Blocked locally: Application Control policy blocks Python native packages; Docker untested.
  - Then verify register, login, journal, appointments, and wellness chat against the running API.
  - _Requirements: 7.1, 7.2_

- [ ] 12. Check layout in a real browser at 375px, 768px, and 1280px
  - Tests run in jsdom, so visual layout is unverified.

- [ ] 13. Run the linter
  - `oxlint` is blocked by Application Control on this machine.

- [ ] 14. Deploy the static frontend and add the public URL to the README
  - `vercel.json` and `public/_redirects` are in place but untested.
