# Cranial Nerve Crisis

Welcome to **Cranial Nerve Crisis**, a physics-based comedy medical simulator where you play the role of a slightly incompetent doctor performing a 12-part cranial nerve exam. The catch? The controls are deliberately awful, and the patient's reactions to your catastrophic failures are incredibly deadpan.

Inspired by games like QWOP and Surgeon Simulator, this game turns a calming, ASMR-like medical procedure into an absolute circus.

## 🧠 High-Concept
Perform delicate medical procedures. Try not to stress out your patient. Don't poke any eyes out. Expect chaotic physics, early-2000s PC game aesthetics, and a healthy dose of ambient dread from the "Window of Distraction."

## 🎮 Features
- **12 Unique Levels:** Each level represents a different cranial nerve test with its own deliberately convoluted control scheme.
- **Physics-Based Chaos:** Characters react to your inputs with extreme, floppy physics. You'll encounter "The Human Noodle" and "The Juggernaut of Jiggle."
- **Stress Meter:** Clumsy actions increase the patient's stress. Max it out, and you fail.
- **Catastrophic Failures:** Specific actions result in instant, comical "Game Over" states.
- **Ambient Dread:** A quiet, relaxing ASMR soundscape juxtaposed against absolute on-screen failure, with deadpan, Monty Python-esque dialogue.
- **The Window of Distraction:** Strange, unsettling background events distract you from the intense focus required to not fail miserably.

## 🛠 Tech Stack
- **Frameworks:** React + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS (with a healthy dose of monospace CRT aesthetics)
- **3D Engine:** React-Three-Fiber (R3F) for the background doctor's office scene
- **Package Manager:** pnpm (Workspaces)

## 🚀 Running the Game

To get started, make sure you have `pnpm` installed.

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Run the Game:**
   ```bash
   pnpm --filter @workspace/cranial-nerve-crisis run dev
   ```
   The game will be available at `http://localhost:24089`.

3. **Run the API Server (Optional):**
   ```bash
   pnpm --filter @workspace/api-server run dev
   ```
   *Note: The API server is not currently required for the core gameplay.*

4. **Typecheck:**
   ```bash
   pnpm run typecheck
   ```

## 📁 Repository Structure
- `src/` - Core application source
  - `src/components/game/` - Game engine, UI, and 3D environment
  - `src/components/levels/` - Individual mini-games for each cranial nerve test
  - `src/pages/` - Main menu, level select, and end screens
  - `src/types/` - Shared TypeScript definitions
  - `src/lib/` - Shared utilities and state management

## 📝 Design Document
For more details on the inspiration, mechanics, and art direction, check out the original Game Design Document: `Cranial_Nerve_Crisis_1778081661703.md`.
