# Cranial Nerve Crisis

A physics-based comedy medical simulator where you perform a 12-part cranial nerve exam with deliberately awful controls and deadpan patient reactions.

## Run & Operate

- `pnpm --filter @workspace/cranial-nerve-crisis run dev` — run the game (port 24089)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Game: React + Vite (no Three.js/R3F — uses SVG/Canvas/CSS for all levels)
- API: Express 5 (backend not used by game)
- Styling: Tailwind CSS v4, monospace CRT aesthetic

## Where things live

- `artifacts/cranial-nerve-crisis/src/` — game source
- `artifacts/cranial-nerve-crisis/src/game/` — all game screens and logic
- `artifacts/cranial-nerve-crisis/src/game/levels/` — individual level components
- `artifacts/cranial-nerve-crisis/src/game/types.ts` — level definitions, dialogue, types

## Architecture decisions

- No physics library — all physics (spring, inertia, lag) is hand-rolled in `useEffect`/`setInterval` loops
- Each level is a self-contained React component handling its own rendering and input
- Game state machine lives in `App.tsx` — screen transitions, stress, score
- Stress meter is global; each level calls `onStressChange(delta)` to modify it
- SVG used for character faces/scenes for crisp scaling; HTML Canvas for mouse-physics levels

## Product

- 5 playable cranial nerve exam levels (CN I, V, VII, IX/X, XII)
- Unique deliberately-broken control scheme per level
- Stress meter that ends the game if maxed out
- Deadpan British understatement dialogue from patient
- CRT scanline aesthetic, EKG decorations, monospace UI throughout
- Level select showing all 12 nerves (7 locked as "coming soon")

## User preferences

_Populate as you build_

## Gotchas

- `@react-three/fiber`, `@react-three/drei`, and `three` are installed but not currently used — game uses CSS/SVG instead
- Level IDs in `LEVELS` array: implemented levels are id=1,4,5,7,9 (matching GDD nerve numbers)
- `GameEngine.tsx` routes by levelId — add new levels here

## Pointers

- Game Design Document: `attached_assets/Cranial_Nerve_Crisis_*.docx`
- See the `pnpm-workspace` skill for workspace structure
