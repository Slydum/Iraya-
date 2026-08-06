# Sprite World Phase 1

## Goal

Replace the procedural farm background with an authored, browser-ready world assembled from the licensed Modern Farm v1.2 asset pack while preserving the existing movement, collisions, mobile controls, and farming logic.

## Included

- Modern Farm grass terrain across the complete 960×640 world
- Modern Farm dirt crossroads and field border
- Modern Farm soil base aligned to the existing 16×11 farming plot
- Modern Farm farmhouse
- Modern Farm pond artwork
- Modern Farm trees, young trees, and stumps
- Collision geometry aligned to the new visual objects
- Godot import validation for the world texture

## Runtime asset policy

The repository contains only the compact, game-ready world texture used by Iraya. The complete purchased tilesheets and source archive are not included or redistributed.

## Acceptance criteria

- [x] `farm_world.gd` no longer draws procedural grass, paths, buildings, water, or trees.
- [x] The world is rendered by a standard Godot `Texture2D` resource.
- [x] The existing farming grid remains aligned at `(272, 224)` with 16-pixel cells.
- [x] Farmhouse, pond, tree, and stump collisions match the authored map.
- [x] CI fails if Godot cannot import the world texture.
- [ ] Farming-state overlays are replaced with crop and soil sprites in Sprite World Phase 2.

## Next pass

Sprite World Phase 2 replaces the procedural tilling, seeding, and watering overlays with Modern Farm soil and crop-stage sprites, then connects the pack's digging and watering animations to the player tool state machine.
