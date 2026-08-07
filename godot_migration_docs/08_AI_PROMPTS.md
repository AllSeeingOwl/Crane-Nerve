# Godot Migration: AI Prompts Guide

Use these prompts when working with an AI assistant (like me) in your new Godot project. These are designed to bridge the gap between the React prototype logic and Godot's node-based architecture.

## Phase 1: Project & Architecture Setup
**Use this when first creating the project.**

> "I am migrating a React web game to Godot 4. I have a folder called `docs/migration/` containing the original source code as Markdown files. First, read `docs/migration/01_GameEngine_State.md`. How should we structure the global state (like the 'Stress' meter and Level transitions) in Godot? Should we use an Autoload (Singleton) for this?"

> "Based on `01_GameEngine_State.md`, I need a Game Engine controller. I want to build a Main Scene that holds the 3D environment in the background and loads the 2D minigames on top via an overlay. Write the GDScript for an Autoload called `GameManager` that tracks `stress`, handles `onWin` and `onLose` signals, and manages loading different level scenes."

## Phase 2: Building the 3D Environment
**Use this when recreating the background room.**

> "Read `docs/migration/06_DoctorsOffice3D_Layout.md`. This contains the layout of a doctor's office originally built in React-Three-Fiber. I want to recreate this room in Godot. Can you give me a list of Godot CSG nodes (CSGBox3D, etc.) and their specific `position` and `size` vectors based on this React code so I can build the room?"

> "In the original `06_DoctorsOffice3D_Layout.md`, there is a `CameraRig` that follows the mouse with parallax movement. I have a `Camera3D` node in my Godot scene. Write a GDScript to attach to this camera so it smoothly interpolates towards the mouse position using `lerp()`, similar to the React logic."

## Phase 3: Porting Level Mechanics
**Use these when tackling individual mini-games. Always reference the specific markdown file.**

**Example for Level 1 (Olfactory):**
> "I am building Level 1. Read `docs/migration/02_Level1_Olfactory.md`. In the React version, the patient's nose wanders around randomly and evades the mouse if a 'bad' smell is held. I am making this in 2D in Godot. I have a `RigidBody2D` for the nose and an `Area2D` for the smell vial following the mouse. Write the `_physics_process(delta)` GDScript for the nose to replicate this wandering and evasion logic using Godot's vector math."

**Example for Level 4 (Trigeminal - The Laggy Tool):**
> "Read `docs/migration/05_Level4_Trigeminal.md`. This level features a medical tool that follows the mouse with extreme lag using `tool.x += dx * 0.02`. In Godot, I have a `Sprite2D` for the tool. Write a GDScript using `_process(delta)` that replicates this heavy, laggy cursor feel, but ensure it is frame-rate independent by using `delta` instead of hardcoded numbers."

## Phase 4: Troubleshooting Physics & UI
**Use these when things feel "off" compared to the original.**

> "In the React prototype, I was calculating distances using basic math: `dx * dx + dy * dy`. Now in Godot, I am using `Vector2.distance_to()`, but the speed feels different. Read the original math in `docs/migration/02_Level1_Olfactory.md` and tell me how I should adjust my Godot speed multipliers to match the feel of the React version."

> "I need to build the Stress UI progress bar. In the React app, this was driven by a high-frequency `requestAnimationFrame` loop. In Godot, I have a `TextureProgressBar`. How should I link the `GameManager`'s stress variable to this progress bar efficiently using Signals, rather than checking it every frame in `_process`?"
