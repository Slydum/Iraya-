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

- Modern Farm Farmer 1 idle and walking animations in four directions
- Matching digging, planting/harvesting, and watering tool animations
- Eight-direction movement with four-direction sprite facing and sprinting
- Animated Modern Farm chicken, dog, and cow placed in the world
- Collision against the farmhouse, pond, trees, stumps, and world bounds
- 16×11 farming plot rendered with real Modern Farm dry and wet soil assets
- Seven-frame carrot source sheet mapped to visible crop-growth stages
- Ripe carrots can be harvested with the Hand tool
- Persistent browser save for farm tile states, crop timing, and selected tool
- Responsive desktop, portrait, and landscape touch controls

## Modern Farm Phaser package integration

Iraya loads its runtime assets through the actual generated Modern Farm package API:

```text
source/src/modern-farm/ModernFarmLoader.ts
source/src/modern-farm/ModernFarmKeys.ts
public/modern-farm/manifests/
public/modern-farm/assets/
```

At boot, Iraya fetches the package manifests before starting Phaser. Each scene then queues only the logical keys it needs and registers the package-provided animations. The selected public runtime contains 26 exact game-facing assets and 24 animations from the prepared package; the complete 11,737-asset licensed library is not committed or redistributed.

The selected binary runtime is stored as checksum-locked source chunks under `asset-source/modern-farm-runtime-package/`, materialized into `public/modern-farm/assets/` by `npm run assets`, and verified against the package-provided SHA-256 values during CI. The loader, scene integration, and selected manifests are likewise checksum-locked under `asset-source/modern-farm-code-package/` and materialized before TypeScript compilation.

The original purchased archive can be preserved privately with:

```bash
python3 tools/import_modern_farm.py /path/to/Modern_Farm_v1.2.zip
```

See `docs/ASSET_PACK.md` for the private-vault workflow.
