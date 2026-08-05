# Iraya

**Iraya** is a cozy pixel-art farming and village-restoration game set on a fictional Filipino-inspired mountainside.

## Play in the browser

**https://slydum.github.io/Iraya-/**

Every successful push to `main` exports the Godot project and deploys the generated WebAssembly build to GitHub Pages. Pull requests run the same export as a validation check without publishing it.

## Current build

The current build includes:

- A browser-playable farm sandbox
- Eight-direction movement and sprinting
- Hand, Hoe, Seeds, and Watering Can tools
- Tilled, planted, and watered soil states
- Desktop and touchscreen controls
- The real **Modern Farm Farmer 1** sprite for idle and walking animations
- A compact, game-ready runtime sheet derived from the purchased source pack

## Controls

| Action | Desktop | Touchscreen |
| --- | --- | --- |
| Move | WASD or arrow keys | Directional pad |
| Sprint | Hold Shift | Hold RUN |
| Previous / next tool | Q / E | `< TOOL` / `TOOL >` |
| Select tool directly | 1–4 | Cycle with tool buttons |
| Use selected tool | F, Space, or Enter | USE |

Recommended farming sequence: select **Hoe**, till a plot tile, plant it with **Seeds**, then use the **Watering Can**.

## Sprite-pack integration

Iraya uses the purchased **Modern Farm v1.2** pack by limezu. The original archive and full source sheets are not committed. Only compact runtime textures containing frames actively used by the game are included.

The player runtime sheet contains:

- Four directional idle poses
- Five-frame walk cycles in four directions
- Nearest-neighbor pixel rendering

Artist credit: **limezu.itch.io**.

## Run locally

1. Install Godot **4.7.1 stable** and its export templates.
2. Clone the repository.
3. Open `project.godot` in Godot.
4. Press **F5** to run the game.
5. To test the browser build, export the `Web` preset to `build/web/index.html` and serve that directory with a local web server.

Command-line export:

```bash
godot --headless --path . --export-release "Web" build/web/index.html
```

## Project status

- [Phase A — Browser Farm Sandbox](docs/PHASE_A.md)
- [Phase B — Farm Tools](docs/PHASE_B.md)
