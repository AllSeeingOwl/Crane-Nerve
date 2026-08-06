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

## 2024-05-16 - Prevent unnecessary re-renders in game loop (Level2Optic)

**Learning:** Using React state (`useState`) to update variables inside high-frequency game loops (like `requestAnimationFrame`) causes unnecessary and expensive full-component re-renders 60 times a second.
**Action:** When working with high-frequency continuous loops in React, replace `useState` with `useRef` to hold mutable values without triggering re-renders, and use refs targeting DOM elements (`HTMLDivElement`) to mutate the DOM properties directly inside the loop.

## 2025-07-27 - [Reduce unnecessary re-renders in game loop]

**Learning:** React state updates inside a `requestAnimationFrame` loop run on every frame and trigger a full component re-render (60 frames per second). This leads to terrible performance for high-frequency game loops.
**Action:** When creating high-frequency UI updates like progress bars inside a `requestAnimationFrame` loop, omit `useState`. Instead, use `useRef` to maintain references to DOM nodes and mutate them directly (e.g. `ref.current.style.width = '...'` or `ref.current.setAttribute('aria-valuenow', '...')`).

## 2024-03-24 - [Reduce unnecessary re-renders in Level8Accessory]

**Learning:** Using `useState` for visual game variables (`resistanceScore`, `timeHeld`, `dragVector`) inside the high-frequency `requestAnimationFrame` loop in `Level8Accessory` triggers constant component re-renders.
**Action:** Replaced `useState` with `useRef` for these values and utilized direct DOM manipulation for the progress bars, resistance meter, and drag lines to bypass React's rendering overhead entirely.

## 2026-07-29 - [Avoid SetState for TimeRemaining in Game Loops]

**Learning:** Unconditionally calling `setState` inside a high-frequency `requestAnimationFrame` game loop, even for slowly changing values like a `timeRemaining` counter (e.g., ticking down by seconds), forces React to queue state updates and triggers unnecessary component re-renders up to 60 times a second.
**Action:** Replace `useState` with `useRef` for tracking the time (and other similar variables). When a change in the value is detected, use a secondary ref to the target DOM element to mutate the `textContent` or `style` directly, bypassing React's rendering overhead entirely.

## 2024-05-16 - [Extract High-Frequency State Checks to Prevent Re-renders]

**Learning:** When a child component only needs a high-frequency state variable (like a 60fps `stress` meter) to evaluate a single threshold (e.g., `if (stress >= 100) lose()`), passing the primitive value as a prop causes the child component to unnecessarily re-render 60 times a second.
**Action:** Extract the threshold logic and its associated messages/handlers into the parent component (e.g., `GameEngine.tsx`). Then, omit the high-frequency primitive from the child's props. For children that _actually_ need the value inside a `requestAnimationFrame` loop (like `Level5FacialNerve`), pass it as a `React.RefObject` to preserve a stable prop signature while allowing synchronous access.

## 2024-05-15 - Fast distance constraints without Math.sqrt

**Learning:** In Position Based Dynamics (PBD) for game loops, constraint resolution (like springs or links) often runs multiple times per frame per segment (e.g., 5 iterations _ 9 segments _ 60fps = 2700 times/sec). Calculating exact distances using `Math.sqrt` is a major bottleneck. Furthermore, directly replacing the percent error function `(dist - L) / (2 * dist)` with `(distSq - L*L) / (distSq + L*L)` will cause a factor-of-2 overcorrection error which can explode game physics.
**Action:** Replace `Math.sqrt(distSq)` with squared distance approximations for small distances near a target length `L`: Instead of calculating `percent = (dist - L) / dist / 2`, calculate `percent = (distSq - L*L) / (distSq + L*L) / 2`. This accurately models the first order Taylor expansion of the original function while avoiding expensive root operations in the hot path.

## 2024-05-16 - Prevent 60fps Re-renders and Expensive Math inside Game Loops

**Learning:** Using `Math.atan2`, `Math.cos`, and `Math.sin` inside high-frequency `requestAnimationFrame` game loops for vector normalization (e.g., pointing a velocity vector toward a target) is a performance bottleneck. Computing angle using `atan2` and converting back to components using `sin` and `cos` adds unnecessary overhead.
**Action:** Replace `Math.atan2`, `Math.cos`, and `Math.sin` with direct vector normalization. Use `Math.sqrt(distSq)` to find the distance and normalize the `dx` and `dy` components directly (`dx / dist` and `dy / dist`) when you just need the direction vector.

## 2024-05-17 - [Optimize Trigonometric Functions in Game Loops]

**Learning:** Using native `Math.sin()` and `Math.cos()` inside 60fps `requestAnimationFrame` game loops for visual elements like circular targets or camera shakes introduces unnecessary computational overhead, especially as the number of elements scales.
**Action:** Replace `Math.sin()` and `Math.cos()` with pre-computed lookup tables (LUTs) using `Float32Array`. Create utility functions `fastSin()` and `fastCos()` to quickly retrieve approximated values based on mapped indices, significantly reducing CPU cycles per frame with negligible visual difference.

## 2026-08-04 - [Optimize Trigonometric Functions in Window Vignettes and Models]\n**Learning:** Using native `Math.sin()` and `Math.cos()` inside 60fps `requestAnimationFrame` game loops for visual elements like flickering stars, procedural effects, and subtle model bobs introduces unnecessary computational overhead, especially as the number of elements scales.\n**Action:** Replaced `Math.sin()` and `Math.cos()` with pre-computed lookup tables (LUTs) using `fastSin()` and `fastCos()` from `src/lib/mathLUT.ts` to reduce CPU cycles per frame with negligible visual difference.

## 2024-08-05 - Avoid expensive Array.find in game loops and use inverse square root for vector normalization

**Learning:** In high-frequency 60fps `requestAnimationFrame` game loops, using `Array.find` to look up elements (even small arrays) can cause noticeable overhead because it gets evaluated 60 times a second. Additionally, when normalizing vectors, dividing by `Math.sqrt()` is slower than multiplying by the inverse (`1 / Math.sqrt()`).
**Action:** Precompute a lookup map (`Record<string, T>`) for `O(1)` access outside the component/loop instead of using `Array.find` inside it. Use `1 / Math.sqrt()` and multiply the components instead of dividing them directly by `Math.sqrt()`.

## 2024-05-18 - [Optimize Array Lookups]

**Learning:** When retrieving objects from a static array based on an ID that matches the array index, using `Array.find()` loops over the array sequentially ($O(N)$), which adds unnecessary operations compared to a direct array lookup ($O(1)$), especially when the array is relatively large or accessed frequently.
**Action:** Replace `Array.find(item => item.id === targetId)` with direct index access like `array[targetId - 1]` whenever the array elements' IDs correspond directly to their indices.
