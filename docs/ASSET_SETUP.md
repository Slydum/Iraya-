# Modern Farm asset setup

Iraya uses the purchased **Modern Farm v1.2** pack by limezu. The original archive must not be committed or redistributed.

## Why the art is not in Git

The included license allows editing and use in commercial or non-commercial projects, but prohibits reselling or distributing the asset to others. The repository therefore contains only an installer script and ignores the extracted PNG/GIF source files.

## Install

From the repository root:

```bash
python tools/import_modern_farm.py /absolute/path/to/Modern_Farm_v1.2.zip
```

The script verifies the expected archive layout and installs a curated 16×16 subset under:

```text
assets/vendor/modern_farm/source/
```

It also copies the pack's `LICENSE.txt` beside the local source directory.

## Phase A selected files

- Terrain tiles
- Fences
- Props and buildings
- Crops
- Fruit trees
- Trees
- Pickup items
- Farmer 1 movement sheet
- Farmer 1 digging, watering, and harvesting sheets

Only the 16×16 edition is selected to avoid duplicate art resolutions and maintain a consistent pixel grid.

## Credit

Credit the artist as **limezu.itch.io** in the eventual game credits.
