# Requirements: Medicine Watchlist

## Introduction

People who take regular medication re-check the same prices again and again. Today the Medicine Price Finder forgets every search. This feature lets a user save a medicine search to a watchlist and re-run it later. It extends requirement 2 of `healthbridge-app`.

All prices remain fictional demo data. This feature must not make them look real.

## Requirements

### 1. Save a search

**User story:** As someone who refills the same prescription, I want to save a search, so that I don't have to re-enter it.

1. WHEN a user views search results THEN the system SHALL show a "Save to watchlist" button.
2. WHEN a user saves THEN the system SHALL store the medicine name, dosage, quantity, the generic and insurance settings, and the best demo price at that moment.
3. WHEN the same medicine, dosage, and quantity is already saved THEN the button SHALL show a saved state and clicking it SHALL remove the item, not create a duplicate.
4. WHEN the watchlist already holds 10 items THEN the system SHALL refuse to add another and SHALL explain why.

### 2. View and manage the watchlist

1. The system SHALL show the watchlist on the Medicine Price Finder, whether or not a search has been run.
2. WHEN the watchlist is empty THEN the system SHALL show a short explanation instead of an empty box.
3. WHEN a user selects "Compare again" on an item THEN the system SHALL restore that search's inputs and show fresh results.
4. WHEN a user removes an item THEN it SHALL disappear immediately.
5. Each item SHALL be labelled as a demo price and show when it was saved.

### 3. Persistence

1. The watchlist SHALL persist across page refresh.
2. WHEN the user chooses "Delete all saved demo data" in Settings THEN the watchlist SHALL be cleared.
3. If stored data is missing or malformed THEN the system SHALL start with an empty watchlist instead of crashing.

### 4. Data integrity (guardrails)

1. The system SHALL NOT show simulated price drops, price alerts, or "you saved" claims. The demo prices are deterministic, so any change shown would be invented.
2. The system SHALL NOT send watchlist data to any server.

### 5. Accessibility

1. Every control SHALL have an accessible name that identifies the medicine it acts on.
2. The saved state SHALL be exposed to assistive technology, not only by color or icon.
