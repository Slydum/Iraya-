#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

mkdir -p assets/runtime

for part in scripts/art/farmer_sprite_chunk_{0..7}.gd; do
  test -s "$part"
  sed -n 's/^const DATA := "\([A-Za-z0-9+\/=]*\)"$/\1/p' "$part"
done | tr -d '\n' | base64 --decode > assets/runtime/farmer_1.png

signature="$(head -c 8 assets/runtime/farmer_1.png | od -An -tx1 | tr -d ' \n')"
if [[ "$signature" != "89504e470d0a1a0a" ]]; then
  echo "Farmer 1 texture generation failed: invalid PNG signature." >&2
  exit 1
fi

echo "Created assets/runtime/farmer_1.png"
