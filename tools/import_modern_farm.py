#!/usr/bin/env python3
"""Preserve a complete purchased Modern Farm pack in a private local vault.

The vault is intentionally ignored by Git. It keeps the original archive,
extracts every source file, and writes a SHA-256 inventory for backup checks.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import stat
import sys
import tempfile
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_DESTINATION = Path("local-assets/vendor/modern_farm_v1_2")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_extract(archive: zipfile.ZipFile, destination: Path) -> None:
    root = destination.resolve()
    for member in archive.infolist():
        mode = member.external_attr >> 16
        if stat.S_ISLNK(mode):
            raise ValueError(f"Refusing symbolic link in archive: {member.filename}")
        target = (destination / member.filename).resolve()
        try:
            target.relative_to(root)
        except ValueError as exc:
            raise ValueError(f"Unsafe archive path: {member.filename}") from exc
    archive.extractall(destination)


def choose_content_root(extracted: Path) -> Path:
    entries = [entry for entry in extracted.iterdir() if entry.name != "__MACOSX"]
    files = [entry for entry in entries if entry.is_file()]
    directories = [entry for entry in entries if entry.is_dir()]
    if not files and len(directories) == 1:
        return directories[0]
    return extracted


def build_manifest(vault: Path, source_name: str, source_digest: str | None) -> dict[str, object]:
    records: list[dict[str, object]] = []
    extensions: Counter[str] = Counter()

    for path in sorted(vault.rglob("*")):
        if not path.is_file() or path.name == "manifest.json":
            continue
        relative = path.relative_to(vault).as_posix()
        suffix = path.suffix.lower() or "[no extension]"
        extensions[suffix] += 1
        records.append(
            {
                "path": relative,
                "bytes": path.stat().st_size,
                "sha256": sha256_file(path),
            }
        )

    png_count = extensions.get(".png", 0)
    if png_count == 0:
        raise ValueError("No PNG files were found. This does not look like the Modern Farm source pack.")

    return {
        "pack": "Modern Farm v1.2",
        "creator": "LimeZu",
        "importedAtUtc": datetime.now(timezone.utc).isoformat(),
        "sourceName": source_name,
        "sourceSha256": source_digest,
        "fileCount": len(records),
        "countsByExtension": dict(sorted(extensions.items())),
        "files": records,
        "licenseBoundary": "Private local preservation only. Do not commit or redistribute this vault.",
    }


def import_pack(source: Path, destination: Path, replace: bool) -> None:
    source = source.expanduser().resolve()
    destination = destination.expanduser().resolve()

    if not source.exists():
        raise FileNotFoundError(f"Asset source not found: {source}")
    if destination.exists():
        if not replace:
            raise FileExistsError(
                f"Vault already exists: {destination}\nRun again with --replace to rebuild it."
            )
        shutil.rmtree(destination)

    destination.mkdir(parents=True)
    source_destination = destination / "source"
    source_digest: str | None = None

    if source.is_file():
        if not zipfile.is_zipfile(source):
            raise ValueError("The source file must be a ZIP archive or an extracted directory.")
        archive_destination = destination / "archive"
        archive_destination.mkdir()
        preserved_archive = archive_destination / source.name
        shutil.copy2(source, preserved_archive)
        source_digest = sha256_file(preserved_archive)

        with tempfile.TemporaryDirectory(prefix="iraya-modern-farm-") as temporary:
            extracted = Path(temporary)
            with zipfile.ZipFile(preserved_archive) as archive:
                safe_extract(archive, extracted)
            shutil.copytree(choose_content_root(extracted), source_destination)
    elif source.is_dir():
        shutil.copytree(source, source_destination)
    else:
        raise ValueError(f"Unsupported asset source: {source}")

    manifest = build_manifest(destination, source.name, source_digest)
    manifest_path = destination / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Preserved Modern Farm vault: {destination}")
    print(f"Indexed {manifest['fileCount']} files, including {manifest['countsByExtension'].get('.png', 0)} PNG files.")
    print("Back up this ignored folder privately; never commit or redistribute it.")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Preserve the complete purchased Modern Farm pack in Iraya's ignored local vault."
    )
    parser.add_argument("source", type=Path, help="Modern Farm ZIP archive or extracted source directory")
    parser.add_argument(
        "--destination",
        type=Path,
        default=DEFAULT_DESTINATION,
        help=f"Vault directory (default: {DEFAULT_DESTINATION})",
    )
    parser.add_argument("--replace", action="store_true", help="Replace an existing vault")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        import_pack(args.source, args.destination, args.replace)
    except (FileNotFoundError, FileExistsError, ValueError, OSError, zipfile.BadZipFile) as error:
        print(f"Asset import failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
