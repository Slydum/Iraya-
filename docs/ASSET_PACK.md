# Modern Farm asset preservation

Iraya uses the purchased **Modern Farm v1.2** pack by LimeZu.

The complete paid source pack must not be committed to this public repository because that would redistribute the original asset archive and source sheets. The Phaser migration therefore uses two separate layers:

1. `local-assets/vendor/modern_farm_v1_2/` — the complete private working vault, ignored by Git.
2. `public/assets/` — only the compact game-ready textures needed by the published game.

## Preserve the complete pack

From the repository root, run:

```bash
python3 tools/import_modern_farm.py /path/to/Modern_Farm_v1.2.zip
```

The importer creates:

```text
local-assets/vendor/modern_farm_v1_2/
├── archive/        # exact purchased ZIP when a ZIP is supplied
├── source/         # every extracted source file
└── manifest.json   # file sizes and SHA-256 checksums
```

To replace an existing vault:

```bash
python3 tools/import_modern_farm.py /path/to/Modern_Farm_v1.2.zip --replace
```

Back up the entire ignored vault in private storage. The checksum inventory makes it possible to confirm that no source sheets were lost or changed during future migrations.

## Runtime exports

The public game currently uses:

- `public/assets/farmer_1.png`
- `public/assets/farm_world.webp`
- `public/assets/runtime-manifest.json`

Future crop, terrain, prop, building, and tool-animation exports should be generated from the private vault and added only as compact game-ready files required by Iraya. The purchased archive and complete sheets remain private.
