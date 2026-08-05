# Iraya

**Iraya** is a cozy pixel-art farming and village-restoration game set on a fictional Filipino-inspired mountainside.

## Play in the browser

**https://slydum.github.io/Iraya-/**

Every successful push to `main` exports the Godot project and deploys the generated WebAssembly build to GitHub Pages. Pull requests run the same export as a validation check without publishing it.

## Phase B: Farm Tools

The current development build adds the first interactive farming loop on top of the Phase A browser foundation:

- A 16×16 interaction cursor projected from the player's facing direction
- Four selectable tools: Hand, Hoe, Seeds, and Watering Can
- Independent tile state for tilled, planted, and watered soil
- Context feedback for valid and invalid actions
- A brief player tool-use state that temporarily pauses movement
- Keyboard and touchscreen controls for selecting and using tools
- A procedural, license-safe public fallback while purchased art stays local

## Controls

| Action | Desktop | Touchscreen |
| --- | --- | --- |
| Move | WASD or arrow keys | Directional pad |
| Sprint | Hold Shift | Hold RUN |
| Previous / next tool | Q / E | `< TOOL` / `TOOL >` |
| Select tool directly | 1–4 | Cycle with tool buttons |
| Use selected tool | F, Space, or Enter | USE |

Recommended farming sequence: select **Hoe**, till a plot tile, plant it with **Seeds**, then use the **Watering Can**.

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

## Install the asset pack locally

The purchased Modern Farm source archive is intentionally not committed or deployed. Run:

```bash
python tools/import_modern_farm.py /path/to/Modern_Farm_v1.2.zip
```

See [`docs/ASSET_SETUP.md`](docs/ASSET_SETUP.md) for the selected files and licensing safeguards. The hosted build continues to use procedural fallback visuals until a license-safe final-art delivery strategy is selected.

## Project status

- [Phase A — Browser Farm Sandbox](docs/PHASE_A.md)
- [Phase B — Farm Tools](docs/PHASE_B.md)
