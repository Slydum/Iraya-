#!/usr/bin/env python3
"""Install the curated Modern Farm 16x16 files without committing the source pack."""

from __future__ import annotations

import argparse
import shutil
import sys
import zipfile
from pathlib import Path

SELECTED_FILES = (
    "LICENSE.txt",
    "16x16/1_Terrains_16x16.png",
    "16x16/2_Fences_16x16.png",
    "16x16/3_Props_and_Buildings_16x16.png",
    "16x16/4_Crops_16x16.png",
    "16x16/5_Fruit_Trees.png",
    "16x16/6_Trees_16x16.png",
    "16x16/7_Pickup_Items_16x16.png",
    "16x16/Characters_16x16/Farmer_1_16x16.png",
    "16x16/Characters_16x16/Farmer_1_Dig_36_frames_16x16.png",
    "16x16/Characters_16x16/Farmer_1_Watering_56_frames_16x16.png",
    "16x16/Characters_16x16/Farmer_1_Harvesting_36_frames_16x16.png",
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Copy the curated Iraya asset subset from Modern_Farm_v1.2.zip."
    )
    parser.add_argument("archive", type=Path, help="Path to Modern_Farm_v1.2.zip")
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Iraya repository root (default: inferred from this script)",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    archive = args.archive.expanduser().resolve()
    project_root = args.project_root.expanduser().resolve()
    destination = project_root / "assets" / "vendor" / "modern_farm"
    source_dir = destination / "source"

    if not archive.is_file():
        print(f"error: archive not found: {archive}", file=sys.stderr)
        return 2

    destination.mkdir(parents=True, exist_ok=True)
    source_dir.mkdir(parents=True, exist_ok=True)

    try:
        with zipfile.ZipFile(archive) as bundle:
            available = set(bundle.namelist())
            missing = [name for name in SELECTED_FILES if name not in available]
            if missing:
                print("error: the archive is missing expected files:", file=sys.stderr)
                for name in missing:
                    print(f"  - {name}", file=sys.stderr)
                return 3

            for member in SELECTED_FILES:
                if member == "LICENSE.txt":
                    target = destination / "LICENSE.txt"
                else:
                    target = source_dir / Path(member).name
                target.parent.mkdir(parents=True, exist_ok=True)
                with bundle.open(member) as src, target.open("wb") as dst:
                    shutil.copyfileobj(src, dst)
                print(f"installed {target.relative_to(project_root)}")
    except zipfile.BadZipFile:
        print(f"error: not a valid ZIP archive: {archive}", file=sys.stderr)
        return 4

    print("\nModern Farm subset installed locally.")
    print("The source art remains ignored by Git; do not redistribute it.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
