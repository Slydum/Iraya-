# Farmer visibility fix

The first Modern Farm integration rendered the farmer through the player's `_draw()` callback. The farming overlay has a higher canvas layer, which could cover the manually drawn character.

The player now uses a dedicated `Sprite2D` with:

- the curated Modern Farm runtime texture referenced directly by the scene
- `hframes = 5` and `vframes = 8`
- explicit directional frame coordinates
- player `z_index = 10`
- nearest-neighbor texture filtering

This keeps the farmer above soil and cursor overlays while preserving movement and farming behavior.
