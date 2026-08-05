# Iraya

**Iraya** is a cozy pixel-art farming and village-restoration game set on a fictional Filipino-inspired mountainside.

## Play in the browser

The primary Phase A target is the browser:

**https://slydum.github.io/Iraya-/**

Every successful push to `main` exports the Godot project and deploys the generated WebAssembly build to GitHub Pages. Pull requests run the same export as a validation check without publishing it.

## Phase A: Browser Farm Sandbox

The current build establishes the technical foundation:

- Godot 4.7.1 project using the Compatibility renderer
- A single-threaded HTML5/WebAssembly export preset
- Automatic GitHub Pages deployment
- A playable top-down farm sandbox
- Eight-direction movement using keyboard or touch controls
- Sprinting with Shift or the on-screen RUN button
- Smooth camera tracking with world limits
- Farm boundaries and environmental collision
- Placeholder procedural visuals that run without proprietary art
- A safe local import workflow for the Modern Farm asset pack

## Controls

| Action | Desktop | Touchscreen |
| --- | --- | --- |
| Move | WASD or arrow keys | On-screen directional pad |
| Sprint | Hold Shift | Hold RUN |

## Run locally

1. Install Godot **4.7.1 stable** and its export templates.
2. Clone this private repository.
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

See [`docs/ASSET_SETUP.md`](docs/ASSET_SETUP.md) for the selected files and licensing safeguards.

## Project status

Phase A is a browser-first functional greybox. The next step is replacing procedural placeholders with a curated 16×16 Modern Farm tileset and character animation resource.
