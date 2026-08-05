# Phase A — Farm Sandbox

## Goal

Create a stable, playable foundation before implementing farming systems.

## Acceptance criteria

- [x] Project opens as a Godot 4.7 project.
- [x] Main scene launches directly.
- [x] Player moves in eight directions.
- [x] Arrow keys and physical WASD are supported.
- [x] Holding Shift increases movement speed.
- [x] The camera follows smoothly and remains inside the farm.
- [x] The player cannot leave the farm boundaries.
- [x] The farmhouse, pond, and trees block movement.
- [x] The game runs without licensed binary assets.
- [x] A local, license-safe asset installation script exists.

## Technical choices

- Internal viewport: **480×270**
- World size: **960×640**
- Source art grid: **16×16**
- Renderer: **GL Compatibility**
- Physics: **60 Hz**
- Player: `CharacterBody2D`
- World collision: generated `StaticBody2D` rectangles

## Known limitations

- Visuals are procedural greyboxes rather than final tiles.
- Player animation is a code-drawn placeholder.
- No interaction, tools, inventory, farming, time, or saving exists yet.
- Engine execution was not available in the build environment, so the project requires an editor smoke test after cloning.

## Phase B entry point

Replace the greybox world with the curated Modern Farm 16×16 tiles and configure the farmer sprite sheet. Then add an interaction cursor and tool state machine.
