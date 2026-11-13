---
inclusion: fileMatch
fileMatchPattern: "**/{MentalWellness.tsx,ai_service.py,wellness.py}"
---

# Mental wellness safety rules

Loaded automatically when editing the wellness chat or its AI service.

1. The 988 crisis banner must stay visible on every Mental Wellness tab. Do not make it dismissible.
2. Crisis language must **bypass the AI** and return a 988 referral. This applies in both `getResponse` (frontend) and `CRISIS_PATTERNS` (backend).
3. **Never end crisis regexes with `\b`.** `suicid\b` does not match "suicidal" and silently disables the safeguard. Use prefix matching and test real phrases ("I feel suicidal", "I want to die", "I might hurt myself").
4. Avoid broad single words that cause false alarms ("harm", "die", "jump").
5. The assistant never diagnoses, prescribes, or claims to be a therapist. Keep the system prompt's limits.
6. Crisis messages are stored with `is_crisis_flagged=True` so they can be reviewed.
7. Any change to these patterns needs a matching test in `src/test/pages.test.tsx`.
