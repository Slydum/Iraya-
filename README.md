# Iraya

Iraya is a browser-first 2D farming prototype built with Phaser 3, TypeScript, and Vite.

## Play

The production build is published through GitHub Pages:

`https://slydum.github.io/Iraya-/`

## Controls

### Desktop

- WASD or arrow keys: move
- Shift: sprint
- Q / E: previous or next tool
- 1–4: Hand, Hoe, Seeds, Watering Can
- F, Space, or Enter: use selected tool

### Mobile

- D-pad: move
- RUN: sprint
- `< TOOL` / `TOOL >`: change tool
- USE: use selected tool

For the closest full-screen iPhone experience, add the game to the Home Screen and launch it in landscape.

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
- Responsive desktop and touch controls

## Asset boundary

Iraya ships only compact, game-ready images assembled from the licensed Modern Farm v1.2 pack. The purchased source archive and complete source sheets are not included in the repository.
