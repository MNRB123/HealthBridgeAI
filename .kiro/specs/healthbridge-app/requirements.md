# Requirements: HealthBridge AI

## Introduction

HealthBridge AI is a demo web app that helps people in the United States find affordable healthcare, compare medicine prices, and access mental wellness support. All data is fictional.

## Requirements

### 1. Dashboard and navigation

**User story:** As a visitor, I want a dashboard and clear navigation, so that I can reach every feature quickly.

1. WHEN the app loads THEN the system SHALL show a header, a sidebar, and a dashboard with four cards: Medicine Savings, Find Healthcare, Mental Wellness, Appointments.
2. WHEN the viewport is below the desktop breakpoint THEN the sidebar SHALL become a slide-in drawer opened from a hamburger button.
3. WHEN a user selects a navigation item THEN the system SHALL show that page and highlight the active item.
4. WHEN a user submits the header search THEN the system SHALL route to the most relevant page.

### 2. Medicine Price Finder

**User story:** As someone paying for prescriptions, I want to compare prices across pharmacies, so that I can spend less.

1. WHEN a user searches a drug THEN the system SHALL show a comparison table with demo prices, distance, stock, and rating.
2. WHEN the drug, quantity, or insurance toggle changes THEN the displayed demo prices SHALL change.
3. WHEN a user opens a coupon THEN the system SHALL show a clearly fictional code.
4. The system SHALL NOT show real pharmacy names, real prices, or real coupon codes.

### 3. Healthcare Finder

**User story:** As someone without insurance, I want to find low-cost care nearby, so that I can get treated.

1. WHEN a user searches without a 5-digit ZIP THEN the system SHALL show a validation error.
2. WHEN a user sets the radius, budget, specialty, insurance, or provider type THEN the results SHALL narrow accordingly.
3. WHEN a user selects Call, Directions, or Virtual THEN the system SHALL show a dialog stating the provider is fictional.

### 4. Mental Wellness

**User story:** As someone who feels stressed, I want supportive tools, so that I can check in with myself.

1. The system SHALL show a 988 crisis banner on every Mental Wellness tab.
2. WHEN a chat message contains crisis language (for example "suicidal", "want to die", "hurt myself") THEN the system SHALL return a 988 referral and SHALL NOT send it to the AI.
3. WHEN a user saves a mood journal entry THEN the system SHALL persist it and allow deletion.
4. WHEN a user starts a breathing exercise THEN the system SHALL guide inhale, hold, and exhale phases and allow stopping.
5. The assistant SHALL NOT diagnose, prescribe, or present itself as a therapist.

### 5. Appointments

1. WHEN a user books an appointment without title, date, and time THEN the system SHALL show a validation error.
2. WHEN a user books, reschedules, cancels, or deletes an appointment THEN the change SHALL persist across refresh.
3. The system SHALL display dates in the user's local calendar day and times in 12-hour format.

### 6. Accounts and settings

1. WHEN a user chooses "Continue as demo user" THEN the system SHALL log them in without a backend or credentials.
2. WHEN the backend is unreachable THEN login and sign up SHALL show a clear error instead of failing silently.
3. WHEN a user changes font size, contrast, motion, or compact mode THEN the change SHALL apply across all pages and persist.
4. Every screen with provider, price, or appointment data SHALL carry a visible demo label.

### 7. Backend (planned)

1. The system SHALL provide FastAPI endpoints for auth, journal, appointments, wellness chat, medicine search, and healthcare search.
2. WHEN the backend is running with an OpenAI key THEN wellness chat SHALL use the model, after the same crisis check.
