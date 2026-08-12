# Cranial Nerve Crisis - Godot Migration Knowledge Base

This folder contains the core logic and design documents extracted from the original React prototype.

## How to use this with an AI Agent in Godot:
1. Copy this entire folder into your new Godot project repository (e.g., in a `docs/migration/` folder).
2. When you start building a level (like the Olfactory nerve), you can instruct the AI:
   > "I am building Level 1 in Godot. Please read `docs/migration/02_Level1_Olfactory.md` to understand the original React logic (mouse follow, lag, stress calculation). Help me write the equivalent GDScript for a RigidBody2D."
3. The AI will use these files as the source of truth for the game mechanics, variable names, and math, ensuring the Godot version feels the same as the prototype.

## Contents:
- **00_Game_Design_Document.md**: The master plan and feel of the game.
- **01_GameEngine_State.md**: How stress and level transitions are handled globally.
- **02 to 05 Levels**: The core game loops (`requestAnimationFrame`), math, and physics for the mini-games.
- **06_DoctorsOffice3D_Layout.md**: The 3D coordinates for the background room, which you can use to position Godot CSG or 3D nodes.
- **07_Math_Utils.md**: Math optimization tables.
