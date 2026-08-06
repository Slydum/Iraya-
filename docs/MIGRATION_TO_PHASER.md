# Migration to Phaser

Iraya was migrated from Godot 4 to Phaser 3, TypeScript, and Vite because the project is browser-first.

## Preserved behavior

- 960×640 authored Modern Farm world
- Farmer 1 idle and walking animations
- Player starting position and movement speeds
- World, farmhouse, pond, tree, and stump collisions
- 16×11 farming plot at `(272, 224)` with 16-pixel cells
- Hand, hoe, seeds, and watering-can rules
- Keyboard and touch controls
- GitHub Pages deployment at the existing URL

## Web improvements

- The canvas resizes to the full browser viewport rather than letterboxing to a fixed engine export.
- Sprite sheets are ordinary PNG files sliced directly by Phaser.
- Farm progress is saved in `localStorage`.
- The PWA manifest requests landscape fullscreen when launched from the Home Screen.
- There is no WebAssembly, `.pck`, Godot import cache, or engine-specific texture conversion.

## Next art pass

Replace the temporary tilled, seeded, and watered overlays with curated Modern Farm soil and crop sprites, then add the pack's hoe and watering animations.
