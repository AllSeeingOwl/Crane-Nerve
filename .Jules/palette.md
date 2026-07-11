## 2024-03-20 - Adding focus-visible outlines
**Learning:** The buttons across the app (MainMenu, GameOver, LevelComplete, LevelSelect, and GameUI) lack specific `focus-visible:` styles which limits keyboard accessibility.
**Action:** Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none` (or similar matching the theme) to all interactive elements.