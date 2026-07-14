## 2024-03-24 - [GameEngine Re-render Teardown Cycle]

**Learning:** High-frequency state updates (like 60fps `stress` from a `requestAnimationFrame` loop) managed in a parent component (`App.tsx`) cause inline callbacks to be recreated every frame. When these volatile callbacks are passed into child components and used inside `useEffect` dependency arrays, it triggers full `useEffect` teardowns 60 times a second. In this app, it was actively destroying and recreating the `requestAnimationFrame` game loops every single frame!
**Action:** Use the "latest ref" pattern (`useRef` + `useCallback`) in the intermediary parent (`GameEngine.tsx`) to stabilize callback references sent to heavy/looping child components. Combine with `useMemo` for sibling components (like heavy R3F `<Canvas>`) that don't need to respond to the 60fps state changes.

## 2024-03-24 - [Math.hypot Performance Overhead in Game Loops]

**Learning:** Using `Math.hypot(dx, dy)` inside high-frequency `requestAnimationFrame` loops introduces unnecessary overhead. While convenient for distance calculations, `Math.hypot` contains internal logic to prevent floating-point underflow/overflow. For standard screen coordinates used in the game levels, this protection is entirely unnecessary, and the function becomes a micro-bottleneck when called multiple times per frame.
**Action:** Replace `Math.hypot` with standard Pythagorean calculations (`Math.sqrt(dx * dx + dy * dy)` or `Math.sqrt(dx ** 2 + dy ** 2)`) or, even better, compare squared distances (`dx*dx + dy*dy < radius*radius`) directly in hot code paths.

## 2023-07-14 - Direct DOM Mutation inside requestAnimationFrame

**Learning:** Found components (e.g., Level9Hypoglossal) triggering `setState` inside 60fps `requestAnimationFrame` loops for continuously updating visual elements (like position or SVG paths). This causes rapid React diffing and teardowns.
**Action:** Instead of `useState` variables in the loop, use `useRef` to target DOM elements and mutate properties directly (`style.left`, `setAttribute("d")`) to avoid React rendering overhead. Make sure to fix visual UI state (like `cursor-grab`) that were relying on the coincidental 60fps re-render to update classes.
