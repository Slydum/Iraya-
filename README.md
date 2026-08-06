# Iraya

Iraya is a browser-first 2D farming prototype built with Phaser 3, TypeScript, and Vite.

## Play

The production build is published through GitHub Pages:

`https://slydum.github.io/Iraya-/`

The mobile build is portrait-first. For the most app-like iPhone experience, add the game to the Home Screen and launch it vertically.

## Controls

### Desktop

- WASD or arrow keys: move
- Shift: sprint
- Q / E: previous or next tool
- 1–4: Hand, Hoe, Seeds, Watering Can
- F, Space, or Enter: use selected tool

### Mobile

- Portrait D-pad: move
- RUN: sprint
- `< TOOL` / `TOOL >`: change tool
- USE: use selected tool

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Current gameplay

- Four-direction Farmer 1 idle and walking animations
- Eight-direction movement with four-direction sprite facing
- Sprinting
- Collision against the farmhouse, pond, trees, stumps, and world bounds
- 16×11 farming plot
- Hand, hoe, seeds, and watering can
- Persistent browser save for farm tile states and selected tool
- Responsive desktop, portrait, and landscape touch controls

## Modern Farm asset preservation

The full purchased Modern Farm v1.2 pack is preserved through a private local vault rather than being redistributed in this public repository.

```bash
python3 tools/import_modern_farm.py /path/to/Modern_Farm_v1.2.zip
```

This keeps the exact archive, extracts every source file, and writes a SHA-256 inventory under the Git-ignored `local-assets/vendor/modern_farm_v1_2/` directory. See `docs/ASSET_PACK.md` for the complete workflow.

The published game contains only compact, game-ready runtime exports required by Iraya.
