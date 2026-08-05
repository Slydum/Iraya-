# Phase A — Browser Farm Sandbox

## Goal

Create a stable, browser-playable foundation before implementing farming systems.

## Acceptance criteria

- [x] Project opens as a Godot 4.7 project.
- [x] Main scene launches directly.
- [x] Player moves in eight directions.
- [x] Arrow keys and physical WASD are supported.
- [x] Touchscreen directional controls are available in mobile browsers.
- [x] Holding Shift or RUN increases movement speed.
- [x] The camera follows smoothly and remains inside the farm.
- [x] The player cannot leave the farm boundaries.
- [x] The farmhouse, pond, and trees block movement.
- [x] The game runs without licensed binary assets.
- [x] A local, license-safe asset installation script exists.
- [x] A single-threaded Web export preset is committed.
- [x] Pull requests validate the Godot browser export.
- [x] Pushes to `main` deploy the build through GitHub Pages.

## Technical choices

- Primary target: **Web browser**
- Internal viewport: **480×270**
- World size: **960×640**
- Source art grid: **16×16**
- Renderer: **GL Compatibility**
- Web export: **single-threaded WebAssembly/WebGL 2.0**
- Physics: **60 Hz**
- Player: `CharacterBody2D`
- World collision: generated `StaticBody2D` rectangles
- Deployment: **GitHub Actions → GitHub Pages**

## Browser delivery

The `Web` export writes to `build/web/index.html`. The deployment workflow performs a headless Godot project validation, creates the browser build, verifies the HTML, WebAssembly, and PCK outputs, and publishes the result after changes reach `main`.

The licensed Modern Farm source artwork is not part of the automated build. Phase A deliberately uses procedural placeholders so the hosted game and repository remain safe to share.

## Known limitations

- Visuals are procedural greyboxes rather than final tiles.
- Player animation is a code-drawn placeholder.
- Touch controls are functional placeholders rather than final game UI.
- No interaction, tools, inventory, farming, time, or saving exists yet.

## Phase B entry point

Replace the greybox world with the curated Modern Farm 16×16 tiles and configure the farmer sprite sheet. Then add an interaction cursor and tool state machine while preserving browser and touchscreen support.
