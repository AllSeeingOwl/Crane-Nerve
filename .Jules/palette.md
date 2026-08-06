## 2024-03-20 - Adding focus-visible outlines

**Learning:** The buttons across the app (MainMenu, GameOver, LevelComplete, LevelSelect, and GameUI) lack specific `focus-visible:` styles which limits keyboard accessibility.
**Action:** Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none` (or similar matching the theme) to all interactive elements.

## 2024-03-21 - Dynamic Progress & Toggle Buttons

**Learning:** For interactive UI mini-games (like Level 1 Olfactory), tracking rapid mutations is difficult for screen readers. However, meaningful, slower progress indicators (like "Identified: X / Y") greatly benefit from `aria-live="polite"` so the user receives auditory success feedback without spamming them during gameplay.
**Action:** When identifying core success indicators or progress states in an app that update incrementally (not every frame), add `aria-live="polite"`. Additionally, when using `<button>` elements to select/deselect items (like inventory or tools), always add `aria-pressed={isSelected}` to correctly identify the toggle state.

## 2024-03-21 - Auto-focus intra-level action buttons

**Learning:** Buttons used as start conditions or interaction triggers within individual mini-games (e.g. "Start Movement") are easily missed by keyboard navigation, breaking the flow.
**Action:** Automatically focus these intra-level primary action buttons on component mount/render and include explicit semantic keyboard hints (like `<kbd>ENTER</kbd>`) natively integrated into the button UI, mirroring the transition screen pattern.

## 2024-03-22 - Dynamic aria-valuenow in Game Loops

**Learning:** High-frequency game loops often use `useRef` and direct DOM mutation (bypassing React state) for performance. If progress bars (`role="progressbar"`) are updated this way, their `aria-valuenow` attribute won't update unless explicitly mutated via `.setAttribute()`, causing screen readers to announce stale values.
**Action:** When optimizing progress indicators in `requestAnimationFrame` loops, always attach a `ref` to the container `div` and dynamically update `containerRef.current.setAttribute("aria-valuenow", value)` alongside the visual style changes.

## 2024-03-22 - Adding Aria-Live Textual Progress to Rapid Visual States

**Learning:** For interactive UI mini-games (like Level 3 Eye Movement), progress bars update rapidly, but relying only on `aria-valuenow` can still be too abstract or verbose for screen readers. Providing a structured, slow-updating text string (e.g. "Nodes Traced: X / Y") is more meaningful and pleasant.
**Action:** Always complement abstract or rapid `role="progressbar"` elements with a concrete, slower-updating textual equivalent wrapped in an `aria-live="polite"` container, ensuring auditory feedback is both reliable and contextual.
## $(date +%Y-%m-%d) - Keyboard Accessibility for Mouse-centric Controls
**Learning:** Some custom interactions (like using the mouse wheel for "focus" in an optic nerve test) can completely block keyboard-only users from progressing if no alternative input is provided and native elements aren't used.
**Action:** When identifying mouse-only custom controls (like mouse wheel scroll), always ensure an explicit keyboard alternative (like ArrowUp/ArrowDown) is intercepted in a corresponding keydown listener, and surface the shortcut visually using `<kbd>` elements in the UI.
