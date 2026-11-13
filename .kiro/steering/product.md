---
inclusion: always
---

# HealthBridge AI: product rules

HealthBridge AI helps people in the United States find affordable healthcare, compare medicine prices, and access mental wellness support. It is a **demo application**.

## Non-negotiable data rules

- Never invent real healthcare providers, pharmacies, medicine prices, or medical information.
- All providers and pharmacies use clearly fictional names ("Demo Pharmacy One", "Demo City, NY").
- Every screen that shows provider, price, or appointment data carries a visible "Demo" label or disclaimer.
- Do not name real pharmacy chains or discount-card brands in sample data. `npm run check:demo-data` enforces this.
- Real public resources (988 Lifeline, 211, HRSA, Medicaid) may be mentioned as pointers only. Never attach invented prices, hours, or claims to them.
- Do not connect external APIs from the frontend. The backend owns any future integration.

## Theme

Blue (primary), green (success), purple (accent), amber (warning), white surfaces. Colors live in `tailwind.config.js`. Reuse those tokens instead of adding new colors.

## Pages

Dashboard, Medicine Price Finder, Healthcare Finder, Mental Wellness AI, Appointments, Settings, plus Login and Sign Up. Shared UI belongs in `src/components`.
