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

- Modern Farm Farmer 1 split idle and walking animations in four directions
- Matching digging, planting/harvesting, and watering tool animations
- Eight-direction movement with four-direction sprite facing and sprinting
- Collision against the farmhouse, pond, trees, stumps, and world bounds
- 16×11 farming plot rendered with real Modern Farm dry/wet soil tiles
- Carrot seeds progress through visible growth stages after watering
- Ripe carrots can be harvested with the Hand tool
- Persistent browser save for farm tile states, crop timing, and selected tool
- Responsive desktop, portrait, and landscape touch controls

## Modern Farm Phaser runtime

Iraya now uses a curated Phaser-ready subset generated from the private Modern Farm v1.2 package. The game-facing exports live under:

```text
public/assets/modern-farm/
```

`runtime-manifest.json` records every included file, byte size, and SHA-256 checksum. The full purchased pack remains private and is not redistributed in this repository.

The source archive can still be preserved locally with:

```bash
python3 tools/import_modern_farm.py /path/to/Modern_Farm_v1.2.zip
```

See `docs/ASSET_PACK.md` for the private-vault workflow.
