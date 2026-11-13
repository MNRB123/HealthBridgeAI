# HealthBridge AI

A demo healthcare accessibility app for people in the United States: find affordable care, compare medicine prices, and access mental wellness support.

> Demo only. All providers, pharmacies, prices, and appointments are fictional. Not for medical use.

## Built with Kiro

This project was built in Kiro, following a staged plan: requirements, an approved implementation plan, then incremental build phases, each checked with a type-check and production build.

## Kiro files (`.kiro/`)

- **Steering** (`.kiro/steering/`): `product.md` and `tech.md` always apply. `mental-wellness-safety.md` loads when wellness code is edited.
- **Spec** (`.kiro/specs/healthbridge-app/`): requirements, design, and tasks, with open items left unchecked.
- **Hooks** (`.kiro/hooks/`): a demo-data guard on file save, a wellness safety reminder before edits, and a build check when the agent stops.

These were added after the first build phases, so they document and guard the project from here on. They are not a record of earlier sessions.

## Run it

```powershell
npm install
npm run dev      # http://localhost:5173
npm test         # 48 automated UI tests
npm run build    # type-check + production build
```

No login is required. On the Login page, choose **Continue as demo user**. The app works fully without a backend.

## What works (verified by automated tests)

The tests render the real app in jsdom and click through each flow.

| Area | Verified behavior |
|---|---|
| Navigation | All 6 pages open; sidebar links, header search routing, notification menu |
| Login / Sign up | Demo login (persists across refresh, log out works); field validation; clear error when the backend is unreachable |
| Medicine Price Finder | Search; prices change with drug, quantity and insurance toggle; coupon dialog; sort and filter |
| Medicine Watchlist | Save a search, no duplicates, 10-item limit, remove, "Compare again", survives refresh and bad storage, never shows invented price changes. Built from its own spec: `.kiro/specs/medicine-watchlist/` |
| Healthcare Finder | ZIP required; radius slider, provider-type tiles and filters narrow results; call / directions / virtual dialogs |
| Mental Wellness | Crisis phrases route to 988 support; keyword replies; mood journal save and delete; breathing exercise start and stop |
| Appointments | Book (validated), reschedule, cancel, delete; correct date and 12-hour time formatting |
| Settings | Font size, high contrast, reduced motion apply app-wide; toggles persist |

Journal entries, appointments and settings are saved in the browser (local storage). They are not sent to a server.

## Known limitations

- **Backend not run.** The FastAPI backend in `backend/` (JWT auth, SQLite, OpenAI chat) is written but has never been started or tested. This machine's Application Control policy blocked its Python packages, and Docker was not tested. The frontend does not depend on it.
- **Real accounts need the backend.** Without it, sign up and log in show an error. Use the demo user.
- **The AI chat is scripted.** Replies are keyword-based. A real model reply needs the backend plus an OpenAI key.
- **Chat history is not saved.** The mood journal is.
- **Not browser-tested.** The tests run in jsdom, not a real browser. Visual layout at phone, tablet and desktop widths has not been checked in one.
- **Linter not run.** `oxlint` is blocked by the same Application Control policy.
- **Demo dates are hardcoded** and will go stale.

## Safety

- A 988 crisis banner is always visible on the Mental Wellness page.
- Chat messages with crisis language return a 988 referral. Matching is tested for phrases like "suicidal", "want to die" and "hurt myself".
- Every data screen carries a demo label and disclaimer.
