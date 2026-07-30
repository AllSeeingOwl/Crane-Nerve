## 2024-03-20 - Adding focus-visible outlines

**Learning:** The buttons across the app (MainMenu, GameOver, LevelComplete, LevelSelect, and GameUI) lack specific `focus-visible:` styles which limits keyboard accessibility.
**Action:** Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none` (or similar matching the theme) to all interactive elements.

## 2024-03-21 - Dynamic Progress & Toggle Buttons

**Learning:** For interactive UI mini-games (like Level 1 Olfactory), tracking rapid mutations is difficult for screen readers. However, meaningful, slower progress indicators (like "Identified: X / Y") greatly benefit from `aria-live="polite"` so the user receives auditory success feedback without spamming them during gameplay.
**Action:** When identifying core success indicators or progress states in an app that update incrementally (not every frame), add `aria-live="polite"`. Additionally, when using `<button>` elements to select/deselect items (like inventory or tools), always add `aria-pressed={isSelected}` to correctly identify the toggle state.
