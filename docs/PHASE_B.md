# Phase B — Farm Tools

## Goal

Add the first browser-playable farming interaction loop without weakening Phase A movement, mobile support, deployment, or asset-license safeguards.

## Acceptance criteria

- [x] The player projects a 16×16 cursor from the current facing direction.
- [x] The cursor clearly distinguishes valid farm tiles from invalid targets.
- [x] Hand, Hoe, Seeds, and Watering Can tools are selectable.
- [x] Q/E cycles tools on desktop.
- [x] Number keys 1–4 select tools directly.
- [x] F, Space, or Enter uses the selected tool.
- [x] Touchscreen players can cycle tools and use the selected tool.
- [x] Hoe converts an untouched plot tile into tilled soil.
- [x] Seeds require tilled soil.
- [x] Watering requires tilled soil.
- [x] Repeating an already completed action gives contextual feedback rather than corrupting tile state.
- [x] The HUD reports selected tool, target tile, plot totals, and feedback.
- [x] Successful tool use briefly enters a movement-blocking tool state.
- [x] The public browser build remains functional without licensed binary assets.
- [ ] Curated Modern Farm terrain and farmer animation mapping is verified against the locally purchased archive.

## Farming state model

Each plot cell stores independent bit flags:

- `TILLED`
- `SEEDED`
- `WATERED`

This keeps the Phase B implementation small while allowing later phases to layer crop type, growth stage, day progression, harvest output, and persistence onto the same 16×16 cell coordinates.

## Controls

| Action | Desktop | Touchscreen |
| --- | --- | --- |
| Move | WASD or arrow keys | Directional pad |
| Sprint | Hold Shift | Hold RUN |
| Previous / next tool | Q / E | `< TOOL` / `TOOL >` |
| Direct tool selection | 1–4 | Cycle tools |
| Use tool | F, Space, or Enter | USE |

## Asset boundary

Modern Farm v1.2 is a purchased pack. The source PNG/GIF files remain ignored and are not redistributed through GitHub or GitHub Pages. Phase B therefore keeps the procedural renderer as the public fallback and isolates gameplay logic from final sprite and tile resources.

The local importer already installs the selected terrain, building, crop, tree, pickup, movement, digging, watering, and harvesting sheets. Final atlas coordinates and animation slicing must be verified against an installed local archive before those resources replace the fallback renderer.

## Known limitations

- No day clock or automatic crop growth exists yet.
- No inventory quantities or seed consumption exists yet.
- The Hand tool inspects planted soil but cannot harvest until crop growth is added.
- Farm state is not saved between sessions.
- The public build still uses procedural fallback art.

## Phase C entry point

Add a day/time loop, crop definitions and growth stages, inventory quantities, harvesting, and browser-safe save data. Once the local Modern Farm atlas mapping is verified, connect its crop and farmer animations to the same state machine rather than changing gameplay rules.
