# Iraya

**Iraya** is a cozy pixel-art farming and village-restoration game set on a fictional Filipino-inspired mountainside.

## Phase A: Farm Sandbox

The current build establishes the technical foundation:

- Godot 4.7.1 project configuration
- A playable top-down farm sandbox
- Eight-direction player movement using WASD or arrow keys
- Sprinting with Shift
- Smooth camera tracking with world limits
- Farm boundaries and environmental collision
- Placeholder procedural visuals that run without proprietary art
- A safe local import workflow for the Modern Farm asset pack

## Run locally

1. Install Godot **4.7.1 stable**.
2. Clone this private repository.
3. Open `project.godot` in Godot.
4. Press **F6/F5** to run.

### Controls

| Action | Input |
| --- | --- |
| Move | WASD or arrow keys |
| Sprint | Hold Shift |

## Install the asset pack locally

The purchased Modern Farm source archive is intentionally not committed. Run:

```bash
python tools/import_modern_farm.py /path/to/Modern_Farm_v1.2.zip
```

See [`docs/ASSET_SETUP.md`](docs/ASSET_SETUP.md) for the selected files and licensing safeguards.

## Project status

Phase A is a functional greybox. The next step is replacing procedural placeholders with a curated 16×16 Modern Farm tileset and character animation resource.
