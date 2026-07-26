## 2024-03-24 - [GameEngine Re-render Teardown Cycle]

**Learning:** High-frequency state updates (like 60fps `stress` from a `requestAnimationFrame` loop) managed in a parent component (`App.tsx`) cause inline callbacks to be recreated every frame. When these volatile callbacks are passed into child components and used inside `useEffect` dependency arrays, it triggers full `useEffect` teardowns 60 times a second. In this app, it was actively destroying and recreating the `requestAnimationFrame` game loops every single frame!
**Action:** Use the "latest ref" pattern (`useRef` + `useCallback`) in the intermediary parent (`GameEngine.tsx`) to stabilize callback references sent to heavy/looping child components. Combine with `useMemo` for sibling components (like heavy R3F `<Canvas>`) that don't need to respond to the 60fps state changes.

## 2024-03-24 - [Math.hypot Performance Overhead in Game Loops]

**Learning:** Using `Math.hypot(dx, dy)` inside high-frequency `requestAnimationFrame` loops introduces unnecessary overhead. While convenient for distance calculations, `Math.hypot` contains internal logic to prevent floating-point underflow/overflow. For standard screen coordinates used in the game levels, this protection is entirely unnecessary, and the function becomes a micro-bottleneck when called multiple times per frame.
**Action:** Replace `Math.hypot` with standard Pythagorean calculations (`Math.sqrt(dx * dx + dy * dy)` or `Math.sqrt(dx ** 2 + dy ** 2)`) or, even better, compare squared distances (`dx*dx + dy*dy < radius*radius`) directly in hot code paths.

## 2023-07-14 - Direct DOM Mutation inside requestAnimationFrame

**Learning:** Found components (e.g., Level9Hypoglossal) triggering `setState` inside 60fps `requestAnimationFrame` loops for continuously updating visual elements (like position or SVG paths). This causes rapid React diffing and teardowns.
**Action:** Instead of `useState` variables in the loop, use `useRef` to target DOM elements and mutate properties directly (`style.left`, `setAttribute("d")`) to avoid React rendering overhead. Make sure to fix visual UI state (like `cursor-grab`) that were relying on the coincidental 60fps re-render to update classes.

## 2024-03-24 - [useState Bugs inside requestAnimationFrame]

**Learning:** Using `useState` alongside closures inside a `requestAnimationFrame` loop not only causes massive re-render overhead but can create subtle bugs where event listeners (like keyboard presses) modifying state aren't seen by the game loop (which captures the initial state in its closure), causing immediate overrides.
**Action:** Use `useRef` for all game loop state (positions, health). This provides a mutable, shared reference that both the game loop and asynchronous event listeners can read/write to instantly without closure capture issues, while also bypassing React rendering overhead entirely when combined with direct DOM manipulation.

## 2024-03-24 - [Avoid `useState` inside `requestAnimationFrame`]

**Learning:** High-frequency `useState` updates inside a `requestAnimationFrame` loop cause unnecessary React re-renders and diffing, significantly impacting performance.
**Action:** Instead of `useState`, use `useRef` to track changing values, along with a ref to the DOM element (`useRef<HTMLDivElement>(null)`). Mutate the element's styles directly (`elementRef.current.style.transform = ...`) inside the loop, entirely bypassing React rendering overhead.

## 2026-07-19 - [Direct DOM Mutation for Position Updates in Level7GagReflex]

**Learning:** The `Level7GagReflex` component was using `useState` to update the `throatPos` and `depressorPos` inside a 60fps `requestAnimationFrame` loop. This caused excessive React re-renders and diffing, degrading performance.
**Action:** Replaced the `useState` hooks with `useRef` for the target DOM elements and updated their `style.left` and `style.top` directly within the loop. This completely bypasses the React rendering cycle for high-frequency position updates.

## 2026-07-20 - [Direct DOM Mutation for Position Updates in Multiple Levels]

**Learning:** Components `Level1Olfactory`, `Level3EyeMovement`, `Level5FacialNerve`, and `Level6Tuning` were triggering `useState` (`setNosePos`, `setPenlightPos`, `setCursorPos`, `setForkPos`) inside a 60fps `requestAnimationFrame` loop to continuously update visual elements positions. This caused excessive React diffing and teardowns.
**Action:** Replaced the `useState` hooks with `useRef` for the target DOM elements and updated their `style.left` and `style.top` directly within the loop. This completely bypasses the React rendering cycle for high-frequency position updates, resulting in much smoother performance.

## 2024-11-20 - [Distance calculations micro-optimizations in hot loops]

**Learning:** High-frequency `requestAnimationFrame` loops used `** 2` which gets transpiled or interpreted with exponentiation logic, and recalculated differences like `(mouseRef.current.x - tX)` twice. Extracting differences to variables and using direct multiplication (`dx * dx`) avoids redundant property lookups and exponentiation overhead, yielding tighter and faster code execution.
**Action:** Extract distance differences into `dx` and `dy` variables and replace `(a - b) ** 2` with `dx * dx + dy * dy` in `distSq` calculations running at 60fps in the level components.

## 2024-07-23 - Prevent 60fps Re-renders in Level11NightShift

**Learning:** High-frequency `useState` updates inside `requestAnimationFrame` game loops cause severe performance degradation due to constant React re-renders.
**Action:** Always use `useRef` for high-frequency game loop variables and directly mutate the DOM via `useRef` handles instead of relying on React state and declarative rendering for components that update every frame.

## 2024-07-23 - Prevent 60fps Re-renders in Level11NightShift\n**Learning:** High-frequency `useState` updates inside `requestAnimationFrame` game loops cause severe performance degradation due to constant React re-renders.\n**Action:** Always use `useRef` for high-frequency game loop variables and directly mutate the DOM via `useRef` handles instead of relying on React state and declarative rendering for components that update every frame.\n

## 2024-07-25 - [Prevent 60fps Re-renders in Level1Olfactory]

**Learning:** High-frequency `useState` updates (`setSmellProgress`) inside a `requestAnimationFrame` loop caused unnecessary React re-renders of the entire `Level1Olfactory` component every single frame just to animate a small progress bar.
**Action:** Replaced the state update with direct DOM manipulation using `useRef` for the progress bar container and its fill element. Using `ref.current.style.width` within the game loop bypasses React's rendering overhead and ensures smooth performance.

## $(date +%Y-%m-%d) - Prevent unnecessary re-renders in game loop (Level2Optic)

**Learning:** Using React state (`useState`) to update variables inside high-frequency game loops (like `requestAnimationFrame`) causes unnecessary and expensive full-component re-renders 60 times a second.
**Action:** When working with high-frequency continuous loops in React, replace `useState` with `useRef` to hold mutable values without triggering re-renders, and use refs targeting DOM elements (`HTMLDivElement`) to mutate the DOM properties directly inside the loop.
